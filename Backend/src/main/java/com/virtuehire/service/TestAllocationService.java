package com.virtuehire.service;

import com.virtuehire.model.*;
import com.virtuehire.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestAllocationService {

    private final CandidateTestMappingRepository testMappingRepo;
    private final CandidateRepository candidateRepo;
    private final QuestionService questionService;
    private final HiringWorkflowService hiringWorkflowService;

    public TestAllocationService(CandidateTestMappingRepository testMappingRepo,
                                 CandidateRepository candidateRepo,
                                 QuestionService questionService,
                                 HiringWorkflowService hiringWorkflowService) {
        this.testMappingRepo = testMappingRepo;
        this.candidateRepo = candidateRepo;
        this.questionService = questionService;
        this.hiringWorkflowService = hiringWorkflowService;
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
        List<String> subjects = questionService.getAllSubjects();
        
        return subjects.stream()
            .map(subject -> {
                List<Question> questions = questionService.getQuestionsBySubject(subject);
                
                // Get assessment config if available
                List<AssessmentConfig> configs = questionService.getConfigs(subject);
                
                int durationMinutes = 60; // default
                String description = "";
                
                if (!configs.isEmpty()) {
                    AssessmentConfig config = configs.get(0);
                    durationMinutes = config.getTimeLimit() != null ? config.getTimeLimit() : 60;
                    // FIX: Use default pass percentage (60%) since AssessmentConfig doesn't have this field
                    description = "60% pass required";
                }
                
                return Map.of(
                    "testName", (Object) subject,
                    "testId", (Object) subject, // Using subject name as ID
                    "description", (Object) description,
                    "questionCount", (Object) questions.size(),
                    "durationMinutes", (Object) durationMinutes,
                    "questionsIncluded", (Object) questions.size()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get test details by subject/test name
     */
    public Map<String, Object> getTestDetails(String testName) {
        List<Question> questions = questionService.getQuestionsBySubject(testName);
        List<AssessmentConfig> configs = questionService.getConfigs(testName);
        
        Map<String, Object> details = new HashMap<>();
        details.put("testName", testName);
        details.put("questionCount", questions.size());
        details.put("questions", questions);
        
        if (!configs.isEmpty()) {
            AssessmentConfig config = configs.get(0);
            details.put("durationMinutes", config.getTimeLimit() != null ? config.getTimeLimit() : 60);
            // FIX: Use default pass percentage (60%) since AssessmentConfig doesn't have this field
            details.put("passPercentage", 60);
            // FIX #2: Add description field
            details.put("description", "60% pass required");
        } else {
            details.put("durationMinutes", 60);
            details.put("passPercentage", 60);
            details.put("description", ""); // FIX #3: Ensure non-null description
        }
        
        return details;
    }

    // ===== TEST ASSIGNMENT =====

    /**
     * Assign test to candidate (prevent duplicates)
     * @return CandidateTestMapping object or null if already assigned
     */
    public CandidateTestMapping assignTestToCandidate(Long candidateId, String testName, Long hrId) {
        // FIX #8: Validate test exists before assignment
        List<String> subjects = questionService.getAllSubjects();
        if (!subjects.contains(testName)) {
            throw new RuntimeException("Invalid test name: " + testName);
        }
        
        // Check if already assigned
        List<CandidateTestMapping> existing = testMappingRepo.findByCandidateId(candidateId).stream()
            .filter(m -> m.getTestName().equalsIgnoreCase(testName))
            .collect(Collectors.toList());
        
        if (!existing.isEmpty()) {
            throw new RuntimeException("Test '" + testName + "' is already assigned to this candidate");
        }

        // Get candidate
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isEmpty()) {
            throw new RuntimeException("Candidate not found");
        }

        // Get test details
        Map<String, Object> testDetails = getTestDetails(testName);
        
        // FIX #7: Add debug logging
        System.out.println("Assigning test: " + testName);
        System.out.println("Test details: " + testDetails);
        
        // FIX #1: Safe type casting for durationMinutes
        Object durationValue = testDetails.get("durationMinutes");
        Integer durationMinutes = durationValue != null ? ((Number) durationValue).intValue() : 60;
        
        // FIX #3: Ensure non-null description
        Object descValue = testDetails.get("description");
        String description = descValue != null ? (String) descValue : "";

        // Create mapping
        // FIX #4: Use Math.abs for hashcode to avoid negative IDs
        CandidateTestMapping mapping = new CandidateTestMapping(
            candidateId,
            Long.valueOf(Math.abs(testName.hashCode())), // Using test name hash as ID (since tests are stored as subjects)
            hrId,
            testName,
            description,
            durationMinutes
        );

        mapping.setAssignedAt(LocalDateTime.now());

        // Save mapping
        CandidateTestMapping saved = testMappingRepo.save(mapping);

        // Update candidate status to TEST_ASSIGNED if not already approved/rejected
        Candidate candidate = candidateOpt.get();
        
        // FIX #5: Null-safe status check
        if (candidate.getApplicationStatus() == null ||
           (candidate.getApplicationStatus() != CandidateStatus.APPROVED &&
            candidate.getApplicationStatus() != CandidateStatus.REJECTED)) {
            hiringWorkflowService.moveToTestAssigned(candidateId);
        }

        return saved;
    }

    /**
     * Assign multiple tests to a candidate
     */
    public List<CandidateTestMapping> assignMultipleTestsToCandidate(Long candidateId, List<String> testNames, Long hrId) {
        List<CandidateTestMapping> mappings = new ArrayList<>();
        
        for (String testName : testNames) {
            try {
                CandidateTestMapping mapping = assignTestToCandidate(candidateId, testName, hrId);
                mappings.add(mapping);
            } catch (RuntimeException e) {
                // Skip already assigned tests
                if (!e.getMessage().contains("already assigned")) {
                    throw e;
                }
            }
        }
        
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
        List<String> subjects = questionService.getAllSubjects();
        
        return subjects.stream()
            .map(subject -> {
                // FIX #4: Use Math.abs for hashcode to avoid negative IDs
                List<CandidateTestMapping> mappings = testMappingRepo.findByTestId(
                    Long.valueOf(Math.abs(subject.hashCode()))
                );
                
                return Map.of(
                    "testName", (Object) subject,
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
    public List<Map<String, Object>> getCandidatesByTestWithStatus(String testName) {
        // FIX #4: Use Math.abs for hashcode to avoid negative IDs
        List<CandidateTestMapping> mappings = testMappingRepo.findByTestId(
            Long.valueOf(Math.abs(testName.hashCode()))
        );

        return mappings.stream()
            .map(mapping -> {
                Optional<Candidate> candidateOpt = candidateRepo.findById(mapping.getCandidateId());
                
                // FIX #3: Ensure non-null values for Map.of()
                String candidateName = candidateOpt.isPresent() && candidateOpt.get().getFullName() != null 
                    ? candidateOpt.get().getFullName() : "Unknown";
                String candidateEmail = candidateOpt.isPresent() && candidateOpt.get().getEmail() != null 
                    ? candidateOpt.get().getEmail() : "Unknown";
                
                return Map.of(
                    "candidateId", (Object) mapping.getCandidateId(),
                    "candidateName", (Object) candidateName,
                    "candidateEmail", (Object) candidateEmail,
                    "testName", (Object) testName,
                    "assignedAt", (Object) (mapping.getAssignedAt() != null ? mapping.getAssignedAt() : LocalDateTime.now()),
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
}
