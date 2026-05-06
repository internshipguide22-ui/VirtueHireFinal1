import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  ShieldAlert,
  User
} from "lucide-react";
import "./HrCandidateDetails.css";
import { ensureHrSubscription } from "../../utils/hrSubscription";
import {
  DEFAULT_PROFILE_IMAGE,
  getCandidateFileUrl,
  getResumeFileName,
} from "../Candidate/profile/profileUtils";

const STATUS_COPY = {
  NONE: "Contact Admin to view full details",
  PENDING: "Your access request is pending admin approval",
  APPROVED: "Full details available",
  REJECTED: "Your access request was rejected"
};

function HrCandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [candidate, setCandidate] = useState(location.state?.candidate || null);
  const [detailedResults, setDetailedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState(candidate?.requestStatus || "NONE");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  const handleBackNavigation = () => {
    const from = location.state?.from;
    const fromTab = location.state?.fromTab;

    if (from === "/hr/dashboard") {
      navigate("/hr/dashboard", {
        state: { activeTab: fromTab || "candidates" }
      });
      return;
    }

    if (from) {
      navigate(from);
      return;
    }

    navigate("/hr/dashboard", {
      state: { activeTab: "candidates" }
    });
  };

  const loadSummary = async () => {
    const summaryRes = await api.get(`/hrs/candidates/${id}/summary`);
    setCandidate(summaryRes.data.candidate || null);
    setRequestStatus(summaryRes.data.requestStatus || "NONE");
    setHasAccess(Boolean(summaryRes.data.hasAccess));
  };

  const loadCandidate = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await loadSummary();

      const detailRes = await api.get(`/hrs/candidates/${id}`);
      setCandidate(detailRes.data.candidate || null);
      setDetailedResults(detailRes.data.detailedResults || []);
      setHasAccess(true);
      setRequestStatus(detailRes.data.requestStatus || "APPROVED");
    } catch (err) {
      if (err.response?.status === 403) {
        setHasAccess(false);
        setDetailedResults([]);
        setRequestStatus(err.response?.data?.requestStatus || "NONE");
        setMessage(err.response?.data?.error || "Contact Admin to view full details");
      } else if (err.response?.status === 401) {
        navigate("/hrs/login");
        return;
      } else {
        setError("Failed to load candidate details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedHr = JSON.parse(localStorage.getItem("current_hr_user") || "null");
    setSubscription(ensureHrSubscription(storedHr));
    loadCandidate();
  }, [id]);

  const handleRequestAccess = async () => {
    setRequestLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/hrs/candidates/${id}/access-request`);
      setRequestStatus(res.data.requestStatus || "PENDING");
      setMessage(res.data.message || "Access request submitted successfully.");
      await loadSummary();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to submit access request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const accessTone = useMemo(() => {
    if (requestStatus === "APPROVED") return "approved";
    if (requestStatus === "PENDING") return "pending";
    return "restricted";
  }, [requestStatus]);

  const canRequestAccess = requestStatus !== "PENDING" && requestStatus !== "APPROVED";
  const canUseHrModule = !subscription?.isExpired;

  const canAccessResume = hasAccess && requestStatus === "APPROVED" && Boolean(candidate?.resumePath);
  const canAccessProfileImage =
    hasAccess && requestStatus === "APPROVED" && Boolean(candidate?.profilePic);
  const resumeName = getResumeFileName(candidate?.resumePath);
  const profileImageUrl = canAccessProfileImage
    ? getCandidateFileUrl(candidate?.profilePic)
    : DEFAULT_PROFILE_IMAGE;
  const resumeUrl = canAccessResume
    ? getCandidateFileUrl(candidate?.resumePath)
    : "";

  if (loading) {
    return (
      <div className="hcd-loading-screen">
        <div className="hcl-spinner"></div>
        <p>Loading candidate access view...</p>
      </div>
    );
  }

  if (error && !candidate) {
    return (
      <div className="hcd-container">
        <div className="hcd-card hcd-empty-card">
          <ShieldAlert size={48} />
          <h3>Unable to open candidate details</h3>
          <p>{error}</p>
          <button className="hcd-back-btn" onClick={handleBackNavigation}>
            <ArrowLeft size={16} /> Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hcd-container">
      <div className="hcd-header">
        <div>
          <h2>Candidate Details</h2>
          <p className="hcd-subcopy">Role-based access is enforced by the server before full details are returned.</p>
        </div>
        <div className="hcd-header-actions">
          <button className="hcd-back-btn" onClick={handleBackNavigation}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="hcd-action-btn hcd-action-btn-muted" onClick={loadCandidate}>
            <RefreshCw size={16} /> Refresh View
          </button>
          {!hasAccess && (
            <button
              className="hcd-action-btn hcd-action-btn-primary"
              onClick={handleRequestAccess}
              disabled={!canRequestAccess || requestLoading || !canUseHrModule}
            >
              <Eye size={16} /> {requestLoading ? "Submitting..." : requestStatus === "PENDING" ? "Request Pending" : "Request Access"}
            </button>
          )}
        </div>
      </div>

      {subscription ? (
        <div className={`hcd-inline-banner ${subscription.isExpired ? "restricted" : "approved"}`}>
          {subscription.isExpired
            ? "Your HR module subscription has expired. Renew to continue requesting candidate access."
            : `${subscription.planLabel} is active. ${subscription.remainingDays} day${subscription.remainingDays === 1 ? "" : "s"} remaining.`}
        </div>
      ) : null}

      {candidate && (
        <div className="hcd-card">
          <div className="hcd-summary-top">
            <div className="hcd-summary-profile">
              <div className="hcd-summary-avatar">
                <img
                  src={profileImageUrl}
                  alt={candidate.fullName}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
              <div>
                <div className="hcd-summary-name">{candidate.fullName}</div>
                <div className="hcd-summary-meta">
                  <span><Briefcase size={14} /> {candidate.role || "Candidate"}</span>
                  <span><User size={14} /> {candidate.experience ?? 0} years experience</span>
                </div>
              </div>
            </div>
            <span className={`hcd-status-pill ${accessTone}`}>
              {requestStatus === "APPROVED" ? <CheckCircle2 size={14} /> :
                requestStatus === "PENDING" ? <Clock3 size={14} /> :
                  <Lock size={14} />}
              {STATUS_COPY[requestStatus] || STATUS_COPY.NONE}
            </span>
          </div>
        </div>
      )}

      {message ? <div className={`hcd-inline-banner ${accessTone}`}>{message}</div> : null}
      {error ? <div className="hcd-inline-banner restricted">{error}</div> : null}

      {hasAccess ? (
        <>
          <div className="hcd-card">
            <div className="hcd-section-title">Full Profile</div>
            <div className="hcd-info-grid">
              <div className="hcd-info-item">
                <span className="hcd-info-label">Email</span>
                <span className="hcd-info-value">{candidate?.email || "Not provided"}</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Phone</span>
                <span className="hcd-info-value">{candidate?.phoneNumber || "Not provided"}</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Location</span>
                <span className="hcd-info-value">
                  {[candidate?.city, candidate?.state].filter(Boolean).join(", ") || "Not provided"}
                </span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Skills</span>
                <span className="hcd-info-value">{candidate?.skills || "Not provided"}</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Education</span>
                <span className="hcd-info-value">{candidate?.collegeUniversity || candidate?.highestEducation || "Not provided"}</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Best Score</span>
                <span className="hcd-info-value">{candidate?.score != null ? `${candidate.score}%` : "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="hcd-card">
            <div className="hcd-section-title">Resume</div>
            <div className="hcd-resume-shell">
              <div className="hcd-resume-copy">
                <span className="hcd-info-label">Resume File</span>
                <strong className="hcd-resume-name">{resumeName || "No resume uploaded"}</strong>
                <p className="hcd-muted-text">
                  Resume actions are available only after admin-approved access to this candidate profile.
                </p>
              </div>

              {canAccessResume ? (
                <div className="hcd-resume-actions">
                  <a
                    className="hcd-back-btn"
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye size={16} /> View Resume
                  </a>
                  <a
                    className="hcd-action-btn hcd-action-btn-primary"
                    href={resumeUrl}
                    download={resumeName || "resume"}
                  >
                    <Download size={16} /> Download Resume
                  </a>
                </div>
              ) : (
                <div className="hcd-resume-empty">
                  <FileText size={18} />
                  <span>No resume available for viewing yet.</span>
                </div>
              )}
            </div>
          </div>

          <div className="hcd-card">
            <div className="hcd-section-title">Profile Picture</div>
            {canAccessProfileImage ? (
              <div className="hcd-photo-shell">
                <div className="hcd-photo-preview">
                  <img
                    src={profileImageUrl}
                    alt={candidate?.fullName || "Candidate"}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                    }}
                  />
                </div>
                <div className="hcd-photo-copy">
                  <span className="hcd-info-label">Uploaded Image</span>
                  <strong className="hcd-resume-name">
                    {candidate?.profilePic || "Profile picture"}
                  </strong>
                  <p className="hcd-muted-text">
                    Open the uploaded profile image in a full-size view when needed.
                  </p>
                  <div className="hcd-resume-actions">
                    <a
                      className="hcd-action-btn hcd-action-btn-primary"
                      href={profileImageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye size={16} /> View Image
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hcd-resume-empty">
                <FileText size={18} />
                <span>No profile picture available for viewing yet.</span>
              </div>
            )}
          </div>

          <div className="hcd-card">
            <div className="hcd-section-title">Assessment History</div>
            {detailedResults.length === 0 ? (
              <p className="hcd-muted-text">No assessment history found for this candidate.</p>
            ) : (
              <div className="hcd-history-list">
                {detailedResults.map((result, index) => (
                  <div key={`${result.subject}-${result.level}-${index}`} className="hcd-history-row">
                    <div>
                      <strong>{result.subject}</strong>
                      <p>{result.sectionName || `Section ${result.level}`}</p>
                    </div>
                    <div className="hcd-history-score">{result.score}%</div>
                    <div className="hcd-history-date">
                      {result.attemptedAt ? new Date(result.attemptedAt).toLocaleString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="hcd-locked-shell">
          <div className="hcd-card hcd-blur-card">
            <div className="hcd-section-title">Locked Candidate Information</div>
            <div className="hcd-info-grid">
              <div className="hcd-info-item">
                <span className="hcd-info-label">Email</span>
                <span className="hcd-info-value">candidate@example.com</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Phone</span>
                <span className="hcd-info-value">+91 XXXXX XXXXX</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Location</span>
                <span className="hcd-info-value">City, State</span>
              </div>
              <div className="hcd-info-item">
                <span className="hcd-info-label">Skills</span>
                <span className="hcd-info-value">Java, React, Spring Boot</span>
              </div>
            </div>
          </div>

          <div className="hcd-card hcd-blur-card">
            <div className="hcd-section-title">Locked Assessment History</div>
            <div className="hcd-history-list">
              {[1, 2, 3].map((row) => (
                <div key={row} className="hcd-history-row">
                  <div>
                    <strong>Assessment Track</strong>
                    <p>Section {row}</p>
                  </div>
                  <div className="hcd-history-score">85%</div>
                  <div className="hcd-history-date">21 Apr 2026, 10:30 AM</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hcd-lock-overlay">
            <Lock size={28} />
            <h3>Contact Admin to view full details</h3>
            <p>
              Full candidate profile data is hidden until an admin approves your access request.
            </p>
            <div className="hcd-overlay-actions">
              <button
                className="hcd-action-btn hcd-action-btn-primary"
                onClick={handleRequestAccess}
                disabled={!canRequestAccess || requestLoading || !canUseHrModule}
              >
                <Eye size={16} /> {requestLoading ? "Submitting..." : requestStatus === "PENDING" ? "Request Pending" : "Request Access"}
              </button>
              {!canUseHrModule ? (
                <button className="hcd-back-btn" onClick={() => navigate("/payments/plans?audience=hr")}>
                  Renew Subscription
                </button>
              ) : null}
              <button className="hcd-back-btn" onClick={loadCandidate}>
                <RefreshCw size={16} /> Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HrCandidateDetails;
