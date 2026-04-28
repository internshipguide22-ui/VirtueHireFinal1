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
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (subject && level !== null && score !== null && passed !== null) return;

    const fetchLatestResult = async () => {
      const subj = subject || initial.subject;
      if (!subj) return;

      setLoading(true);
      try {
        const encodedSubject = encodeURIComponent(subj);
        const res = await api.get(`/assessment/results/${encodedSubject}`, { withCredentials: true });
        console.log("Assessment results response:", res?.data);
        const results = res.data || [];
        if (results.length === 0) {
          setLoading(false);
          return;
        }

        const highest = results.reduce((max, r) => (r.level > max.level ? r : max), results[0]);

        setLevel(highest.level);
        setSubject(subj);
        setScore(highest.score.toFixed(2));
        setPassed(highest.passed ?? (highest.score >= 60));

        // Fetch configs to get the actual section name and total sections
        const statusRes = await api.get(`/assessment/status/${encodedSubject}`, { withCredentials: true });
        console.log("Assessment status response on result page:", statusRes?.data);
        const configs = statusRes.data.configs || [];
        const totalSections = statusRes.data.totalSections || 3;

        const config = configs.find(c => c.sectionNumber === highest.level);
        setSectionName(config ? config.sectionName : `Section ${highest.level}`);
        setIsLastLevel(highest.level === totalSections);

      } catch (err) {
        console.error("Failed to fetch results:", err);
        setActionError(getApiErrorMessage(err, "Failed to load the latest assessment result."));
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  // Handle auto navigation if the previous segment timed out
  useEffect(() => {
    if (!loading && initial.autoSubmitted) {
        // give them 3 seconds to see the result, then force to next
        const timer = setTimeout(() => {
            handleNextLevel();
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [loading, initial.autoSubmitted, isLastLevel, passed]);

  const handleNextLevel = async () => {
    if (isLastLevel) {
      navigate("/assessment/complete");
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
      const res = await api.get(`/assessment/${encodedSubject}/level/${nextLevel}`, { withCredentials: true });
      console.log("Next level preload response:", res?.data);

      if (!res?.data) {
        setActionError("The next section could not be loaded right now. Please try again.");
        return;
      }

      if (res.data?.error) {
        setActionError(
          typeof res.data.error === "string" && res.data.error.trim() && res.data.error.trim().toLowerCase() !== "null"
            ? res.data.error
            : "The next section is not available right now."
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
      setActionError(getApiErrorMessage(err, "Unable to load the next section right now. Please try again."));
    }
  };

  const handleGoHome = () => {
    navigate("/candidates/welcome");
  };

  // Get performance message based on score
  const getPerformanceMessage = (scoreVal) => {
    if (scoreVal >= 90) return { text: "Outstanding!", color: "#10b981", icon: "🌟" };
    if (scoreVal >= 75) return { text: "Excellent!", color: "#3b82f6", icon: "⭐" };
    if (scoreVal >= 60) return { text: "Good Job!", color: "#f59e0b", icon: "👍" };
    return { text: "Keep Trying!", color: "#ef4444", icon: "💪" };
  };

  const performance = getPerformanceMessage(score);

  if (loading) {
    return (
      <div style={{
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif"
      }}>
        <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>Loading result...</div>
      </div>
    );
  }

  if (!subject || level === null) {
    return (
      <div style={{
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif"
      }}>
        <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>No result to show.</div>
      </div>
    );
  }


  return (
    <div style={{
      fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#f3f4f6",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 20px"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "50px 40px",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center",
        animation: "slideUp 0.5s ease-out"
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          color: "#1f2937",
          marginBottom: "10px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Assessment Result
        </h1>

        {/* Subject & Level Info */}
        <div style={{
          backgroundColor: "#f9fafb",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          borderLeft: "4px solid #4f46e5"
        }}>
          <p style={{ margin: "8px 0", color: "#6b7280", fontSize: "0.95rem" }}>
            Assessment: <span style={{ fontWeight: "700", color: "#1f2937", fontSize: "1.1rem" }}>{subject}</span>
          </p>
          <p style={{ margin: "8px 0", color: "#6b7280", fontSize: "0.95rem" }}>
            Section: <span style={{ fontWeight: "700", color: "#1f2937", fontSize: "1.1rem" }}>{sectionName || "Assessment Section"}</span>
          </p>
        </div>

        {/* Score Circle */}
        <div style={{
          position: "relative",
          width: "200px",
          height: "200px",
          margin: "0 auto 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Outer Circle Background */}
          <svg style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            transform: "rotate(-90deg)"
          }}>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={passed ? "#dcfce7" : "#fee2e2"}
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={passed ? "#10b981" : "#ef4444"}
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 565} 565`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease-out" }}
            />
          </svg>

          {/* Center Content */}
          <div>
            <div style={{
              fontSize: "3rem",
              marginBottom: "5px"
            }}>
              {performance.icon}
            </div>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              color: passed ? "#10b981" : "#ef4444",
              lineHeight: "1"
            }}>
              {score}%
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <h2 style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          color: performance.color,
          marginBottom: "8px"
        }}>
          {performance.text}
        </h2>

        {/* Status Badge */}
        <div style={{
          display: "inline-block",
          padding: "8px 16px",
          borderRadius: "20px",
          fontWeight: "700",
          fontSize: "1rem",
          marginBottom: "30px",
          backgroundColor: passed ? "#dcfce7" : "#fee2e2",
          color: passed ? "#166534" : "#991b1b"
        }}>
          {passed ? "✓ Passed" : "✗ Failed"}
        </div>

        {/* Motivational Message */}
        {passed ? (
          <p style={{
            color: "#6b7280",
            fontSize: "1rem",
            marginBottom: "30px",
            fontWeight: "500"
          }}>
            🎉 You've successfully completed this level!
          </p>
        ) : (
          <p style={{
            color: "#6b7280",
            fontSize: "1rem",
            marginBottom: "30px",
            fontWeight: "500"
          }}>
            💪 Don't give up! Review and try again to improve your score.
          </p>
        )}

        {/* Buttons */}
        {actionError ? (
          <div style={{
            marginBottom: "20px",
            padding: "12px 14px",
            borderRadius: "12px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            fontWeight: "600"
          }}>
            {actionError}
          </div>
        ) : null}

        <div style={{
          display: "flex",
          gap: "12px",
          flexDirection: passed ? "row" : "column"
        }}>
          {passed ? (
            <>
              <button
                onClick={handleNextLevel}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  backgroundColor: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = "0 8px 20px rgba(79, 70, 229, 0.4)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {isLastLevel ? "🎓 Finish" : "➜ Next Level"}
              </button>

              <button
                onClick={handleGoHome}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  backgroundColor: "#f3f4f6",
                  color: "#4f46e5",
                  border: "2px solid #4f46e5",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#ede9fe";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6";
                }}
              >
                🏠 Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(-1)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  backgroundColor: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = "0 8px 20px rgba(255, 152, 0, 0.4)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.3)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🔄 Try Again
              </button>

              <button
                onClick={handleGoHome}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#e5e7eb";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6";
                }}
              >
                🏠 Home
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentResult;
