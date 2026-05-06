// PATH: Backend/src/main/java/com/virtuehire/controller/CandidateRestController.java

package com.virtuehire.controller;

import com.virtuehire.model.AssessmentResult;
import com.virtuehire.model.Candidate;
import com.virtuehire.model.CandidateStatus;
import com.virtuehire.service.AssessmentResultService;
import com.virtuehire.service.CandidateService;
import com.virtuehire.service.HiringWorkflowService;
import com.virtuehire.service.TestAllocationService;
import com.virtuehire.util.StoragePathResolver;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/candidates")
public class CandidateRestController {

    private static final Logger logger = LoggerFactory.getLogger(CandidateRestController.class);

    private final CandidateService candidateService;
    private final AssessmentResultService assessmentResultService;
    private final HiringWorkflowService hiringWorkflowService;
    private final TestAllocationService testAllocationService;
    private final Path uploadDir;

    public CandidateRestController(CandidateService candidateService,
            AssessmentResultService assessmentResultService,
            HiringWorkflowService hiringWorkflowService,
            TestAllocationService testAllocationService,
            @Value("${file.upload-dir}") String uploadDirPath) {
        this.candidateService = candidateService;
        this.assessmentResultService = assessmentResultService;
        this.hiringWorkflowService = hiringWorkflowService;
        this.testAllocationService = testAllocationService;
        this.uploadDir = StoragePathResolver.resolveUploadDir(uploadDirPath);
    }

