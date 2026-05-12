import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  X,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Award,
} from "lucide-react";
import "./ViewAssignmentsModal.css";

const ViewAssignmentsModal = ({ candidate, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchAssignments();
  }, [candidate.id]);

  const fetchAssignments = async () => {
    try {
      const [assignmentsResponse, submissionsResponse] = await Promise.all([
        api.get(`/hrs/candidates/${candidate.id}/assigned-tests`),
        api.get(`/hrs/candidates/${candidate.id}/submissions`),
      ]);
      setAssignments(assignmentsResponse.data.assignedTests || []);
      setSubmissions(submissionsResponse.data.submissions || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load test assignments");
    } finally {
      setLoading(false);
    }
  };

  const getSubmission = (assignment) =>
    submissions.find(
      (submission) => submission.candidateTestMappingId === assignment.id,
    );

  const getFilteredAssignments = () => {
    if (statusFilter === "SUBMITTED") {
      return assignments.filter((assignment) => assignment.submitted);
    }

    if (statusFilter === "PENDING") {
      return assignments.filter((assignment) => !assignment.submitted);
    }

    return assignments;
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

  const getStatusIcon = (submitted) =>
    submitted ? (
      <CheckCircle size={18} className="status-submitted" />
    ) : (
      <X size={18} className="status-pending" />
    );

  const getStatusText = (submitted, submittedAt, scoreObtained) => {
    if (submitted) {
      return `Submitted on ${formatDate(submittedAt)}${scoreObtained !== undefined ? ` | Score: ${scoreObtained}%` : ""}`;
    }
    return "Pending submission";
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="view-assignments-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={24} />
            <div>
              <h2>Test Assignments</h2>
              <p>
                Candidate: <strong>{candidate.fullName}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="modal-alert error">
              <X size={18} />
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
                    {assignments.filter((assignment) => assignment.submitted).length}
                  </span>
                  <span className="summary-label">Submitted</span>
                </div>
                <div className="summary-card pending">
                  <span className="summary-number">
                    {assignments.filter((assignment) => !assignment.submitted).length}
                  </span>
                  <span className="summary-label">Pending</span>
                </div>
              </div>

              <div className="assignments-toolbar">
                <div className="assignments-filter">
                  <label htmlFor="assignment-status-filter">Filter</label>
                  <select
                    id="assignment-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Assignments</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <span className="assignments-count">
                  Showing {filteredAssignments.length} of {assignments.length}
                </span>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="filtered-empty-state">
                  <X size={20} />
                  <p>No assignments match the selected filter.</p>
                </div>
              ) : (
                <div className="assignments-list">
                  {filteredAssignments.map((assignment) => {
                    const submission = getSubmission(assignment);

                    return (
                      <div
                        key={assignment.id}
                        className={`assignment-card ${assignment.submitted ? "submitted" : "pending"}`}
                      >
                        <div className="assignment-header">
                          <div className="assignment-title">
                            {getStatusIcon(assignment.submitted)}
                            <h4>
                              {assignment.testName ||
                                assignment.testId ||
                                "Unknown Test"}
                            </h4>
                          </div>
                          <span
                            className={`assignment-status ${assignment.submitted ? "submitted" : "pending"}`}
                          >
                            {assignment.submitted ? "Submitted" : "Pending"}
                          </span>
                        </div>

                        <div className="assignment-details">
                          <div className="detail-row">
                            <Calendar size={14} />
                            <span>
                              Assigned: {formatDate(assignment.assignedAt)}
                            </span>
                          </div>

                          {assignment.durationMinutes && (
                            <div className="detail-row">
                              <Clock size={14} />
                              <span>
                                Duration: {assignment.durationMinutes} minutes
                              </span>
                            </div>
                          )}

                          <div className="detail-row status">
                            <Award size={14} />
                            <span>
                              {getStatusText(
                                assignment.submitted,
                                assignment.submittedAt,
                                assignment.scoreObtained,
                              )}
                            </span>
                          </div>

                          {submission?.submissionDetails && (
                            <div className="detail-row description">
                              <p>{submission.submissionDetails}</p>
                            </div>
                          )}

                          {assignment.testDescription && (
                            <div className="detail-row description">
                              <p>{assignment.testDescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
