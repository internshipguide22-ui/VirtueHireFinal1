import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  X,
  Check,
  Loader2,
  UserCheck,
  UserX,
  MessageSquare,
  ClipboardList,
  Clock,
  Award,
} from "lucide-react";
import "./FeedbackModal.css";

const FeedbackModal = ({ candidate, action, onClose, onStatusChanged }) => {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewItems, setReviewItems] = useState([]);
  const [selectedMappingId, setSelectedMappingId] = useState(null);

  const isApprove = action === "approve";
  const title = isApprove ? "Approve Candidate" : "Reject Candidate";
  const icon = isApprove ? <UserCheck size={24} /> : <UserX size={24} />;
  const defaultFeedback = isApprove ? "Approved after review" : "Rejected after review";

  useEffect(() => {
    let active = true;

    const fetchReviewData = async () => {
      setReviewLoading(true);
      try {
        const response = await api.get(`/hrs/candidates/${candidate.id}/review-data`);
        const reviews = response.data?.reviews || [];
        if (!active) {
          return;
        }

        setReviewItems(reviews);
        const preferred =
          reviews.find((item) => item.submitted || (item.results || []).length > 0) ||
          reviews[0] ||
          null;
        setSelectedMappingId(preferred?.mappingId ?? null);
      } catch (err) {
        if (!active) {
          return;
        }
        console.error("Error fetching review data:", err);
        setError(err.response?.data?.error || "Failed to load candidate review details");
      } finally {
        if (active) {
          setReviewLoading(false);
        }
      }
    };

    fetchReviewData();

    return () => {
      active = false;
    };
  }, [candidate.id]);

  const selectedReview = useMemo(
    () => reviewItems.find((item) => item.mappingId === selectedMappingId) || null,
    [reviewItems, selectedMappingId],
  );

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
              <X size={18} />
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

          <div className="review-section">
            <div className="feedback-label">
              <ClipboardList size={18} />
              Review Assigned Tests
            </div>

            {reviewLoading ? (
              <div className="review-loading">
                <Loader2 className="animate-spin" size={18} />
                <span>Loading assigned test review details...</span>
              </div>
            ) : reviewItems.length === 0 ? (
              <div className="review-empty">
                No assigned tests found for this candidate yet.
              </div>
            ) : (
              <>
                <div className="review-test-list">
                  {reviewItems.map((item) => (
                    <button
                      key={item.mappingId}
                      type="button"
                      className={`review-test-tab ${item.mappingId === selectedMappingId ? "active" : ""}`}
                      onClick={() => setSelectedMappingId(item.mappingId)}
                    >
                      <span>{item.testName}</span>
                      <span className={`review-state ${item.submitted ? "submitted" : "pending"}`}>
                        {item.submitted ? "Submitted" : "Pending"}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedReview ? (
                  <div className="review-panel">
                    <div className="review-overview">
                      <div className="review-chip">
                        <Clock size={14} />
                        {selectedReview.durationMinutes || 0} min
                      </div>
                      <div className="review-chip">
                        <Award size={14} />
                        Score: {selectedReview.scoreObtained ?? "N/A"}%
                      </div>
                      <div className="review-chip">
                        <ClipboardList size={14} />
                        Sections: {selectedReview.completedSections}/{selectedReview.totalSections || selectedReview.completedSections}
                      </div>
                    </div>

                    {selectedReview.testDescription ? (
                      <p className="review-description">{selectedReview.testDescription}</p>
                    ) : null}

                    {!selectedReview.canReview ? (
                      <div className="review-empty">
                        This assigned test has not been submitted yet.
                      </div>
                    ) : (
                      <div className="review-results">
                        {(selectedReview.results || []).map((result) => (
                          <div key={result.resultId || `${selectedReview.mappingId}-${result.level}`} className="review-result-card">
                            <div className="review-result-head">
                              <div>
                                <strong>Section {result.level}</strong>
                                <span className="review-result-score">{result.score}%</span>
                              </div>
                              <span className="review-result-time">
                                {result.attemptedAt ? new Date(result.attemptedAt).toLocaleString() : "Attempt time unavailable"}
                              </span>
                            </div>

                            {(result.answers || []).length === 0 ? (
                              <div className="review-empty">No answer details stored for this section.</div>
                            ) : (
                              <div className="review-answer-list">
                                {result.answers.map((answer, index) => (
                                  <div key={`${result.resultId || result.level}-${answer.questionId || index}`} className="review-answer-card">
                                    <div className="review-question">
                                      Q{index + 1}. {answer.question || "Question"}
                                    </div>
                                    <div className="review-answer-row">
                                      <span className="review-answer-label">Candidate answer</span>
                                      <span className="review-answer-value codeish">
                                        {answer.userAnswer || "No answer provided"}
                                      </span>
                                    </div>
                                    <div className="review-answer-row">
                                      <span className="review-answer-label">Expected</span>
                                      <span className="review-answer-value">
                                        {answer.correctAnswer || "N/A"}
                                      </span>
                                    </div>
                                    <div className="review-answer-row">
                                      <span className="review-answer-label">Result</span>
                                      <span className={`review-answer-status ${answer.isCorrect ? "correct" : "incorrect"}`}>
                                        {answer.isCorrect ? "Correct" : "Needs review"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </>
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
