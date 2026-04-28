import React, { useEffect, useState } from "react";
import { BriefcaseBusiness, RefreshCw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getJobs, JOB_STATUS, subscribeJobs } from "../../utils/jobsStore";
import "../Jobs/JobsModule.css";
import "./AdminDashboard.css";

export default function AdminViewJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const formatPostedDate = (value) => {
    if (!value) return "Not available";
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? "Not available" : parsedDate.toLocaleDateString();
  };

  useEffect(() => {
    setJobs(getJobs());
    const unsubscribe = subscribeJobs(setJobs);
    return unsubscribe;
  }, []);

  const refreshJobs = () => {
    setJobs(getJobs());
  };

  const getAdminStatusLabel = (status) => {
    if (status === JOB_STATUS.PAUSED) return "Paused";
    if (status === JOB_STATUS.CLOSED) return "Closed";
    return "Open";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesRole = !roleFilter.trim() || (job.title || "").toLowerCase().includes(roleFilter.trim().toLowerCase());
    const matchesLocation = !locationFilter.trim() || (job.location || "").toLowerCase().includes(locationFilter.trim().toLowerCase());
    return matchesStatus && matchesRole && matchesLocation;
  });

  return (
    <AdminLayout
      title="View Jobs"
      description="Review all active job posts published by HR teams across the platform."
      actions={
        <button onClick={refreshJobs} className="adm-refresh-btn" type="button">
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <section className="adm-module-stack jobs-module-shell">
        <div className="jobs-toolbar">
          <span className="jobs-summary-badge">
            <BriefcaseBusiness size={16} />
            {jobs.length} Active Job{jobs.length === 1 ? "" : "s"}
          </span>
          <div className="jobs-filter-row">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="jobs-filter-input">
              <option value="all">All Status</option>
              <option value={JOB_STATUS.OPEN}>Open</option>
              <option value={JOB_STATUS.PAUSED}>Paused</option>
              <option value={JOB_STATUS.CLOSED}>Closed</option>
            </select>
            <input
              type="text"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="jobs-filter-input"
              placeholder="Filter by role"
            />
            <input
              type="text"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="jobs-filter-input"
              placeholder="Filter by location"
            />
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="jobs-empty-state">
            {jobs.length === 0 ? "No jobs are currently published by HR teams." : "No jobs match the selected filters."}
          </div>
        ) : (
          <div className="jobs-table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Salary</th>
                  <th>Description</th>
                  <th>Posted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="jobs-row-title">
                      <strong>{job.title}</strong>
                      <div className="jobs-row-company">{job.company || "Unknown company"}</div>
                    </td>
                    <td>
                      <span className={`job-status-badge status-${job.status || JOB_STATUS.OPEN}`}>{getAdminStatusLabel(job.status)}</span>
                    </td>
                    <td>
                      <span className="job-pill">{job.type || "Not specified"}</span>
                    </td>
                    <td>{job.location || "Not specified"}</td>
                    <td>{job.experience || "Not specified"}</td>
                    <td>{job.salary || "Not specified"}</td>
                    <td className="jobs-description-cell">
                      {job.skills ? (
                        <p className="jobs-description-skills">
                          <strong>Skills:</strong> {job.skills}
                        </p>
                      ) : null}
                      <p className="jobs-description-text">{job.description || "No description provided."}</p>
                    </td>
                    <td className="jobs-posted-cell">
                      <strong>{job.postedBy || "HR Team"}</strong>
                      <span>{formatPostedDate(job.createdAt)}</span>
                    </td>
                    <td className="jobs-actions-cell">
                      <div className="job-manage-row">
                        <button
                          type="button"
                          className="interested-toggle-btn"
                          onClick={() => navigate("/admin/interested-candidates")}
                        >
                          <Users size={15} />
                          Interested Candidates
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
    </AdminLayout>
  );
}
