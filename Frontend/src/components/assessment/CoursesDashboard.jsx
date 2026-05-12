import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  RotateCw,
  Filter,
  X,
  Search,
  ArrowUpDown,
} from "lucide-react";
import api from "../../services/api";

function getAssessmentState(status = {}) {
  const results = Array.isArray(status.results) ? status.results : [];
  const attemptedCount = results.length;
  const totalSections = Number(status.totalSections) || 0;
  const nextLevel = Number(status.nextLevel) || 1;
  const configs = Array.isArray(status.configs) ? status.configs : [];
  const isLocked = Boolean(status.isLocked);
  const lockMessage =
    typeof status.error === "string" && status.error.trim()
      ? status.error
      : "Test is locked";
  const passedLevels = new Set(
    results
      .filter((result) => {
        const currentConfig = configs.find(
          (config) => Number(config.sectionNumber) === Number(result.level),
        );
        const requiredScore = Number(currentConfig?.passPercentage) || 60;
        return Number(result.score) >= requiredScore;
      })
      .map((result) => Number(result.level)),
  );
  const completed = totalSections > 0 && passedLevels.size >= totalSections;
  const hasStarted = attemptedCount > 0;
  const actionLabel = isLocked
    ? "Test is Locked"
    : completed
      ? "Completed"
      : hasStarted
        ? "Continue"
        : "Start";
  const progressValue =
    totalSections > 0
      ? Math.round((passedLevels.size / totalSections) * 100)
      : 0;
  const currentConfig = configs.find(
    (config) => Number(config.sectionNumber) === nextLevel,
  );
  const currentPhaseName =
    currentConfig?.sectionName ||
    currentConfig?.subject ||
    `Section ${nextLevel}`;

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
    statusLabel: isLocked
      ? "Test is Locked"
      : completed
        ? "Completed"
        : hasStarted
          ? "In Progress"
          : "Not Started",
  };
}

