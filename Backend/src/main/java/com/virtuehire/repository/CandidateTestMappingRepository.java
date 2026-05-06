package com.virtuehire.repository;

import com.virtuehire.model.CandidateTestMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidateTestMappingRepository extends JpaRepository<CandidateTestMapping, Long> {

    // Find all tests assigned to a candidate
    @Query("SELECT ctm FROM CandidateTestMapping ctm WHERE ctm.candidateId = :candidateId ORDER BY ctm.assignedAt DESC")
    List<CandidateTestMapping> findByCandidateId(@Param("candidateId") Long candidateId);

    // Find all candidates assigned a specific test
    @Query("SELECT ctm FROM CandidateTestMapping ctm WHERE ctm.testId = :testId ORDER BY ctm.assignedAt DESC")
    List<CandidateTestMapping> findByTestId(@Param("testId") Long testId);

    // Find tests assigned by a specific HR
    @Query("SELECT ctm FROM CandidateTestMapping ctm WHERE ctm.assignedByHrId = :hrId ORDER BY ctm.assignedAt DESC")
    List<CandidateTestMapping> findByAssignedByHrId(@Param("hrId") Long hrId);

    // Check if test is already assigned to candidate
    @Query("SELECT COUNT(ctm) > 0 FROM CandidateTestMapping ctm WHERE ctm.candidateId = :candidateId AND ctm.testId = :testId")
    boolean existsByBothCandidateAndTest(@Param("candidateId") Long candidateId, @Param("testId") Long testId);

    // Find unsubmitted tests for a candidate
    @Query("SELECT ctm FROM CandidateTestMapping ctm WHERE ctm.candidateId = :candidateId AND ctm.submitted = false ORDER BY ctm.assignedAt DESC")
    List<CandidateTestMapping> findUnsubmittedByCandidateId(@Param("candidateId") Long candidateId);

    // Find submitted tests for a candidate
    @Query("SELECT ctm FROM CandidateTestMapping ctm WHERE ctm.candidateId = :candidateId AND ctm.submitted = true ORDER BY ctm.submittedAt DESC")
    List<CandidateTestMapping> findSubmittedByCandidateId(@Param("candidateId") Long candidateId);

    // Find mapping by candidate and test
    Optional<CandidateTestMapping> findByCandidateIdAndTestId(Long candidateId, Long testId);
}
