import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { fetchCandidateProfile, updateCandidateProfile } from "./profileApi";
import {
  EMPTY_PROFILE,
  formatDisplayValue,
  getResumeFileName,
  normalizeCandidate,
} from "./profileUtils";
import "./CandidateProfile.css";

function validateProfile(values) {
  const nextErrors = {};

  if (!values.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!values.phoneNumber.trim()) {
    nextErrors.phoneNumber = "Phone number is required.";
  } else if (!/^\d{10}$/.test(values.phoneNumber.trim())) {
    nextErrors.phoneNumber = "Phone number must be exactly 10 digits.";
  }

  if (
    values.alternatePhoneNumber &&
    !/^\d{10}$/.test(values.alternatePhoneNumber.trim())
  ) {
    nextErrors.alternatePhoneNumber =
      "Alternate phone must be exactly 10 digits.";
  }

  if (
    values.yearOfGraduation &&
    !/^\d{4}$/.test(String(values.yearOfGraduation).trim())
  ) {
    nextErrors.yearOfGraduation = "Graduation year must be a 4-digit year.";
  }

  if (values.experience !== "" && Number(values.experience) < 0) {
    nextErrors.experience = "Experience cannot be negative.";
  }

  return nextErrors;
}

export default function CandidateProfileEdit() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(EMPTY_PROFILE);
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const candidate = await fetchCandidateProfile();
        const normalizedProfile = normalizeCandidate(candidate);
        setFormValues(normalizedProfile);
        localStorage.setItem("candidate", JSON.stringify(candidate));
        window.dispatchEvent(new Event("auth-change"));
      } catch (err) {
        const message =
          err.response?.data?.error || "We could not load the profile form.";
        setApiError(message);

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

  const currentResumeName = useMemo(
    () => getResumeFileName(formValues.resumePath),
    [formValues.resumePath],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setApiError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      setApiError("");

      const updatedCandidate = await updateCandidateProfile(formValues, {
        resumeFile,
        profilePicFile,
      });

      localStorage.setItem("candidate", JSON.stringify(updatedCandidate));
      window.dispatchEvent(new Event("auth-change"));
      setFormValues(normalizeCandidate(updatedCandidate));
      setResumeFile(null);
      setProfilePicFile(null);
      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate(-1);
      }, 700);
    } catch (err) {
      setApiError(
        err.response?.data?.error || "Profile update failed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="candidate-profile-shell">
        <div className="candidate-profile-loading">
          Loading your editable profile...
        </div>
      </div>
    );
  }

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
            <h1>Edit Profile</h1>
            <p className="candidate-profile-subtitle">
              Update your details, replace your resume, and keep your profile
              recruiter-ready.
            </p>
          </div>

          <div className="candidate-profile-actions">
            <button
              type="button"
              className="candidate-profile-link-btn secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </div>

        {apiError && (
          <div className="candidate-profile-feedback error">{apiError}</div>
        )}
        {successMessage && (
          <div className="candidate-profile-feedback success">
            {successMessage}
          </div>
        )}

        <form className="candidate-profile-form" onSubmit={handleSubmit}>
          <section className="candidate-profile-section">
            <div className="candidate-profile-section-header">
              <h3>Basic Information</h3>
            </div>

            <div className="candidate-profile-form-grid">
              <label className="candidate-profile-field">
                <span>Full Name</span>
                <input
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <small>{errors.fullName}</small>}
              </label>

              <label className="candidate-profile-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && <small>{errors.email}</small>}
              </label>

              <label className="candidate-profile-field">
                <span>Phone</span>
                <input
                  name="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                />
                {errors.phoneNumber && <small>{errors.phoneNumber}</small>}
              </label>

              <label className="candidate-profile-field">
                <span>Alternate Phone</span>
                <input
                  name="alternatePhoneNumber"
                  value={formValues.alternatePhoneNumber}
                  onChange={handleChange}
                  placeholder="Optional alternate phone"
                />
                {errors.alternatePhoneNumber && (
                  <small>{errors.alternatePhoneNumber}</small>
                )}
              </label>

              <label className="candidate-profile-field">
                <span>Gender</span>
                <select
                  name="gender"
                  value={formValues.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="candidate-profile-field">
                <span>Date of Birth</span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formValues.dateOfBirth}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <section className="candidate-profile-section">
            <div className="candidate-profile-section-header">
              <h3>Location and Education</h3>
            </div>

            <div className="candidate-profile-form-grid">
              <label className="candidate-profile-field">
                <span>City</span>
                <input
                  name="city"
                  value={formValues.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label className="candidate-profile-field">
                <span>State</span>
                <input
                  name="state"
                  value={formValues.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </label>

              <label className="candidate-profile-field">
                <span>Education</span>
                <input
                  name="highestEducation"
                  value={formValues.highestEducation}
                  onChange={handleChange}
                  placeholder="Highest education"
                />
              </label>

              <label className="candidate-profile-field">
                <span>College / University</span>
                <input
                  name="collegeUniversity"
                  value={formValues.collegeUniversity}
                  onChange={handleChange}
                  placeholder="College or university"
                />
              </label>

              <label className="candidate-profile-field">
                <span>Graduation Year</span>
                <input
                  name="yearOfGraduation"
                  type="number"
                  value={formValues.yearOfGraduation}
                  onChange={handleChange}
                  placeholder="e.g. 2025"
                />
                {errors.yearOfGraduation && (
                  <small>{errors.yearOfGraduation}</small>
                )}
              </label>
            </div>
          </section>

          <section className="candidate-profile-section">
            <div className="candidate-profile-section-header">
              <h3>Professional Details</h3>
            </div>

            <div className="candidate-profile-form-grid">
              <label className="candidate-profile-field">
                <span>Experience</span>
                <input
                  name="experience"
                  type="number"
                  min="0"
                  value={formValues.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                />
                {errors.experience && <small>{errors.experience}</small>}
              </label>

              <label className="candidate-profile-field candidate-profile-field-full">
                <span>Skills</span>
                <input
                  name="skills"
                  value={formValues.skills}
                  onChange={handleChange}
                  placeholder="Comma-separated skills"
                />
              </label>
            </div>
          </section>

          <section className="candidate-profile-section">
            <div className="candidate-profile-section-header">
              <h3>Documents</h3>
            </div>

            <div className="candidate-profile-form-grid">
              <label className="candidate-profile-field">
                <span>Current Resume</span>
                <div className="candidate-profile-file-meta">
                  {formatDisplayValue(currentResumeName)}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] || null)
                  }
                />
              </label>

              <label className="candidate-profile-field">
                <span>Replace Profile Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setProfilePicFile(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>
          </section>

          <div className="candidate-profile-form-actions">
            <button
              type="submit"
              className="candidate-profile-link-btn primary"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={18} className="candidate-profile-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
