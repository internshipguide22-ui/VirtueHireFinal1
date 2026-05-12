import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, MessageSquare, XCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  getAllInterestedCandidates,
  getContactAccessRequests,
  reviewContactAccessRequest,
  subscribeContactAccessRequests,
  subscribeJobs,
} from "../../utils/jobsStore";
import api from "../../services/api";
import "../Jobs/JobsModule.css";
import "./AdminInterestedCandidates.css";

export default function AdminInterestedCandidates() {
  const [interestedCandidates, setInterestedCandidates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedbackRows, setFeedbackRows] = useState([]);

  useEffect(() => {
    setInterestedCandidates(getAllInterestedCandidates());
    const unsubscribeJobs = subscribeJobs(() =>
      setInterestedCandidates(getAllInterestedCandidates()),
    );
    setRequests(getContactAccessRequests());
    const unsubscribeRequests = subscribeContactAccessRequests(setRequests);

    return () => {
      unsubscribeJobs();
      unsubscribeRequests();
    };
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get("/admin/feedback");
        const interestedIds = new Set(
          getAllInterestedCandidates().map((row) => String(row.candidateId)),
        );
        const rows = (response.data?.candidates || []).filter((candidate) =>
          interestedIds.has(String(candidate.candidateId || candidate.id)),
        );
        setFeedbackRows(rows);
      } catch (error) {
        setFeedbackRows([]);
      }
    };

    fetchFeedback();
  }, []);

  const pendingRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "PENDING" ||
          request.status === "APPROVED" ||
          request.status === "REJECTED",
      ),
    [requests],
  );

  const handleReview = (requestId, status) => {
    reviewContactAccessRequest(requestId, status);
  };

  return (
    <AdminLayout hidePageHeader>
      <div className="aic-stack">
        <section className="aic-card">
          <span className="jobs-summary-badge">
            {interestedCandidates.length} Interested Entries
          </span>
          {interestedCandidates.length === 0 ? (
            <div className="jobs-empty-state">
              No interested candidates yet.
            </div>
          ) : (
            <div className="aic-table-wrap">
              <table className="aic-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Job</th>
                    <th>Skills</th>
                    <th>Experience</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedCandidates.map((row) => (
                    <tr key={`${row.jobId}_${row.candidateId}`}>
                      <td>{row.fullName}</td>
                      <td>{row.jobTitle}</td>
                      <td>{row.skills || "Not provided"}</td>
                      <td>{row.experience ?? 0} years</td>
                      <td>{row.email || "N/A"}</td>
                      <td>{row.phoneNumber || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="aic-card">
          <span className="jobs-summary-badge">
            {pendingRequests.length} Contact Access Requests
          </span>
          {pendingRequests.length === 0 ? (
            <div className="jobs-empty-state">No access requests yet.</div>
          ) : (
            <div className="aic-table-wrap">
              <table className="aic-table">
                <thead>
                  <tr>
                    <th>HR</th>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="aic-main">{request.hrName}</div>
                        <div className="aic-sub">{request.hrEmail}</div>
                      </td>
                      <td>
                        <div className="aic-main">{request.candidateName}</div>
                        <div className="aic-sub">
                          {request.candidateExperience ?? 0} years
                        </div>
                      </td>
                      <td>{request.jobTitle || "N/A"}</td>
                      <td>
                        <span
                          className={`aic-status ${request.status.toLowerCase()}`}
                        >
                          {request.status === "APPROVED" ? (
                            <CheckCircle2 size={14} />
                          ) : request.status === "PENDING" ? (
                            <Clock3 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {request.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="aic-actions">
                          <button
                            type="button"
                            className="aic-btn approve"
                            disabled={request.status === "APPROVED"}
                            onClick={() => handleReview(request.id, "APPROVED")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="aic-btn decline"
                            disabled={request.status === "REJECTED"}
                            onClick={() => handleReview(request.id, "REJECTED")}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="aic-card">
          <span className="jobs-summary-badge">
            {feedbackRows.length} Hiring Feedback Updates
          </span>
          {feedbackRows.length === 0 ? (
            <div className="jobs-empty-state">
              No HR feedback available yet for interested candidates.
            </div>
          ) : (
            <div className="aic-table-wrap">
              <table className="aic-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Status</th>
                    <th>Feedback</th>
                    <th>Tests Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackRows.map((row) => (
                    <tr key={`feedback_${row.candidateId || row.id}`}>
                      <td>
                        <div className="aic-main">
                          {row.candidateName || "Candidate"}
                        </div>
                        <div className="aic-sub">{row.candidateEmail || "N/A"}</div>
                      </td>
                      <td>
                        <span
                          className={`aic-status ${String(row.status || "").toLowerCase()}`}
                        >
                          {row.status === "APPROVED" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div className="aic-feedback">
                          <MessageSquare size={14} />
                          <span>{row.feedback || "No feedback provided"}</span>
                        </div>
                      </td>
                      <td>{row.testCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
