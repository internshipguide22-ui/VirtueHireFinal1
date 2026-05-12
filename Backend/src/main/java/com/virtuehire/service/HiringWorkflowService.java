package com.virtuehire.service;

import com.virtuehire.model.*;
import com.virtuehire.repository.*;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HiringWorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(HiringWorkflowService.class);

    private final CandidateRepository candidateRepo;
    private final CandidateTestMappingRepository testMappingRepo;
    private final AssignmentSubmissionRepository submissionRepo;
    private final HrRepository hrRepo;

    public HiringWorkflowService(CandidateRepository candidateRepo,
                                 CandidateTestMappingRepository testMappingRepo,
                                 AssignmentSubmissionRepository submissionRepo,
                                 HrRepository hrRepo) {
        this.candidateRepo = candidateRepo;
        this.testMappingRepo = testMappingRepo;
        this.submissionRepo = submissionRepo;
        this.hrRepo = hrRepo;
    }

    // ===== CANDIDATE STATUS MANAGEMENT =====

    /**
     * Mark candidate as interested (initial status)
     */
    public Candidate markCandidateInterested(Long candidateId) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            candidate.setApplicationStatus(CandidateStatus.INTERESTED);
            candidate.setStatusUpdatedAt(LocalDateTime.now());
            return candidateRepo.save(candidate);
        }
        return null;
    }

    /**
     * Move candidate to UNDER_REVIEW status
     */
    public Candidate moveToUnderReview(Long candidateId) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            candidate.setApplicationStatus(CandidateStatus.UNDER_REVIEW);
            candidate.setStatusUpdatedAt(LocalDateTime.now());
            return candidateRepo.save(candidate);
        }
        return null;
    }

    /**
     * Approve candidate with feedback
     */
    public Candidate approveCandidate(Long candidateId, String feedback) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            candidate.setApplicationStatus(CandidateStatus.APPROVED);
            candidate.setHrFeedback(feedback != null ? feedback : "Approved");
            candidate.setStatusUpdatedAt(LocalDateTime.now());
            candidate.setApproved(true);
            return candidateRepo.save(candidate);
        }
        return null;
    }

    /**
     * Reject candidate with feedback
     */
    public Candidate rejectCandidate(Long candidateId, String feedback) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            candidate.setApplicationStatus(CandidateStatus.REJECTED);
            candidate.setHrFeedback(feedback != null ? feedback : "Rejected");
            candidate.setStatusUpdatedAt(LocalDateTime.now());
            candidate.setApproved(false);
            return candidateRepo.save(candidate);
        }
        return null;
    }

    /**
     * Move candidate to TEST_ASSIGNED status
     */
    public Candidate moveToTestAssigned(Long candidateId) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            if (candidate.getApplicationStatus() != CandidateStatus.APPROVED &&
                candidate.getApplicationStatus() != CandidateStatus.REJECTED) {
                candidate.setApplicationStatus(CandidateStatus.TEST_ASSIGNED);
                candidate.setStatusUpdatedAt(LocalDateTime.now());
                return candidateRepo.save(candidate);
            }
        }
        return null;
    }

    // ===== CANDIDATE RETRIEVAL =====

    /**
     * Get all candidates with a specific status
     */
    public List<Candidate> getCandidatesByStatus(CandidateStatus status) {
        return candidateRepo.findByApplicationStatus(status);
    }

    /**
     * Get candidates by multiple statuses
     */
    public List<Candidate> getCandidatesByMultipleStatuses(List<CandidateStatus> statuses) {
        return candidateRepo.findByApplicationStatusIn(statuses);
    }

    /**
     * Get interested or under review candidates for HR
     */
    public List<Candidate> getCandidatesForHrAction() {
        return candidateRepo.findByApplicationStatusIn(
            List.of(CandidateStatus.INTERESTED, CandidateStatus.UNDER_REVIEW, CandidateStatus.TEST_ASSIGNED)
        );
    }

    /**
     * Get approved candidates
     */
    public List<Candidate> getApprovedCandidates() {
        return candidateRepo.findByApplicationStatus(CandidateStatus.APPROVED);
    }

    /**
     * Get rejected candidates
     */
    public List<Candidate> getRejectedCandidates() {
        return candidateRepo.findByApplicationStatus(CandidateStatus.REJECTED);
    }

    /**
     * Get candidates with assigned tests
     */
    public List<Candidate> getCandidatesWithTestAssignments() {
        return candidateRepo.findByApplicationStatus(CandidateStatus.TEST_ASSIGNED);
    }

    // ===== TEST MAPPING MANAGEMENT =====

    /**
     * Check if test is already assigned to candidate (prevent duplicates)
     */
    public boolean isTestAlreadyAssigned(Long candidateId, Long testId) {
        return testMappingRepo.existsByBothCandidateAndTest(candidateId, testId);
    }

    /**
     * Get all assigned tests for a candidate
     */
    public List<CandidateTestMapping> getAssignedTestsForCandidate(Long candidateId) {
        // FIX: Add logging to verify per-candidate isolation
        if (candidateId == null) {
            logger.error("GET ASSIGNED TESTS: candidateId is null");
            return List.of();
        }
        
        List<CandidateTestMapping> mappings = testMappingRepo.findByCandidateId(candidateId);
        logger.info("GET ASSIGNED TESTS: Found {} tests for candidate {}", mappings.size(), candidateId);
        
        // Verify all mappings belong to this candidate
        for (CandidateTestMapping mapping : mappings) {
            if (!candidateId.equals(mapping.getCandidateId())) {
                logger.error("GET ASSIGNED TESTS ERROR: Mapping {} has candidateId {} but expected {}", 
                    mapping.getId(), mapping.getCandidateId(), candidateId);
            }
        }
        
        return mappings;
    }

    /**
     * Get unsubmitted tests for a candidate
     */
    public List<CandidateTestMapping> getUnsubmittedTestsForCandidate(Long candidateId) {
        return testMappingRepo.findUnsubmittedByCandidateId(candidateId);
    }

    /**
     * Get submitted tests for a candidate
     */
    public List<CandidateTestMapping> getSubmittedTestsForCandidate(Long candidateId) {
        return testMappingRepo.findSubmittedByCandidateId(candidateId);
    }

    /**
     * Get all candidates assigned to a test
     */
    public List<CandidateTestMapping> getCandidatesForTest(Long testId) {
        return testMappingRepo.findByTestId(testId);
    }

    /**
     * Get test mappings assigned by a specific HR
     */
    public List<CandidateTestMapping> getTestMappingsByHr(Long hrId) {
        return testMappingRepo.findByAssignedByHrId(hrId);
    }

    // ===== SUBMISSION MANAGEMENT =====

    /**
     * Get all submissions for a candidate
     */
    public List<AssignmentSubmission> getSubmissionsForCandidate(Long candidateId) {
        return submissionRepo.findByCandidateId(candidateId);
    }

    /**
     * Get submission for candidate and test
     */
    public Optional<AssignmentSubmission> getSubmissionForCandidateTest(Long candidateId, Long testId) {
        return submissionRepo.findByCandidateIdAndTestId(candidateId, testId);
    }

    public AssignmentSubmission submitAssignment(AssignmentSubmission submission) {
        Optional<AssignmentSubmission> existing = submissionRepo.findByCandidateTestMappingId(
            submission.getCandidateTestMappingId()
        );
        if (existing.isPresent()) {
            throw new RuntimeException("Assignment already submitted");
        }
        return submissionRepo.save(submission);
    }

    /**
     * Get all submissions for a test
     */
    public List<AssignmentSubmission> getSubmissionsForTest(Long testId) {
        return submissionRepo.findByTestId(testId);
    }

    /**
     * Get passed submissions for a candidate
     */
    public List<AssignmentSubmission> getPassedSubmissionsForCandidate(Long candidateId) {
        return submissionRepo.findPassedByCandidateId(candidateId);
    }

    // ===== ADMIN REPORTING =====

    /**
     * Get approval/rejection history with feedback
     */
    public Map<String, Object> getCandidateFeedback(Long candidateId) {
        Optional<Candidate> candidateOpt = candidateRepo.findById(candidateId);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            return Map.of(
                "candidateId", candidate.getId(),
                "candidateName", candidate.getFullName(),
                "candidateEmail", candidate.getEmail(),
                "status", candidate.getApplicationStatus().toString(),
                "feedback", candidate.getHrFeedback() != null ? candidate.getHrFeedback() : "",
                "statusUpdatedAt", candidate.getStatusUpdatedAt(),
                "testAssignments", getAssignedTestsForCandidate(candidateId)
            );
        }
        return null;
    }

    /**
     * Get all approved/rejected candidates with feedback for Admin
     */
    public List<Map<String, Object>> getAllApprovedRejectedCandidates() {
        List<Candidate> approved = getApprovedCandidates();
        List<Candidate> rejected = getRejectedCandidates();
        
        List<Candidate> allDecided = new java.util.ArrayList<>();
        allDecided.addAll(approved);
        allDecided.addAll(rejected);

        return allDecided.stream()
            .map(candidate -> Map.of(
                "candidateId", (Object) candidate.getId(),
                "candidateName", (Object) candidate.getFullName(),
                "candidateEmail", (Object) candidate.getEmail(),
                "status", (Object) candidate.getApplicationStatus().toString(),
                "feedback", (Object) (candidate.getHrFeedback() != null ? candidate.getHrFeedback() : ""),
                "statusUpdatedAt", (Object) candidate.getStatusUpdatedAt(),
                "testCount", (Object) getAssignedTestsForCandidate(candidate.getId()).size()
            ))
            .collect(Collectors.toList());
    }
}
