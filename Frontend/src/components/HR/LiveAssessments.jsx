import React, { useState, useEffect } from "react";
import { Trash2, Lock, Unlock, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import "./LiveAssessments.css";

const LiveAssessments = ({ hr, refreshTrigger, apiBase = "/hrs" }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLiveAssessments();
  }, [refreshTrigger]);

  const fetchLiveAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint updated to match backend
      const res = await api.get(`${apiBase}/assessments/live`, {
        withCredentials: true,
      });
      setAssessments(res.data.assessments || []);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments. Internal Server Error.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (ast) => {
    const newLockStatus = !ast.isLocked;
    try {
      setError(null);
      await api.put(
        `${apiBase}/assessments/${ast.id}/lock?lock=${newLockStatus}`,
        {},
        { withCredentials: true },
      );
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === ast.id ? { ...a, isLocked: newLockStatus } : a,
        ),
      );
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to update test status.";
      setError(message);
    }
  };

  const initDelete = (assessment) => {
    setTestToDelete(assessment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      setError(null);
      await api.delete(`${apiBase}/assessments/${testToDelete.id}`, {
        withCredentials: true,
      });
      setAssessments((prev) => prev.filter((a) => a.id !== testToDelete.id));
      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete assessment.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="la-loading">
        <span className="spinner-border spinner-border-sm me-2"></span> Loading
        Assessments...
      </div>
    );
  }

  return (
    <div className="la-container">
      <div className="la-header">
        <div>
          <h2>Manage Assessments</h2>
          <p>
            Control availability, monitoring configurations, and active test
            banks.
          </p>
        </div>
      </div>

      {error && (
        <div className="la-alert la-alert-error">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="la-table-card">
        {assessments.length === 0 ? (
          <div className="la-empty-state">
            <div className="la-empty-icon">📝</div>
            <h3>No Assessments Found</h3>
            <p>Upload a question bank to create your first assessment.</p>
          </div>
        ) : (
          <div className="la-table-responsive">
            <table className="la-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Sections</th>
                  <th>Questions</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((ast) => (
                  <tr
                    key={ast.id}
                    className={ast.isLocked ? "la-row-locked" : ""}
                  >
                    <td className="la-fw-600">
                      <div className="la-test-info">
                        {ast.assessmentName}
                        {ast.isLocked && (
                          <span className="la-lock-tag">
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="la-badge la-badge-gray">
                        {ast.sectionCount} Sections
                      </span>
                    </td>
                    <td>{ast.totalQuestions} Qs</td>
                    <td>{ast.totalTime} Mins</td>
                    <td>
                      {ast.isLocked ? (
                        <span className="la-badge la-badge-danger">Locked</span>
                      ) : (
                        <span className="la-badge la-badge-success">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="la-action-btns">
                        <button
                          className={`la-btn-icon ${ast.isLocked ? "la-text-primary" : "la-text-warning"}`}
                          onClick={() => toggleLock(ast)}
                          title={ast.isLocked ? "Unlock Test" : "Lock Test"}
                        >
                          {ast.isLocked ? (
                            <Unlock size={18} />
                          ) : (
                            <Lock size={18} />
                          )}
                        </button>
                        <button
                          className="la-btn-icon la-text-danger"
                          onClick={() => initDelete(ast)}
                          title="Delete Test"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="la-modal-overlay">
          <div className="la-modal-content">
            <div className="la-modal-header la-bg-danger-light">
              <AlertTriangle size={24} className="la-text-danger" />
            </div>
            <div className="la-modal-body">
              <h3>Delete Assessment?</h3>
              <p>
                Are you sure you want to permanently delete{" "}
                <strong>{testToDelete?.assessmentName}</strong>? This cannot be
                undone.
              </p>
            </div>
            <div className="la-modal-footer">
              <button
                className="la-btn la-btn-outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="la-btn la-btn-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAssessments;
