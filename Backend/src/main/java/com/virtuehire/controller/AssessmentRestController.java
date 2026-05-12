package com.virtuehire.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtuehire.model.*;
import com.virtuehire.service.*;
import com.virtuehire.repository.*;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assessment")
@CrossOrigin(origins = { "https://admin.virtuehire.in", "https://virtuehire.in", "http://localhost:3000" },
             allowCredentials = "true")
public class AssessmentRestController {

    private final AssessmentResultService resultService;
    private final AssessmentService assessmentService;
    private final AssessmentQuestionRepository aqRepo;
    private final CandidateAnswerRepository candidateAnswerRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService questionService;
    private final CodeExecutionService codeExecutionService;
    private final HiringWorkflowService hiringWorkflowService;
    private final TestAllocationService testAllocationService;
    private final ObjectMapper objectMapper;

    public AssessmentRestController(
            AssessmentResultService resultService,
            AssessmentService assessmentService,
            AssessmentQuestionRepository aqRepo,
            CandidateAnswerRepository candidateAnswerRepository,
            QuestionRepository questionRepository,
            QuestionService questionService,
            CodeExecutionService codeExecutionService,
            HiringWorkflowService hiringWorkflowService,
            TestAllocationService testAllocationService,
            ObjectMapper objectMapper) {

        this.resultService = resultService;
        this.assessmentService = assessmentService;
        this.aqRepo = aqRepo;
        this.candidateAnswerRepository = candidateAnswerRepository;
        this.questionRepository = questionRepository;
        this.questionService = questionService;
        this.codeExecutionService = codeExecutionService;
        this.hiringWorkflowService = hiringWorkflowService;
        this.testAllocationService = testAllocationService;
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // ✅ FIXED: STATUS ENDPOINT - Uses query parameter, not path variable
    // This fixes the 404 error. The endpoint now accepts ?name=Java+Assessment
    // instead of /Java+Assessment
    // =========================================================

    @GetMapping("/status")
    public ResponseEntity<?> getAssessmentStatus(
            @RequestParam String name,
            HttpSession session) {

        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        // Decode URL-encoded assessment name
        String decodedName = URLDecoder.decode(name, StandardCharsets.UTF_8);
        System.out.println("🔍 Looking for assessment: '" + decodedName + "'");

        Optional<Assessment> assessmentOpt = assessmentService.getAssessmentByName(decodedName);

        if (assessmentOpt.isEmpty()) {
            List<String> availableAssessments = assessmentService.getAllAssessmentNames();
            System.err.println("❌ Assessment not found: " + decodedName);
            System.err.println("📋 Available assessments: " + availableAssessments);
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Assessment not found: " + decodedName,
                    "availableAssessments", availableAssessments
            ));
        }

        Assessment assessment = assessmentOpt.get();
        List<AssessmentSection> sections = assessmentService.getAssessmentSections(assessment.getId());
        List<AssessmentResult> results = resultService.getResultsForAssessment(candidate.getId(), assessment.getAssessmentName());
        int nextLevel = resultService.getNextLevelForAssessment(
                candidate.getId(),
                assessment.getAssessmentName(),
                sections);
        boolean isLocked = assessment.isLocked() || resultService.isAssessmentLocked(
                candidate.getId(),
                assessment.getAssessmentName(),
                sections);
        String error = assessment.isLocked()
                ? "This assessment is locked by the admin."
                : resultService.getAssessmentLockMessage(candidate.getId(), assessment.getAssessmentName(), sections);

        System.out.println("✅ Assessment found: " + assessment.getAssessmentName());
        System.out.println("📊 Results: " + results.size() + ", Next Level: " + nextLevel + ", Locked: " + isLocked);

