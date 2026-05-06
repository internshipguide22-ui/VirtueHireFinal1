import React, { useState } from "react";
import api from "../../services/api";
import {
  X,
  Check,
  Loader2,
  UserCheck,
  UserX,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import "./FeedbackModal.css";

const FeedbackModal = ({ candidate, action, onClose, onStatusChanged }) => {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isApprove = action === "approve";
  const title = isApprove ? "Approve Candidate" : "Reject Candidate";
  const icon = isApprove ? <UserCheck size={24} /> : <UserX size={24} />;
  const defaultFeedback = isApprove ? "Approved after review" : "Rejected after review";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError("Please provide feedback before submitting");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = isApprove ? "/hrs/approve-candidate" : "/hrs/reject-candidate";
      
      const response = await api.post(endpoint, {
        candidateId: candidate.id,
        feedback: feedback.trim(),
      });

      if (response.data) {
        onStatusChanged(candidate.id, isApprove ? "APPROVED" : "REJECTED");
        onClose();
      }
    } catch (err) {
      console.error(`Error ${action}ing candidate:`, err);
      setError(err.response?.data?.error || `Failed to ${action} candidate`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${isApprove ? "approve" : "reject"}`}>
          <div className="modal-title">
            {icon}
            <div>
              <h2>{title}</h2>
              <p>Candidate: <strong>{candidate.fullName}</strong></p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          {error && (
            <div className="modal-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="candidate-summary">
            <div className="summary-item">
              <span className="label">Email:</span>
              <span className="value">{candidate.email || "N/A"}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Status:</span>
              <span className="value status-badge">{candidate.applicationStatus}</span>
            </div>
            {candidate.skills && (
              <div className="summary-item">
                <span className="label">Skills:</span>
                <span className="value">{candidate.skills}</span>
              </div>
            )}
            {candidate.experience && (
              <div className="summary-item">
                <span className="label">Experience:</span>
                <span className="value">{candidate.experience} years</span>
              </div>
            )}
          </div>

          <div className="feedback-section">
            <label htmlFor="feedback" className="feedback-label">
              <MessageSquare size={18} />
              Feedback <span className="required">*</span>
            </label>
            <textarea
              id="feedback"
              rows="5"
              placeholder={`Provide detailed feedback for ${isApprove ? "approving" : "rejecting"} this candidate...`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={submitting}
              autoFocus
            />
            <div className="feedback-hint">
              <button
                type="button"
                className="quick-feedback"
                onClick={() => setFeedback(defaultFeedback)}
              >
                Use default: "{defaultFeedback}"
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${isApprove ? "approve" : "reject"}`}
              disabled={submitting || !feedback.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isApprove ? "Approve Candidate" : "Reject Candidate"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
