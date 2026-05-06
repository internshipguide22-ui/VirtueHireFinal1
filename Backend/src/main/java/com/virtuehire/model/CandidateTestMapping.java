package com.virtuehire.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_test_mapping")
public class CandidateTestMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long testId;

    @Column(nullable = false)
    private Long assignedByHrId;

    @Column(nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    // Test details (denormalized for quick access)
    @Column(nullable = false)
    private String testName;

    @Column(length = 1000)
    private String testDescription;

    @Column(nullable = false)
    private Integer durationMinutes;

    private Boolean submitted = false;
    private LocalDateTime submittedAt;
    private Integer scoreObtained;

    // ===== Constructors =====
    public CandidateTestMapping() {
    }

    public CandidateTestMapping(Long candidateId, Long testId, Long assignedByHrId, 
                                String testName, String testDescription, Integer durationMinutes) {
        this.candidateId = candidateId;
        this.testId = testId;
        this.assignedByHrId = assignedByHrId;
        this.testName = testName;
        this.testDescription = testDescription;
        this.durationMinutes = durationMinutes;
        this.assignedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public Long getAssignedByHrId() {
        return assignedByHrId;
    }

    public void setAssignedByHrId(Long assignedByHrId) {
        this.assignedByHrId = assignedByHrId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getTestDescription() {
        return testDescription;
    }

    public void setTestDescription(String testDescription) {
        this.testDescription = testDescription;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getSubmitted() {
        return submitted;
    }

    public void setSubmitted(Boolean submitted) {
        this.submitted = submitted;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getScoreObtained() {
        return scoreObtained;
    }

    public void setScoreObtained(Integer scoreObtained) {
        this.scoreObtained = scoreObtained;
    }
}
