import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

const getApiErrorMessage = (error, fallbackMessage) => {
  const serverMessage =
    error?.response?.data?.error ??
    error?.response?.data?.message ??
    error?.message;

  if (typeof serverMessage === "string") {
    const trimmedMessage = serverMessage.trim();
    if (trimmedMessage && trimmedMessage.toLowerCase() !== "null") {
      return trimmedMessage;
    }
  }

  return fallbackMessage;
};

const AssessmentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.state || {};

  const [level, setLevel] = useState(initial.level ?? null);
  const [score, setScore] = useState(initial.score ?? null);
  const [passed, setPassed] = useState(initial.passed ?? null);
  const [subject, setSubject] = useState(initial.subject ?? null);
  const [isLastLevel, setIsLastLevel] = useState(initial.isLastLevel ?? false);
  const [deliveryMode] = useState(
    initial.deliveryMode ||
      sessionStorage.getItem("assessmentDeliveryMode") ||
      localStorage.getItem("assessmentDeliveryMode") ||
      "online",
  );
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [offlineBadgeAwarded, setOfflineBadgeAwarded] = useState(false);

  useEffect(() => {
    if (subject && level !== null && score !== null && passed !== null) return;

    const fetchLatestResult = async () => {
      const subj = subject || initial.subject;
      if (!subj) return;

      setLoading(true);
      try {
        const encodedSubject = encodeURIComponent(subj);
        const res = await api.get(`/assessment/results/${encodedSubject}`, {
          withCredentials: true,
        });
        const results = res.data || [];
        if (results.length === 0) {
          setLoading(false);
          return;
        }

        const highest = results.reduce(
          (max, r) => (r.level > max.level ? r : max),
          results[0],
        );

        setLevel(highest.level);
        setSubject(subj);
        setScore(highest.score.toFixed(2));
        setPassed(highest.passed ?? highest.score >= 60);

        const statusRes = await api.get(
          `/assessment/status/${encodedSubject}`,
          { withCredentials: true },
        );
        const configs = statusRes.data.configs || [];
        const totalSections = statusRes.data.totalSections || 3;

        const config = configs.find((c) => c.sectionNumber === highest.level);
        setSectionName(
          config ? config.sectionName : `Section ${highest.level}`,
        );
        setIsLastLevel(highest.level === totalSections);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setActionError(
          getApiErrorMessage(
            err,
            "Failed to load the latest assessment result.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  useEffect(() => {
    const awardOfflineBadge = async () => {
      if (
        loading ||
        offlineBadgeAwarded ||
        deliveryMode !== "offline" ||
        !subject
      ) {
        return;
      }

      try {
        const res = await api.post(
          "/candidates/offline-badge",
          { subject },
          { withCredentials: true },
        );

        if (res.data?.candidate) {
          localStorage.setItem("candidate", JSON.stringify(res.data.candidate));
        }
        setOfflineBadgeAwarded(true);
      } catch (err) {
        console.error("Failed to award offline badge from result page:", err);
      }
    };

    awardOfflineBadge();
  }, [deliveryMode, loading, offlineBadgeAwarded, subject]);

  useEffect(() => {
    if (!loading && initial.autoSubmitted) {
      const timer = setTimeout(() => {
        handleNextLevel();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, initial.autoSubmitted, isLastLevel, passed]);

  const handleNextLevel = async () => {
    if (isLastLevel) {
      navigate("/assessment/complete", { state: { subject, deliveryMode } });
      return;
    }

    if (!passed || !subject || level === null) {
      navigate("/candidates/welcome");
      return;
    }

    const nextLevel = Number(level) + 1;

    try {
      setActionError("");
      const encodedSubject = encodeURIComponent(subject);
      const res = await api.get(
        `/assessment/${encodedSubject}/level/${nextLevel}`,
        { withCredentials: true },
      );

      if (!res?.data) {
        setActionError("The next section could not be loaded right now. Please try again.");
        return;
      }

      if (res.data?.error) {
        setActionError(
          typeof res.data.error === "string" &&
            res.data.error.trim() &&
            res.data.error.trim().toLowerCase() !== "null"
            ? res.data.error
            : "The next section is not available right now.",
        );
        return;
      }

      const nextQuestions = Array.isArray(res.data.questions) ? res.data.questions : [];
      if (nextQuestions.length === 0) {
        setActionError("The next section has no questions available yet. Please contact support or try again later.");
        return;
      }

      navigate(`/assessment/${encodeURIComponent(subject)}/${nextLevel}`);
    } catch (err) {
      console.error("Failed to load next level:", err);
      setActionError(
        getApiErrorMessage(err, "Unable to load the next section right now. Please try again."),
      );
    }
  };

  const handleGoHome = () => navigate("/candidates/welcome");

  const getPerformanceMessage = (scoreVal) => {
    if (scoreVal >= 90) return { text: "Outstanding!", color: "#10b981", icon: "🌟" };
    if (scoreVal >= 75) return { text: "Excellent!", color: "#3b82f6", icon: "⭐" };
    if (scoreVal >= 60) return { text: "Good Job!", color: "#f59e0b", icon: "👍" };
    return { text: "Keep Trying!", color: "#ef4444", icon: "💪" };
  };

  const performance = getPerformanceMessage(score);
  const passColor = passed ? "#10b981" : "#ef4444";
  const passBg = passed ? "#dcfce7" : "#fee2e2";

  if (loading) {
    return (
      <div style={styles.fullPage}>
        <div style={{ fontSize: "1.1rem", color: "#6b7280", fontWeight: 600 }}>
          Loading result...
        </div>
      </div>
    );
  }

  if (!subject || level === null) {
    return (
      <div style={styles.fullPage}>
        <div style={{ fontSize: "1.1rem", color: "#6b7280", fontWeight: 600 }}>
          No result to show.
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.8); opacity: 0; }
          70%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .result-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .result-btn:hover { transform: translateY(-2px); }
        .result-btn:active { transform: translateY(0); }
      `}</style>

      <div style={styles.fullPage}>
        <div style={styles.card}>

          {/* ── Title ── */}
          <h1 style={styles.title}>Assessment Result</h1>

          {/* ── Info block ── */}
          <div style={styles.infoBlock}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Assessment</span>
              <span style={styles.infoValue}>{subject}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Section</span>
              <span style={styles.infoValue}>{sectionName || "Assessment Section"}</span>
            </div>
          </div>

          {/* ── Score ring ── */}
          <div style={styles.ringWrap}>
            <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="90" cy="90" r="78" fill="none" stroke={passBg} strokeWidth="10" />
              <circle
                cx="90" cy="90" r="78"
                fill="none"
                stroke={passColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 490} 490`}
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
            </svg>
            <div style={styles.ringInner}>
              <span style={styles.ringIcon}>{performance.icon}</span>
              <span style={{ ...styles.ringScore, color: passColor }}>{score}%</span>
            </div>
          </div>

          {/* ── Performance label ── */}
          <p style={{ ...styles.performanceText, color: performance.color }}>
            {performance.text}
          </p>

          {/* ── Pass / Fail badge ── */}
          <span style={{ ...styles.statusBadge, background: passBg, color: passed ? "#166534" : "#991b1b" }}>
            {passed ? "✓ Passed" : "✗ Failed"}
          </span>

          {/* ── Motivational line ── */}
          <p style={styles.motivational}>
            {passed
              ? "🎉 You've successfully completed this level!"
              : "💪 Don't give up! Review and try again to improve your score."}
          </p>

          {/* ── Error banner ── */}
          {actionError && (
            <div style={styles.errorBox}>{actionError}</div>
          )}

          {/* ── Action buttons ── */}
          <div style={{ ...styles.btnRow, flexDirection: passed ? "row" : "column" }}>
            {passed ? (
              <>
                <button
                  className="result-btn"
                  onClick={handleNextLevel}
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                >
                  {isLastLevel ? "🎓 Finish" : "➜ Next Level"}
                </button>
                <button
                  className="result-btn"
                  onClick={handleGoHome}
                  style={{ ...styles.btn, ...styles.btnOutline }}
                >
                  🏠 Home
                </button>
              </>
            ) : (
              <>
                <button
                  className="result-btn"
                  onClick={() => navigate(-1)}
                  style={{ ...styles.btn, ...styles.btnWarning }}
                >
                  🔄 Try Again
                </button>
                <button
                  className="result-btn"
                  onClick={handleGoHome}
                  style={{ ...styles.btn, ...styles.btnGhost }}
                >
                  🏠 Home
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

const styles = {
  fullPage: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
    padding: "40px 16px",
    boxSizing: "border-box",
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(79, 70, 229, 0.12)",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0px",
    animation: "slideUp 0.45s ease-out",
  },
  title: {
    margin: "0 0 28px",
    fontSize: "2rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center",
  },
  infoBlock: {
    width: "100%",
    background: "#f8faff",
    border: "1px solid #e0e7ff",
    borderLeft: "4px solid #4f46e5",
    borderRadius: "14px",
    padding: "18px 22px",
    marginBottom: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  infoLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
    fontWeight: 600,
  },
  infoValue: {
    fontSize: "0.95rem",
    color: "#1f2937",
    fontWeight: 700,
    textAlign: "right",
  },
  divider: {
    height: "1px",
    background: "#e0e7ff",
  },
  ringWrap: {
    position: "relative",
    width: "180px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    animation: "popIn 0.6s ease-out 0.2s both",
  },
  ringInner: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
  },
  ringIcon: {
    fontSize: "2rem",
    lineHeight: 1,
  },
  ringScore: {
    fontSize: "2.8rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  performanceText: {
    margin: "0 0 10px",
    fontSize: "1.6rem",
    fontWeight: 700,
    textAlign: "center",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 20px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.95rem",
    marginBottom: "16px",
  },
  motivational: {
    margin: "0 0 24px",
    color: "#6b7280",
    fontSize: "0.95rem",
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1.5,
  },
  errorBox: {
    width: "100%",
    marginBottom: "16px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontWeight: 600,
    fontSize: "0.9rem",
    textAlign: "center",
    boxSizing: "border-box",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    width: "100%",
  },
  btn: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
  },
  btnOutline: {
    background: "#f3f4f6",
    color: "#4f46e5",
    border: "2px solid #4f46e5",
  },
  btnWarning: {
    background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(255, 152, 0, 0.3)",
  },
  btnGhost: {
    background: "#f3f4f6",
    color: "#1f2937",
    border: "2px solid #e5e7eb",
  },
};

export default AssessmentResult;