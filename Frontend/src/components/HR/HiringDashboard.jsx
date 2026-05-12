import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  CheckCircle,
  X,
  XCircle,
  FileText,
  Eye,
  ClipboardList,
  UserCheck,
  UserX,
  Loader2,
  Search,
  Filter,
  Briefcase,
} from "lucide-react";
import "./HiringDashboard.css";
import AssignTestModal from "./AssignTestModal";
import FeedbackModal from "./FeedbackModal";
import ViewAssignmentsModal from "./ViewAssignmentsModal";

const STATUS_BADGES = {
  INTERESTED: { label: "Interested", class: "status-interested" },
  UNDER_REVIEW: { label: "Under Review", class: "status-review" },
  TEST_ASSIGNED: { label: "Test Assigned", class: "status-test" },
  APPROVED: { label: "Approved", class: "status-approved" },
  REJECTED: { label: "Rejected", class: "status-rejected" },
};

const HiringDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const [assignTestModal, setAssignTestModal] = useState({ open: false, candidate: null });
  const [feedbackModal, setFeedbackModal] = useState({ open: false, candidate: null, action: null });
  const [viewAssignmentsModal, setViewAssignmentsModal] = useState({ open: false, candidate: null });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Get candidates for HR action (INTERESTED or UNDER_REVIEW)
      const response = await api.get("/hrs/candidates-for-action");
      setCandidates(response.data.candidates || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      if (err.response?.status === 401) {
        navigate("/hrs/login");
      }
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (candidateId) => {
    navigate(`/hrs/candidates/${candidateId}`);
  };

  const handleAssignTest = (candidate) => {
    setAssignTestModal({ open: true, candidate });
  };

  const handleViewAssignments = (candidate) => {
    setViewAssignmentsModal({ open: true, candidate });
  };

  const handleApprove = (candidate) => {
    setFeedbackModal({ open: true, candidate, action: "approve" });
  };

  const handleReject = (candidate) => {
    setFeedbackModal({ open: true, candidate, action: "reject" });
  };

  const onTestAssigned = (candidateId) => {
    // Update candidate status locally
    // FIX: Use loose equality (==) because candidateId from form is string, c.id from DB is number
    setCandidates(prev => prev.map(c => 
      c.id == candidateId ? { ...c, applicationStatus: "TEST_ASSIGNED" } : c
    ));
    fetchCandidates(); // Refresh to get latest data
  };

  const onStatusChanged = (candidateId, newStatus) => {
    // Remove candidate from list if approved/rejected, or update status
    // FIX: Use loose equality (==) because candidateId can be string, c.id from DB is number
    if (newStatus === "APPROVED" || newStatus === "REJECTED") {
      setCandidates(prev => prev.filter(c => c.id != candidateId));
    } else {
      setCandidates(prev => prev.map(c => 
        c.id == candidateId ? { ...c, applicationStatus: newStatus } : c
      ));
    }
    fetchCandidates();
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.skills?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.applicationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badge = STATUS_BADGES[status] || { label: status, class: "status-default" };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  const canAssignTest = (status) => {
    return status === "INTERESTED" || status === "UNDER_REVIEW" || status === "TEST_ASSIGNED";
  };

  const canApproveReject = (status) => {
    return status === "INTERESTED" || status === "UNDER_REVIEW" || status === "TEST_ASSIGNED";
  };

  if (loading) {
    return (
      <div className="hiring-dashboard-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="hiring-dashboard">
      <div className="hiring-dashboard-header">
        <div className="header-title">
          <Briefcase size={24} />
          <h1>Hiring Workflow</h1>
        </div>
        <p className="header-subtitle">
          Manage candidates through the hiring process: review, assign tests, approve or reject
        </p>
      </div>

      {error && (
        <div className="hiring-dashboard-error">
          <X size={20} />
          <span>{error}</span>
          <button onClick={fetchCandidates}>Retry</button>
        </div>
      )}

      <div className="hiring-dashboard-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="INTERESTED">Interested</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="TEST_ASSIGNED">Test Assigned</option>
          </select>
        </div>
      </div>

      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Status</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-candidates">
                  <Users size={48} />
                  <p>No candidates found</p>
                  <span>Candidates with INTERESTED or UNDER_REVIEW status will appear here</span>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="candidate-info">
                    <div className="candidate-name">{candidate.fullName || "Unknown"}</div>
                    <div className="candidate-email">{candidate.email || "No email"}</div>
                  </td>
                  <td>{getStatusBadge(candidate.applicationStatus)}</td>
                  <td className="candidate-skills">
                    {candidate.skills ? (
                      <div className="skills-list">
                        {candidate.skills.split(",").slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill.trim()}</span>
                        ))}
                        {candidate.skills.split(",").length > 3 && (
                          <span className="skill-more">+{candidate.skills.split(",").length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="no-skills">No skills listed</span>
                    )}
                  </td>
                  <td className="candidate-experience">
                    {candidate.experience ? `${candidate.experience} years` : "N/A"}
                  </td>
                  <td className="candidate-actions">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewProfile(candidate.id)}
                      title="View Profile"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    
                    {canAssignTest(candidate.applicationStatus) && (
                      <button
                        className="action-btn assign"
                        onClick={() => handleAssignTest(candidate)}
                        title="Assign Test"
                      >
                        <FileText size={16} />
                        <span>Assign Test</span>
                      </button>
                    )}
                    
                    <button
                      className="action-btn assignments"
                      onClick={() => handleViewAssignments(candidate)}
                      title="View Assignments"
                    >
                      <ClipboardList size={16} />
                      <span>Assignments</span>
                    </button>
                    
                    {canApproveReject(candidate.applicationStatus) && (
                      <>
                        <button
                          className="action-btn approve"
                          onClick={() => handleApprove(candidate)}
                          title="Approve Candidate"
                        >
                          <UserCheck size={16} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleReject(candidate)}
                          title="Reject Candidate"
                        >
                          <UserX size={16} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {assignTestModal.open && (
        <AssignTestModal
          candidate={assignTestModal.candidate}
          candidates={candidates}
          onClose={() => setAssignTestModal({ open: false, candidate: null })}
          onAssigned={onTestAssigned}
        />
      )}

      {feedbackModal.open && (
        <FeedbackModal
          candidate={feedbackModal.candidate}
          action={feedbackModal.action}
          onClose={() => setFeedbackModal({ open: false, candidate: null, action: null })}
          onStatusChanged={onStatusChanged}
        />
      )}

      {viewAssignmentsModal.open && (
        <ViewAssignmentsModal
          candidate={viewAssignmentsModal.candidate}
          onClose={() => setViewAssignmentsModal({ open: false, candidate: null })}
        />
      )}
    </div>
  );
};

export default HiringDashboard;
