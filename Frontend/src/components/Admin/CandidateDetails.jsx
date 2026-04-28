import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Download,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
  XCircle
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { API_BASE_URL } from "../../config";
import "./AdminDashboard.css";
import "./CandidateDetails.css";
import { useAppDialog } from "../common/AppDialog";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  alternatePhoneNumber: "",
  gender: "",
  dateOfBirth: "",
  city: "",
  state: "",
  highestEducation: "",
  collegeUniversity: "",
  yearOfGraduation: "",
  experience: "",
  experienceLevel: "",
  skills: "",
  badge: "",
  approved: false,
  assessmentTaken: false,
  rejectionReason: ""
};

const formatDateInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const buildFormState = (candidate) => ({
  fullName: candidate?.fullName || "",
  email: candidate?.email || "",
  phoneNumber: candidate?.phoneNumber || "",
  alternatePhoneNumber: candidate?.alternatePhoneNumber || "",
  gender: candidate?.gender || "",
  dateOfBirth: formatDateInput(candidate?.dateOfBirth),
  city: candidate?.city || "",
  state: candidate?.state || "",
  highestEducation: candidate?.highestEducation || "",
  collegeUniversity: candidate?.collegeUniversity || "",
  yearOfGraduation: candidate?.yearOfGraduation ?? "",
  experience: candidate?.experience ?? "",
  experienceLevel: candidate?.experienceLevel || "",
  skills: candidate?.skills || "",
  badge: candidate?.badge || "",
  approved: Boolean(candidate?.approved),
  assessmentTaken: Boolean(candidate?.assessmentTaken),
  rejectionReason: candidate?.rejectionReason || ""
});

const getInitials = (name = "Candidate") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "C";