        return ResponseEntity.ok(Map.of(
                "assessmentName", assessment.getAssessmentName(),
                "nextLevel", nextLevel,
                "assessmentId", assessment.getId(),
                "totalSections", sections.size(),
                "configs", buildSectionConfigs(sections),
                "results", buildResultSummaries(results),
                "isLocked", isLocked,
                "error", error
        ));
    }

    // =========================================================
    // FILE UPLOAD
    // =========================================================

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String testName,
            @RequestParam(required = false) String input1,
            @RequestParam(required = false) String output1,
            @RequestParam(required = false) String input2,
            @RequestParam(required = false) String output2) {

        try {
            String fileName = file.getOriginalFilename();

            if (fileName == null) {
                return ResponseEntity.badRequest().body("Invalid file");
            }

            System.out.println("Uploading file: " + fileName);

            questionService.saveQuestionsFromUpload(file, testName, input1, output1, input2, output2);

            return ResponseEntity.ok("Upload successful");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // =========================================================
    // GET QUESTIONS FOR A LEVEL
    // =========================================================

    @GetMapping("/{assessmentName}/level/{level}")
    public ResponseEntity<?> getLevelQuestions(
            @PathVariable String assessmentName,
            @PathVariable int level,
            HttpSession session) {

        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        String decodedName = URLDecoder.decode(assessmentName, StandardCharsets.UTF_8);
        
        Optional<Assessment> assessmentOpt = assessmentService.getAssessmentByName(decodedName);

        if (assessmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Assessment not found: " + decodedName));
        }

        Assessment assessment = assessmentOpt.get();

        List<AssessmentSection> sections = assessmentService.getAssessmentSections(assessment.getId());

        if (sections == null || sections.size() < level) {
            return ResponseEntity.status(404).body(Map.of("error", "Section not found for level " + level));
        }

        AssessmentSection section = sections.get(level - 1);

        List<Question> questions = aqRepo.findQuestionsBySectionId(section.getId());

        if (questions == null || questions.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message", "No questions found for this level.",
                    "questions", List.of()
            ));
        }

        return ResponseEntity.ok(Map.of(
                "subject", assessment.getAssessmentName(),
                "level", level,
                "sectionName", section.getSubject(),
                "timeLimit", section.getSectionTime(),
                "sectionMode", section.getSectionMode(),
                "supportedLanguages", parseSupportedLanguages(section.getSupportedLanguages()),
                "questions", questions
        ));
    }

    // =========================================================
    // SUBMIT ANSWERS
    // =========================================================

    @PostMapping("/{assessmentName}/submit/{level}")
    public ResponseEntity<?> submitAnswers(
            @PathVariable String assessmentName,
            @PathVariable int level,
            @RequestBody SubmissionRequest request,
            HttpSession session) {

        try {
            Candidate candidate = (Candidate) session.getAttribute("candidate");
            if (candidate == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
            }

            Map<String, CodingAnswerRequest> codingAnswers = request.codingAnswers != null ? request.codingAnswers : new HashMap<>();

            String decodedName = URLDecoder.decode(assessmentName, StandardCharsets.UTF_8);
            
            Optional<Assessment> assessmentOpt = assessmentService.getAssessmentByName(decodedName);

            if (assessmentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Assessment not found"));
            }

            Assessment assessment = assessmentOpt.get();

            List<AssessmentSection> sections = assessmentService.getAssessmentSections(assessment.getId());

            if (sections.size() < level) {
                return ResponseEntity.status(404).body(Map.of("error", "Section not found"));
            }

            AssessmentSection section = sections.get(level - 1);
            List<AssessmentQuestion> aqs = aqRepo.findBySectionId(section.getId());

            int correct = 0;
            List<Map<String, Object>> answersForStorage = new ArrayList<>();

            for (AssessmentQuestion aq : aqs) {
                Question q = aq.getQuestion();

                if (q.isHasCompiler()) {
                    CodingAnswerRequest ans = codingAnswers.get(q.getId().toString());

                    if (ans != null && ans.sourceCode != null) {
                        List<TestCase> testCases = questionService.getTestCases(q.getId());

                        Map<String, Object> result = codeExecutionService.submit(
                                ans.sourceCode,
                                ans.languageId,
                                testCases);

                        int passed = ((Number) result.get("passedTestCases")).intValue();
                        int total  = ((Number) result.get("totalTestCases")).intValue();
                        boolean isCorrect = passed == total;

                        if (isCorrect) correct++;

                        answersForStorage.add(buildCodingAnswerPayload(q, ans, isCorrect));
                    }
                } else {
                    // MCQ scoring
                    String given = request.answers != null
                            ? request.answers.get(q.getId().toString())
                            : null;
                    boolean isCorrect = given != null && given.equalsIgnoreCase(q.getCorrectAnswer());
                    if (isCorrect) {
                        correct++;
                    }
                    answersForStorage.add(buildMcqAnswerPayload(q, given, isCorrect));
                }
            }

            int total = aqs.size();
            int percentage = total > 0 ? (correct * 100 / total) : 0;
            boolean passed = percentage >= section.getPassPercentage();
            AssessmentResult savedResult = resultService.saveResult(
                    candidate.getId(),
                    assessment.getAssessmentName(),
                    level,
                    percentage,
                    section.getPassPercentage(),
                    serializeAnswers(answersForStorage),
                    "offline".equalsIgnoreCase(request.deliveryMode));

            persistCandidateAnswers(savedResult, candidate.getId(), answersForStorage);
            syncWorkflowSubmission(candidate, assessment, sections, level, percentage, savedResult);

            return ResponseEntity.ok(Map.of(
                    "score", correct,
                    "percentage", percentage,
                    "passed", passed,
                    "resultId", savedResult.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal Server Error: " + e.getMessage()));
        }
    }

    // =========================================================
    // SUBJECTS (Available Assessments)
    // =========================================================

    @GetMapping("/subjects")
    public List<String> getConfiguredSubjects() {
        return assessmentService.getAllAssessmentNames();
    }

    @GetMapping("/results/{resultId}/answers")
    public ResponseEntity<?> getResultAnswers(@PathVariable Long resultId, HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        Optional<AssessmentResult> resultOpt = resultService.getCandidateResults(candidate.getId()).stream()
                .filter(result -> Objects.equals(result.getId(), resultId))
                .findFirst();

        if (resultOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Result not found"));
        }

        AssessmentResult result = resultOpt.get();
        try {
            List<Map<String, Object>> answers = parseStoredAnswers(result.getAnswersJson());
            return ResponseEntity.ok(answers);
        } catch (Exception ex) {
            return ResponseEntity.ok(List.of());
        }
    }

    // =========================================================
    // DEBUG ENDPOINT - List all assessments (remove in production)
    // =========================================================
    
    @GetMapping("/debug/list-all")
    public ResponseEntity<?> listAllAssessments() {
        List<Assessment> all = assessmentService.getAllAssessments();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Assessment a : all) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("name", a.getAssessmentName());
            map.put("locked", a.isLocked());
            map.put("createdAt", a.getCreatedAt());
            result.add(map);
        }
        
        return ResponseEntity.ok(Map.of(
                "total", result.size(),
                "assessments", result
        ));
    }

    // =========================================================
    // CLEANUP AUTO-ASSESSMENTS (Admin only - remove in production)
    // =========================================================
    
    @DeleteMapping("/cleanup-auto-assessments")
    public ResponseEntity<?> cleanupAutoAssessments() {
        List<Assessment> allAssessments = assessmentService.getAllAssessments();
        List<Assessment> autoAssessments = allAssessments.stream()
            .filter(a -> a.getAssessmentName().endsWith(" Assessment"))
            .toList();
        
        int deletedCount = 0;
        for (Assessment assessment : autoAssessments) {
            try {
                assessmentService.deleteAssessment(assessment.getId());
                deletedCount++;
                System.out.println("Deleted auto-assessment: " + assessment.getAssessmentName());
            } catch (Exception e) {
                System.err.println("Failed to delete: " + assessment.getAssessmentName() + " - " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(Map.of(
                "deleted", deletedCount,
                "message", "Auto-created assessments have been removed",
                "remaining", allAssessments.size() - deletedCount
        ));
    }

    // =========================================================
    // RUN CODE
    // =========================================================

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("sourceCode");
            Integer languageId = (Integer) request.get("languageId");
            String input = (String) request.getOrDefault("input", "");

            if (code == null || languageId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing code or languageId"));
            }

            Map<String, Object> result = codeExecutionService.run(code, languageId, input);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Execution failed: " + e.getMessage()));
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private List<String> parseSupportedLanguages(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    private List<Map<String, Object>> buildSectionConfigs(List<AssessmentSection> sections) {
        return sections.stream()
                .map(section -> {
                    Map<String, Object> config = new LinkedHashMap<>();
                    config.put("sectionNumber", section.getSectionNumber());
                    config.put("sectionName", section.getSubject());
                    config.put("subject", section.getSubject());
                    config.put("questionCount", section.getQuestionCount());
                    config.put("timeLimit", section.getSectionTime());
                    config.put("passPercentage", section.getPassPercentage());
                    config.put("sectionMode", section.getSectionMode());
                    config.put("supportedLanguages", parseSupportedLanguages(section.getSupportedLanguages()));
                    return config;
                })
                .toList();
    }

    private List<Map<String, Object>> buildResultSummaries(List<AssessmentResult> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> summary = new LinkedHashMap<>();
                    summary.put("id", result.getId());
                    summary.put("subject", result.getSubject());
                    summary.put("level", result.getLevel());
                    summary.put("score", result.getScore());
                    summary.put("attemptedAt", result.getAttemptedAt());
                    summary.put("lockedAt", result.getLockedAt());
                    return summary;
                })
                .toList();
    }

    private Map<String, Object> buildMcqAnswerPayload(Question question, String userAnswer, boolean isCorrect) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("questionId", question.getId());
        payload.put("question", question.getText());
        payload.put("options", question.getOptions() != null ? question.getOptions() : List.of());
        payload.put("userAnswer", userAnswer);
        payload.put("correctAnswer", question.getCorrectAnswer());
        payload.put("isCorrect", isCorrect);
        payload.put("questionType", question.getQuestionType());
        return payload;
    }

    private Map<String, Object> buildCodingAnswerPayload(Question question, CodingAnswerRequest answer, boolean isCorrect) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("questionId", question.getId());
        payload.put("question", question.getText());
        payload.put("options", List.of());
        payload.put("userAnswer", answer != null ? answer.sourceCode : null);
        payload.put("correctAnswer", isCorrect ? "All test cases passed" : "Not all test cases passed");
        payload.put("isCorrect", isCorrect);
        payload.put("questionType", question.getQuestionType());
        return payload;
    }

    private String serializeAnswers(List<Map<String, Object>> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    private List<Map<String, Object>> parseStoredAnswers(String answersJson) throws JsonProcessingException {
        if (answersJson == null || answersJson.isBlank()) {
            return List.of();
        }

        return objectMapper.readValue(answersJson, new TypeReference<List<Map<String, Object>>>() {});
    }

    private void persistCandidateAnswers(AssessmentResult result, Long candidateId, List<Map<String, Object>> answers) {
        if (result == null || result.getId() == null) {
            return;
        }

        candidateAnswerRepository.deleteByResultId(result.getId());

        List<CandidateAnswer> entities = answers.stream()
                .map(answer -> {
                    CandidateAnswer entity = new CandidateAnswer();
                    entity.setCandidateId(candidateId);
                    entity.setResultId(result.getId());
                    Object questionId = answer.get("questionId");
                    if (questionId instanceof Number number) {
                        entity.setQuestionId(number.longValue());
                    }
                    Object userAnswer = answer.get("userAnswer");
                    entity.setUserAnswer(userAnswer != null ? String.valueOf(userAnswer) : null);
                    entity.setCorrect(Boolean.TRUE.equals(answer.get("isCorrect")));
                    return entity;
                })
                .collect(Collectors.toList());

        if (!entities.isEmpty()) {
            candidateAnswerRepository.saveAll(entities);
        }
    }

    private void syncWorkflowSubmission(Candidate candidate,
                                        Assessment assessment,
                                        List<AssessmentSection> sections,
                                        int currentLevel,
                                        int percentage,
                                        AssessmentResult savedResult) {
        if (candidate == null || assessment == null || sections == null || savedResult == null) {
            return;
        }

        if (currentLevel != sections.size()) {
            return;
        }

        Optional<CandidateTestMapping> mappingOpt = hiringWorkflowService
                .getAssignedTestsForCandidate(candidate.getId())
                .stream()
                .filter(mapping -> Objects.equals(mapping.getTestId(), assessment.getId()))
                .findFirst();

        if (mappingOpt.isEmpty()) {
            return;
        }

        CandidateTestMapping mapping = mappingOpt.get();
        if (Boolean.TRUE.equals(mapping.getSubmitted())) {
            return;
        }

        AssignmentSubmission submission = new AssignmentSubmission(
                candidate.getId(),
                mapping.getId(),
                assessment.getId(),
                percentage,
                percentage >= 50);
        submission.setSubmissionDetails("Assessment resultId=" + savedResult.getId());

        try {
            hiringWorkflowService.submitAssignment(submission);
            testAllocationService.markTestSubmitted(mapping.getId(), percentage);
        } catch (RuntimeException ignored) {
        }
    }

    // =========================================================
    // DTOs
    // =========================================================

    public static class SubmissionRequest {
        public Map<String, String> answers;
        public Map<String, CodingAnswerRequest> codingAnswers;
        public Integer violations;
        public String lastActivity;
        public Boolean isAutoSubmit;
        public String deliveryMode;
    }

    public static class CodingAnswerRequest {
        public String sourceCode;
        public Integer languageId;
        public Boolean submitted;
    }
}