// ─────────────────────────────────────────────────────────────
// SectionReview
// ─────────────────────────────────────────────────────────────
function SectionReview({ result, config }) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const required = Number(config?.passPercentage) || 60;
  const score = Number(result.score);
  const passed = score >= required;
  const sectionName =
    config?.sectionName || config?.subject || `Section ${result.level}`;

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const wrongCount = questions.length - correctCount;

  const handleToggle = async () => {
    if (!open && questions.length === 0) {
      setLoadingQ(true);
      setFetchError("");
      try {
        const res = await api.get(`/assessment/results/${result.id}/answers`, {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
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
    <div style={s.sectionReview}>
      <div style={s.chipRow}>
        <div style={s.chipLeft}>
          <span style={s.sectionReviewName}>{sectionName}</span>
          <span
            style={{
              ...s.scorePill,
              color: passed ? "#166534" : "#991b1b",
              background: passed ? "#dcfce7" : "#fee2e2",
            }}
          >
            {score}% {passed ? "✓" : "✗"}
          </span>
          {questions.length > 0 && (
            <span style={s.chipMeta}>
              <span style={s.correct}>{correctCount} correct</span>
              <span style={s.dot}>·</span>
              <span style={s.wrong}>{wrongCount} wrong</span>
              <span style={s.dot}>·</span>
              <span style={s.total}>{questions.length} total</span>
            </span>
          )}
        </div>
        <button type="button" onClick={handleToggle} style={s.reviewToggle}>
          {loadingQ ? "Loading…" : open ? "Hide answers" : "Review answers"}
          {!loadingQ && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </button>
      </div>

      {open && fetchError && (
        <div style={{ padding: "12px 24px", color: "#991b1b", fontSize: "0.85rem" }}>
          {fetchError}
        </div>
      )}
      {open && loadingQ && (
        <div style={{ padding: "12px 24px", color: "#64748b", fontSize: "0.85rem" }}>
          Loading answers…
        </div>
      )}
      {open && !loadingQ && !fetchError && questions.length === 0 && (
        <div style={{ padding: "12px 24px", color: "#64748b", fontSize: "0.85rem" }}>
          No answer data available for this attempt.
        </div>
      )}
      {open && !loadingQ && questions.length > 0 && (
        <div style={s.questionList}>
          {questions.map((q, idx) => (
            <div
              key={idx}
              style={{
                ...s.questionCard,
                borderLeft: `4px solid ${q.isCorrect ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <div style={s.questionHeader}>
                <span
                  style={{
                    ...s.questionBadge,
                    background: q.isCorrect ? "#dcfce7" : "#fee2e2",
                    color: q.isCorrect ? "#166534" : "#991b1b",
                  }}
                >
                  {q.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
                <span style={s.questionNumber}>Q{idx + 1}</span>
              </div>
              <p style={s.questionText}>{q.question}</p>
              {Array.isArray(q.options) && q.options.length > 0 ? (
                <div style={s.optionsList}>
                  {q.options.map((option, oIdx) => {
                    const isUserPick = option === q.userAnswer;
                    const isCorrectAnswer = option === q.correctAnswer;
                    let optionStyle = { ...s.optionItem };
                    if (isCorrectAnswer) optionStyle = { ...optionStyle, ...s.optionCorrect };
                    else if (isUserPick && !isCorrectAnswer) optionStyle = { ...optionStyle, ...s.optionWrong };
                    return (
                      <div key={oIdx} style={optionStyle}>
                        <span style={s.optionText}>{option}</span>
                        {isCorrectAnswer && isUserPick && <span style={s.optionTag}>Your answer ✓</span>}
                        {isCorrectAnswer && !isUserPick && <span style={s.optionTag}>Correct answer</span>}
                        {isUserPick && !isCorrectAnswer && (
                          <span style={{ ...s.optionTag, ...s.optionTagWrong }}>Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={s.answerFallback}>
                  <div style={s.answerRow}>
                    <span style={s.answerRowLabel}>Your answer:</span>
                    <span style={{ ...s.answerValue, color: q.isCorrect ? "#166534" : "#991b1b", background: q.isCorrect ? "#dcfce7" : "#fee2e2" }}>
                      {q.userAnswer || "—"}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div style={s.answerRow}>
                      <span style={s.answerRowLabel}>Correct answer:</span>
                      <span style={{ ...s.answerValue, color: "#166534", background: "#dcfce7" }}>
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all | completed | inprogress | notstarted | locked
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default | name | progress | status

  // ─────────────────────────────────────────────────────────────
  // Fetch assessment names on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const [profileRes, assessmentsRes] = await Promise.all([
          api.get("/candidates/me", { withCredentials: true }),
          api.get("/candidates/my-assessments", { withCredentials: true }),
        ]);

        const raw = assessmentsRes.data?.assessments;

        let visibleAssessments = [];
        if (Array.isArray(raw)) {
          visibleAssessments = raw.flatMap((entry) =>
            typeof entry === "string"
              ? entry.split(",").map((n) => n.trim()).filter(Boolean)
              : [],
          );
        } else if (typeof raw === "string") {
          visibleAssessments = raw.split(",").map((n) => n.trim()).filter(Boolean);
        }

        setAssessmentNames(visibleAssessments);
        setAssignmentMessage(profileRes.data?.candidate?.assessmentAssignmentMessage || "");
        setError("");
      } catch (err) {
        console.error("Error fetching assessments:", err);
        const status = err?.response?.status;
        if (status === 401) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => navigate("/login"), 3000);
        } else if (status === 403) {
          setError("Access denied. Please complete any required verification steps.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else if (err?.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────
  // Fetch assessment statuses with cache-busting
  // ─────────────────────────────────────────────────────────────
  const fetchStatusData = async () => {
    if (assessmentNames.length === 0) return;
    try {
      setLoading(true);
      const statusEntries = await Promise.all(
        assessmentNames.map(async (name) => {
          try {
            const res = await api.get(`/assessment/status`, {
              params: {
                name,
                t: Date.now(),
              },
              withCredentials: true,
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              }
            });
            return [name, {
              results: res.data?.results || [],
              nextLevel: res.data?.nextLevel || 1,
              totalSections: res.data?.totalSections || 0,
              configs: res.data?.configs || [],
              isLocked: Boolean(res.data?.isLocked),
              error: res.data?.error || "",
            }];
          } catch (err) {
            console.error(`Error fetching status for ${name}:`, err);
            return [name, { results: [], nextLevel: 1, totalSections: 0, configs: [], isLocked: false, error: "" }];
          }
        }),
      );
      setStatusData(Object.fromEntries(statusEntries));
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Error loading test statuses:", err);
      setError("We could not load your assessment progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusData();
  }, [assessmentNames]);

  // ─────────────────────────────────────────────────────────────
  // Auto-refresh every 30 seconds
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatusData();
    }, 30000);
    return () => clearInterval(interval);
  }, [assessmentNames]);

  // ─────────────────────────────────────────────────────────────
  // Manual refresh handler
  // ─────────────────────────────────────────────────────────────
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchStatusData();
    setRefreshing(false);
  };

  const assessments = useMemo(() => {
    return assessmentNames.map((name) => ({
      name,
      state: getAssessmentState(statusData[name]),
    }));
  }, [assessmentNames, statusData]);

  // FIX: Filter and sort assessments
  const filteredAssessments = useMemo(() => {
    let result = assessments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(({ name }) => name.toLowerCase().includes(query));
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(({ state }) => {
        switch (filterStatus) {
          case "completed":
            return state.completed;
          case "inprogress":
            return state.hasStarted && !state.completed && !state.isLocked;
          case "notstarted":
            return !state.hasStarted && !state.isLocked;
          case "locked":
            return state.isLocked;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.state.progressValue - a.state.progressValue;
        case "status":
          const statusOrder = { locked: 0, completed: 1, inprogress: 2, notstarted: 3 };
          const getStatus = (s) => {
            if (s.isLocked) return "locked";
            if (s.completed) return "completed";
            if (s.hasStarted) return "inprogress";
            return "notstarted";
          };
          return statusOrder[getStatus(a.state)] - statusOrder[getStatus(b.state)];
        default:
          return 0;
      }
    });

    return result;
  }, [assessments, filterStatus, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery || filterStatus !== "all" || sortBy !== "default";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setSortBy("default");
  };

  const handleAction = (assessmentName, assessmentState) => {
    if (!assessmentState.canLaunch) return;
    localStorage.setItem("selectedAssessment", assessmentName);
    sessionStorage.setItem("selectedAssessment", assessmentName);
    navigate(`/assessment/instructions/${encodeURIComponent(assessmentName)}/${assessmentState.nextLevel}`);
  };

  const getStatusTone = (state) => {
    if (state.completed) return "success";
    if (state.isLocked) return "danger";
    if (state.hasStarted) return "info";
    return "neutral";
  };

  const getActionTone = (state) => {
    if (state.completed) return "completed";
    if (state.isLocked) return "completed";
    if (state.hasStarted) return "continue";
    return "start";
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .action-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .action-btn:disabled {
          cursor: default;
        }
        .review-toggle:hover {
          background: #f1f5f9 !important;
        }
        .refresh-btn:hover:not(:disabled) {
          background: #f1f5f9 !important;
          transform: translateY(-1px);
        }
        .refresh-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .refresh-btn.spinning {
          animation: spin 1s linear infinite;
        }
        .filter-input-wrap:hover, .filter-input-wrap:focus-within {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }
        .filter-select-wrap:hover, .filter-select-wrap:focus-within {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }
        .input-clear:hover {
          background: #94a3b8 !important;
        }
        .filter-clear-btn:hover:not(:disabled) {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
        }
        .filter-clear-btn:disabled {
          background: #93c5fd !important;
        }
      `}</style>

      <div style={s.page}>
        <div style={s.container}>

          {/* ── Topbar ── */}
          <header style={s.topbar}>
            <button type="button" onClick={() => navigate(-1)} style={s.backBtn}>
              <ArrowLeft size={16} />
              Back
            </button>
            <div style={s.brand}>
              <div style={s.brandMark}>V</div>
              <span style={s.brandText}>VirtueHire</span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              style={{ ...s.refreshBtn }}
              className={refreshing ? "refresh-btn spinning" : "refresh-btn"}
              title="Refresh assessment status"
            >
              <RotateCw size={16} />
            </button>
          </header>

          {/* ── Hero ── */}
          <section style={s.hero}>
            <p style={s.eyebrow}>Manage Tests</p>
            <h1 style={s.heroTitle}>Your assessment progress</h1>
            <p style={s.heroSub}>
              Start a new test, continue where you left off, or review what you have already completed.
            </p>
            {lastRefreshTime && (
              <p style={s.lastRefresh}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </p>
            )}
          </section>

          {/* ── Filter Bar ── */}
          {assessments.length > 0 && (
            <section style={s.filterBar}>
              <div style={s.filterRow}>
                {/* Search by name */}
                <div style={s.filterInputWrap} className="filter-input-wrap">
                  <Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search by assessment name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={s.filterInput}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={s.inputClear}
                      className="input-clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div style={s.filterSelectWrap} className="filter-select-wrap">
                  <ArrowUpDown size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={s.filterSelect}
                  >
                    <option value="default">Default Sort</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="progress">Progress (High-Low)</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Status filter dropdown */}
                <div style={s.filterSelectWrap} className="filter-select-wrap">
                  <Filter size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={s.filterSelect}
                  >
                    <option value="all">All Status ({assessments.length})</option>
                    <option value="completed">
                      Completed ({assessments.filter(a => a.state.completed).length})
                    </option>
                    <option value="inprogress">
                      In Progress ({assessments.filter(a => a.state.hasStarted && !a.state.completed && !a.state.isLocked).length})
                    </option>
                    <option value="notstarted">
                      Not Started ({assessments.filter(a => !a.state.hasStarted && !a.state.isLocked).length})
                    </option>
                    <option value="locked">
                      Locked ({assessments.filter(a => a.state.isLocked).length})
                    </option>
                  </select>
                </div>

                {/* Clear button */}
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  style={{
                    ...s.filterClearBtn,
                    opacity: hasActiveFilters ? 1 : 0.5,
                    cursor: hasActiveFilters ? "pointer" : "not-allowed",
                  }}
                  className="filter-clear-btn"
                >
                  <RotateCw size={16} />
                  Clear
                </button>
              </div>
            </section>
          )}

          {error && <div style={s.errorBanner}>{error}</div>}

          {/* ── List card ── */}
          <section style={s.card}>
            {loading ? (
              <div style={s.emptyState}>Loading assessments…</div>
            ) : assessments.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "3rem", opacity: 0.3 }}>📋</div>
                  <div style={{ fontWeight: 600, color: "#475569" }}>
                    {assignmentMessage || "No assessments assigned yet"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", maxWidth: "400px" }}>
                    Contact your HR or administrator if you believe this is an error. They can assign assessments to your account.
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: refreshing ? "not-allowed" : "pointer",
                      opacity: refreshing ? 0.6 : 1,
                      marginTop: "8px",
                    }}
                  >
                    <RotateCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                    {refreshing ? "Checking..." : "Check for new assessments"}
                  </button>
                </div>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "3rem", opacity: 0.3 }}>🔍</div>
                  <div style={{ fontWeight: 600, color: "#475569" }}>
                    No assessments match the selected filter
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", maxWidth: "400px" }}>
                    Try selecting a different filter option or clear the filter to see all assessments.
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("all")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                    Clear Filter
                  </button>
                </div>
              </div>
            ) : (
              <div style={s.list}>
                {filteredAssessments.map(({ name, state }, i) => (
                  <article
                    key={name}
                    style={{ ...s.listItem, animationDelay: `${i * 60}ms` }}
                    className="fade-up-item"
                  >
                    {/* ── Top row ── */}
                    <div style={s.listItemTop}>

                      {/* Left: icon + name */}
                      <div style={s.listMain}>
                        <div style={{
                          ...s.iconWrap,
                          background: state.completed ? "#f0fdf4" : "#eff6ff",
                          color: state.completed ? "#16a34a" : "#2563eb",
                        }}>
                          {state.completed
                            ? <CheckCircle2 size={20} />
                            : <PlayCircle size={20} />}
                        </div>
                        <div>
                          <h3 style={s.testName}>{name}</h3>
                          <p style={s.testMeta}>
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

                      {/* Right: badge + progress + button */}
                      <div style={s.listSide}>
                        <span style={{ ...s.statusBadge, ...statusTones[getStatusTone(state)] }}>
                          {state.statusLabel}
                        </span>

                        {/* FIX: progressWrap now correctly closed before the button */}
                        <div style={s.progressWrap}>
                          <span style={s.progressText}>
                            {state.passedCount}/{state.totalSections || 0} sections cleared
                          </span>
                          <div style={s.progressTrack}>
                            <div style={{
                              ...s.progressFill,
                              width: `${state.progressValue}%`,
                              background: state.completed
                                ? "linear-gradient(90deg,#16a34a,#22c55e)"
                                : "linear-gradient(90deg,#2563eb,#4338ca)",
                            }} />
                          </div>
                        </div>
                        {/* ↑ progressWrap closes here — button is now a sibling, not a child */}

                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => handleAction(name, state)}
                          disabled={!state.canLaunch}
                          style={{
                            ...s.actionBtn,
                            ...actionTones[getActionTone(state)],
                            transition: "transform 0.15s ease, filter 0.15s ease",
                          }}
                        >
                          {state.actionLabel}
                          {state.canLaunch && <ChevronRight size={15} />}
                        </button>
                      </div>
                      {/* ↑ listSide closes here */}

                    </div>
                    {/* ↑ listItemTop closes here */}

                    {/* ── Section reviews ── */}
                    {state.results && state.results.length > 0 && (
                      <div style={s.resultsArea}>
                        {state.results.map((result, idx) => {
                          const config = statusData[name]?.configs?.find(
                            (c) => Number(c.sectionNumber) === Number(result.level),
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
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(160deg,#f0f4ff 0%,#faf5ff 100%)",
    padding: "32px 20px 60px",
    boxSizing: "border-box",
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // Topbar
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#0f172a",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 14px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#0f172a",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s ease, transform 0.15s ease",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandMark: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#2563eb,#4338ca)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "1rem",
    display: "grid",
    placeItems: "center",
  },
  brandText: {
    fontWeight: 800,
    fontSize: "1.15rem",
    color: "#0f172a",
  },

  // Hero
  hero: {
    background: "#ffffff",
    border: "1px solid #dbeafe",
    borderRadius: "20px",
    padding: "28px 32px",
    boxShadow: "0 8px 32px rgba(37,99,235,0.07)",
  },
  eyebrow: {
    margin: "0 0 6px",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4338ca",
  },
  heroTitle: {
    margin: "0 0 10px",
    fontSize: "1.9rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  heroSub: {
    margin: "0 0 8px",
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },
  lastRefresh: {
    margin: "8px 0 0 0",
    color: "#94a3b8",
    lineHeight: 1.4,
    fontSize: "0.8rem",
    fontWeight: 500,
  },

  // Filter Bar - Horizontal layout matching reference
  filterBar: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 18px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  filterInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1 1 260px",
    minWidth: "220px",
    maxWidth: "320px",
    padding: "10px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    position: "relative",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  filterInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#0f172a",
    outline: "none",
    fontFamily: "inherit",
    minWidth: 0,
    padding: "2px 0",
  },
  inputClear: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    background: "#cbd5e1",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    color: "#ffffff",
    padding: 0,
    flexShrink: 0,
    transition: "background 0.15s ease",
  },
  filterSelectWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    flexShrink: 0,
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  filterSelect: {
    border: "none",
    background: "transparent",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#0f172a",
    cursor: "pointer",
    fontFamily: "inherit",
    outline: "none",
    minWidth: "150px",
    padding: "2px 20px 2px 0",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right center",
  },
  filterClearBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "#2563eb",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    flexShrink: 0,
    minWidth: "90px",
  },

  // Error
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "14px",
    padding: "14px 18px",
    fontWeight: 600,
    fontSize: "0.9rem",
  },

  // Card
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    padding: "40px 28px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.95rem",
  },

  // List item
  listItem: {
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid #e2e8f0",
    animation: "fadeUp 0.4s ease both",
  },
  listItemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 24px",
    flexWrap: "wrap",
  },

  // Left side
  listMain: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: "1 1 240px",
    minWidth: 0,
  },
  iconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  testName: {
    margin: "0 0 4px",
    fontSize: "1rem",
    fontWeight: 800,
    color: "#0f172a",
    overflowWrap: "anywhere",
  },
  testMeta: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.85rem",
    lineHeight: 1.4,
  },

  // Right side
  listSide: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flex: "1 1 300px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
  },
  progressWrap: {
    minWidth: "160px",
    flex: "0 1 200px",
  },
  progressText: {
    display: "block",
    marginBottom: "6px",
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  progressTrack: {
    width: "100%",
    height: "7px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.6s ease",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  // Results
  resultsArea: {
    borderTop: "1px dashed #e2e8f0",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  sectionReview: {
    borderBottom: "1px solid #edf0f4",
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "12px 24px",
  },
  chipLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  sectionReviewName: {
    fontSize: "0.88rem",
    fontWeight: 800,
    color: "#1e293b",
  },
  scorePill: {
    fontSize: "0.8rem",
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  chipMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8rem",
    fontWeight: 600,
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
    fontWeight: 700,
    fontSize: "0.8rem",
    color: "#334155",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    transition: "background 0.15s ease",
  },
  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "4px 24px 16px",
  },
  questionCard: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "14px 16px",
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
    fontSize: "0.75rem",
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  questionNumber: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#94a3b8",
  },
  questionText: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.55,
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  optionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "9px",
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
    fontSize: "0.86rem",
    fontWeight: 600,
    color: "#1e293b",
    flex: 1,
  },
  optionTag: {
    fontSize: "0.72rem",
    fontWeight: 700,
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
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#64748b",
    minWidth: "110px",
  },
  answerValue: {
    fontSize: "0.8rem",
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "8px",
  },
};

const statusTones = {
  success: { background: "#dcfce7", color: "#166534" },
  info:    { background: "#dbeafe", color: "#1d4ed8" },
  neutral: { background: "#f1f5f9", color: "#475569" },
  danger:  { background: "#fee2e2", color: "#991b1b" },
};

const actionTones = {
  start:     { background: "#2563eb", color: "#ffffff", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" },
  continue:  { background: "#4338ca", color: "#ffffff", boxShadow: "0 4px 14px rgba(67,56,202,0.25)" },
  completed: { background: "#e2e8f0", color: "#64748b", boxShadow: "none" },
};