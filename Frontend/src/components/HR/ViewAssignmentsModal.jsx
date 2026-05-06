import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  X,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
} from "lucide-react";
import "./ViewAssignmentsModal.css";

const ViewAssignmentsModal = ({ candidate, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [candidate.id]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/hrs/candidates/${candidate.id}/assigned-tests`);
      setAssignments(response.data.assignedTests || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load test assignments");
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

  const getStatusIcon = (submitted) => {
    return submitted ? (
      <CheckCircle size={18} className="status-submitted" />
    ) : (
      <AlertCircle size={18} className="status-pending" />
    );
  };

  const getStatusText = (submitted, submittedAt, scoreObtained) => {
    if (submitted) {
      return `Submitted on ${formatDate(submittedAt)}${scoreObtained !== undefined ? ` • Score: ${scoreObtained}%` : ""}`;
    }
    return "Pending submission";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-assignments-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={24} />
            <div>
              <h2>Test Assignments</h2>
              <p>Candidate: <strong>{candidate.fullName}</strong></p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="modal-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="modal-loading">
              <Loader2 className="animate-spin" size={32} />
              <p>Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="no-assignments">
              <FileText size={48} />
              <h3>No Tests Assigned</h3>
              <p>This candidate has not been assigned any tests yet.</p>
              <button className="btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="assignments-summary">
                <div className="summary-card total">
                  <span className="summary-number">{assignments.length}</span>
                  <span className="summary-label">Total Assigned</span>
                </div>
                <div className="summary-card submitted">
                  <span className="summary-number">
                    {assignments.filter(a => a.submitted).length}
                  </span>
                  <span className="summary-label">Submitted</span>
                </div>
                <div className="summary-card pending">
                  <span className="summary-number">
                    {assignments.filter(a => !a.submitted).length}
                  </span>
                  <span className="summary-label">Pending</span>
                </div>
              </div>

              <div className="assignments-list">
                {assignments.map((assignment, idx) => (
                  <div
                    key={idx}
                    className={`assignment-card ${assignment.submitted ? "submitted" : "pending"}`}
                  >
                    <div className="assignment-header">
                      <div className="assignment-title">
                        {getStatusIcon(assignment.submitted)}
                        <h4>{assignment.testName || assignment.testId || "Unknown Test"}</h4>
                      </div>
                      <span className={`assignment-status ${assignment.submitted ? "submitted" : "pending"}`}>
                        {assignment.submitted ? "Submitted" : "Pending"}
                      </span>
                    </div>

                    <div className="assignment-details">
                      <div className="detail-row">
                        <Calendar size={14} />
                        <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                      </div>

                      {assignment.durationMinutes && (
                        <div className="detail-row">
                          <Clock size={14} />
                          <span>Duration: {assignment.durationMinutes} minutes</span>
                        </div>
                      )}

                      <div className="detail-row status">
                        <Award size={14} />
                        <span>{getStatusText(assignment.submitted, assignment.submittedAt, assignment.scoreObtained)}</span>
                      </div>

                      {assignment.testDescription && (
                        <div className="detail-row description">
                          <p>{assignment.testDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignmentsModal;
