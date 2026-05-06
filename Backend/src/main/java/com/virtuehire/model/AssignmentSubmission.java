package com.virtuehire.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long candidateTestMappingId;

    @Column(nullable = false)
    private Long testId;

    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Integer scoreObtained;

    @Column(length = 2000)
    private String submissionDetails; // JSON or detailed submission info

    private Boolean passed = false;

    @Column(length = 1000)
    private String status; // SUBMITTED, EVALUATED, etc.

    // ===== Constructors =====
    public AssignmentSubmission() {
    }

    public AssignmentSubmission(Long candidateId, Long candidateTestMappingId, Long testId, 
                                Integer scoreObtained, Boolean passed) {
        this.candidateId = candidateId;
        this.candidateTestMappingId = candidateTestMappingId;
        this.testId = testId;
        this.scoreObtained = scoreObtained;
        this.passed = passed;
        this.submittedAt = LocalDateTime.now();
        this.status = "SUBMITTED";
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

    public Long getCandidateTestMappingId() {
        return candidateTestMappingId;
    }

    public void setCandidateTestMappingId(Long candidateTestMappingId) {
        this.candidateTestMappingId = candidateTestMappingId;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
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

    public String getSubmissionDetails() {
        return submissionDetails;
    }

    public void setSubmissionDetails(String submissionDetails) {
        this.submissionDetails = submissionDetails;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
