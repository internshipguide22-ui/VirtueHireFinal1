import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  CheckCircle,
  XCircle,
  X,
  User,
  FileText,
  MessageSquare,
  Calendar,
  Award,
  Loader2,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import "./FeedbackDashboard.css";

const STATUS_CONFIG = {
  APPROVED: { icon: CheckCircle, class: "status-approved", label: "Approved" },
  REJECTED: { icon: X, class: "status-rejected", label: "Rejected" },
};

const FeedbackDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [allocationHistory, setAllocationHistory] = useState([]);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      const response = await api.get("/admin/feedback");
      setCandidates(response.data.candidates || []);
      setAllocationHistory(response.data.allocationHistory || []);
    } catch (err) {
      console.error("Error fetching feedback data:", err);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      } else {
        setError("Failed to load feedback data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.candidateName?.toLowerCase() || candidate.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.candidateEmail?.toLowerCase() || candidate.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.feedback?.toLowerCase() || candidate.hrFeedback?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (candidate.applicationStatus || candidate.status) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { icon: X, class: "status-default", label: status };
    const Icon = config.icon;
    return (
      <span className={`status-badge ${config.class}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const approvedCount = candidates.filter(c => (c.applicationStatus || c.status) === "APPROVED").length;
  const rejectedCount = candidates.filter(c => (c.applicationStatus || c.status) === "REJECTED").length;

  if (loading) {
    return (
      <div className="feedback-dashboard-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading feedback data...</p>
      </div>
    );
  }

  return (
    <div className="feedback-dashboard">
      <div className="feedback-dashboard-header">
        <div className="header-title">
          <MessageSquare size={24} />
          <h1>HR Feedback Dashboard</h1>
        </div>
        <p className="header-subtitle">
          Review all approved and rejected candidates with HR feedback
        </p>
      </div>

      {error && (
        <div className="feedback-dashboard-error">
          <X size={20} />
          <span>{error}</span>
          <button onClick={fetchFeedbackData}>Retry</button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="feedback-summary">
        <div className="summary-card approved">
          <CheckCircle size={24} />
          <div className="summary-info">
            <span className="summary-number">{approvedCount}</span>
            <span className="summary-label">Approved</span>
          </div>
        </div>
        <div className="summary-card rejected">
          <XCircle size={24} />
          <div className="summary-info">
            <span className="summary-number">{rejectedCount}</span>
            <span className="summary-label">Rejected</span>
          </div>
        </div>
        <div className="summary-card total">
          <User size={24} />
          <div className="summary-info">
            <span className="summary-number">{candidates.length}</span>
            <span className="summary-label">Total Processed</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="feedback-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {allocationHistory.length > 0 && (
        <div className="feedback-summary">
          {allocationHistory.slice(0, 4).map((item) => (
            <div key={item.testId || item.testName} className="summary-card total">
              <FileText size={24} />
              <div className="summary-info">
                <span className="summary-number">{item.totalAssignments}</span>
                <span className="summary-label">{item.testName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidates Table */}
      <div className="feedback-table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Status</th>
              <th>Tests Assigned</th>
              <th>HR Feedback</th>
              <th>Processed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-candidates">
                  <MessageSquare size={48} />
                  <p>No feedback records found</p>
                  <span>Candidates with APPROVED or REJECTED status will appear here</span>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="candidate-info">
                    <div className="candidate-name">{candidate.candidateName || candidate.fullName || "Unknown"}</div>
                    <div className="candidate-email">{candidate.candidateEmail || candidate.email || "No email"}</div>
                    {candidate.skills && (
                      <div className="candidate-skills">
                        {candidate.skills.split(",").slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill.trim()}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{getStatusBadge(candidate.applicationStatus || candidate.status)}</td>
                  <td className="tests-count">
                    <div className="tests-info">
                      <FileText size={14} />
                      <span>{candidate.testCount ?? candidate.assignedTests?.length ?? 0} tests</span>
                    </div>
                    {candidate.assignedTests && candidate.assignedTests.length > 0 && (
                      <div className="tests-submitted">
                        <CheckCircle size={12} />
                        <span>
                          {candidate.assignedTests.filter(t => t.submitted).length} submitted
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="feedback-cell">
                    <div className="feedback-preview">
                      <MessageSquare size={14} />
                      <p>{candidate.feedback || candidate.hrFeedback || "No feedback provided"}</p>
                    </div>
                  </td>
                  <td className="processed-date">
                    <Calendar size={14} />
                    <span>{formatDate(candidate.statusUpdatedAt || candidate.processedAt || candidate.updatedAt)}</span>
                  </td>
                  <td className="actions">
                    <button
                      className="view-btn"
                      onClick={() => setSelectedCandidate(candidate)}
                      title="View Full Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="candidate-detail-modal" onClick={e => e.stopPropagation()}>
            <div className={`modal-header ${(selectedCandidate.applicationStatus || selectedCandidate.status || "").toLowerCase()}`}>
              <div className="modal-title">
                <User size={24} />
                <div>
                  <h2>{selectedCandidate.candidateName || selectedCandidate.fullName}</h2>
                  <p>{selectedCandidate.candidateEmail || selectedCandidate.email}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCandidate(null)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h3>Status</h3>
                {getStatusBadge(selectedCandidate.applicationStatus || selectedCandidate.status)}
              </div>

              <div className="detail-section">
                <h3>HR Feedback</h3>
                <div className="feedback-box">
                  <MessageSquare size={18} />
                  <p>{selectedCandidate.feedback || selectedCandidate.hrFeedback || "No feedback provided"}</p>
                </div>
              </div>

              {selectedCandidate.assignedTests && selectedCandidate.assignedTests.length > 0 && (
                <div className="detail-section">
                  <h3>Test Assignments</h3>
                  <div className="tests-list">
                    {selectedCandidate.assignedTests.map((test, idx) => (
                      <div key={idx} className={`test-item ${test.submitted ? "submitted" : ""}`}>
                        <FileText size={14} />
                        <span className="test-name">{test.testName || test.testId}</span>
                        {test.submitted ? (
                          <span className="test-status submitted">
                            <CheckCircle size={12} />
                            {test.scoreObtained !== undefined ? `${test.scoreObtained}%` : "Submitted"}
                          </span>
                        ) : (
                          <span className="test-status pending">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-grid">
                {selectedCandidate.experience && (
                  <div className="detail-item">
                    <Award size={16} />
                    <span className="label">Experience:</span>
                    <span className="value">{selectedCandidate.experience} years</span>
                  </div>
                )}
                {selectedCandidate.skills && (
                  <div className="detail-item">
                    <Award size={16} />
                    <span className="label">Skills:</span>
                    <span className="value">{selectedCandidate.skills}</span>
                  </div>
                )}
                <div className="detail-item">
                  <Calendar size={16} />
                  <span className="label">Processed:</span>
                  <span className="value">{formatDate(selectedCandidate.statusUpdatedAt || selectedCandidate.processedAt || selectedCandidate.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedCandidate(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;
