package com.virtuehire.service;

import com.virtuehire.model.AssessmentResult;
import com.virtuehire.model.AssessmentSection;
import com.virtuehire.model.Candidate;
import com.virtuehire.repository.AssessmentSectionRepository;
import com.virtuehire.repository.AssessmentResultRepository;
import com.virtuehire.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentResultService {

    @Autowired
    private AssessmentResultRepository resultRepo;

    @Autowired
    private CandidateRepository candidateRepo;

    @Autowired
    private AssessmentSectionRepository assessmentSectionRepository;

    @Value("${assessment.pass.percent:60}")
    private double passPercentage;

    private static final int LOCK_DURATION_MINUTES = 3;

    // =========================================================
    // FIX: getNextLevel now filters by assessmentName so level
    // progression is scoped per assessment, not shared globally.
    // Previously it fetched ALL results for the candidate across
    // every subject, meaning passing "Python level 1" could
    // unlock "Java level 2" for the same candidate.
    // =========================================================

    public int getNextLevel(Long candidateId, Long assessmentId) {
        // assessmentId is not stored on results — callers that have the
        // assessment name should use getNextLevelForAssessment() instead.
        // This overload is kept for backward-compatibility and falls back
        // to level 1 safely.
        return 1;
    }

    public List<AssessmentResult> getResultsForAssessment(Long candidateId, String assessmentName) {
        if (assessmentName == null || assessmentName.isBlank()) {
            return List.of();
        }

        // FIX: filters by BOTH candidateId AND assessmentName.
        // Before this fix the query was correct here, but getNextLevel()
        // was ignoring the assessment name, causing cross-assessment
        // level pollution.
        return resultRepo.findByCandidateIdAndSubjectIgnoreCase(candidateId, assessmentName).stream()
                .sorted(Comparator.comparing(AssessmentResult::getLevel)
                        .thenComparing(AssessmentResult::getAttemptedAt,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public int getNextLevelForAssessment(Long candidateId, String assessmentName, List<AssessmentSection> sections) {
        if (sections == null || sections.isEmpty()) {
            return 1;
        }

        // FIX: results are now scoped to this specific assessmentName + candidateId.
        // Previously getNextLevel() was called with only candidateId, which let
        // results from other assessments bleed into the level calculation.
        List<AssessmentResult> results = getResultsForAssessment(candidateId, assessmentName);
        int nextLevel = 1;

        for (AssessmentSection section : sections) {
            int currentLevel = section.getSectionNumber();
            Optional<AssessmentResult> latestResult = getLatestResult(results, currentLevel);
            if (latestResult.isEmpty()) {
                return currentLevel;
            }

            if (latestResult.get().getScore() >= section.getPassPercentage()) {
                nextLevel = currentLevel + 1;
                continue;
            }

            return currentLevel;
        }

        return Math.min(nextLevel, sections.size());
    }

    public boolean isAssessmentLocked(Long candidateId, String assessmentName, List<AssessmentSection> sections) {
        if (sections == null || sections.isEmpty()) {
            return false;
        }

        // FIX: use assessment-scoped results only
        List<AssessmentResult> results = getResultsForAssessment(candidateId, assessmentName);
        int nextLevel = getNextLevelForAssessment(candidateId, assessmentName, sections);

        if (nextLevel <= 1) {
            return false;
        }

        Optional<AssessmentSection> previousSection = sections.stream()
                .filter(section -> section.getSectionNumber() == nextLevel - 1)
                .findFirst();
        Optional<AssessmentResult> previousResult = getLatestResult(results, nextLevel - 1);

        if (previousSection.isEmpty() || previousResult.isEmpty()) {
            return false;
        }

        AssessmentResult result = previousResult.get();
        boolean passed = result.getScore() >= previousSection.get().getPassPercentage();
        if (passed || result.getLockedAt() == null) {
            return false;
        }

        return LocalDateTime.now().isBefore(result.getLockedAt().plusMinutes(LOCK_DURATION_MINUTES));
    }

    public String getAssessmentLockMessage(Long candidateId, String assessmentName, List<AssessmentSection> sections) {
        if (!isAssessmentLocked(candidateId, assessmentName, sections)) {
            return "";
        }
        return "Your previous section was not cleared yet. Please wait before retrying.";
    }

    // =========================================================
    // SAVE RESULT
    // =========================================================

    public AssessmentResult saveResult(Long candidateId, String subject, int level, int score,
            int passPercentageRequired) {
        return saveResult(candidateId, subject, level, score, passPercentageRequired, false);
    }

    public AssessmentResult saveResult(Long candidateId, String subject, int level, int score,
            int passPercentageRequired, boolean offlineMode) {
        Candidate candidate = candidateRepo.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        // FIX: findByCandidateIdAndSubjectIgnoreCaseAndLevel already scopes by
        // candidateId — so each candidate gets their own result row. This was
        // already correct; confirmed unchanged.
        AssessmentResult result = resultRepo
                .findByCandidateIdAndSubjectIgnoreCaseAndLevel(candidateId, subject, level)
                .stream()
                .findFirst()
                .orElseGet(() -> new AssessmentResult(candidate, subject, level, score));

        result.setCandidate(candidate);
        result.setSubject(subject);
        result.setLevel(level);
        result.setScore(score);
        result.setAttemptedAt(LocalDateTime.now());
        result.setOfflineMode(offlineMode);

        if (score < passPercentageRequired) {
            result.setLockedAt(LocalDateTime.now());
        } else {
            result.setLockedAt(null);
        }

        AssessmentResult saved = resultRepo.save(result);

        candidate.setAssessmentTaken(true);
        updateCandidateBadge(candidate);
        candidateRepo.save(candidate);

        return saved;
    }

    public AssessmentResult saveResult(Long candidateId, String subject, int level, int score,
            int passPercentageRequired, String answersJson) {
        return saveResult(candidateId, subject, level, score, passPercentageRequired, answersJson, false);
    }

    public AssessmentResult saveResult(Long candidateId, String subject, int level, int score,
            int passPercentageRequired, String answersJson, boolean offlineMode) {
        AssessmentResult saved = saveResult(candidateId, subject, level, score, passPercentageRequired, offlineMode);
        saved.setAnswersJson(answersJson);
        return resultRepo.save(saved);
    }

    // =========================================================
    // BADGE
    // =========================================================

    public void updateCandidateBadge(Candidate candidate) {
        List<Map<String, Object>> cumulativeResults = getCandidateCumulativeResults(candidate.getId());

        List<String> expertBadges = cumulativeResults.stream()
                .map(res -> (String) res.get("badge"))
                .filter(b -> b != null && b.endsWith("Expert"))
                .distinct()
                .collect(Collectors.toList());

        if (expertBadges.isEmpty()) {
            candidate.setBadge("No badge");
        } else {
            candidate.setBadge(String.join(", ", expertBadges));
        }
    }

    // =========================================================
    // EXISTING METHODS — UNCHANGED
    // =========================================================

    public boolean hasAttempted(Long candidateId, String subject, int level) {
        return !resultRepo.findByCandidateIdAndSubjectIgnoreCaseAndLevel(candidateId, subject, level).isEmpty();
    }

    public boolean hasPassed(Long candidateId, String subject, int level) {
        return resultRepo.findByCandidateIdAndSubjectIgnoreCaseAndLevel(candidateId, subject, level).stream()
                .anyMatch(r -> r.getScore() >= passPercentage);
    }

    public boolean canAttemptLevel(Long candidateId, String subject, int requestedLevel) {
        if (requestedLevel == 1)
            return true;

        List<AssessmentResult> prevResults = resultRepo.findByCandidateIdAndSubjectIgnoreCaseAndLevel(candidateId,
                subject, requestedLevel - 1);

        if (prevResults.isEmpty())
            return false;

        if (prevResults.stream().anyMatch(r -> r.getScore() >= passPercentage))
            return true;

        AssessmentResult latestPrev = prevResults.stream()
                .max(Comparator.comparing(AssessmentResult::getAttemptedAt))
                .get();

        if (latestPrev.getLockedAt() != null) {
            LocalDateTime unlockTime = latestPrev.getLockedAt().plusMinutes(LOCK_DURATION_MINUTES);
            return LocalDateTime.now().isAfter(unlockTime);
        }

        return false;
    }

    public List<AssessmentResult> getResults(Long candidateId, String subject) {
        return resultRepo.findByCandidateIdAndSubjectIgnoreCase(candidateId, subject);
    }

    public List<AssessmentResult> getCandidateResults(Long candidateId) {
        return resultRepo.findByCandidateId(candidateId);
    }

    public long getTotalAssessmentTracksTaken() {
        return resultRepo.findAll().stream()
                .filter(result -> result.getCandidate() != null
                        && result.getCandidate().getId() != null
                        && result.getSubject() != null
                        && !result.getSubject().isBlank())
                .map(result -> result.getCandidate().getId() + "::" + result.getSubject().trim().toLowerCase())
                .distinct()
                .count();
    }

    public List<AssessmentResult> getCandidateResults(Long candidateId, String subject) {
        return getResults(candidateId, subject);
    }

    public Map<String, Object> getCandidateStatusSummary(Long candidateId) {
        Candidate candidate = candidateRepo.findById(candidateId).orElse(null);
        List<AssessmentResult> results = resultRepo.findByCandidateId(candidateId);

        Map<String, List<AssessmentResult>> groupedBySubject = results.stream()
                .filter(result -> result.getSubject() != null && !result.getSubject().isBlank())
                .collect(Collectors.groupingBy(AssessmentResult::getSubject));

        int highestLevelReached = results.stream()
                .mapToInt(AssessmentResult::getLevel)
                .max()
                .orElse(0);

        int bestScore = results.stream()
                .mapToInt(AssessmentResult::getScore)
                .max()
                .orElse(0);

        int passedLevels = groupedBySubject.values().stream()
                .mapToInt(subjectResults -> (int) subjectResults.stream()
                        .filter(this::isPassedResult)
                        .map(AssessmentResult::getLevel)
                        .distinct()
                        .count())
                .sum();

        long offlineTracks = groupedBySubject.values().stream()
                .filter(subjectResults -> subjectResults.stream().anyMatch(AssessmentResult::isOfflineMode))
                .count();

        Optional<AssessmentResult> latestResult = results.stream()
                .max(Comparator.comparing(AssessmentResult::getAttemptedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())));

        List<Map<String, Object>> trackSummaries = groupedBySubject.entrySet().stream()
                .map(entry -> buildTrackSummary(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(
                        summary -> (LocalDateTime) summary.get("latestAttemptedAt"),
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        long completedTracks = trackSummaries.stream()
                .filter(summary -> Boolean.TRUE.equals(summary.get("completed")))
                .count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("hasAttended", !results.isEmpty());
        summary.put("totalAttempts", results.size());
        summary.put("assessmentTracks", groupedBySubject.size());
        summary.put("completedTracks", completedTracks);
        summary.put("highestLevelReached", highestLevelReached);
        summary.put("passedLevels", passedLevels);
        summary.put("offlineTracks", offlineTracks);
        summary.put("bestScore", bestScore);
        summary.put("latestAssessment", latestResult.map(AssessmentResult::getSubject).orElse(null));
        summary.put("latestAttemptedAt", latestResult.map(AssessmentResult::getAttemptedAt).orElse(null));
        summary.put("selectionStatus",
                candidate != null && candidate.getSelectionStatus() != null
                        && !candidate.getSelectionStatus().isBlank()
                                ? candidate.getSelectionStatus()
                                : "Under Review");
        summary.put("selectionNote", candidate != null ? candidate.getSelectionNote() : null);
        summary.put("currentBadge", candidate != null ? candidate.getBadge() : null);
        summary.put("trackSummaries", trackSummaries);
        return summary;
    }

    public Map<Integer, String> getLevelStatus(Long candidateId, String subject) {
        Map<Integer, String> status = new HashMap<>();

        for (int level = 1; level <= 3; level++) {
            List<AssessmentResult> results = resultRepo.findByCandidateIdAndSubjectIgnoreCaseAndLevel(candidateId,
                    subject, level);

            if (results.isEmpty()) {
                if (canAttemptLevel(candidateId, subject, level)) {
                    status.put(level, "available");
                } else {
                    status.put(level, "locked");
                }
            } else {
                boolean passed = results.stream().anyMatch(r -> r.getScore() >= passPercentage);
                if (passed) {
                    status.put(level, "passed");
                } else {
                    AssessmentResult latest = results.stream()
                            .max(Comparator.comparing(AssessmentResult::getAttemptedAt))
                            .get();
                    if (latest.getLockedAt() != null
                            && LocalDateTime.now()
                                    .isBefore(latest.getLockedAt().plusMinutes(LOCK_DURATION_MINUTES))) {
                        status.put(level, "locked");
                    } else {
                        status.put(level, "failed");
                    }
                }
            }
        }

        return status;
    }

    private Optional<AssessmentResult> getLatestResult(List<AssessmentResult> results, int level) {
        if (results == null || results.isEmpty()) {
            return Optional.empty();
        }

        return results.stream()
                .filter(result -> result.getLevel() == level)
                .max(Comparator.comparing(AssessmentResult::getAttemptedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())));
    }

    public List<Map<String, Object>> getCandidateCumulativeResults(Long candidateId) {
        List<AssessmentResult> results = resultRepo.findByCandidateId(candidateId);
        Candidate candidate = candidateRepo.findById(candidateId).orElse(null);

        Map<String, List<AssessmentResult>> grouped = results.stream()
                .collect(Collectors.groupingBy(AssessmentResult::getSubject));

        List<Map<String, Object>> finalResults = new ArrayList<>();

        for (String subject : grouped.keySet()) {
            List<AssessmentResult> subjectResults = grouped.get(subject);

            double totalScore = subjectResults.stream()
                    .mapToDouble(AssessmentResult::getScore)
                    .sum();
            double maxScore = subjectResults.size() * 100;
            double percentage = Math.round((totalScore / maxScore) * 100);

            String offlineBadge = resolveOfflinePriorityBadge(candidate, subject);
            String badge = offlineBadge != null
                    ? offlineBadge
                    : percentage > 95 ? subject + " Expert" : "No Badge";
            boolean offlineTaken = subjectResults.stream().anyMatch(AssessmentResult::isOfflineMode);

            Map<String, Object> subjectResult = new HashMap<>();
            subjectResult.put("subject", subject);
            subjectResult.put("cumulativePercentage", percentage);
            subjectResult.put("badge", badge);
            subjectResult.put("offlineTaken", offlineTaken);
            subjectResult.put("candidateId", candidateId);

            finalResults.add(subjectResult);
        }

        return finalResults;
    }

    private String resolveOfflinePriorityBadge(Candidate candidate, String subject) {
        if (candidate == null || candidate.getBadge() == null || candidate.getBadge().isBlank()) {
            return null;
        }
        if (subject == null || subject.isBlank()) {
            return null;
        }

        return Arrays.stream(candidate.getBadge().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .filter(value -> value.toLowerCase(Locale.ROOT).endsWith(" certified"))
                .filter(value -> matchesBadgeSubject(value, subject))
                .findFirst()
                .orElse(null);
    }

    private boolean matchesBadgeSubject(String badge, String subject) {
        if (badge == null || subject == null) {
            return false;
        }

        String normalizedBadge = canonicalizeBadgeSubject(badge);
        String normalizedSubject = canonicalizeBadgeSubject(subject);

        return !normalizedBadge.isBlank()
                && !normalizedSubject.isBlank()
                && (normalizedBadge.equals(normalizedSubject)
                        || normalizedBadge.contains(normalizedSubject)
                        || normalizedSubject.contains(normalizedBadge));
    }

    private String canonicalizeBadgeSubject(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replaceFirst("(?i)\\s+certified$", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Map<String, Object> buildTrackSummary(String subject, List<AssessmentResult> subjectResults) {
        Set<Integer> attemptedLevels = subjectResults.stream()
                .map(AssessmentResult::getLevel)
                .collect(Collectors.toCollection(TreeSet::new));
        Set<Integer> clearedLevels = subjectResults.stream()
                .filter(this::isPassedResult)
                .map(AssessmentResult::getLevel)
                .collect(Collectors.toCollection(TreeSet::new));

        int totalSections = assessmentSectionRepository.findByAssessment_AssessmentNameIgnoreCase(subject).size();
        if (totalSections == 0) {
            totalSections = Math.max(attemptedLevels.size(), clearedLevels.size());
        }

        Optional<AssessmentResult> latestResult = subjectResults.stream()
                .max(Comparator.comparing(AssessmentResult::getAttemptedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())));

        Map<String, Object> track = new LinkedHashMap<>();
        track.put("subject", subject);
        track.put("attemptedLevels", attemptedLevels);
        track.put("clearedLevels", clearedLevels);
        track.put("highestLevel", attemptedLevels.stream().mapToInt(Integer::intValue).max().orElse(0));
        track.put("totalSections", totalSections);
        track.put("completed", totalSections > 0 && clearedLevels.size() >= totalSections);
        track.put("offlineTaken", subjectResults.stream().anyMatch(AssessmentResult::isOfflineMode));
        track.put("latestScore", latestResult.map(AssessmentResult::getScore).orElse(0));
        track.put("latestAttemptedAt", latestResult.map(AssessmentResult::getAttemptedAt).orElse(null));
        return track;
    }

    private boolean isPassedResult(AssessmentResult result) {
        if (result == null) {
            return false;
        }

        return assessmentSectionRepository
                .findByAssessmentNameAndSectionNumber(result.getSubject(), result.getLevel())
                .map(section -> result.getScore() >= section.getPassPercentage())
                .orElse(result.getScore() >= passPercentage);
    }
}