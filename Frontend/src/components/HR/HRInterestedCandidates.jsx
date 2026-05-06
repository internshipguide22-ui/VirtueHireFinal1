import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Eye,
  LayoutDashboard,
  List,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import {
  createContactAccessRequest,
  getAllInterestedCandidates,
  getContactAccessRequests,
  getHrCandidateAccessStatus,
  subscribeContactAccessRequests,
  subscribeJobs,
} from "../../utils/jobsStore";
import api from "../../services/api";
import "../Jobs/JobsModule.css";
import "./HRInterestedCandidates.css";
import { useAppDialog } from "../common/AppDialog";

const parseStorageUser = () => {
  const rawSources = ["current_hr_user", "user"];
  for (const key of rawSources) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      if (parsed) return parsed;
    } catch {
      // no-op
    }
  }
  return null;
};

export default function HRInterestedCandidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const [interestedCandidates, setInterestedCandidates] = useState([]);
  const [, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [hrUser, setHrUser] = useState(parseStorageUser);
  const selectedJobId = location.state?.selectedJobId || "";
  const selectedJobTitle = location.state?.selectedJobTitle || "";
  const { showAlert, dialogNode } = useAppDialog();

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
    const syncHrSession = async () => {
      if (hrUser?.id || hrUser?.email) return;

      try {
        const response = await api.get("/hrs/dashboard");
        const activeHr = response.data?.hr || null;
        if (activeHr) {
          setHrUser(activeHr);
          localStorage.setItem("current_hr_user", JSON.stringify(activeHr));
          localStorage.setItem("user", JSON.stringify(activeHr));
        }
      } catch (error) {
        // Keep local fallback behavior; dashboard request already tells us if session is gone.
      }
    };

    syncHrSession();
  }, [hrUser]);

  const requestAccess = (row) => {
    if (!hrUser) {
      setMessage("Unable to identify HR session. Please login again.");
      return;
    }
    createContactAccessRequest({
      hr: hrUser,
      candidate: row,
      job: row,
    });
    setMessage(`Contact access request submitted for ${row.fullName}.`);
  };

  const openContact = async (row) => {
    await showAlert({
      title: "Candidate Contact",
      message: `Email: ${row.email || "N/A"}\nPhone: ${row.phoneNumber || "N/A"}`,
      tone: "info",
      confirmLabel: "Close",
    });
  };

  const statusBadge = (status) => {
    if (status === "APPROVED")
      return (
        <span className="hri-status approved">
          <CheckCircle2 size={14} /> Approved
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="hri-status pending">
          <Clock3 size={14} /> Pending
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="hri-status rejected">
          <ShieldAlert size={14} /> Declined
        </span>
      );
    return (
      <span className="hri-status restricted">
        <ShieldAlert size={14} /> No Access
      </span>
    );
  };

  const rows = useMemo(
    () =>
      interestedCandidates.map((row) => ({
        ...row,
        accessStatus: getHrCandidateAccessStatus(hrUser || {}, row.candidateId),
      })),
    [interestedCandidates, hrUser],
  );

  const visibleRows = useMemo(
    () =>
      selectedJobId ? rows.filter((row) => row.jobId === selectedJobId) : rows,
    [rows, selectedJobId],
  );

  return (
    <div className="hri-layout">
      {dialogNode}
      <aside className="hri-sidebar">
        <div className="hri-brand">
          <div className="hri-mark">V</div>
          <div>
            <h2>VirtueHire</h2>
            <p>HR Workspace</p>
          </div>
        </div>

        <nav className="hri-nav">
          <button
            type="button"
            className="hri-nav-btn"
            onClick={() => navigate("/hr/dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            type="button"
            className="hri-nav-btn"
            onClick={() =>
              navigate("/hr/dashboard", { state: { activeTab: "view-jobs" } })
            }
          >
            <List size={18} />
            View Jobs
          </button>
          <button
            type="button"
            className="hri-nav-btn danger"
            onClick={() => navigate("/hrs/login")}
          >
            <LogOut size={18} />
            Exit
          </button>
        </nav>
      </aside>

      <main className="hri-main">
        {message ? <div className="hri-inline-msg">{message}</div> : null}

        <section className="hri-card">
          <div className="jobs-toolbar" style={{ marginBottom: "18px" }}>
            <span className="jobs-summary-badge">
              {visibleRows.length} Interested Candidate
              {visibleRows.length === 1 ? "" : "s"}
              {selectedJobTitle ? ` for ${selectedJobTitle}` : ""}
            </span>
          </div>

          {visibleRows.length === 0 ? (
            <div className="jobs-empty-state">
              No interested candidates available yet.
            </div>
          ) : (
            <div className="hri-table-wrap">
              <table className="hri-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Skills</th>
                    <th>Experience</th>
                    <th>Interested For</th>
                    <th>Contact Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={`${row.jobId}_${row.candidateId}`}>
                      <td>{row.fullName}</td>
                      <td>{row.skills || "Not provided"}</td>
                      <td>{row.experience ?? 0} years</td>
                      <td>{row.jobTitle || "N/A"}</td>
                      <td>{statusBadge(row.accessStatus)}</td>
                      <td>
                        <div className="hri-action-row">
                          <button
                            type="button"
                            className="hri-btn"
                            disabled={row.accessStatus !== "APPROVED"}
                            onClick={() =>
                              navigate(`/hr/candidate/${row.candidateId}`, {
                                state: {
                                  candidate: {
                                    id: row.candidateId,
                                    fullName: row.fullName,
                                    skills: row.skills,
                                    experience: row.experience,
                                  },
                                  from: "/hr/interested-candidates",
                                },
                              })
                            }
                          >
                            <Eye size={14} />
                            View Profile
                          </button>
                          <button
                            type="button"
                            className="hri-btn request"
                            onClick={() => requestAccess(row)}
                            disabled={
                              row.accessStatus === "APPROVED" ||
                              row.accessStatus === "PENDING"
                            }
                          >
                            {row.accessStatus === "APPROVED"
                              ? "Admin Approved"
                              : row.accessStatus === "PENDING"
                                ? "Request Pending"
                                : "Request Admin"}
                          </button>
                          {row.accessStatus === "APPROVED" ? (
                            <button
                              type="button"
                              className="hri-btn contact"
                              onClick={() => openContact(row)}
                            >
                              Contact Candidate
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
