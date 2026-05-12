package com.virtuehire.service;

import com.virtuehire.model.Assessment;
import com.virtuehire.model.AssessmentQuestion;
import com.virtuehire.model.AssessmentSection;
import com.virtuehire.model.Question;
import com.virtuehire.repository.AssessmentQuestionRepository;
import com.virtuehire.repository.AssessmentRepository;
import com.virtuehire.repository.AssessmentResultRepository;
import com.virtuehire.repository.AssessmentSectionRepository;
import com.virtuehire.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepo;
    private final AssessmentSectionRepository sectionRepo;
    private final AssessmentQuestionRepository aqRepo;
    private final QuestionRepository questionRepo;
    private final QuestionService questionService;
    private final AssessmentResultRepository resultRepo;
    private final AdminNotificationService adminNotificationService;

    public AssessmentService(AssessmentRepository assessmentRepo,
                             AssessmentSectionRepository sectionRepo,
                             AssessmentQuestionRepository aqRepo,
                             QuestionRepository questionRepo,
                             QuestionService questionService,
                             AssessmentResultRepository resultRepo,
                             AdminNotificationService adminNotificationService) {
        this.assessmentRepo = assessmentRepo;
        this.sectionRepo = sectionRepo;
        this.aqRepo = aqRepo;
        this.questionRepo = questionRepo;
        this.questionService = questionService;
        this.resultRepo = resultRepo;
        this.adminNotificationService = adminNotificationService;
    }

    @Transactional
    public Assessment createAssessment(String name, String description, List<Map<String, Object>> sectionsData) {
        return createAssessment(name, description, sectionsData, null);
    }

    @Transactional
    public Assessment createAssessment(String name, String description, List<Map<String, Object>> sectionsData, Long hrId) {
        // Validation step
        for (Map<String, Object> sec : sectionsData) {
            String subject = normalizeSkill((String) sec.get("subject"), hrId);
            int requestedCount = (Integer) sec.get("questionCount");
            String sectionMode = normalizeSectionMode((String) sec.get("sectionMode"));
            List<Question> availableQuestions = getQuestionsForMode(subject, sectionMode, hrId);

            long availableCount = availableQuestions.size();
            if (availableCount < requestedCount) {
                throw new RuntimeException("Only " + availableCount + " " + formatModeLabel(sectionMode)
                        + " questions available for " + subject + ".");
            }

            if ("COMPILER".equals(sectionMode)) {
                List<String> supportedLanguages = toStringList(sec.get("supportedLanguages"));
                if (supportedLanguages.isEmpty()) {
                    throw new RuntimeException("Select at least one compiler language for " + subject + ".");
                }
            }
        }

        // 1. Create Assessment
        Assessment assessment = new Assessment(name, description);
        assessment = assessmentRepo.save(assessment);

        // 2. Iterate sections, save sections, assign random questions
        int sectionNumber = 1;
        for (Map<String, Object> sec : sectionsData) {
            String subject = normalizeSkill((String) sec.get("subject"), hrId);
            int requestedCount = (Integer) sec.get("questionCount");
            int timeLimit = (Integer) sec.get("timeLimit");
            int passPercentage = (Integer) sec.get("passPercentage");
            String sectionMode = normalizeSectionMode((String) sec.get("sectionMode"));
            String supportedLanguages = String.join(",", toStringList(sec.get("supportedLanguages")));

            AssessmentSection section = new AssessmentSection(
                    assessment,
                    sectionNumber++,
                    subject,
                    requestedCount,
                    timeLimit,
                    passPercentage,
                    sectionMode,
                    supportedLanguages);
            section = sectionRepo.save(section);

            // Fetch and shuffle questions
            List<Question> availableQs = getQuestionsForMode(subject, sectionMode, hrId);
            Collections.shuffle(availableQs);

            List<Question> selectedQs = availableQs.subList(0, requestedCount);

            List<AssessmentQuestion> aqs = new ArrayList<>();
            for (Question q : selectedQs) {
                aqs.add(new AssessmentQuestion(assessment, section, q));
            }
            aqRepo.saveAll(aqs);
        }

        adminNotificationService.resolveCombinedAssessmentNotification(
                buildSkillSignatureFromSections(getAssessmentSections(assessment.getId()), hrId));

        return assessment;
    }

    public List<Assessment> getAllAssessments() {
        return assessmentRepo.findAll();
    }

    /**
     * Looks up an assessment by name using exact match first, then
     * case-insensitive match. Partial / prefix matching has been removed
     * because it caused "Java" to resolve to "Java Assignment" (or vice-versa),
     * hiding valid assessments from candidates.
     */
    public Optional<Assessment> getAssessmentByName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }

        // 1. Try exact match first
        Optional<Assessment> exactMatch = assessmentRepo.findByAssessmentName(name);
        if (exactMatch.isPresent()) {
            return exactMatch;
        }

        // 2. Try case-insensitive match
        Optional<Assessment> caseInsensitiveMatch = assessmentRepo.findAll().stream()
                .filter(assessment -> assessment.getAssessmentName().equalsIgnoreCase(name))
                .findFirst();

        if (caseInsensitiveMatch.isPresent()) {
            System.out.println("Found case-insensitive match: '" + name + "' -> '"
                    + caseInsensitiveMatch.get().getAssessmentName() + "'");
            return caseInsensitiveMatch;
        }

        // 3. No match found — partial matching intentionally removed.
        // Previously, a prefix-based partial match caused "Java" to match
        // "Java Assignment" (space after prefix is not a letter/digit),
        // which hid the real "Java" assessment from the candidate view.
        System.out.println("No assessment found for: '" + name + "'");
        System.out.println("Available assessments:");
        assessmentRepo.findAll().forEach(a ->
                System.out.println("  - '" + a.getAssessmentName() + "' (ID: " + a.getId() + ")")
        );

        return Optional.empty();
    }

    // Removed .distinct() so assessments with the same name are all returned.
    // Each assessment is identified by its ID, not its name; deduplication here
    // was silently hiding valid assessments from callers.
    public List<String> getAllAssessmentNames() {
        return assessmentRepo.findAll().stream()
                .map(Assessment::getAssessmentName)
                .toList();
    }

    public Optional<Assessment> findAssessmentBySkillSet(List<String> skills) {
        String requestedSignature = buildSkillSignature(skills);
        if (requestedSignature.isBlank()) {
            return Optional.empty();
        }

        // Find ALL matching assessments, not just the first one
        List<Assessment> matchedAssessments = new ArrayList<>();
        for (Assessment assessment : assessmentRepo.findAll()) {
            String assessmentSignature = buildSkillSignatureFromSections(getAssessmentSections(assessment.getId()), null);
            if (requestedSignature.equals(assessmentSignature)) {
                matchedAssessments.add(assessment);
            }
        }
        
        // Sort by creation date (newest first) and return the first one
        matchedAssessments.sort(Comparator.comparing(Assessment::getCreatedAt).reversed());
        return matchedAssessments.isEmpty() ? Optional.empty() : Optional.of(matchedAssessments.get(0));
    }

    public List<Assessment> findAssessmentsForSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return List.of();
        }

        // Build candidate skill keys once for consistent matching
        Set<String> candidateSkills = skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(this::buildSkillMatchKey)
                .filter(key -> !key.isBlank())
                .collect(Collectors.toSet());

        if (candidateSkills.isEmpty()) {
            return List.of();
        }

        // Get all assessments and filter those matching candidate skills
        List<Assessment> allAssessments = assessmentRepo.findAll();
        
        List<Assessment> matchedAssessments = new ArrayList<>();
        for (Assessment assessment : allAssessments) {
            List<String> assessmentSkills = getAssessmentSubjects(assessment);
            
            // Check if any assessment skill matches any candidate skill
            boolean hasMatch = assessmentSkills.stream()
                    .anyMatch(assessmentSkill -> matchesCandidateSkill(candidateSkills, assessmentSkill));
            
            if (hasMatch) {
                matchedAssessments.add(assessment);
            }
        }
        
        // Sort by creation date (newest first) after collecting all matches
        matchedAssessments.sort(Comparator.comparing(Assessment::getCreatedAt).reversed());
        
        return matchedAssessments;
    }

    public List<String> getAssessmentSubjects(Assessment assessment) {
        if (assessment == null || assessment.getId() == null) {
            return List.of();
        }

        List<AssessmentSection> sections = getAssessmentSections(assessment.getId());
        if (sections == null || sections.isEmpty()) {
            return List.of();
        }

        // Collect all unique subjects without early termination
        Set<String> uniqueSubjects = new LinkedHashSet<>();
        for (AssessmentSection section : sections) {
            String subject = section.getSubject();
            if (subject != null && !subject.isBlank()) {
                String normalized = normalizeSkill(subject, null);
                if (!normalized.isBlank()) {
                    uniqueSubjects.add(normalized);
                }
            }
        }
        
        return new ArrayList<>(uniqueSubjects);
    }

    public boolean skillsMatch(String firstSkill, String secondSkill) {
        String firstKey = buildSkillMatchKey(firstSkill);
        String secondKey = buildSkillMatchKey(secondSkill);
        return !firstKey.isBlank() && firstKey.equals(secondKey);
    }

    @Transactional
    public Optional<Assessment> findOrCreateSingleSkillAssessment(String skill) {
        // AUTO-CREATION DISABLED - Only find existing assessments
        // No new assessments will be created automatically
        if (skill == null || skill.isBlank()) {
            return Optional.empty();
        }

        // Try to find existing assessment by skill set
        Optional<Assessment> existingAssessment = findAssessmentBySkillSet(List.of(skill));

        if (existingAssessment.isPresent()) {
            return existingAssessment;
        }

        // Log that no assessment exists instead of creating one
        System.out.println("No assessment found for skill: '" + skill +
                "'. Please create one manually in the admin panel.");

        return Optional.empty();
    }

    public List<AssessmentSection> getAssessmentSections(Long assessmentId) {
        return sectionRepo.findByAssessmentIdOrderBySectionNumberAsc(assessmentId);
    }

    @Transactional
    public void deleteAssessment(Long id) {
        Assessment assessment = assessmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        List<AssessmentQuestion> aqs = aqRepo.findByAssessmentId(id);
        aqRepo.deleteAll(aqs);

        List<AssessmentSection> sections = sectionRepo.findByAssessmentIdOrderBySectionNumberAsc(id);
        sectionRepo.deleteAll(sections);

        resultRepo.deleteBySubjectIgnoreCase(assessment.getAssessmentName());
        assessmentRepo.delete(assessment);
    }

    @Transactional
    public void toggleLock(Long id, boolean lock) {
        Assessment a = assessmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        a.setLocked(lock);
        assessmentRepo.save(a);
    }

    public String buildSkillSignature(List<String> skills) {
        if (skills == null) {
            return "";
        }

        return skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(skill -> normalizeSkill(skill, null))
                .map(skill -> skill.toLowerCase(Locale.ROOT))
                .distinct()
                .sorted()
                .collect(Collectors.joining("|"));
    }

    private String buildSkillSignatureFromSections(List<AssessmentSection> sections, Long hrId) {
        Set<String> skills = sections.stream()
                .map(AssessmentSection::getSubject)
                .filter(subject -> subject != null && !subject.isBlank())
                .map(subject -> normalizeSkill(subject, hrId))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return buildSkillSignature(new ArrayList<>(skills));
    }

    private String normalizeSkill(String skill, Long hrId) {
        if (skill == null) {
            return "";
        }

        String trimmed = skill.trim();
        List<String> visibleSubjects = hrId == null
                ? questionService.getAllSubjects()
                : questionService.getAllSubjectsForHr(hrId);

        return visibleSubjects.stream()
                .filter(subject -> subject != null
                        && canonicalizeSkill(subject).equals(canonicalizeSkill(trimmed)))
                .findFirst()
                .orElse(trimmed);
    }

    private String canonicalizeSkill(String skill) {
        if (skill == null) {
            return "";
        }

        return skill
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private boolean matchesCandidateSkill(Set<String> candidateSkillKeys, String assessmentSkill) {
        if (assessmentSkill == null || assessmentSkill.isBlank()) {
            return false;
        }
        String assessmentKey = buildSkillMatchKey(assessmentSkill);
        return !assessmentKey.isBlank() && candidateSkillKeys.contains(assessmentKey);
    }

    private String buildSkillMatchKey(String skill) {
        String canonical = canonicalizeSkill(normalizeSkill(skill, null));
        if (canonical.isBlank()) {
            return "";
        }

        String simplified = Arrays.stream(canonical.split("\\s+"))
                .filter(token -> !token.isBlank())
                .filter(token -> !isGenericSkillWord(token))
                .collect(Collectors.joining(" "));

        return simplified.isBlank() ? canonical : simplified;
    }

    private boolean isGenericSkillWord(String token) {
        return switch (token) {
            case "programming", "developer", "development", "coding", "language", "basics", "advanced" -> true;
            default -> false;
        };
    }

    private List<Question> getQuestionsForMode(String subject, String sectionMode, Long hrId) {
        List<Question> questions = hrId == null
                ? questionService.getQuestionsBySubject(subject)
                : questionService.getQuestionsBySubjectForHr(subject, hrId);
        if ("COMPILER".equals(sectionMode)) {
            return questions.stream().filter(Question::isHasCompiler).toList();
        }
        return questions.stream().filter(question -> !question.isHasCompiler()).toList();
    }

    private String normalizeSectionMode(String sectionMode) {
        if (sectionMode == null || sectionMode.isBlank()) {
            return "NO_COMPILER";
        }
        return "COMPILER".equalsIgnoreCase(sectionMode.trim()) ? "COMPILER" : "NO_COMPILER";
    }

    private String formatModeLabel(String sectionMode) {
        return "COMPILER".equals(sectionMode) ? "coding/compiler-enabled" : "no-compiler";
    }

    private List<String> toStringList(Object rawValue) {
        if (!(rawValue instanceof List<?> rawList)) {
            return List.of();
        }

        return rawList.stream()
                .filter(Objects::nonNull)
                .map(Object::toString)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }
}