const splitSkills = (skills = "") =>
  skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showConfirm, dialogNode } = useAppDialog();

  const loadCandidate = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/admin/candidates/${id}`);
      const nextCandidate = res.data?.candidate || null;
      setCandidate(nextCandidate);
      setResults(Array.isArray(res.data?.results) ? res.data.results : []);
      setForm(buildFormState(nextCandidate));
      setErrors({});
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load candidate details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCandidate();
  }, [loadCandidate]);

  const handleDeleteCandidate = async () => {
    if (!candidate) return;

    const confirmed = await showConfirm({
      title: "Delete Candidate",
      message: `Delete candidate "${candidate.fullName}"? This action cannot be undone.`,
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel"
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/candidates/${candidate.id}`);
      navigate("/admin/candidates");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete candidate.");
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";

    if (form.yearOfGraduation !== "" && Number.isNaN(Number(form.yearOfGraduation))) {
      nextErrors.yearOfGraduation = "Graduation year must be numeric.";
    }

    if (form.experience !== "" && Number(form.experience) < 0) {
      nextErrors.experience = "Experience cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setErrors({});
    setSuccess("");
    setForm(buildFormState(candidate));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        alternatePhoneNumber: form.alternatePhoneNumber.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        highestEducation: form.highestEducation.trim(),
        collegeUniversity: form.collegeUniversity.trim(),
        experienceLevel: form.experienceLevel.trim(),
        skills: form.skills.trim(),
        badge: form.badge.trim(),
        rejectionReason: form.rejectionReason.trim(),
        yearOfGraduation: form.yearOfGraduation === "" ? null : Number(form.yearOfGraduation),
        experience: form.experience === "" ? null : Number(form.experience),
        dateOfBirth: form.dateOfBirth || null
      };

      const res = await api.put(`/admin/candidates/${id}`, payload);
      const updatedCandidate = res.data?.candidate || payload;
      setCandidate(updatedCandidate);
      setForm(buildFormState(updatedCandidate));
      setEditing(false);
      setSuccess(res.data?.message || "Candidate updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update candidate.");
    } finally {
      setSaving(false);
    }
  };

  const skills = useMemo(() => splitSkills(candidate?.skills || ""), [candidate?.skills]);

  if (loading) {
    return (
      <div className="adm-loading-screen">
        <div className="adm-spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <AdminLayout title="Candidate Not Found" description="The selected candidate record could not be located.">
        <div className="adm-card">
          <div className="adm-empty-note">Candidate not found.</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Candidate Profile"
      description="Review candidate history, update profile fields, and keep recruitment records clean and current."
      actions={
        <div className="adm-edit-actions">
          <Link to="/admin/candidates" className="adm-btn-ghost">
            <ArrowLeft size={16} /> Back
          </Link>
          {!editing ? (
            <button type="button" className="adm-btn-secondary" onClick={() => { setEditing(true); setSuccess(""); }}>
              <Pencil size={16} /> Edit Details
            </button>
          ) : (
            <>
              <button type="button" className="adm-btn-ghost" onClick={handleCancelEdit} disabled={saving}>
                <XCircle size={16} /> Cancel
              </button>
              <button type="button" className="adm-btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      }
    >
      {dialogNode}
      <div className="adm-candidate-shell">
        {error ? (
          <div className="adm-card" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="adm-card" style={{ borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>
            {success}
          </div>
        ) : null}

        <section className="adm-candidate-hero">
          <div className="adm-card adm-card-section">
            <div className="adm-candidate-profile">
              <div className="adm-candidate-avatar">
                {candidate.profilePic ? (
                  <img src={`${API_BASE_URL}/candidates/file/${candidate.profilePic}`} alt={candidate.fullName} />
                ) : (
                  getInitials(candidate.fullName)
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="adm-candidate-name-row">
                  <h2>{candidate.fullName}</h2>
                  {candidate.badge ? <span className="adm-t-badge">{candidate.badge}</span> : null}
                </div>

                <div className="adm-status-row">
                  <span className={`adm-status-chip ${candidate.approved ? "success" : "warning"}`}>
                    <ShieldCheck size={14} />
                    {candidate.approved ? "Approved" : "Pending Approval"}
                  </span>
                  <span className={`adm-status-chip ${candidate.assessmentTaken ? "success" : "neutral"}`}>
                    <BadgeCheck size={14} />
                    {candidate.assessmentTaken ? "Assessment Taken" : "Assessment Pending"}
                  </span>
                  <span className={`adm-status-chip ${candidate.emailVerified ? "success" : "warning"}`}>
                    <Mail size={14} />
                    {candidate.emailVerified ? "Email Verified" : "Email Unverified"}
                  </span>
                </div>

                <div className="adm-candidate-meta">
                  <div className="adm-meta-item">
                    <span className="adm-meta-label">Email</span>
                    <span className="adm-meta-value">{candidate.email || "N/A"}</span>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-label">Phone</span>
                    <span className="adm-meta-value">{candidate.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-label">Location</span>
                    <span className="adm-meta-value">{[candidate.city, candidate.state].filter(Boolean).join(", ") || "N/A"}</span>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-label">Experience Level</span>
                    <span className="adm-meta-value">{candidate.experienceLevel || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="adm-card adm-card-section">
            <div className="adm-section-head">
              <div>
                <h3>Quick Summary</h3>
                <p>Compact metrics for review at a glance.</p>
              </div>
            </div>
            <div className="adm-summary-grid">
              <div className="adm-summary-stat">
                <strong>{candidate.score ?? "N/A"}</strong>
                <span>Latest Score</span>
              </div>
              <div className="adm-summary-stat">
                <strong>{candidate.experience ?? 0} yrs</strong>
                <span>Experience</span>
              </div>
              <div className="adm-summary-stat">
                <strong>{candidate.yearOfGraduation || "N/A"}</strong>
                <span>Graduation Year</span>
              </div>
              <div className="adm-summary-stat">
                <strong>{results.length}</strong>
                <span>Assessment Attempts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="adm-details-grid">
          <div className="adm-section-stack">
            <div className="adm-card adm-card-section">
              <div className="adm-section-head">
                <div>
                  <h3>Profile Details</h3>
                  <p>Personal, contact, education, and professional information.</p>
                </div>
              </div>

              {!editing ? (
                <>
                  <div className="adm-info-grid">
                    <div className="adm-info-block">
                      <label><User size={12} style={{ verticalAlign: "middle", marginRight: 6 }} /> Full Name</label>
                      <div>{candidate.fullName || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label><Mail size={12} style={{ verticalAlign: "middle", marginRight: 6 }} /> Email</label>
                      <div>{candidate.email || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label><Phone size={12} style={{ verticalAlign: "middle", marginRight: 6 }} /> Phone</label>
                      <div>{candidate.phoneNumber || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Alternate Phone</label>
                      <div>{candidate.alternatePhoneNumber || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Gender</label>
                      <div>{candidate.gender || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Date of Birth</label>
                      <div>{candidate.dateOfBirth || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label><MapPin size={12} style={{ verticalAlign: "middle", marginRight: 6 }} /> City</label>
                      <div>{candidate.city || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>State</label>
                      <div>{candidate.state || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Highest Education</label>
                      <div>{candidate.highestEducation || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>College / University</label>
                      <div>{candidate.collegeUniversity || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Graduation Year</label>
                      <div>{candidate.yearOfGraduation || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label><Briefcase size={12} style={{ verticalAlign: "middle", marginRight: 6 }} /> Experience</label>
                      <div>{candidate.experience != null ? `${candidate.experience} years` : "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Experience Level</label>
                      <div>{candidate.experienceLevel || "N/A"}</div>
                    </div>
                    <div className="adm-info-block">
                      <label>Admin Badge</label>
                      <div>{candidate.badge || "N/A"}</div>
                    </div>
                    <div className="adm-info-block full">
                      <label>Skills</label>
                      {skills.length > 0 ? (
                        <div className="adm-skills-wrap">
                          {skills.map((skill) => (
                            <span key={skill} className="adm-skill-pill">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <div>No skills added.</div>
                      )}
                    </div>
                    {candidate.rejectionReason ? (
                      <div className="adm-info-block full">
                        <label>Rejection Reason</label>
                        <div>{candidate.rejectionReason}</div>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="adm-form-grid">
                    <div className="adm-field">
                      <label>Full Name</label>
                      <input name="fullName" value={form.fullName} onChange={handleFieldChange} />
                      {errors.fullName ? <span className="adm-field-error">{errors.fullName}</span> : null}
                    </div>
                    <div className="adm-field">
                      <label>Email</label>
                      <input name="email" value={form.email} onChange={handleFieldChange} />
                      {errors.email ? <span className="adm-field-error">{errors.email}</span> : null}
                    </div>
                    <div className="adm-field">
                      <label>Phone Number</label>
                      <input name="phoneNumber" value={form.phoneNumber} onChange={handleFieldChange} />
                      {errors.phoneNumber ? <span className="adm-field-error">{errors.phoneNumber}</span> : null}
                    </div>
                    <div className="adm-field">
                      <label>Alternate Phone</label>
                      <input name="alternatePhoneNumber" value={form.alternatePhoneNumber} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>Gender</label>
                      <select name="gender" value={form.gender} onChange={handleFieldChange}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>City</label>
                      <input name="city" value={form.city} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>State</label>
                      <input name="state" value={form.state} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>Highest Education</label>
                      <input name="highestEducation" value={form.highestEducation} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>College / University</label>
                      <input name="collegeUniversity" value={form.collegeUniversity} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>Graduation Year</label>
                      <input name="yearOfGraduation" value={form.yearOfGraduation} onChange={handleFieldChange} />
                      {errors.yearOfGraduation ? <span className="adm-field-error">{errors.yearOfGraduation}</span> : null}
                    </div>
                    <div className="adm-field">
                      <label>Experience (Years)</label>
                      <input type="number" min="0" name="experience" value={form.experience} onChange={handleFieldChange} />
                      {errors.experience ? <span className="adm-field-error">{errors.experience}</span> : null}
                    </div>
                    <div className="adm-field">
                      <label>Experience Level</label>
                      <input name="experienceLevel" value={form.experienceLevel} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>Badge</label>
                      <input name="badge" value={form.badge} onChange={handleFieldChange} />
                    </div>
                    <div className="adm-field">
                      <label>
                        <input type="checkbox" name="approved" checked={form.approved} onChange={handleFieldChange} style={{ width: "auto", marginRight: 8 }} />
                        Approved
                      </label>
                    </div>
                    <div className="adm-field">
                      <label>
                        <input type="checkbox" name="assessmentTaken" checked={form.assessmentTaken} onChange={handleFieldChange} style={{ width: "auto", marginRight: 8 }} />
                        Assessment Taken
                      </label>
                    </div>
                    <div className="adm-field-full">
                      <label>Skills</label>
                      <textarea name="skills" value={form.skills} onChange={handleFieldChange} placeholder="Comma-separated skills" />
                    </div>
                    <div className="adm-field-full">
                      <label>Rejection Reason</label>
                      <textarea name="rejectionReason" value={form.rejectionReason} onChange={handleFieldChange} placeholder="Optional admin note" />
                    </div>
                  </div>

                  <div className="adm-form-actions">
                    <button type="button" className="adm-btn-ghost" onClick={handleCancelEdit} disabled={saving}>
                      Cancel
                    </button>
                    <button type="button" className="adm-btn-primary" onClick={handleSave} disabled={saving}>
                      <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="adm-card adm-card-section">
              <div className="adm-section-head">
                <div>
                  <h3>Assessment History</h3>
                  <p>Latest recorded activity and result trail.</p>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="adm-empty-note">No assessment results available for this candidate yet.</div>
              ) : (
                <div className="adm-results-list">
                  {results.map((result, index) => (
                    <div key={`${result.subject}-${result.level}-${index}`} className="adm-result-card">
                      <div className="adm-result-row">
                        <div>
                          <div className="adm-result-title">{result.subject || "Assessment"} • Level {result.level}</div>
                          <div className="adm-result-sub">
                            Attempted {result.attemptedAt ? new Date(result.attemptedAt).toLocaleString() : "N/A"}
                          </div>
                        </div>
                        <div className="adm-result-score">{result.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="adm-section-stack">
            <div className="adm-card adm-card-section">
              <div className="adm-section-head">
                <div>
                  <h3>Files</h3>
                  <p>Resume and supporting profile assets.</p>
                </div>
              </div>
              <div className="adm-files-grid">
                <div className="adm-file-card">
                  <h4><FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Resume</h4>
                  <p>{candidate.resumePath || "No resume uploaded."}</p>
                  {candidate.resumePath ? (
                    <a href={`${API_BASE_URL}/admin/download/resume/${candidate.id}`} className="adm-btn-secondary" download>
                      <Download size={16} /> Download Resume
                    </a>
                  ) : null}
                </div>

                <div className="adm-file-card">
                  <h4><User size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Profile Image</h4>
                  <p>{candidate.profilePic || "No profile image uploaded."}</p>
                  {candidate.profilePic ? (
                    <a href={`${API_BASE_URL}/candidates/file/${candidate.profilePic}`} className="adm-btn-ghost" target="_blank" rel="noreferrer">
                      View Image
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="adm-card adm-card-section">
              <div className="adm-section-head">
                <div>
                  <h3>Admin Actions</h3>
                  <p>Fast actions for record management.</p>
                </div>
              </div>
              <div className="adm-edit-actions">
                <button type="button" className="adm-btn-secondary" onClick={() => setEditing(true)}>
                  <Pencil size={16} /> Edit Candidate
                </button>
                <button type="button" className="adm-btn-danger" onClick={handleDeleteCandidate} disabled={deleting}>
                  <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete Candidate"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
