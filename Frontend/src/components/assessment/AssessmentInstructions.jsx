import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./AssessmentInstructions.css";

const ASSESSMENT_DELIVERY_MODE_KEY = "assessmentDeliveryMode";

const AssessmentInstructions = () => {
  const { subject, level } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [agreed, setAgreed] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [violations, setViolations] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState(() => {
    const storedMode =
      sessionStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY) ||
      localStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY);
    return storedMode === "offline" ? "offline" : "online";
  });

  useEffect(() => {
    sessionStorage.setItem(ASSESSMENT_DELIVERY_MODE_KEY, deliveryMode);
    localStorage.setItem(ASSESSMENT_DELIVERY_MODE_KEY, deliveryMode);
  }, [deliveryMode]);

  useEffect(() => {
    // Get candidate name from localStorage
    try {
      const candidateData = JSON.parse(
        localStorage.getItem("candidate") || "{}",
      );
      setCandidateName(
        candidateData.fullName || candidateData.name || "Candidate",
      );
    } catch {
      setCandidateName("Candidate");
    }

    // Fetch exam info (questions count, time, section name)
    const fetchExamInfo = async () => {
      try {
        const res = await api.get(`/assessment/${subject}/level/${level}`, {
          withCredentials: true,
        });
        if (res.data && !res.data.error) {
          setExamInfo({
            sectionName: res.data.sectionName || `Level ${level}`,
            questionCount: (res.data.questions || []).length,
            timeLimit: res.data.timeLimit || 10,
          });
        } else if (res.data.error) {
          setError(res.data.error);
        }
      } catch (err) {
        console.error("Failed to fetch exam info:", err);
        setError(
          "Failed to fetch exam details. The test might be locked or unavailable.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExamInfo();
  }, [subject, level]);

  const handleStartAssessment = () => {
    if (!agreed) return;

    sessionStorage.setItem(ASSESSMENT_DELIVERY_MODE_KEY, deliveryMode);
    localStorage.setItem(ASSESSMENT_DELIVERY_MODE_KEY, deliveryMode);

    // Enter fullscreen mode
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();

    // Navigate to exam
    navigate(`/assessment/${subject}/${level}`);
  };

  if (loading) {
    return (
      <div className="ai-loading">
        <div className="ai-spinner"></div>
        <p>Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="ai-page">
      {/* Top Header Bar */}
      <div className="ai-topbar">
        <div className="ai-topbar-brand">
          <span className="ai-topbar-logo">VH</span>
          <span className="ai-topbar-title">VirtueHire Online Assessment</span>
        </div>
        <div className="ai-topbar-candidate">
          <i className="fas fa-user-circle"></i>
          <span>{candidateName}</span>
        </div>
      </div>

      {error ? (
        <div className="ai-container">
          <div
            className="ai-section-card ai-security-card"
            style={{
              borderTop: "4px solid #ef4444",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
            <h2 style={{ color: "#1e293b", marginBottom: "16px" }}>
              Assessment Unavailable
            </h2>
            <p
              style={{
                color: "#64748b",
                marginBottom: "30px",
                fontSize: "1.1rem",
              }}
            >
              {error}
            </p>
            <button
              className="ai-btn-back"
              onClick={() => navigate("/candidates/welcome")}
              style={{ width: "fit-content", margin: "0 auto" }}
            >
              <i className="fas fa-arrow-left"></i> Return to Home
            </button>
          </div>
        </div>
      ) : (
        <div className="ai-container">
          {/* Exam Info Card */}
          <div className="ai-info-card">
            <div className="ai-info-header">
              <div className="ai-info-icon">📋</div>
              <div>
                <h2 className="ai-info-title">Online Assessment</h2>
                <p className="ai-info-subtitle">
                  Please read all instructions carefully before starting
                </p>
              </div>
            </div>
            <div className="ai-meta-grid">
              <div className="ai-meta-item">
                <span className="ai-meta-label">Candidate</span>
                <span className="ai-meta-value">{candidateName}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Subject</span>
                <span className="ai-meta-value">{subject}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Section</span>
                <span className="ai-meta-value">{examInfo?.sectionName}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Questions</span>
                <span className="ai-meta-value">{examInfo?.questionCount}</span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Time Limit</span>
                <span className="ai-meta-value">
                  {examInfo?.timeLimit} Minutes
                </span>
              </div>
              <div className="ai-meta-item">
                <span className="ai-meta-label">Level</span>
                <span className="ai-meta-value">{level}</span>
              </div>
            </div>
          </div>

          <div className="ai-content-grid">
            {/* Left Column */}
            <div className="ai-col">
              {/* General Instructions */}
              <div className="ai-section-card">
                <div className="ai-section-header ai-header-blue">
                  <i className="fas fa-info-circle"></i>
                  <h3>General Instructions</h3>
                </div>
                <ul className="ai-instruction-list">
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> The
                    test contains multiple-choice questions.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> Each
                    question has four options.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> Only
                    one option is correct per question.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i>{" "}
                    Navigate between questions using the question navigator.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> All
                    answered questions are saved automatically.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> You
                    can change your answer before submitting.
                  </li>
                  <li>
                    <i className="fas fa-check-circle ai-icon-green"></i> Timer
                    is visible at the top of the screen.
                  </li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="ai-section-card">
                <div className="ai-section-header ai-header-purple">
                  <i className="fas fa-laptop"></i>
                  <h3>Technical Requirements</h3>
                </div>
                <ul className="ai-instruction-list">
                  <li>
                    <i className="fas fa-wifi ai-icon-purple"></i> Ensure stable
                    internet connection before starting.
                  </li>
                  <li>
                    <i className="fas fa-chrome ai-icon-purple"></i> Use a
                    modern browser (Chrome recommended).
                  </li>
                  <li>
                    <i className="fas fa-times-circle ai-icon-purple"></i> Close
                    unnecessary applications and browser tabs.
                  </li>
                  <li>
                    <i className="fas fa-expand ai-icon-purple"></i> Keep the
                    exam window active throughout.
                  </li>
                  <li>
                    <i className="fas fa-power-off ai-icon-purple"></i> Disable
                    screen savers and power saving modes.
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="ai-col">
              {/* Important Rules */}
              <div className="ai-section-card">
                <div className="ai-section-header ai-header-orange">
                  <i className="fas fa-exclamation-triangle"></i>
                  <h3>Important Rules</h3>
                </div>
                <ul className="ai-instruction-list">
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Do{" "}
                    <strong>not</strong> refresh the page during the exam.
                  </li>
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Do{" "}
                    <strong>not</strong> switch browser tabs.
                  </li>
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Do{" "}
                    <strong>not</strong> exit fullscreen mode.
                  </li>
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Copying or
                    pasting content is <strong>not allowed</strong>.
                  </li>
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Right-click is
                    disabled during the test.
                  </li>
                  <li>
                    <i className="fas fa-ban ai-icon-red"></i> Do not open other
                    windows or applications.
                  </li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="ai-section-card ai-security-card">
                <div className="ai-section-header ai-header-red">
                  <i className="fas fa-shield-alt"></i>
                  <h3>Security Notice</h3>
                </div>
                <p className="ai-security-text">
                  The system actively monitors your activity during the exam.
                  Avoid the following actions:
                </p>
                <div className="ai-monitor-grid">
                  <div className="ai-monitor-item">
                    <i className="fas fa-eye"></i> Tab switching
                  </div>
                  <div className="ai-monitor-item">
                    <i className="fas fa-expand-arrows-alt"></i> Fullscreen exit
                  </div>
                  <div className="ai-monitor-item">
                    <i className="fas fa-sync"></i> Page refresh
                  </div>
                  <div className="ai-monitor-item">
                    <i className="fas fa-copy"></i> Copy/paste / Right-click
                  </div>
                  <div className="ai-monitor-item">
                    <i className="fas fa-window-restore"></i> Minimizing window
                  </div>
                  <div className="ai-monitor-item">
                    <i className="fas fa-keyboard"></i> DevTools shortcuts
                  </div>
                </div>
                <div className="ai-violation-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  After <strong>3 violations</strong> (detected via the triggers
                  above), your exam will be{" "}
                  <strong>automatically submitted</strong>.
                </div>
              </div>

              <div className="ai-section-card">
                <div className="ai-section-header ai-header-blue">
                  <i className="fas fa-toggle-on"></i>
                  <h3>Assessment Mode</h3>
                </div>
                <div className="ai-mode-panel">
                  <p className="ai-mode-copy">
                    Choose how you want to take this assessment. Offline mode
                    removes only the webcam requirement. All other rules and
                    restrictions stay the same.
                  </p>
                  <div className="ai-mode-toggle" role="tablist" aria-label="Assessment mode">
                    <button
                      type="button"
                      className={`ai-mode-option ${deliveryMode === "online" ? "active" : ""}`}
                      onClick={() => setDeliveryMode("online")}
                    >
                      <span className="ai-mode-title">Online Mode</span>
                      <span className="ai-mode-subtitle">Webcam required</span>
                    </button>
                    <button
                      type="button"
                      className={`ai-mode-option ${deliveryMode === "offline" ? "active" : ""}`}
                      onClick={() => setDeliveryMode("offline")}
                    >
                      <span className="ai-mode-title">Offline Mode</span>
                      <span className="ai-mode-subtitle">No webcam access</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement + Start Button */}
          <div className="ai-agreement-card">
            <label className="ai-checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="ai-checkbox"
              />
              <span className="ai-checkbox-custom"></span>
              <span className="ai-checkbox-text">
                I have read and understood all instructions. I agree to abide by
                the exam rules and code of conduct.
              </span>
            </label>

            <div className="ai-start-row">
              <button className="ai-btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Go Back
              </button>
              <button
                className={`ai-btn-start ${!agreed ? "ai-btn-disabled" : ""}`}
                onClick={handleStartAssessment}
                disabled={!agreed}
              >
                <i className="fas fa-play-circle"></i> Start Assessment
              </button>
            </div>

            {!agreed && (
              <p className="ai-agree-warning">
                <i className="fas fa-info-circle"></i>
                Please check the agreement box above to enable the Start
                Assessment button.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentInstructions;
