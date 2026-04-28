package com.virtuehire.controller;

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

    public AssessmentRestController(
            AssessmentResultService resultService,
            AssessmentService assessmentService,
            AssessmentQuestionRepository aqRepo,
            CandidateAnswerRepository candidateAnswerRepository,
            QuestionRepository questionRepository,
            QuestionService questionService,
            CodeExecutionService codeExecutionService) {

        this.resultService = resultService;
        this.assessmentService = assessmentService;
        this.aqRepo = aqRepo;
        this.candidateAnswerRepository = candidateAnswerRepository;
        this.questionRepository = questionRepository;
        this.questionService = questionService;
        this.codeExecutionService = codeExecutionService;
    }

    // =========================================================
    // STATUS ENDPOINT - Fixed with better error handling
    // =========================================================

    @GetMapping("/status/{assessmentName}")
    public ResponseEntity<?> getAssessmentStatus(
            @PathVariable String assessmentName,
            HttpSession session) {

        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        // Decode URL-encoded assessment name
        String decodedName = URLDecoder.decode(assessmentName, StandardCharsets.UTF_8);
        System.out.println("Looking for assessment: '" + decodedName + "'");

        Optional<Assessment> assessmentOpt = assessmentService.getAssessmentByName(decodedName);

        if (assessmentOpt.isEmpty()) {
            List<String> availableAssessments = assessmentService.getAllAssessmentNames();
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Assessment not found: " + decodedName,
                    "availableAssessments", availableAssessments
            ));
        }

        Assessment assessment = assessmentOpt.get();
        
        // Determine which level the candidate can attempt next
        int nextLevel = resultService.getNextLevel(candidate.getId(), assessment.getId());
        
        // If candidate has never attempted this assessment, nextLevel should be 1
        if (nextLevel == 0) {
            nextLevel = 1;
        }

        return ResponseEntity.ok(Map.of(
                "assessmentName", assessment.getAssessmentName(),
                "nextLevel", nextLevel,
                "assessmentId", assessment.getId()
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

                        if (passed == total) correct++;
                    }
                } else {
                    // MCQ scoring
                    String given = request.answers != null
                            ? request.answers.get(q.getId().toString())
                            : null;
                    if (given != null && given.equalsIgnoreCase(q.getCorrectAnswer())) {
                        correct++;
                    }
                }
            }

            int total = aqs.size();
            int percentage = total > 0 ? (correct * 100 / total) : 0;
            boolean passed = percentage >= 60;

            return ResponseEntity.ok(Map.of(
                    "score", correct,
                    "percentage", percentage,
                    "passed", passed
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

    // =========================================================
    // DTOs
    // =========================================================

    public static class SubmissionRequest {
        public Map<String, String> answers;
        public Map<String, CodingAnswerRequest> codingAnswers;
        public Integer violations;
        public String lastActivity;
        public Boolean isAutoSubmit;
    }

    public static class CodingAnswerRequest {
        public String sourceCode;
        public Integer languageId;
        public Boolean submitted;
    }
}