package com.virtuehire.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_hr_status", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"candidate_id", "hr_id"})
})
public class CandidateHrStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "hr_id", nullable = false)
    private Long hrId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.NEW;

    private LocalDateTime viewedAt;
    private LocalDateTime statusUpdatedAt = LocalDateTime.now();

    // Constructor
    public CandidateHrStatus() {}

    public CandidateHrStatus(Long candidateId, Long hrId, CandidateStatus status) {
        this.candidateId = candidateId;
        this.hrId = hrId;
        this.status = status;
        this.statusUpdatedAt = LocalDateTime.now();
        if (status != CandidateStatus.NEW) {
            this.viewedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getHrId() { return hrId; }
    public void setHrId(Long hrId) { this.hrId = hrId; }

    public CandidateStatus getStatus() { return status; }
    public void setStatus(CandidateStatus status) {
        this.status = status;
        this.statusUpdatedAt = LocalDateTime.now();
        if (status != CandidateStatus.NEW && this.viewedAt == null) {
            this.viewedAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }

    public LocalDateTime getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }
}
