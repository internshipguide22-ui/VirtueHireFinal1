package com.virtuehire.repository;

import com.virtuehire.model.Candidate;
import com.virtuehire.model.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    // Case-insensitive login check
    @Query("SELECT c FROM Candidate c WHERE lower(c.email) = lower(:email) AND c.password = :password")
    Optional<Candidate> login(@Param("email") String email, @Param("password") String password);

    Optional<Candidate> findByEmail(String email);

    // Find candidates by application status
    List<Candidate> findByApplicationStatus(CandidateStatus status);

    // Find candidates with specific statuses
    @Query("SELECT c FROM Candidate c WHERE c.applicationStatus IN :statuses")
    List<Candidate> findByApplicationStatusIn(@Param("statuses") List<CandidateStatus> statuses);

    // Find candidates by approval status for HR
    @Query("SELECT c FROM Candidate c WHERE c.approved = :approved ORDER BY c.id DESC")
    List<Candidate> findByApproved(@Param("approved") Boolean approved);
}
