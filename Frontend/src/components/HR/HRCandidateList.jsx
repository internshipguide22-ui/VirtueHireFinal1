import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  Search,
  Filter,
  Briefcase,
  Eye,
  User,
  X,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import "./HRCandidateList.css";
import {
  ensureHrSubscription,
  syncStoredHrUser,
} from "../../utils/hrSubscription";

export default function HRCandidateList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [hrInfo, setHrInfo] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    skills: "",
    experienceLevel: "All",
    minScore: "",
  });

  const API_BASE = "/hrs";

  useEffect(() => {
    // Basic authentication check
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!storedUser || role !== "HR") {
      // For demo purposes/if no login, we might want to stay, but usually:
      // navigate('/hrs/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setHrInfo(parsedUser);
      setSubscription(ensureHrSubscription(parsedUser));
    }

    fetchCandidates();
  }, []);

  const fetchCandidates = async (searchParams = {}) => {
    setLoading(true);
    try {
      const response = await api.get(`${API_BASE}/candidates`, {
        params: searchParams,
      });
      // The backend returns a map with 'candidates' and 'hr'
      setCandidates(response.data.candidates || []);
      if (response.data.hr) {
        const hydratedHr = syncStoredHrUser(response.data.hr);
        setHrInfo(hydratedHr);
        setSubscription(ensureHrSubscription(hydratedHr || response.data.hr));
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(filters);
  };

  const handleClear = () => {
    const defaultFilters = { skills: "", experienceLevel: "All", minScore: "" };
    setFilters(defaultFilters);
    fetchCandidates(defaultFilters);
  };

  const viewDetails = (candidate) => {
    navigate(`/hr/candidate/${candidate.id}`, {
      state: {
        candidate,
        from: location.pathname,
      },
    });
  };

  return (
    <div className="hcl-container">
      {/* Mini Header for HR */}
      <nav className="hcl-navbar">
        <div className="hcl-nav-content">
          <div className="hcl-brand">
            <Briefcase className="hcl-logo-icon" />
            <span>HR Partner Portal</span>
          </div>
          <div className="hcl-hr-meta">
            {hrInfo && (
              <div className="hcl-plan-badge">
                {subscription?.planLabel ||
                  hrInfo.planType ||
                  "Free for 3 Months"}
              </div>
            )}
            <Link to="/hr/dashboard" className="hcl-nav-link">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="hcl-main">
        <header className="hcl-header">
          <div className="hcl-title-section">
            <h1>Candidate Pipeline</h1>
            <p>Discover top talent verified by Virtue Hire assessments</p>
          </div>
          <div className="hcl-stats-mini">
            <div className="hcl-stat-item">
              <span className="hcl-stat-val">{candidates.length}</span>
              <span className="hcl-stat-label">Available</span>
            </div>
          </div>
        </header>

        {subscription ? (
          <section
            className={`hcl-subscription-banner ${subscription.isExpired ? "expired" : ""}`}
          >
            <div>
              <strong>{subscription.planLabel}</strong>
              <p>
                {subscription.isExpired
                  ? "Your HR module subscription has expired. Renew to continue using the HR module."
                  : `${subscription.remainingDays} day${subscription.remainingDays === 1 ? "" : "s"} remaining for HR module access.`}
              </p>
            </div>
            <button
              type="button"
              className="hcl-btn-primary"
              onClick={() => navigate("/payments/plans?audience=hr")}
            >
              {subscription.isExpired ? "Renew Now" : "View Plans"}
            </button>
          </section>
        ) : null}

        {/* Search & Filter Bar */}
        <section className="hcl-search-section">
          <form className="hcl-filter-card" onSubmit={handleSearch}>
            <div className="hcl-search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by candidate name"
                value={filters.skills}
                onChange={(e) =>
                  setFilters({ ...filters, skills: e.target.value })
                }
              />
            </div>

            <div className="hcl-filter-group">
              <div className="hcl-select-wrapper">
                <Filter size={16} />
                <select
                  value={filters.experienceLevel}
                  onChange={(e) =>
                    setFilters({ ...filters, experienceLevel: e.target.value })
                  }
                >
                  <option value="All">All Experience</option>
                  <option value="Fresher">Fresher (0-1 yr)</option>
                  <option value="Experienced">Experienced (2+ yrs)</option>
                </select>
              </div>

              <div className="hcl-score-filter">
                <span>Min Score:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="75%"
                  value={filters.minScore}
                  onChange={(e) =>
                    setFilters({ ...filters, minScore: e.target.value })
                  }
                />
              </div>

              <div className="hcl-filter-actions">
                <button type="submit" className="hcl-btn-primary">
                  Search
                </button>
                <button
                  type="button"
                  className="hcl-btn-secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Candidate List */}
        <div className="hcl-list-container">
          {loading ? (
            <div className="hcl-loading">
              <div className="hcl-spinner"></div>
              <p>Scanning talent pool...</p>
            </div>
          ) : candidates.length > 0 ? (
            <div className="hcl-grid">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="hcl-card">
                  <div className="hcl-card-header">
                    <div className="hcl-candi-avatar">
                      {candidate.fullName.charAt(0)}
                    </div>
                    <div className="hcl-badge-tag">
                      {candidate.role || "Candidate"}
                    </div>
                  </div>

                  <div className="hcl-card-body">
                    <h3 className="hcl-candi-name">{candidate.fullName}</h3>

                    <div className="hcl-candi-stats">
                      <div className="hcl-candi-stat">
                        <Briefcase size={16} />
                        <span>
                          Role: <strong>{candidate.role || "Candidate"}</strong>
                        </span>
                      </div>
                      <div className="hcl-candi-stat">
                        <User size={16} />
                        <span>Exp: {candidate.experience ?? 0} yrs</span>
                      </div>
                    </div>

                    <div className="hcl-skills-tags">
                      <span
                        className={`hcl-access-pill status-${(candidate.requestStatus || "NONE").toLowerCase()}`}
                      >
                        {candidate.requestStatus === "APPROVED" ? (
                          <CheckCircle2 size={14} />
                        ) : candidate.requestStatus === "PENDING" ? (
                          <Clock3 size={14} />
                        ) : (
                          <X size={14} />
                        )}
                        {candidate.requestStatus === "APPROVED"
                          ? "Full access granted"
                          : candidate.requestStatus === "PENDING"
                            ? "Access pending admin approval"
                            : candidate.requestStatus === "REJECTED"
                              ? "Access denied"
                              : "Basic access only"}
                      </span>
                    </div>
                  </div>

                  <div className="hcl-card-footer">
                    <button
                      className="hcl-btn-view"
                      onClick={() => viewDetails(candidate)}
                    >
                      <Eye size={18} />
                      Open Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hcl-empty">
              <User size={64} />
              <h3>No candidates matches</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={handleClear} className="hcl-btn-secondary">
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div className="hcl-footer">
          <Link to="/hr/dashboard" className="hcl-back-link">
            &larr; Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