    // ---------------------------
    // Candidate Registration
    // ---------------------------
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(@ModelAttribute Candidate candidate,
            @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFile,
            @RequestParam(value = "profilePicFile", required = false) MultipartFile profilePicFile) throws IOException {

        if (candidate.getEmail() != null) {
            candidate.setEmail(candidate.getEmail().trim().toLowerCase(Locale.ROOT));
        }

        if (candidate.getPassword() == null || !candidate.getPassword().equals(candidate.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        if (candidateService.findByEmail(candidate.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered. Please login or use a different email."));
        }

        if (!Files.exists(uploadDir))
            Files.createDirectories(uploadDir);

        if (resumeFile != null && !resumeFile.isEmpty()) {
            candidate.setResumePath(storeUploadedFile(resumeFile));
        }

        if (profilePicFile != null && !profilePicFile.isEmpty()) {
            candidate.setProfilePic(storeUploadedFile(profilePicFile));
        }

        candidateService.save(candidate);

        String message = "Candidate registered successfully!";
        try {
            candidateService.sendVerificationMail(candidate);
            message += " Please check your email for the OTP.";
        } catch (Exception ex) {
            logger.error("Candidate registered but verification email failed for {}", candidate.getEmail(), ex);
            message += " We could not send the verification email right now. Please try again later.";
        }

        return ResponseEntity.ok(Map.of(
                "message", message,
                "requiresOtpVerification", true,
                "candidate", toCandidateResponse(candidate)));
    }

    // ---------------------------
    // Serve uploaded files
    // FIX: Changed @PathVariable "filename" to use the regex {filename:.+}
    // so Spring does NOT strip the file extension (e.g. ".pdf") from the path
    // variable. Without this, Spring truncates "resume.pdf" to "resume" and
    // the file lookup fails with a 404 / resource-not-found error.
    // ---------------------------
    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws IOException {
        return serveStoredFile(filename, "inline");
    }

    @GetMapping("/me/resume")
    public ResponseEntity<Resource> accessOwnResume(
            @RequestParam(defaultValue = "inline") String disposition,
            HttpSession session) throws IOException {
        Candidate sessionCandidate = (Candidate) session.getAttribute("candidate");
        if (sessionCandidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Candidate candidate = candidateService.findById(sessionCandidate.getId()).orElse(null);
        if (candidate == null || candidate.getResumePath() == null || candidate.getResumePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        return serveStoredFile(candidate.getResumePath(), disposition);
    }

    // ---------------------------
    // Candidate Login
    // ---------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email,
            @RequestParam String password,
            HttpSession session) {

        Candidate candidate = candidateService.login(email, password);
        if (candidate != null) {
            candidate = candidateService.refreshAssessmentAssignment(candidate);

            if (!candidateService.isEmailVerified(candidate)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Please verify your email using OTP",
                        "emailVerified", false));
            }

            session.setAttribute("candidate", candidate);

            List<AssessmentResult> results = assessmentResultService.getCandidateResults(candidate.getId());

            Map<String, Map<Integer, Boolean>> subjectLevelResults = new HashMap<>();
            Map<String, List<Integer>> subjectAttemptedLevels = new HashMap<>();

            for (AssessmentResult r : results) {
                subjectLevelResults.putIfAbsent(r.getSubject(), new HashMap<>());
                subjectLevelResults.get(r.getSubject()).put(r.getLevel(), r.getScore() >= 50);

                subjectAttemptedLevels.putIfAbsent(r.getSubject(), new ArrayList<>());
                subjectAttemptedLevels.get(r.getSubject()).add(r.getLevel());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "candidate", toCandidateResponse(candidate),
                    "results", results,
                    "subjectLevelResults", subjectLevelResults,
                    "subjectAttemptedLevels", subjectAttemptedLevels));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Candidate sessionCandidate = (Candidate) session.getAttribute("candidate");
        if (sessionCandidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        Candidate candidate = candidateService.findById(sessionCandidate.getId()).orElse(null);
        if (candidate == null) {
            session.invalidate();
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        candidate = candidateService.refreshAssessmentAssignment(candidate);
        session.setAttribute("candidate", candidate);
        return ResponseEntity.ok(Map.of("candidate", toCandidateResponse(candidate)));
    }

    // ---------------------------
    // Get My Assessments
    // FIX: assignedAssessmentName is stored as a comma-separated string
    // (e.g. "Java Assessment,Java,Java Assignment"). We must split it into
    // individual names before adding to the set — never add the whole joined
    // string as a single entry, otherwise the frontend receives one string
    // and either displays it joined or splits it causing duplicates.
    // ---------------------------
    @GetMapping("/my-assessments")
    public ResponseEntity<?> getMyAssessments(HttpSession session) {
        Candidate sessionCandidate = (Candidate) session.getAttribute("candidate");
        if (sessionCandidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            Candidate candidate = candidateService.findById(sessionCandidate.getId()).orElse(null);
            if (candidate == null) {
                session.invalidate();
                return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
            }

            candidate = candidateService.refreshAssessmentAssignment(candidate);
            session.setAttribute("candidate", candidate);

            // Use LinkedHashSet to deduplicate while preserving insertion order.
            // Assigned assessments go first, then any others the candidate has attempted.
            LinkedHashSet<String> assessmentSet = new LinkedHashSet<>();

            // FIX: Split the comma-separated assignedAssessmentName into individual
            // names before adding — never add the whole joined string as one entry.
            if (candidate.getAssignedAssessmentName() != null
                    && !candidate.getAssignedAssessmentName().isBlank()) {
                Arrays.stream(candidate.getAssignedAssessmentName().split(","))
                        .map(String::trim)
                        .filter(name -> !name.isBlank())
                        .forEach(assessmentSet::add);
            }

            // Pull all assessment names from the candidate's actual result history
            List<AssessmentResult> results = assessmentResultService.getCandidateResults(candidate.getId());
            for (AssessmentResult result : results) {
                if (result.getSubject() != null && !result.getSubject().isBlank()) {
                    assessmentSet.add(result.getSubject().trim());
                }
            }

            return ResponseEntity.ok(Map.of(
                    "assessments", new ArrayList<>(assessmentSet),
                    "assignedAssessmentName", candidate.getAssignedAssessmentName() != null
                            ? candidate.getAssignedAssessmentName() : "",
                    "assessmentAssignmentStatus", candidate.getAssessmentAssignmentStatus() != null
                            ? candidate.getAssessmentAssignmentStatus() : "",
                    "assessmentAssignmentMessage", candidate.getAssessmentAssignmentMessage() != null
                            ? candidate.getAssessmentAssignmentMessage() : ""));
        } catch (Exception e) {
            logger.error("Failed to fetch assessments for candidate", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch assessments"));
        }
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(@ModelAttribute Candidate payload,
            @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFile,
            @RequestParam(value = "profilePicFile", required = false) MultipartFile profilePicFile,
            HttpSession session) throws IOException {

        Candidate sessionCandidate = (Candidate) session.getAttribute("candidate");
        if (sessionCandidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        Candidate candidate = candidateService.findById(sessionCandidate.getId()).orElse(null);
        if (candidate == null) {
            session.invalidate();
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        candidate.setFullName(payload.getFullName());

        Candidate existingByEmail = candidateService.findByEmail(payload.getEmail());
        if (existingByEmail != null && !existingByEmail.getId().equals(candidate.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered. Please use a different email."));
        }

        candidate.setEmail(payload.getEmail());
        candidate.setPhoneNumber(payload.getPhoneNumber());
        candidate.setAlternatePhoneNumber(payload.getAlternatePhoneNumber());
        candidate.setGender(payload.getGender());
        candidate.setDateOfBirth(payload.getDateOfBirth());
        candidate.setCity(payload.getCity());
        candidate.setState(payload.getState());
        candidate.setHighestEducation(payload.getHighestEducation());
        candidate.setCollegeUniversity(payload.getCollegeUniversity());
        candidate.setYearOfGraduation(payload.getYearOfGraduation());
        candidate.setExperience(payload.getExperience());
        candidate.setSkills(payload.getSkills());

        if (resumeFile != null && !resumeFile.isEmpty()) {
            candidate.setResumePath(storeUploadedFile(resumeFile));
        }

        if (profilePicFile != null && !profilePicFile.isEmpty()) {
            candidate.setProfilePic(storeUploadedFile(profilePicFile));
        }

        Candidate updatedCandidate = candidateService.save(candidate);
        session.setAttribute("candidate", updatedCandidate);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "candidate", toCandidateResponse(updatedCandidate)));
    }

    // ---------------------------
    // Recommended & All Courses
    // ---------------------------
    @GetMapping("/recommended-courses")
    public ResponseEntity<?> getRecommendedCourses(HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null)
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));

        String skillsStr = candidate.getSkills();
        List<String> recommendedCourses = new ArrayList<>();
        if (skillsStr != null && !skillsStr.isBlank()) {
            recommendedCourses = Arrays.asList(skillsStr.split(","));
        }

        List<String> allCourses = Arrays.asList("C", "C++", "Java", "Python", "SQL", "JavaScript", "React", "Node.js");

        return ResponseEntity.ok(Map.of(
                "recommended", recommendedCourses,
                "allCourses", allCourses));
    }

    // ---------------------------
    // Logout
    // ---------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ---------------------------
    // Forgot Password
    // ---------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        candidateService.sendResetMail(email);
        return ResponseEntity.ok(Map.of("message", "Reset email sent successfully!"));
    }

    // ---------------------------
    // Reset Password
    // ---------------------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        candidateService.resetPassword(email, code, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successful!"));
    }

    // ---------------------------
    // Verify Email
    // ---------------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        try {
            boolean verified = candidateService.verifyOtp(email.trim(), code.trim());
            if (verified) {
                Candidate candidate = candidateService.findByEmail(email.trim());
                return ResponseEntity.ok(Map.of(
                        "message", "Email verified successfully! You can now log in.",
                        "emailVerified", true,
                        "candidate", candidate != null ? toCandidateResponse(candidate) : null));
            } else {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired OTP"));
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        return verifyOtp(request);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            candidateService.resendVerificationMail(email.trim());
            return ResponseEntity.ok(Map.of("message", "A new OTP has been sent to your email."));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        }
    }

    // ---------------------------
    // Get Candidate Results by Subject
    // ---------------------------
    @GetMapping("/results/{subject}")
    public ResponseEntity<?> getCandidateResultsBySubject(@PathVariable String subject, HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            List<AssessmentResult> results = assessmentResultService.getCandidateResults(candidate.getId(), subject);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch results for subject"));
        }
    }

