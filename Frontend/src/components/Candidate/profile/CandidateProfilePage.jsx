import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, FileText, Mail, PencilLine, Phone } from "lucide-react";
import { fetchCandidateProfile } from "./profileApi";
import {
  DEFAULT_PROFILE_IMAGE,
  formatDisplayValue,
  getCandidateFileUrl,
  getSkillList,
  normalizeCandidate,
} from "./profileUtils";
import "./CandidateProfile.css";

export default function CandidateProfilePage() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchCandidateProfile();
        setCandidate(normalizeCandidate(profile));
        localStorage.setItem("candidate", JSON.stringify(profile));
        window.dispatchEvent(new Event("auth-change"));
      } catch (err) {
        const message = err.response?.data?.error || "We could not load your profile summary.";
        setError(message);

        if (err.response?.status === 401) {
          localStorage.removeItem("candidate");
          navigate("/candidate/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="candidate-profile-shell">
        <div className="candidate-profile-loading">Loading your profile...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-profile-shell">
        <div className="candidate-profile-feedback error">{error}</div>
      </div>
    );
  }

  const profileImage = getCandidateFileUrl(candidate.profilePic) || DEFAULT_PROFILE_IMAGE;
  const skills = getSkillList(candidate.skills);

  return (
    <div className="candidate-profile-shell">
      <div className="candidate-profile-page">
        <div className="candidate-profile-topbar">
          <div className="candidate-profile-heading-block">
            <button
              type="button"
              className="candidate-profile-link-btn secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <p className="candidate-profile-eyebrow">Candidate Profile</p>
            <h1>Profile Overview</h1>
            <p className="candidate-profile-subtitle">
              A concise snapshot of your account with quick access to full view and editing.
            </p>
          </div>

          <div className="candidate-profile-actions">
            <button
              type="button"
              className="candidate-profile-link-btn secondary"
              onClick={() => navigate("/candidate/profile/view")}
            >
              <Eye size={18} />
              View Full Profile
            </button>
            <button
              type="button"
              className="candidate-profile-link-btn primary"
              onClick={() => navigate("/candidate/profile/edit")}
            >
              <PencilLine size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {error && <div className="candidate-profile-feedback error">{error}</div>}

        <section className="candidate-profile-hero-card">
          <div className="candidate-profile-identity">
            <img
              src={profileImage}
              alt={candidate.fullName || "Candidate profile"}
              className="candidate-profile-avatar"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
              }}
            />

            <div>
              <h2>{formatDisplayValue(candidate.fullName)}</h2>
              <p>{formatDisplayValue(candidate.highestEducation)}</p>
              <span className="candidate-profile-highlight">
                {candidate.experience !== "" ? `${candidate.experience} years experience` : "Experience not added"}
              </span>
            </div>
          </div>

          <div className="candidate-profile-summary-list">
            <div className="candidate-profile-summary-item">
              <Mail size={18} />
              <span>{formatDisplayValue(candidate.email)}</span>
            </div>
            <div className="candidate-profile-summary-item">
              <Phone size={18} />
              <span>{formatDisplayValue(candidate.phoneNumber)}</span>
            </div>
            <div className="candidate-profile-summary-item">
              <FileText size={18} />
              <span>{skills.length ? `${skills.length} listed skills` : "No skills listed yet"}</span>
            </div>
          </div>
        </section>

        <section className="candidate-profile-section">
          <div className="candidate-profile-section-header">
            <h3>Quick Snapshot</h3>
          </div>

          <div className="candidate-profile-detail-grid">
            <article className="candidate-profile-detail-card">
              <div>
                <span>Location</span>
                <strong>
                  {formatDisplayValue(
                    candidate.city || candidate.state
                      ? [candidate.city, candidate.state].filter(Boolean).join(", ")
                      : ""
                  )}
                </strong>
              </div>
            </article>

            <article className="candidate-profile-detail-card">
              <div>
                <span>College / University</span>
                <strong>{formatDisplayValue(candidate.collegeUniversity)}</strong>
              </div>
            </article>

            <article className="candidate-profile-detail-card">
              <div>
                <span>Graduation Year</span>
                <strong>{formatDisplayValue(candidate.yearOfGraduation)}</strong>
              </div>
            </article>

            <article className="candidate-profile-detail-card">
              <div>
                <span>Resume Status</span>
                <strong>{candidate.resumePath ? "Uploaded" : "Not uploaded"}</strong>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
