import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { API_BASE_URL } from "../../config";
import AdminLayout from "./AdminLayout";
import {
  Users,
  Search,
  Download,
  Eye,
  Trash2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Award,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import "./AdminDashboard.css";
import { useAppDialog } from "../common/AppDialog";
import {
  DEFAULT_PROFILE_IMAGE,
  getCandidateFileUrl,
} from "../Candidate/profile/profileUtils";

export default function CandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    assessed: 0,
    assessmentsDone: 0,
    fresher: 0,
    experienced: 0,
  });
  const { showAlert, showConfirm, dialogNode } = useAppDialog();

  const API_BASE = "/admin/candidates";

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // FIX: Add cache-busting to prevent stale data showing for wrong candidates
      const [candidatesRes, dashboardRes] = await Promise.all([
        api.get(`${API_BASE}?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }),
        api.get("/admin/dashboard"),
      ]);
      const list = candidatesRes.data.candidates || [];
      setCandidates(list);
      setStats({
        total: list.length,
        assessed: list.filter((c) => c.assessmentTaken).length,
        assessmentsDone: dashboardRes.data?.candidatesWithTest || 0,
        fresher: list.filter((c) => c.experienceLevel === "Fresher").length,
        experienced: list.filter((c) => c.experienceLevel !== "Fresher").length,
      });
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    const confirmed = await showConfirm({
      title: "Delete Candidate",
      message: `Delete candidate "${candidateName}"? This action cannot be undone.`,
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;

    setDeletingId(candidateId);
    try {
      await api.delete(`${API_BASE}/${candidateId}`);
      await fetchCandidates();
    } catch (err) {
      console.error("Error deleting candidate:", err);
      await showAlert({
        title: "Delete Failed",
        message: err.response?.data?.error || "Failed to delete candidate.",
        tone: "danger",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "assessed") return matchesSearch && candidate.assessmentTaken;
    if (filter === "fresher")
      return matchesSearch && candidate.experienceLevel === "Fresher";
    if (filter === "experienced")
      return matchesSearch && candidate.experienceLevel !== "Fresher";
    return matchesSearch;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilter("all");
  };

  if (loading) {
    return (
      <div className="adm-loading-screen">
        <div className="adm-spinner"></div>
        <p>Loading candidate database...</p>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Candidate Management"
      description="Review the candidate pool, audit assessment outcomes, and manage candidate records."
      contentClassName="adm-module-stack"
      actions={
        <button onClick={fetchCandidates} className="adm-refresh-btn">
          <RefreshCw size={18} /> Refresh List
        </button>
      }
    >
      {dialogNode}

      <section className="adm-module-hero">
        <div className="adm-module-hero-copy">
          <div className="adm-module-hero-topline">
            <Link to="/admin/dashboard" className="adm-inline-back">
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
          </div>
          <h2>Browse, filter, and act on candidate records without the clutter.</h2>
          <p>
            Keep visibility high across resumes, scores, and profile details,
            while making quick admin actions feel faster and more consistent.
          </p>
        </div>
        <div className="adm-module-hero-metrics">
          <div className="adm-mini-metric">
            <span>Visible Results</span>
            <strong>{filteredCandidates.length}</strong>
          </div>
          <div className="adm-mini-metric">
            <span>Total Pool</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
      </section>

      <section className="adm-stats-grid adm-section-spacer">
        <div className="adm-stat-card blue">
          <div className="adm-stat-icon">
            <Users size={20} />
          </div>
          <div className="adm-stat-content">
            <div className="adm-stat-value">{stats.total}</div>
            <div className="adm-stat-label">Total Registered</div>
          </div>
        </div>
        <div className="adm-stat-card green">
          <div className="adm-stat-icon">
            <Award size={20} />
          </div>
          <div className="adm-stat-content">
            <div className="adm-stat-value">{stats.assessmentsDone}</div>
            <div className="adm-stat-label">Assessments Done</div>
          </div>
        </div>
        <div className="adm-stat-card yellow">
          <div className="adm-stat-icon">
            <Calendar size={20} />
          </div>
          <div className="adm-stat-content">
            <div className="adm-stat-value">{stats.fresher}</div>
            <div className="adm-stat-label">Freshers</div>
          </div>
        </div>
        <div className="adm-stat-card purple">
          <div className="adm-stat-icon">
            <Briefcase size={20} />
          </div>
          <div className="adm-stat-content">
            <div className="adm-stat-value">{stats.experienced}</div>
            <div className="adm-stat-label">Experienced</div>
          </div>
        </div>
      </section>

      <section className="adm-card adm-filter-toolbar">
        <div className="adm-filter-search">
          <Search className="adm-filter-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            className="adm-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="adm-filter-actions">
          <button
            className={`adm-filter-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
            <span>{stats.total}</span>
          </button>
          <button
            className={`adm-filter-pill ${filter === "assessed" ? "active" : ""}`}
            onClick={() => setFilter("assessed")}
          >
            Assessed
            <span>{stats.assessed}</span>
          </button>
          <button
            className={`adm-filter-pill ${filter === "fresher" ? "active" : ""}`}
            onClick={() => setFilter("fresher")}
          >
            Freshers
            <span>{stats.fresher}</span>
          </button>
          <button
            className={`adm-filter-pill ${filter === "experienced" ? "active" : ""}`}
            onClick={() => setFilter("experienced")}
          >
            Experienced
            <span>{stats.experienced}</span>
          </button>
        </div>
      </section>

      <section className="adm-card table-card adm-table-card-lg">
        <div className="adm-table-card-head">
          <div>
            <h3>Candidate Directory</h3>
            <p>
              {filteredCandidates.length} result
              {filteredCandidates.length === 1 ? "" : "s"} matching the
              current filters.
            </p>
          </div>
        </div>

        <div className="adm-table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate Info</th>
                <th>Contact Details</th>
                <th>Assessment Status</th>
                <th>Experience</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <div className="adm-candidate-row">
                        <div className="adm-candidate-row-avatar">
                          <img
                            src={
                              candidate.profilePic
                                ? getCandidateFileUrl(candidate.profilePic)
                                : DEFAULT_PROFILE_IMAGE
                            }
                            alt={candidate.fullName}
                            onError={(event) => {
                              event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                            }}
                          />
                        </div>
                        <div className="adm-candidate-row-copy">
                          <div className="adm-t-name">{candidate.fullName}</div>
                          <div className="adm-t-sub">
                            {candidate.qualification ||
                              candidate.highestEducation ||
                              "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-t-email">
                        <Mail size={12} /> {candidate.email}
                      </div>
                      <div className="adm-t-phone">
                        <Phone size={12} /> {candidate.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td>
                      {candidate.assessmentTaken ? (
                        <div className="adm-assessment-cell">
                          <span className="adm-badge success">
                            {candidate.score}% Score
                          </span>
                          {candidate.badge ? (
                            <span className="adm-t-badge">
                              {candidate.badge}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="adm-badge secondary">
                          Not Attempted
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="adm-t-level">
                        {candidate.experienceLevel || "Fresher"}
                      </div>
                      <div className="adm-t-sub">
                        {candidate.experience
                          ? `${candidate.experience} years`
                          : ""}
                      </div>
                    </td>
                    <td className="adm-actions-cell">
                      <div className="adm-actions-inline">
                        <Link
                          to={`/admin/candidates/${candidate.id}`}
                          className="adm-t-btn primary"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </Link>
                        {candidate.resumePath ? (
                          <button
                            type="button"
                            className="adm-t-btn secondary"
                            title="Download Resume"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token");
                                const res = await fetch(
                                  `${API_BASE_URL}/admin/download/resume/${candidate.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                if (!res.ok) throw new Error("Download failed");
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const anchor = document.createElement("a");
                                anchor.href = url;
                                anchor.download =
                                  candidate.resumePath.split("/").pop() ||
                                  "resume";
                                anchor.click();
                                URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Resume download error:", err);
                              }
                            }}
                          >
                            <Download size={16} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="adm-t-btn danger"
                          title="Delete Candidate"
                          onClick={() =>
                            handleDeleteCandidate(
                              candidate.id,
                              candidate.fullName,
                            )
                          }
                          disabled={deletingId === candidate.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="adm-empty-table">
                    <Users size={48} />
                    <p>No candidates found matching your criteria.</p>
                    <button onClick={resetFilters} className="adm-t-btn">
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
