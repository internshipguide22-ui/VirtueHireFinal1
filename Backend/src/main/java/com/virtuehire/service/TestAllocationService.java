package com.virtuehire.service;

import com.virtuehire.model.*;
import com.virtuehire.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TestAllocationService {

    private static final Logger logger = LoggerFactory.getLogger(TestAllocationService.class);

    private final CandidateTestMappingRepository testMappingRepo;
    private final CandidateRepository candidateRepo;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentSectionRepository assessmentSectionRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final HiringWorkflowService hiringWorkflowService;
    private final JavaMailSender mailSender;

    public TestAllocationService(CandidateTestMappingRepository testMappingRepo,
                                 CandidateRepository candidateRepo,
                                 AssessmentRepository assessmentRepository,
                                 AssessmentSectionRepository assessmentSectionRepository,
                                 AssessmentQuestionRepository assessmentQuestionRepository,
                                 HiringWorkflowService hiringWorkflowService,
                                 JavaMailSender mailSender) {
        this.testMappingRepo = testMappingRepo;
        this.candidateRepo = candidateRepo;
        this.assessmentRepository = assessmentRepository;
        this.assessmentSectionRepository = assessmentSectionRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.hiringWorkflowService = hiringWorkflowService;
        this.mailSender = mailSender;
    }

    /**
     * Get all assigned tests for a candidate
     */
    public List<CandidateTestMapping> getAssignedTestsForCandidate(Long candidateId) {
        return testMappingRepo.findByCandidateId(candidateId);
    }

    // ===== TEST RETRIEVAL (from Admin's existing tests) =====

    /**
     * Get all available tests (subjects) created by Admin
     * These are reused from the existing Admin "Manage Test" module
     */
    public List<Map<String, Object>> getAvailableTests() {
        return assessmentRepository.findAll().stream()
            .sorted(Comparator.comparing(Assessment::getCreatedAt).reversed())
            .map(this::toAssessmentSummary)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAvailableTests(Long hrId) {
        return assessmentRepository.findAll().stream()
            .filter(assessment -> isAssessmentOwnedByHr(assessment.getId(), hrId))
            .sorted(Comparator.comparing(Assessment::getCreatedAt).reversed())
            .map(this::toAssessmentSummary)
            .collect(Collectors.toList());
    }

    /**
     * Get test details by assessment ID
     */
    public Map<String, Object> getTestDetails(Long testId) {
        Assessment assessment = assessmentRepository.findById(testId)
            .orElseThrow(() -> new RuntimeException("Test not found"));
        return toAssessmentSummary(assessment);
    }

    // ===== TEST ASSIGNMENT =====

    /**
     * Assign test to candidate (prevent duplicates)
     * @return CandidateTestMapping object or null if already assigned
     */
    public CandidateTestMapping assignTestToCandidate(Long candidateId, Long testId, Long hrId) {
        return assignTestToCandidate(candidateId, testId, hrId, null);
    }

    public CandidateTestMapping assignTestToCandidate(Long candidateId, Long testId, Long hrId, LocalDateTime availableFrom) {
        // FIX: Add defensive validation and logging
        if (candidateId == null) {
            logger.error("ASSIGN TEST FAILED: candidateId is null");
            throw new RuntimeException("Candidate ID cannot be null");
        }
        if (testId == null) {
            logger.error("ASSIGN TEST FAILED: testId is null");
            throw new RuntimeException("Test ID cannot be null");
        }

        logger.info("ASSIGN TEST START: candidateId={}, testId={}, hrId={}", candidateId, testId, hrId);

        Assessment assessment = assessmentRepository.findById(testId)
            .orElseThrow(() -> new RuntimeException("Invalid test id: " + testId));

        if (testMappingRepo.existsByBothCandidateAndTest(candidateId, testId)) {
            logger.warn("ASSIGN TEST: Test '{}' already assigned to candidate {}", assessment.getAssessmentName(), candidateId);
            throw new RuntimeException("Test '" + assessment.getAssessmentName() + "' is already assigned to this candidate");
        }

        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isEmpty()) {
            logger.error("ASSIGN TEST FAILED: Candidate {} not found", candidateId);
            throw new RuntimeException("Candidate not found");
        }

        Candidate candidate = candidateOpt.get();
        logger.info("ASSIGN TEST: Found candidate {} - {}", candidate.getId(), candidate.getFullName());

        Map<String, Object> testDetails = toAssessmentSummary(assessment);
        Integer durationMinutes = ((Number) testDetails.get("durationMinutes")).intValue();
        String description = String.valueOf(testDetails.get("description"));

        CandidateTestMapping mapping = new CandidateTestMapping(
            candidateId,
            assessment.getId(),
            hrId,
            assessment.getAssessmentName(),
            description,
            durationMinutes,
            availableFrom
        );

        mapping.setAssignedAt(LocalDateTime.now());
        mapping.setAvailableFrom(availableFrom != null ? availableFrom : LocalDateTime.now());

        // DEBUG: Verify the mapping entity has correct candidateId BEFORE saving
        logger.info("ASSIGN TEST: About to save - mapping.candidateId={}, mapping.testId={}, mapping.testName='{}'", 
            mapping.getCandidateId(), mapping.getTestId(), mapping.getTestName());

        CandidateTestMapping saved = testMappingRepo.save(mapping);

        logger.info("ASSIGN TEST SUCCESS: Saved mapping id={}, candidateId={}, testId={}, testName='{}'", 
            saved.getId(), saved.getCandidateId(), saved.getTestId(), saved.getTestName());
        
        // DEBUG: Verify what was actually saved by querying it back
        List<CandidateTestMapping> verifyMappings = testMappingRepo.findByCandidateId(candidateId);
        logger.info("ASSIGN TEST VERIFY: Candidate {} now has {} tests assigned", 
            candidateId, verifyMappings.size());
        
        // CRITICAL DEBUG: Check total count in database to detect bulk insert
        long totalMappings = testMappingRepo.count();
        logger.info("ASSIGN TEST TOTAL: Total mappings in database = {}", totalMappings);
        
        // CRITICAL DEBUG: Query all recent mappings to see if there are unexpected inserts
        List<CandidateTestMapping> allRecentMappings = testMappingRepo.findByTestId(testId);
        logger.info("ASSIGN TEST ALL FOR TEST: Test {} has {} total assignments across all candidates", 
            testId, allRecentMappings.size());
        for (CandidateTestMapping m : allRecentMappings) {
            logger.info("  - Mapping: id={}, candidateId={}, testId={}", 
                m.getId(), m.getCandidateId(), m.getTestId());
        }

        // FIX: Only update the specific candidate's status, not all candidates
        if (candidate.getApplicationStatus() == null ||
           (candidate.getApplicationStatus() != CandidateStatus.APPROVED &&
            candidate.getApplicationStatus() != CandidateStatus.REJECTED)) {
            logger.info("ASSIGN TEST: Updating candidate {} status to TEST_ASSIGNED", candidateId);
            hiringWorkflowService.moveToTestAssigned(candidateId);
        }

        // Send email notification to candidate
        sendTestAssignmentEmail(candidate, assessment, availableFrom);

        return saved;
    }

    /**
     * Assign multiple tests to a candidate
     */
    public List<CandidateTestMapping> assignMultipleTestsToCandidate(Long candidateId, List<Long> testIds, Long hrId) {
        return assignMultipleTestsToCandidate(candidateId, testIds, hrId, null);
    }

    public List<CandidateTestMapping> assignMultipleTestsToCandidate(Long candidateId, List<Long> testIds, Long hrId,
                                                                     LocalDateTime availableFrom) {
        // FIX: Add validation and logging for bulk assignment
        if (candidateId == null) {
            logger.error("ASSIGN MULTIPLE TESTS FAILED: candidateId is null");
            throw new RuntimeException("Candidate ID cannot be null");
        }
        if (testIds == null || testIds.isEmpty()) {
            logger.error("ASSIGN MULTIPLE TESTS FAILED: testIds is null or empty");
            throw new RuntimeException("Test IDs cannot be null or empty");
        }

        logger.info("ASSIGN MULTIPLE TESTS START: candidateId={}, testCount={}", candidateId, testIds.size());

        List<CandidateTestMapping> mappings = new ArrayList<>();

        for (Long testId : testIds) {
            mappings.add(assignTestToCandidate(candidateId, testId, hrId, availableFrom));
        }

        logger.info("ASSIGN MULTIPLE TESTS COMPLETE: candidateId={}, assignedCount={}", candidateId, mappings.size());

        return mappings;
    }

    /**
     * Remove test assignment (HR action to unassign)
     */
    public void removeTestAssignment(Long mappingId) {
        testMappingRepo.deleteById(mappingId);
    }

    // ===== TEST SUBMISSION =====

    /**
     * Mark test as submitted for a candidate
     */
    public CandidateTestMapping markTestSubmitted(Long mappingId, Integer scoreObtained) {
        Optional<CandidateTestMapping> mappingOpt = testMappingRepo.findById(mappingId);
        if (mappingOpt.isPresent()) {
            CandidateTestMapping mapping = mappingOpt.get();
            mapping.setSubmitted(true);
            mapping.setSubmittedAt(LocalDateTime.now());
            mapping.setScoreObtained(scoreObtained);
            return testMappingRepo.save(mapping);
        }
        throw new RuntimeException("Test mapping not found");
    }

    /**
     * Get candidates awaiting test assignment (INTERESTED or UNDER_REVIEW)
     */
    public List<Candidate> getCandidatesAwaitingTestAssignment() {
        return hiringWorkflowService.getCandidatesForHrAction();
    }

    /**
     * Get all test assignments for reporting
     */
    public List<Map<String, Object>> getTestAssignmentReport() {
        return assessmentRepository.findAll().stream()
            .map(assessment -> {
                List<CandidateTestMapping> mappings = testMappingRepo.findByTestId(assessment.getId());
                return Map.of(
                    "testId", (Object) assessment.getId(),
                    "testName", (Object) assessment.getAssessmentName(),
                    "totalAssignments", (Object) mappings.size(),
                    "submittedCount", (Object) mappings.stream()
                        .filter(m -> Boolean.TRUE.equals(m.getSubmitted()))
                        .count(),
                    "pendingCount", (Object) mappings.stream()
                        .filter(m -> Boolean.FALSE.equals(m.getSubmitted()))
                        .count()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get candidates assigned to a specific test with their submission status
     */
    public List<Map<String, Object>> getCandidatesByTestWithStatus(Long testId) {
        Assessment assessment = assessmentRepository.findById(testId)
            .orElseThrow(() -> new RuntimeException("Test not found"));
        List<CandidateTestMapping> mappings = testMappingRepo.findByTestId(testId);

        return mappings.stream()
            .map(mapping -> {
                Optional<Candidate> candidateOpt = candidateRepo.findById(mapping.getCandidateId());
                String candidateName = candidateOpt.isPresent() && candidateOpt.get().getFullName() != null 
                    ? candidateOpt.get().getFullName() : "Unknown";
                String candidateEmail = candidateOpt.isPresent() && candidateOpt.get().getEmail() != null 
                    ? candidateOpt.get().getEmail() : "Unknown";
                
                return Map.of(
                    "candidateId", (Object) mapping.getCandidateId(),
                    "candidateName", (Object) candidateName,
                    "candidateEmail", (Object) candidateEmail,
                    "testId", (Object) assessment.getId(),
                    "testName", (Object) assessment.getAssessmentName(),
                    "assignedAt", (Object) (mapping.getAssignedAt() != null ? mapping.getAssignedAt() : LocalDateTime.now()),
                    "availableFrom", (Object) (mapping.getAvailableFrom() != null ? mapping.getAvailableFrom() : mapping.getAssignedAt()),
                    "submitted", (Object) (mapping.getSubmitted() != null ? mapping.getSubmitted() : false),
                    "submittedAt", (Object) (mapping.getSubmittedAt() != null ? mapping.getSubmittedAt() : ""),
                    "scoreObtained", (Object) (mapping.getScoreObtained() != null ? mapping.getScoreObtained() : 0)
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get unsubmitted test assignments (for HR to follow up)
     */
    public List<Map<String, Object>> getUnsubmittedAssignments() {
        List<CandidateTestMapping> allMappings = testMappingRepo.findAll();
        
        return allMappings.stream()
            .filter(m -> Boolean.FALSE.equals(m.getSubmitted()))
            .map(mapping -> {
                Optional<Candidate> candidateOpt = candidateRepo.findById(mapping.getCandidateId());
                
                // FIX #3: Ensure non-null values for Map.of()
                String candidateName = candidateOpt.isPresent() && candidateOpt.get().getFullName() != null 
                    ? candidateOpt.get().getFullName() : "Unknown";
                String testNameValue = mapping.getTestName() != null ? mapping.getTestName() : "Unknown";
                LocalDateTime assignedAt = mapping.getAssignedAt() != null ? mapping.getAssignedAt() : LocalDateTime.now();
                
                return Map.of(
                    "candidateId", (Object) mapping.getCandidateId(),
                    "candidateName", (Object) candidateName,
                    "testName", (Object) testNameValue,
                    "assignedAt", (Object) assignedAt,
                    "daysOverdue", (Object) calculateDaysOverdue(assignedAt),
                    "mappingId", (Object) (mapping.getId() != null ? mapping.getId() : 0L)
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Calculate days overdue for a test
     */
    private long calculateDaysOverdue(LocalDateTime assignedAt) {
        return java.time.temporal.ChronoUnit.DAYS.between(assignedAt, LocalDateTime.now());
    }

    /**
     * Send email notification to candidate when test is assigned
     */
    private void sendTestAssignmentEmail(Candidate candidate, Assessment assessment, LocalDateTime availableFrom) {
        try {
            if (candidate.getEmail() == null || candidate.getEmail().isBlank()) {
                logger.warn("Cannot send test assignment email - candidate {} has no email", candidate.getId());
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(candidate.getEmail());
            message.setSubject("New Test Assigned - " + assessment.getAssessmentName());
            
            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Hello ").append(candidate.getFullName()).append(",\n\n");
            emailBody.append("A new test has been assigned to you by the HR team.\n\n");
            emailBody.append("Test Details:\n");
            emailBody.append("- Test Name: ").append(assessment.getAssessmentName()).append("\n");
            
            if (assessment.getDescription() != null && !assessment.getDescription().isBlank()) {
                emailBody.append("- Description: ").append(assessment.getDescription()).append("\n");
            }
            
            if (availableFrom != null && availableFrom.isAfter(LocalDateTime.now())) {
                emailBody.append("- Available From: ").append(availableFrom.toLocalDate()).append(" at ").append(availableFrom.toLocalTime()).append("\n");
                emailBody.append("\nPlease log in to the portal after the scheduled time to take the test.\n");
            } else {
                emailBody.append("- Status: Available immediately\n");
                emailBody.append("\nPlease log in to the portal to take the test at your earliest convenience.\n");
            }
            
            emailBody.append("\nBest regards,\n");
            emailBody.append("VirtueHire Team\n");
            emailBody.append("(Sent on behalf of HR)");
            
            message.setText(emailBody.toString());
            mailSender.send(message);
            
            logger.info("Test assignment email sent to candidate {} at {}", candidate.getId(), candidate.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send test assignment email to candidate {}: {}", candidate.getId(), e.getMessage());
        }
    }

    private Map<String, Object> toAssessmentSummary(Assessment assessment) {
        List<AssessmentSection> sections = assessmentSectionRepository.findByAssessmentIdOrderBySectionNumberAsc(assessment.getId());
        int durationMinutes = sections.stream().mapToInt(AssessmentSection::getSectionTime).sum();
        int questionCount = sections.stream().mapToInt(AssessmentSection::getQuestionCount).sum();
        List<Map<String, Object>> sectionDetails = sections.stream()
            .map(section -> Map.of(
                "id", (Object) section.getId(),
                "sectionNumber", (Object) section.getSectionNumber(),
                "subject", (Object) section.getSubject(),
                "questionCount", (Object) section.getQuestionCount(),
                "sectionTime", (Object) section.getSectionTime(),
                "passPercentage", (Object) section.getPassPercentage(),
                "sectionMode", (Object) section.getSectionMode(),
                "supportedLanguages", (Object) (section.getSupportedLanguages() != null ? section.getSupportedLanguages() : "")
            ))
            .collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("testId", assessment.getId());
        summary.put("title", assessment.getAssessmentName());
        summary.put("testName", assessment.getAssessmentName());
        summary.put("description", assessment.getDescription() != null ? assessment.getDescription() : "");
        summary.put("questionCount", questionCount);
        summary.put("questions", questionCount);
        summary.put("durationMinutes", durationMinutes);
        summary.put("sectionCount", sections.size());
        summary.put("sections", sectionDetails);
        summary.put("createdAt", assessment.getCreatedAt());
        summary.put("locked", assessment.isLocked());
        return summary;
    }

    private boolean isAssessmentOwnedByHr(Long assessmentId, Long hrId) {
        if (assessmentId == null || hrId == null) {
            return false;
        }

        List<AssessmentQuestion> assessmentQuestions = assessmentQuestionRepository.findByAssessmentId(assessmentId);
        if (assessmentQuestions.isEmpty()) {
            return false;
        }

        return assessmentQuestions.stream().allMatch(assessmentQuestion -> {
            Question question = assessmentQuestion.getQuestion();
            return question != null
                && "HR".equalsIgnoreCase(question.getCreatedByRole())
                && Objects.equals(question.getCreatedByHrId(), hrId);
        });
    }
}