    // ---------------------------
    // Get All Candidate Results
    // ---------------------------
    @GetMapping("/results")
    public ResponseEntity<?> getCandidateResults(HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            List<AssessmentResult> results = assessmentResultService.getCandidateResults(candidate.getId());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch results"));
        }
    }

    // ---------------------------
    // Get Cumulative Results with Badges
    // ---------------------------
    @GetMapping("/{id}/cumulative-results")
    public ResponseEntity<?> getCumulativeResults(@PathVariable Long id) {
        try {
            List<Map<String, Object>> results = assessmentResultService.getCandidateCumulativeResults(id);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch cumulative results"));
        }
    }

    private Map<String, Object> toCandidateResponse(Candidate candidate) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", candidate.getId());
        data.put("fullName", candidate.getFullName());
        data.put("email", candidate.getEmail());
        data.put("phoneNumber", candidate.getPhoneNumber());
        data.put("alternatePhoneNumber", candidate.getAlternatePhoneNumber());
        data.put("gender", candidate.getGender());
        data.put("dateOfBirth", candidate.getDateOfBirth());
        data.put("city", candidate.getCity());
        data.put("state", candidate.getState());
        data.put("highestEducation", candidate.getHighestEducation());
        data.put("collegeUniversity", candidate.getCollegeUniversity());
        data.put("yearOfGraduation", candidate.getYearOfGraduation());
        data.put("experience", candidate.getExperience());
        data.put("experienceLevel", candidate.getExperienceLevel());
        data.put("skills", candidate.getSkills());
        data.put("resumePath", candidate.getResumePath());
        data.put("resumeUrl", candidate.getResumePath() != null ? "/api/candidates/me/resume?disposition=inline" : null);
        data.put("resumeDownloadUrl", candidate.getResumePath() != null ? "/api/candidates/me/resume?disposition=attachment" : null);
        data.put("profilePic", candidate.getProfilePic());
        data.put("profilePicUrl", candidate.getProfilePic() != null ? "/api/candidates/file/" + candidate.getProfilePic() : null);
        data.put("badge", candidate.getBadge());
        data.put("score", candidate.getScore());
        data.put("approved", candidate.getApproved());
        data.put("emailVerified", candidate.getEmailVerified());
        data.put("rejectionReason", candidate.getRejectionReason());
        data.put("assessmentTaken", candidate.getAssessmentTaken());
        data.put("assignedAssessmentName", candidate.getAssignedAssessmentName());
        data.put("assessmentAssignmentStatus", candidate.getAssessmentAssignmentStatus());
        data.put("assessmentAssignmentMessage", candidate.getAssessmentAssignmentMessage());
        return data;
    }

    // ==================== HIRING WORKFLOW ENDPOINTS ====================

    // --------- MARK CANDIDATE AS INTERESTED ---------
    @PostMapping("/interested/{candidateId}")
    public ResponseEntity<?> markInterested(@PathVariable Long candidateId) {
        try {
            var candidate = hiringWorkflowService.markCandidateInterested(candidateId);
            if (candidate != null) {
                return ResponseEntity.ok(Map.of(
                        "message", "Thank you for your interest. We'll review your profile shortly.",
                        "status", candidate.getApplicationStatus().toString(),
                        "candidateId", candidateId));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark interest"));
        }
    }

    // --------- GET CANDIDATE'S ASSIGNED TESTS ---------
    @GetMapping("/me/assigned-tests")
    public ResponseEntity<?> getMyAssignedTests(HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            var candidateOpt = candidateService.findById(candidate.getId());
            if (candidateOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
            }

            var assignedTests = hiringWorkflowService.getUnsubmittedTestsForCandidate(candidate.getId());
            return ResponseEntity.ok(Map.of(
                    "candidateId", candidate.getId(),
                    "assignedTests", assignedTests,
                    "totalTests", assignedTests.size(),
                    "candidateStatus", candidateOpt.get().getApplicationStatus().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch assigned tests"));
        }
    }

    // --------- GET TEST DETAILS BY NAME FOR CANDIDATE ---------
    @GetMapping("/me/tests/{testName}")
    public ResponseEntity<?> getTestDetails(@PathVariable String testName, HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            var assignedTests = hiringWorkflowService.getUnsubmittedTestsForCandidate(candidate.getId());
            boolean hasAccess = assignedTests.stream()
                    .anyMatch(t -> t.getTestName().equalsIgnoreCase(testName));

            if (!hasAccess) {
                return ResponseEntity.status(403).body(Map.of("error", "You don't have access to this test"));
            }

            var testDetails = testAllocationService.getTestDetails(testName);
            return ResponseEntity.ok(testDetails);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch test details"));
        }
    }

    // --------- GET CANDIDATE'S SUBMISSION STATUS ---------
    @GetMapping("/me/submission-status")
    public ResponseEntity<?> getSubmissionStatus(HttpSession session) {
        Candidate candidate = (Candidate) session.getAttribute("candidate");
        if (candidate == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        try {
            var unsubmitted = hiringWorkflowService.getUnsubmittedTestsForCandidate(candidate.getId());
            var submitted = hiringWorkflowService.getSubmittedTestsForCandidate(candidate.getId());

            return ResponseEntity.ok(Map.of(
                    "candidateId", candidate.getId(),
                    "pendingTests", unsubmitted,
                    "submittedTests", submitted,
                    "pendingCount", unsubmitted.size(),
                    "submittedCount", submitted.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch submission status"));
        }
    }

    private String storeUploadedFile(MultipartFile file) throws IOException {
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalName = file.getOriginalFilename();
        String safeOriginalName = extractFileName(originalName);
        if (safeOriginalName.isBlank()) {
            safeOriginalName = "upload.bin";
        }

        String storedFileName = UUID.randomUUID() + "_" + safeOriginalName;
        Path storedPath = uploadDir.resolve(storedFileName).normalize();
        if (!storedPath.startsWith(uploadDir)) {
            throw new IOException("Invalid upload path");
        }

        file.transferTo(storedPath.toFile());
        return storedFileName;
    }

    private ResponseEntity<Resource> serveStoredFile(String storedFileName, String disposition) throws IOException {
        String normalizedStoredFileName = extractFileName(storedFileName);
        if (normalizedStoredFileName.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path path = resolveStoredFilePath(normalizedStoredFileName);
        if (path == null) {
            return ResponseEntity.notFound().build();
        }

        if (!path.startsWith(uploadDir) && !path.startsWith(getAlternateUploadDir())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(path);
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        String safeDisposition = "attachment".equalsIgnoreCase(disposition) ? "attachment" : "inline";
        String downloadName = getOriginalFileName(normalizedStoredFileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, safeDisposition + "; filename=\"" + downloadName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(resource);
    }

    private Path resolveStoredFilePath(String storedFileName) {
        Path primaryPath = uploadDir.resolve(storedFileName).normalize();
        if (Files.exists(primaryPath) && Files.isReadable(primaryPath)) {
            return primaryPath;
        }

        Path alternateUploadDir = getAlternateUploadDir();
        if (alternateUploadDir != null) {
            Path alternatePath = alternateUploadDir.resolve(storedFileName).normalize();
            if (Files.exists(alternatePath) && Files.isReadable(alternatePath)) {
                return alternatePath;
            }
        }

        Path fuzzyMatch = findMatchingStoredFile(storedFileName);
        return fuzzyMatch != null ? fuzzyMatch : primaryPath;
    }

    private Path findMatchingStoredFile(String storedFileName) {
        String normalizedRequestedName = extractFileName(storedFileName);
        String requestedOriginalName = getOriginalFileName(normalizedRequestedName);

        List<Path> candidateDirs = new ArrayList<>();
        candidateDirs.add(uploadDir);
        Path alternateUploadDir = getAlternateUploadDir();
        if (alternateUploadDir != null && !alternateUploadDir.equals(uploadDir)) {
            candidateDirs.add(alternateUploadDir);
        }

        for (Path dir : candidateDirs) {
            if (dir == null || !Files.isDirectory(dir)) {
                continue;
            }

            try (var stream = Files.list(dir)) {
                Optional<Path> exactOriginalNameMatch = stream
                        .filter(Files::isRegularFile)
                        .filter(path -> {
                            String candidateName = extractFileName(path.getFileName().toString());
                            String candidateOriginalName = getOriginalFileName(candidateName);
                            return candidateName.equalsIgnoreCase(normalizedRequestedName)
                                    || candidateOriginalName.equalsIgnoreCase(normalizedRequestedName)
                                    || candidateOriginalName.equalsIgnoreCase(requestedOriginalName);
                        })
                        .findFirst();

                if (exactOriginalNameMatch.isPresent()) {
                    return exactOriginalNameMatch.get().normalize();
                }
            } catch (IOException ignored) {
            }
        }

        return null;
    }

    private Path getAlternateUploadDir() {
        Path current = uploadDir.toAbsolutePath().normalize();
        Path parent = current.getParent();
        if (parent == null) {
            return null;
        }

        Path currentName = current.getFileName();
        Path parentName = parent.getFileName();

        if (currentName != null && "uploads".equalsIgnoreCase(currentName.toString())
                && parentName != null && "Backend".equalsIgnoreCase(parentName.toString())
                && parent.getParent() != null) {
            return parent.getParent().resolve("uploads").normalize();
        }

        return current.resolveSibling("Backend").resolve("uploads").normalize();
    }

    private String extractFileName(String fileName) {
        if (fileName == null) {
            return "";
        }
        return Paths.get(fileName).getFileName().toString().trim();
    }

    private String getOriginalFileName(String storedFileName) {
        String safeFileName = extractFileName(storedFileName);
        int separatorIndex = safeFileName.indexOf('_');
        if (separatorIndex > -1 && separatorIndex < safeFileName.length() - 1) {
            return safeFileName.substring(separatorIndex + 1);
        }
        return safeFileName;
    }
}
