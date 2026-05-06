package com.virtuehire.repository;

import com.virtuehire.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    // Find submissions by candidate
    @Query("SELECT asub FROM AssignmentSubmission asub WHERE asub.candidateId = :candidateId ORDER BY asub.submittedAt DESC")
    List<AssignmentSubmission> findByCandidateId(@Param("candidateId") Long candidateId);

    // Find submission by candidate and test
    Optional<AssignmentSubmission> findByCandidateIdAndTestId(Long candidateId, Long testId);

    // Find submissions by test
    @Query("SELECT asub FROM AssignmentSubmission asub WHERE asub.testId = :testId ORDER BY asub.submittedAt DESC")
    List<AssignmentSubmission> findByTestId(@Param("testId") Long testId);

    // Find submissions by candidateTestMappingId
    Optional<AssignmentSubmission> findByCandidateTestMappingId(Long candidateTestMappingId);

    // Find passed submissions for a candidate
    @Query("SELECT asub FROM AssignmentSubmission asub WHERE asub.candidateId = :candidateId AND asub.passed = true ORDER BY asub.submittedAt DESC")
    List<AssignmentSubmission> findPassedByCandidateId(@Param("candidateId") Long candidateId);

    // Count submissions for a test
    @Query("SELECT COUNT(asub) FROM AssignmentSubmission asub WHERE asub.testId = :testId")
    long countByTestId(@Param("testId") Long testId);
}
