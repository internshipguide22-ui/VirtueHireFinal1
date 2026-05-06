package com.virtuehire.model;

public enum CandidateStatus {
    NEW,             // Fresh registration - NOT shown in Hiring Workflow yet
    INTERESTED,      // HR clicked "View" - now in Hiring Workflow
    UNDER_REVIEW,    // HR reviewing the candidate
    TEST_ASSIGNED,   // Test(s) assigned to candidate
    APPROVED,        // Candidate approved by HR
    REJECTED         // Candidate rejected by HR
}
