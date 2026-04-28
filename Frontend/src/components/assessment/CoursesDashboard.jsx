import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import api from "../../services/api";

function getAssessmentState(status = {}) {
  const results = Array.isArray(status.results) ? status.results : [];
  const attemptedCount = results.length;
  const totalSections = Number(status.totalSections) || 0;
  const nextLevel = Number(status.nextLevel) || 1;
  const configs = Array.isArray(status.configs) ? status.configs : [];
  const isLocked = Boolean(status.isLocked);
  const lockMessage =
    typeof status.error === "string" && status.error.trim() ? status.error : "Test is locked";
  const passedLevels = new Set(
    results
      .filter((result) => {
        const currentConfig = configs.find(
          (config) => Number(config.sectionNumber) === Number(result.level)
        );
        const requiredScore = Number(currentConfig?.passPercentage) || 60;
        return Number(result.score) >= requiredScore;
      })
      .map((result) => Number(result.level))
  );
  const completed = totalSections > 0 && passedLevels.size >= totalSections;
  const hasStarted = attemptedCount > 0;
  const actionLabel = isLocked ? "Test is Locked" : completed ? "Completed" : hasStarted ? "Continue" : "Start";
  const progressValue = totalSections > 0 ? Math.round((passedLevels.size / totalSections) * 100) : 0;
  const currentConfig = configs.find((config) => Number(config.sectionNumber) === nextLevel);
  const currentPhaseName = currentConfig?.sectionName || currentConfig?.subject || `Section ${nextLevel}`;

  return {
    results,
    attemptedCount,
    totalSections,
    nextLevel,
    passedCount: passedLevels.size,
    completed,
    hasStarted,
    isLocked,
    lockMessage,
    canLaunch: !completed && !isLocked,
    actionLabel,
    progressValue,
    currentPhaseName,
    statusLabel: isLocked ? "Test is Locked" : completed ? "Completed" : hasStarted ? "In Progress" : "Not Started",
  };
}

