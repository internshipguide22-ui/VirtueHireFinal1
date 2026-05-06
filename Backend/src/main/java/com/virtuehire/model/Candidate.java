package com.virtuehire.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.io.Serializable;
import org.springframework.format.annotation.DateTimeFormat;

@Entity
public class Candidate implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phoneNumber;

    private String alternatePhoneNumber;

    @NotBlank
    private String password;

    @Transient
    private String confirmPassword;

    private String gender;
    private String city;
    private String state;
    private String highestEducation;
    private String collegeUniversity;

    @PositiveOrZero
    private Integer yearOfGraduation;

    private String skills;
    private Integer experience;

    private String resumePath;

    private String badge;
    private String profilePic;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateOfBirth;

    private Boolean approved = false;
    private String rejectionReason;
    private Boolean assessmentTaken = false;
    private String selectionStatus = "Under Review";

    @Column(length = 1000)
    private String selectionNote;

    // FIX: increased length to 2000 so comma-separated assessment names
    // (e.g. "Java,Java Assignment,Python") are never silently truncated
    // by the default 255-char VARCHAR limit.
    @Column(length = 2000)
    private String assignedAssessmentName;

    private String assessmentAssignmentStatus;

    @Column(length = 1000)
    private String assessmentAssignmentMessage;

    private String verificationCode;
    private LocalDateTime verificationCodeExpiry;
    private Boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus applicationStatus = CandidateStatus.NEW;

    @Column(length = 2000)
    private String hrFeedback;

    private LocalDateTime statusUpdatedAt = LocalDateTime.now();

    @Transient
    private Map<Integer, Integer> levelMarks;

    @Transient
    private List<AssessmentResult> results;

    private String experienceLevel;
    private Integer score;

    // ---------------- Getters & Setters ----------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAlternatePhoneNumber() { return alternatePhoneNumber; }
    public void setAlternatePhoneNumber(String alternatePhoneNumber) { this.alternatePhoneNumber = alternatePhoneNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getHighestEducation() { return highestEducation; }
    public void setHighestEducation(String highestEducation) { this.highestEducation = highestEducation; }

    public String getCollegeUniversity() { return collegeUniversity; }
    public void setCollegeUniversity(String collegeUniversity) { this.collegeUniversity = collegeUniversity; }

    public Integer getYearOfGraduation() { return yearOfGraduation; }
    public void setYearOfGraduation(Integer yearOfGraduation) { this.yearOfGraduation = yearOfGraduation; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Map<Integer, Integer> getLevelMarks() { return levelMarks; }
    public void setLevelMarks(Map<Integer, Integer> levelMarks) { this.levelMarks = levelMarks; }

    public List<AssessmentResult> getResults() { return results; }
    public void setResults(List<AssessmentResult> results) { this.results = results; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Boolean getAssessmentTaken() { return assessmentTaken; }
    public void setAssessmentTaken(Boolean assessmentTaken) { this.assessmentTaken = assessmentTaken; }

    public String getSelectionStatus() { return selectionStatus; }
    public void setSelectionStatus(String selectionStatus) { this.selectionStatus = selectionStatus; }

    public String getSelectionNote() { return selectionNote; }
    public void setSelectionNote(String selectionNote) { this.selectionNote = selectionNote; }

    public String getAssignedAssessmentName() { return assignedAssessmentName; }
    public void setAssignedAssessmentName(String assignedAssessmentName) { this.assignedAssessmentName = assignedAssessmentName; }

    public String getAssessmentAssignmentStatus() { return assessmentAssignmentStatus; }
    public void setAssessmentAssignmentStatus(String assessmentAssignmentStatus) { this.assessmentAssignmentStatus = assessmentAssignmentStatus; }

    public String getAssessmentAssignmentMessage() { return assessmentAssignmentMessage; }
    public void setAssessmentAssignmentMessage(String assessmentAssignmentMessage) { this.assessmentAssignmentMessage = assessmentAssignmentMessage; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public LocalDateTime getVerificationCodeExpiry() { return verificationCodeExpiry; }
    public void setVerificationCodeExpiry(LocalDateTime verificationCodeExpiry) { this.verificationCodeExpiry = verificationCodeExpiry; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public CandidateStatus getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(CandidateStatus applicationStatus) {
        this.applicationStatus = applicationStatus;
        this.statusUpdatedAt = LocalDateTime.now();
    }

    public String getHrFeedback() { return hrFeedback; }
    public void setHrFeedback(String hrFeedback) { this.hrFeedback = hrFeedback; }

    public LocalDateTime getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }
}