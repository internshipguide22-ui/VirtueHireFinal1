import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";

export default function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const fetchRequests = async (nextFilter = filter) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/candidate-access-requests", {
        params: { status: nextFilter },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load access requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(filter);
  }, [filter]);

  const handleReview = async (requestId, action) => {
    setBusyId(requestId);
    try {
      await api.post(`/admin/candidate-access-requests/${requestId}/${action}`);
      await fetchRequests(filter);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} request.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Candidate Access Requests"
      description="Review HR requests for full candidate profile access and approve only when visibility is justified."
      actions={
        <button
          onClick={() => fetchRequests(filter)}
          className="adm-refresh-btn"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      }
    >
      <div className="adm-dashboard-body">
        <div className="adm-card" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["PENDING", "APPROVED", "REJECTED", "all"].map((value) => (
              <button
                key={value}
                type="button"
                className={`adm-filter-pill ${filter === value ? "active" : ""}`}
                onClick={() => setFilter(value)}
              >
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div
            className="adm-card"
            style={{
              color: "#b91c1c",
              borderColor: "#fecaca",
              background: "#fef2f2",
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="adm-card table-card">
          {loading ? (
            <div className="adm-loading-screen" style={{ height: "320px" }}>
              <div className="adm-spinner"></div>
              <p>Loading access requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "56px 24px",
                color: "#64748b",
              }}
            >
              <X
                size={48}
                style={{ opacity: 0.3, marginBottom: "12px" }}
              />
              <p>No access requests found for this filter.</p>
            </div>
          ) : (
            <div className="adm-table-container">
              <table>
                <thead>
                  <tr>
                    <th>HR</th>
                    <th>Candidate</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="adm-t-name">{request.hrName}</div>
                        <div className="adm-t-email">{request.hrEmail}</div>
                      </td>
                      <td>
                        <div className="adm-t-name">
                          {request.candidateName}
                        </div>
                        <div className="adm-t-email">
                          {request.candidateRole} •{" "}
                          {request.candidateExperience} yrs
                        </div>
                      </td>
                      <td>
                        <span
                          className={`adm-status-chip ${request.status.toLowerCase()}`}
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
                      <td>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="adm-t-btn primary"
                            disabled={
                              busyId === request.id ||
                              request.status === "APPROVED"
                            }
                            onClick={() => handleReview(request.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="adm-t-btn danger"
                            disabled={
                              busyId === request.id ||
                              request.status === "REJECTED"
                            }
                            onClick={() => handleReview(request.id, "decline")}
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
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .adm-filter-pill {
              padding: 8px 16px;
              border-radius: 999px;
              border: 1px solid #dbe3ef;
              background: #f8fafc;
              color: #475569;
              font-weight: 700;
              cursor: pointer;
            }
            .adm-filter-pill.active {
              background: #2563eb;
              border-color: #2563eb;
              color: #fff;
            }
            .adm-status-chip {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 12px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 700;
            }
            .adm-status-chip.pending {
              background: #fef3c7;
              color: #92400e;
            }
            .adm-status-chip.approved {
              background: #dcfce7;
              color: #166534;
            }
            .adm-status-chip.rejected {
              background: #fee2e2;
              color: #b91c1c;
            }
            .adm-t-btn.primary {
              background: #2563eb;
              color: #fff;
              border: none;
            }
            .adm-t-btn.danger {
              background: #ef4444;
              color: #fff;
              border: none;
            }
          `,
          }}
        />
      </div>
    </AdminLayout>
  );
}
