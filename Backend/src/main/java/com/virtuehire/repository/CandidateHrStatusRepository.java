package com.virtuehire.repository;

import com.virtuehire.model.CandidateHrStatus;
import com.virtuehire.model.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateHrStatusRepository extends JpaRepository<CandidateHrStatus, Long> {

    Optional<CandidateHrStatus> findByCandidateIdAndHrId(Long candidateId, Long hrId);

    List<CandidateHrStatus> findByHrIdAndStatusIn(Long hrId, List<CandidateStatus> statuses);

    List<CandidateHrStatus> findByHrId(Long hrId);

    boolean existsByCandidateIdAndHrId(Long candidateId, Long hrId);
}