// ─────────────────────────────────────────────────────────────
// SectionReview — fetches per-question answers lazily on open
// ─────────────────────────────────────────────────────────────
function SectionReview({ result, config }) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const required = Number(config?.passPercentage) || 60;
  const score = Number(result.score);
  const passed = score >= required;
  const sectionName = config?.sectionName || config?.subject || `Section ${result.level}`;

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const wrongCount = questions.length - correctCount;

  const handleToggle = async () => {
    // Only fetch on first open
    if (!open && questions.length === 0) {
      setLoadingQ(true);
      setFetchError("");
      try {
        const res = await api.get(`/assessment/results/${result.id}/answers`, {
          withCredentials: true,
        });
        setQuestions(res.data || []);
      } catch (e) {
        console.error("Failed to load answers", e);
        setFetchError("Could not load answers. Please try again.");
      } finally {
        setLoadingQ(false);
      }
    }
    setOpen((v) => !v);
  };

  return (
    <div style={styles.sectionReview}>
      {/* ── Chip row — always visible ── */}
      <div style={styles.chipRow}>
        <div style={styles.chipLeft}>
          <span style={styles.sectionReviewName}>{sectionName}</span>
          <span
            style={{
              ...styles.scorePill,
              color: passed ? "#166534" : "#991b1b",
              background: passed ? "#dcfce7" : "#fee2e2",
            }}
          >
            {score}% {passed ? "✓" : "✗"}
          </span>
          {questions.length > 0 && (
            <span style={styles.chipMeta}>
              <span style={styles.correct}>{correctCount} correct</span>
              <span style={styles.dot}>·</span>
              <span style={styles.wrong}>{wrongCount} wrong</span>
              <span style={styles.dot}>·</span>
              <span style={styles.total}>{questions.length} total</span>
            </span>
          )}
        </div>

        {/* Always show the Review answers button */}
        <button type="button" onClick={handleToggle} style={styles.reviewToggle}>
          {loadingQ
            ? "Loading…"
            : open
            ? "Hide answers"
            : "Review answers"}
          {!loadingQ && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </button>
      </div>

      {/* ── Error state ── */}
      {open && fetchError && (
        <div style={{ padding: "12px 24px", color: "#991b1b", fontSize: "0.85rem" }}>
          {fetchError}
        </div>
      )}

      {/* ── Loading state ── */}
      {open && loadingQ && (
        <div style={{ padding: "12px 24px", color: "#64748b", fontSize: "0.85rem" }}>
          Loading answers…
        </div>
      )}

      {/* ── No data (submitted before feature was added) ── */}
      {open && !loadingQ && !fetchError && questions.length === 0 && (
        <div style={{ padding: "12px 24px", color: "#64748b", fontSize: "0.85rem" }}>
          No answer data available for this attempt.
        </div>
      )}

      {/* ── Expanded answer list ── */}
      {open && !loadingQ && questions.length > 0 && (
        <div style={styles.questionList}>
          {questions.map((q, idx) => (
            <div
              key={idx}
              style={{
                ...styles.questionCard,
                borderLeft: `4px solid ${q.isCorrect ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <div style={styles.questionHeader}>
                <span
                  style={{
                    ...styles.questionBadge,
                    background: q.isCorrect ? "#dcfce7" : "#fee2e2",
                    color: q.isCorrect ? "#166534" : "#991b1b",
                  }}
                >
                  {q.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
                <span style={styles.questionNumber}>Q{idx + 1}</span>
              </div>

              <p style={styles.questionText}>{q.question}</p>

              {/* Options list */}
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div style={styles.optionsList}>
                  {q.options.map((option, oIdx) => {
                    const isUserPick = option === q.userAnswer;
                    const isCorrectAnswer = option === q.correctAnswer;
                    let optionStyle = { ...styles.optionItem };
                    if (isCorrectAnswer) {
                      optionStyle = { ...optionStyle, ...styles.optionCorrect };
                    } else if (isUserPick && !isCorrectAnswer) {
                      optionStyle = { ...optionStyle, ...styles.optionWrong };
                    }
                    return (
                      <div key={oIdx} style={optionStyle}>
                        <span style={styles.optionText}>{option}</span>
                        {isCorrectAnswer && isUserPick && (
                          <span style={styles.optionTag}>Your answer ✓</span>
                        )}
                        {isCorrectAnswer && !isUserPick && (
                          <span style={styles.optionTag}>Correct answer</span>
                        )}
                        {isUserPick && !isCorrectAnswer && (
                          <span style={{ ...styles.optionTag, ...styles.optionTagWrong }}>
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback: no options array */}
              {(!Array.isArray(q.options) || q.options.length === 0) && (
                <div style={styles.answerFallback}>
                  <div style={styles.answerRow}>
                    <span style={styles.answerRowLabel}>Your answer:</span>
                    <span
                      style={{
                        ...styles.answerValue,
                        color: q.isCorrect ? "#166534" : "#991b1b",
                        background: q.isCorrect ? "#dcfce7" : "#fee2e2",
                      }}
                    >
                      {q.userAnswer || "—"}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div style={styles.answerRow}>
                      <span style={styles.answerRowLabel}>Correct answer:</span>
                      <span
                        style={{ ...styles.answerValue, color: "#166534", background: "#dcfce7" }}
                      >
                        {q.correctAnswer || "—"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────
export default function CoursesDashboard() {
  const navigate = useNavigate();
  const [assessmentNames, setAssessmentNames] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const [assessmentsRes, profileRes] = await Promise.all([
          api.get("/assessment/subjects", { withCredentials: true }),
          api.get("/candidates/me", { withCredentials: true }),
        ]);
        setAssessmentNames(assessmentsRes.data || []);
        setAssignmentMessage(profileRes.data?.candidate?.assessmentAssignmentMessage || "");
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError("We could not load the available assessments.");
      }
    };

    fetchAssessments();
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (assessmentNames.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const statusEntries = await Promise.all(
          assessmentNames.map(async (name) => {
            try {
              const res = await api.get(`/assessment/status/${encodeURIComponent(name)}`, {
                withCredentials: true,
              });

              return [
                name,
                {
                  results: res.data?.results || [],
                  nextLevel: res.data?.nextLevel || 1,
                  totalSections: res.data?.totalSections || 0,
                  configs: res.data?.configs || [],
                },
              ];
            } catch (err) {
              console.error(`Error fetching status for ${name}:`, err);
              return [
                name,
                {
                  results: [],
                  nextLevel: 1,
                  totalSections: 0,
                  configs: [],
                },
              ];
            }
          })
        );

        setStatusData(Object.fromEntries(statusEntries));
      } catch (err) {
        console.error("Error loading test statuses:", err);
        setError("We could not load your assessment progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [assessmentNames]);

  const assessments = useMemo(() => {
    return assessmentNames.map((name) => ({
      name,
      state: getAssessmentState(statusData[name]),
    }));
  }, [assessmentNames, statusData]);

  const handleAction = (assessmentName, assessmentState) => {
    if (!assessmentState.canLaunch) return;
    navigate(`/assessment/instructions/${encodeURIComponent(assessmentName)}/${assessmentState.nextLevel}`);
  };

  const getStatusTone = (assessmentState) => {
    if (assessmentState.completed) return "success";
    if (assessmentState.isLocked) return "danger";
    if (assessmentState.hasStarted) return "info";
    return "neutral";
  };

  const getActionTone = (assessmentState) => {
    if (assessmentState.completed) return "completed";
    if (assessmentState.isLocked) return "completed";
    if (assessmentState.hasStarted) return "continue";
    return "start";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.topbar}>
          <button type="button" onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={18} />
            Back
          </button>
          <div style={styles.brand}>
            <div style={styles.brandMark}>V</div>
            <span style={styles.brandText}>VirtueHire</span>
          </div>
        </header>

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Manage Tests</p>
            <h1 style={styles.title}>Your assessment progress</h1>
            <p style={styles.subtitle}>
              Start a new test, continue where you left off, or review what you have already completed.
            </p>
          </div>
        </section>

        {error ? <div style={styles.errorBanner}>{error}</div> : null}

        <section style={styles.card}>
          {loading ? (
            <div style={styles.emptyState}>Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div style={styles.emptyState}>
              {assignmentMessage || "No assessments are available right now."}
            </div>
          ) : (
            <div style={styles.list}>
              {assessments.map(({ name, state }) => (
                <article key={name} style={styles.listItem}>
                  {/* Top row: name + progress + action */}
                  <div style={styles.listItemTop}>
                    <div style={styles.listMain}>
                      <div style={styles.iconWrap}>
                        {state.completed ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />}
                      </div>
                      <div style={styles.testInfo}>
                        <h3 style={styles.testName}>{name}</h3>
                        <p style={styles.testMeta}>
                          {state.isLocked
                            ? state.lockMessage
                            : state.completed
                            ? `All ${state.totalSections || 0} sections finished`
                            : state.hasStarted
                            ? `Next section: ${state.currentPhaseName}`
                            : `Ready to begin from ${state.currentPhaseName}`}
                        </p>
                      </div>
                    </div>

                    <div style={styles.listSide}>
                      <span style={{ ...styles.statusBadge, ...statusToneStyles[getStatusTone(state)] }}>
                        {state.statusLabel}
                      </span>

                      <div style={styles.progressWrap}>
                        <span style={styles.progressText}>
                          {state.passedCount}/{state.totalSections || 0} sections cleared
                        </span>
                        <div style={styles.progressTrack}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${state.progressValue}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAction(name, state)}
                        disabled={!state.canLaunch}
                        style={{
                          ...styles.actionButton,
                          ...actionToneStyles[getActionTone(state)],
                          ...(state.canLaunch ? null : styles.disabledButton),
                        }}
                      >
                        {state.actionLabel}
                        {state.canLaunch ? <ChevronRight size={16} /> : null}
                      </button>
                    </div>
                  </div>

                  {/* Results: one expandable SectionReview per attempted level */}
                  {state.results && state.results.length > 0 && (
                    <div style={styles.resultsArea}>
                      {state.results.map((result, idx) => {
                        const config = statusData[name]?.configs?.find(
                          (c) => Number(c.sectionNumber) === Number(result.level)
                        );
                        return (
                          <SectionReview key={idx} result={result} config={config} />
                        );
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
    padding: "28px 16px 40px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: "12px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "700",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandMark: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)",
    color: "#ffffff",
    fontWeight: "800",
  },
  brandText: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  hero: {
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #dbeafe",
    padding: "28px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
  },
  eyebrow: {
    margin: "0 0 8px",
    fontSize: "0.8rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4338ca",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "2.1rem",
    fontWeight: "800",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: "720px",
  },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "18px",
    padding: "16px 18px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #dbeafe",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid #e2e8f0",
  },
  listItemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "22px 24px",
    flexWrap: "wrap",
  },
  listMain: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    flex: "1 1 360px",
    minWidth: 0,
  },
  iconWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    color: "#2563eb",
    flexShrink: 0,
  },
  testInfo: {
    minWidth: 0,
  },
  testName: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
    overflowWrap: "anywhere",
  },
  testMeta: {
    margin: "8px 0 0",
    color: "#64748b",
    lineHeight: 1.5,
  },
  listSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "16px",
    flex: "1 1 360px",
    flexWrap: "wrap",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  progressWrap: {
    minWidth: "190px",
    flex: "0 1 220px",
  },
  progressText: {
    display: "block",
    marginBottom: "8px",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  progressTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #2563eb 0%, #4338ca 100%)",
  },
  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "800",
    minWidth: "120px",
  },
  disabledButton: {
    cursor: "default",
  },
  emptyState: {
    padding: "28px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: "600",
  },

  // Results area
  resultsArea: {
    borderTop: "1px dashed #e2e8f0",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },

  // Per-section review
  sectionReview: {
    borderBottom: "1px solid #edf0f4",
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "14px 24px",
  },
  chipLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  sectionReviewName: {
    fontSize: "0.88rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  scorePill: {
    fontSize: "0.82rem",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "999px",
  },
  chipMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
  },
  correct: { color: "#166534" },
  wrong: { color: "#991b1b" },
  total: { color: "#64748b" },
  dot: { color: "#cbd5e1" },
  reviewToggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.82rem",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  // Question list
  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "4px 24px 18px",
  },
  questionCard: {
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  questionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionBadge: {
    fontSize: "0.78rem",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "999px",
  },
  questionNumber: {
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#94a3b8",
  },
  questionText: {
    margin: 0,
    fontSize: "0.92rem",
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 1.55,
  },

  // Options
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  optionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "9px 14px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  optionCorrect: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },
  optionWrong: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
  },
  optionText: {
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  optionTag: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#166534",
    background: "#dcfce7",
    padding: "2px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  optionTagWrong: {
    color: "#991b1b",
    background: "#fee2e2",
  },

  // Fallback (no options array)
  answerFallback: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  answerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  answerRowLabel: {
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#64748b",
    minWidth: "110px",
  },
  answerValue: {
    fontSize: "0.82rem",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "8px",
  },
};

const statusToneStyles = {
  success: { background: "#dcfce7", color: "#166534" },
  info:    { background: "#dbeafe", color: "#1d4ed8" },
  neutral: { background: "#f1f5f9", color: "#475569" },
  danger:  { background: "#fee2e2", color: "#991b1b" },
};

const actionToneStyles = {
  start: {
    background: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(37, 99, 235, 0.22)",
  },
  continue: {
    background: "#4338ca",
    color: "#ffffff",
    boxShadow: "0 12px 28px rgba(67, 56, 202, 0.22)",
  },
  completed: {
    background: "#e2e8f0",
    color: "#64748b",
    boxShadow: "none",
  },
};