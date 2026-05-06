import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck,
  UserRound,
  FileText,
  LogOut,
  PlayCircle,
  CircleCheck,
  Clock3,
  Award,
  BadgeCheck,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Eye,
  PencilLine,
  BriefcaseBusiness,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import api from "../../services/api";
import { API_BASE_URL } from "../../config";
import { DEFAULT_PROFILE_IMAGE } from "./profile/profileUtils";
import "./CandidateWelcome.css";
import "../Jobs/JobsModule.css";
import {
  getCandidateJobStatus,
  getJobs,
  JOB_STATUS,
  setCandidateJobInterest,
  subscribeJobs,
} from "../../utils/jobsStore";
import { useAppDialog } from "../common/AppDialog";
import CandidateResumeModule from "./resume/CandidateResumeModule";

export default function CandidateWelcome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [candidate, setCandidate] = useState(null);
  const [profileSrc, setProfileSrc] = useState(DEFAULT_PROFILE_IMAGE);
  const [cumulativeResults, setCumulativeResults] = useState([]);
  const [assessmentStatuses, setAssessmentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const { showAlert, dialogNode } = useAppDialog();

  useEffect(() => {
    const bootstrap = async () => {
      const storedCandidate = localStorage.getItem("candidate");
      if (!storedCandidate) {
        navigate("/candidate/login");
        return;
      }

      let parsedCandidate;
      try {
        parsedCandidate = JSON.parse(storedCandidate);
      } catch (err) {
        localStorage.removeItem("candidate");
        navigate("/candidate/login");
        return;
      }

      setCandidate(parsedCandidate);

      if (parsedCandidate.emailVerified === false) {
        localStorage.setItem(
          "pendingVerificationEmail",
          parsedCandidate.email || "",
        );
        localStorage.removeItem("candidate");
        navigate(
          `/candidate/verify-otp?email=${encodeURIComponent(parsedCandidate.email || "")}`,
        );
        return;
      }

      if (parsedCandidate.profilePic) {
        setProfileSrc(
          `${API_BASE_URL}/candidates/file/${parsedCandidate.profilePic}`,
        );
      }

      try {
        const [profileResult, cumulativeResult, assessmentsResult] =
          await Promise.allSettled([
          api.get("/candidates/me", { withCredentials: true }),
          api.get(`/candidates/${parsedCandidate.id}/cumulative-results`, {
            withCredentials: true,
          }),
          api.get("/candidates/my-assessments", { withCredentials: true }),
        ]);

        const results = [profileResult, cumulativeResult, assessmentsResult];
        const authError = results.find(
          (result) =>
            result.status === "rejected" &&
            (result.reason?.response?.status === 401 ||
              result.reason?.response?.status === 403),
        );

        if (authError) {
          localStorage.removeItem("candidate");
          navigate("/candidate/login");
          return;
        }

        const profileRes =
          profileResult.status === "fulfilled" ? profileResult.value : null;
        const cumulativeRes =
          cumulativeResult.status === "fulfilled" ? cumulativeResult.value : null;
        const assessmentsRes =
          assessmentsResult.status === "fulfilled"
            ? assessmentsResult.value
            : null;

        const latestCandidate = {
          ...parsedCandidate,
          ...(profileRes?.data?.candidate || {}),
        };

        if (assessmentsRes?.data) {
          latestCandidate.assignedAssessmentName =
            assessmentsRes.data.assignedAssessmentName ??
            latestCandidate.assignedAssessmentName;
          latestCandidate.assessmentAssignmentStatus =
            assessmentsRes.data.assessmentAssignmentStatus ??
            latestCandidate.assessmentAssignmentStatus;
          latestCandidate.assessmentAssignmentMessage =
            assessmentsRes.data.assessmentAssignmentMessage ??
            latestCandidate.assessmentAssignmentMessage;
        }

        if (latestCandidate.emailVerified === false) {
          localStorage.setItem(
            "pendingVerificationEmail",
            latestCandidate.email || "",
          );
          localStorage.removeItem("candidate");
          navigate(
            `/candidate/verify-otp?email=${encodeURIComponent(latestCandidate.email || "")}`,
          );
          return;
        }

        setCandidate(latestCandidate);
        localStorage.setItem("candidate", JSON.stringify(latestCandidate));

        if (latestCandidate.profilePic) {
          setProfileSrc(
            `${API_BASE_URL}/candidates/file/${latestCandidate.profilePic}`,
          );
        }

        // Null-guarded: handles 404 or any failed response from my-assessments gracefully
        const visibleAssessmentNames =
          assessmentsRes?.data && Array.isArray(assessmentsRes.data.assessments)
            ? assessmentsRes.data.assessments
            : [];

        const statusResponses = await Promise.all(
          visibleAssessmentNames.map(async (name) => {
            try {
              const res = await api.get(
                `/assessment/status/${encodeURIComponent(name)}`,
                { withCredentials: true },
              );
              return { name, ...res.data };
            } catch (err) {
              return {
                name,
                results: [],
                nextLevel: 1,
                totalSections: 0,
                configs: [],
                isLocked: false,
              };
            }
          }),
        );

        setCumulativeResults(
          Array.isArray(cumulativeRes?.data) ? cumulativeRes.data : [],
        );
        setAssessmentStatuses(statusResponses);

        const failedRequests = [];
        if (profileResult.status === "rejected") failedRequests.push("profile");
        if (cumulativeResult.status === "rejected")
          failedRequests.push("results");
        if (assessmentsResult.status === "rejected")
          failedRequests.push("assessments");

        if (failedRequests.length > 0) {
          console.error("Candidate portal partial load failure:", {
            failedRequests,
            profileError:
              profileResult.status === "rejected" ? profileResult.reason : null,
            cumulativeError:
              cumulativeResult.status === "rejected"
                ? cumulativeResult.reason
                : null,
            assessmentsError:
              assessmentsResult.status === "rejected"
                ? assessmentsResult.reason
                : null,
          });
          setError(
            `Some portal data could not be loaded: ${failedRequests.join(", ")}.`,
          );
        } else {
          setError("");
        }
      } catch (err) {
        console.error("Candidate portal load failed:", err);
        setError("Some portal data could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate]);

  useEffect(() => {
    setJobs(getJobs());
    const unsubscribe = subscribeJobs(setJobs);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    localStorage.removeItem("candidateResults");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/candidate/login");
  };

  const handleCandidateProfileUpdate = (updatedCandidate) => {
    if (!updatedCandidate) return;
    setCandidate(updatedCandidate);
    localStorage.setItem("candidate", JSON.stringify(updatedCandidate));
    if (updatedCandidate.profilePic) {
      setProfileSrc(
        `${API_BASE_URL}/candidates/file/${updatedCandidate.profilePic}`,
      );
    }
  };

  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.filter(Boolean);
    return String(skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const testBuckets = useMemo(() => {
    const attended = [];
    const unattended = [];

    assessmentStatuses.forEach((assessment) => {
      const results = assessment.results || [];
      const totalSections = assessment.totalSections || 0;
      const attemptedCount = results.length;
      const configs = Array.isArray(assessment.configs)
        ? assessment.configs
        : [];
      const isLocked = Boolean(assessment.isLocked);

      const passedCount = results.filter((result) => {
        const currentConfig = configs.find(
          (config) => Number(config.sectionNumber) === Number(result.level),
        );
        const requiredScore = Number(currentConfig?.passPercentage) || 60;
        return Number(result.score) >= requiredScore;
      }).length;
      const availableLevel = assessment.nextLevel || 1;
      const progress =
        totalSections > 0 ? Math.round((passedCount / totalSections) * 100) : 0;

      const item = {
        name: assessment.name,
        attemptedCount,
        passedCount,
        totalSections,
        progress,
        nextLevel: availableLevel,
        latestScore: results.length ? results[results.length - 1].score : null,
        latestAttemptedAt: results.length
          ? results[results.length - 1].attemptedAt
          : null,
        isCompleted: totalSections > 0 && passedCount === totalSections,
        isLocked,
      };

      if (isLocked) {
        // Skip locked tests entirely
        return;
      } else if (attemptedCount > 0) {
        attended.push(item);
      } else {
        unattended.push(item);
      }
    });

    return { attended, unattended };
  }, [assessmentStatuses]);

  const stats = useMemo(() => {
    const avgScore =
      cumulativeResults.length > 0
        ? Math.round(
            cumulativeResults.reduce(
              (sum, item) => sum + item.cumulativePercentage,
              0,
            ) / cumulativeResults.length,
          )
        : 0;

    return [
      {
        label: "Assessments Taken",
        value: testBuckets.attended.length,
        icon: <FileCheck size={22} />,
      },
      {
        label: "Pending Tests",
        value: testBuckets.unattended.length,
        icon: <Clock3 size={22} />,
      },
      {
        label: "Average Score",
        value: cumulativeResults.length ? `${avgScore}%` : "N/A",
        icon: <Award size={22} />,
      },
    ];
  }, [cumulativeResults, testBuckets]);

  const topBadge = useMemo(() => {
    if (candidate?.badge && candidate.badge.trim() && candidate.badge !== "No badge") {
      return candidate.badge;
    }

    return (
      cumulativeResults.find((item) => item.badge && item.badge !== "No Badge")
        ?.badge || "In Progress"
    );
  }, [candidate, cumulativeResults]);

  const startAssessment = (assessmentName) => {
    const selectedAssessment =
      assessmentName ||
      candidate?.assignedAssessmentName ||
      testBuckets.unattended[0]?.name ||
      testBuckets.attended[0]?.name;

    if (!selectedAssessment) {
      return;
    }
    localStorage.setItem(
      "selectedAssessment",
      selectedAssessment,
    );
    sessionStorage.setItem(
      "selectedAssessment",
      selectedAssessment,
    );
    navigate("/courses");
  };

  const updateJobInterest = async (jobId, status) => {
    if (!candidate) return;
    const result = setCandidateJobInterest(jobId, candidate, status);

    if (!result?.updated) {
      await showAlert({
        title: "Response Already Submitted",
        message:
          "You have already responded to this job. This action can only be submitted once.",
        tone: "warning",
      });
      return;
    }

    if (status === "interested") {
      await showAlert({
        title: "Interest Submitted",
        message: "Your interest has been submitted successfully.",
        tone: "success",
      });
    }
  };

  const formatPostedDate = (value) => {
    if (!value) return "Not available";
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? "Not available"
      : parsedDate.toLocaleDateString();
  };

  const getCandidateJobAvailability = (status) => {
    if (status === JOB_STATUS.PAUSED) return "Job is Paused";
    if (status === JOB_STATUS.CLOSED) return "Job is Closed";
    return "Still Open";
  };

  if (loading || !candidate) {
    return (
      <div className="candidate-portal-loading">
        <div className="candidate-portal-spinner" />
        <p>Loading your candidate portal...</p>
      </div>
    );
  }

  return (
    <div className="candidate-portal">
      {dialogNode}
      <aside className="candidate-sidebar">
        <div className="candidate-sidebar-brand">
          <div className="candidate-sidebar-mark">V</div>
          <div>
            <h1>VirtueHire</h1>
            <p>Candidate Portal</p>
          </div>
        </div>

        <div className="candidate-sidebar-profile">
          <img
            src={profileSrc}
            alt={candidate.fullName}
            className="candidate-sidebar-avatar"
            onError={() => setProfileSrc(DEFAULT_PROFILE_IMAGE)}
          />
          <h2>{candidate.fullName}</h2>
          <span>{topBadge}</span>
        </div>

        <nav className="candidate-sidebar-nav">
          <button
            type="button"
            className={`candidate-sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            Candidate Dashboard
          </button>
          <button
            type="button"
            className={`candidate-sidebar-link ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => setActiveTab("tests")}
          >
            <FileCheck size={18} />
            Manage Tests
          </button>
          <button
            type="button"
            className={`candidate-sidebar-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={18} />
            Profile
          </button>
          <button
            type="button"
            className={`candidate-sidebar-link ${activeTab === "resume" ? "active" : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <FileText size={18} />
            Resume
          </button>
          <button
            type="button"
            className={`candidate-sidebar-link ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <BriefcaseBusiness size={18} />
            View Jobs
          </button>
        </nav>

        <button
          type="button"
          className="candidate-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="candidate-main">
        <section className="candidate-hero">
          <div>
            <p className="candidate-hero-eyebrow">Candidate Workspace</p>
            <h2>Welcome back, {candidate.fullName}!</h2>
            <p className="candidate-hero-copy">
              Track your progress, manage upcoming assessments, and keep your
              profile ready for recruiters.
            </p>
          </div>
          <button
            type="button"
            className="candidate-primary-btn"
            onClick={() => startAssessment()}
            disabled={
              !candidate?.assignedAssessmentName &&
              testBuckets.unattended.length === 0 &&
              testBuckets.attended.length === 0
            }
          >
            <PlayCircle size={18} />
            {candidate.assignedAssessmentName || testBuckets.unattended.length > 0
              ? "Start Assessment"
              : "Assessment Pending"}
          </button>
        </section>

        {error && <div className="candidate-alert">{error}</div>}
        {!candidate.assignedAssessmentName &&
        candidate.assessmentAssignmentMessage ? (
          <div className="candidate-alert">
            {candidate.assessmentAssignmentMessage}
          </div>
        ) : null}

        {activeTab === "dashboard" && (
          <div className="candidate-content-stack">
            <section className="candidate-stats-grid">
              {stats.map((stat) => (
                <article key={stat.label} className="candidate-stat-card">
                  <div className="candidate-stat-icon">{stat.icon}</div>
                  <div>
                    <p>{stat.label}</p>
                    <h3>{stat.value}</h3>
                  </div>
                </article>
              ))}
            </section>

            <section className="candidate-panel">
              <div className="candidate-panel-header">
                <div>
                  <h3>Assessment Snapshot</h3>
                  <p>A quick view of your recent candidate activity.</p>
                </div>
              </div>

              <div className="candidate-snapshot-grid">
                <div className="candidate-mini-card">
                  <span>Attended Tests</span>
                  <strong>{testBuckets.attended.length}</strong>
                </div>
                <div className="candidate-mini-card">
                  <span>Not Attended</span>
                  <strong>{testBuckets.unattended.length}</strong>
                </div>
                <div className="candidate-mini-card">
                  <span>Best Badge</span>
                  <strong>{topBadge}</strong>
                </div>
              </div>
            </section>

            <section className="candidate-panel">
              <div className="candidate-panel-header">
                <div>
                  <h3>Recent Results</h3>
                  <p>Your cumulative subject-wise performance.</p>
                </div>
              </div>

              {cumulativeResults.length === 0 ? (
                <div className="candidate-empty-state">
                  <p>
                    No assessment results yet. Start your first assessment to
                    see progress here.
                  </p>
                </div>
              ) : (
                <div className="candidate-results-grid">
                  {cumulativeResults.map((result) => (
                    <article
                      key={result.subject}
                      className="candidate-result-card"
                    >
                      <div className="candidate-result-top">
                        <h4>
                          {result.subject}{" "}
                          {result.offlineTaken ? (
                            <span
                              className="candidate-offline-verified"
                              title="Taken in offline mode"
                            >
                              <BadgeCheck size={16} />
                            </span>
                          ) : null}
                        </h4>
                        <span
                          className={
                            result.cumulativePercentage >= 60
                              ? "passed"
                              : "failed"
                          }
                        >
                          {result.cumulativePercentage}%
                        </span>
                      </div>
                      <p>
                        {result.badge !== "No Badge"
                          ? result.badge
                          : "No badge yet"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "tests" && (
          <div className="candidate-content-stack">
            <section className="candidate-panel">
              <div className="candidate-panel-header">
                <div>
                  <h3>Attended Tests</h3>
                  <p>
                    Assessments where you have already started or completed
                    sections.
                  </p>
                </div>
              </div>

              {testBuckets.attended.length === 0 ? (
                <div className="candidate-empty-state">
                  <p>You have not attended any tests yet.</p>
                </div>
              ) : (
                <div className="candidate-test-list">
                  {testBuckets.attended.map((test) => (
                    <article key={test.name} className="candidate-test-card">
                      <div>
                        <h4>{test.name}</h4>
                        <p>
                          {test.passedCount}/{test.totalSections || 0} sections
                          cleared
                        </p>
                      </div>
                      <div className="candidate-test-meta">
                        <span className="candidate-badge success">
                          <CircleCheck size={14} />
                          Attended
                        </span>
                        <strong>{test.progress}%</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="candidate-panel">
              <div className="candidate-panel-header">
                <div>
                  <h3>Non Attended Tests</h3>
                  <p>Available assessments you have not started yet.</p>
                </div>
              </div>

              {testBuckets.unattended.length === 0 ? (
                <div className="candidate-empty-state">
                  <p>
                    {candidate.assessmentAssignmentMessage ||
                      "No pending tests right now."}
                  </p>
                </div>
              ) : (
                <div className="candidate-test-list">
                  {testBuckets.unattended.map((test) => (
                    <article key={test.name} className="candidate-test-card">
                      <div>
                        <h4>{test.name}</h4>
                        <p>Ready to begin from section {test.nextLevel || 1}</p>
                      </div>
                      <div className="candidate-test-actions">
                        <span className="candidate-badge warning">
                          <Clock3 size={14} />
                          Not Attended
                        </span>
                        <button
                          type="button"
                          className="candidate-secondary-btn"
                          onClick={() => startAssessment(test.name)}
                        >
                          Start
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "profile" && (
          <section className="candidate-panel candidate-profile-panel">
            <div className="candidate-panel-header">
              <div>
                <h3>Profile</h3>
                <p>Your account details and professional summary.</p>
              </div>
              <div className="candidate-profile-cta-group">
                <button
                  type="button"
                  className="candidate-secondary-btn"
                  onClick={() => navigate("/candidate/profile/view")}
                >
                  <Eye size={16} />
                  View Full Profile
                </button>
                <button
                  type="button"
                  className="candidate-primary-btn candidate-primary-btn-inline"
                  onClick={() => navigate("/candidate/profile/edit")}
                >
                  <PencilLine size={16} />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="candidate-profile-grid">
              <div className="candidate-profile-photo-wrap">
                <img
                  src={profileSrc}
                  alt={candidate.fullName}
                  className="candidate-profile-photo"
                  onError={() => setProfileSrc(DEFAULT_PROFILE_IMAGE)}
                />
              </div>

              <div className="candidate-profile-details">
                <div className="candidate-profile-item">
                  <Mail size={16} />
                  <div>
                    <span>Email</span>
                    <strong>{candidate.email || "Not provided"}</strong>
                  </div>
                </div>
                <div className="candidate-profile-item">
                  <Phone size={16} />
                  <div>
                    <span>Phone</span>
                    <strong>{candidate.phoneNumber || "Not provided"}</strong>
                  </div>
                </div>
                <div className="candidate-profile-item">
                  <GraduationCap size={16} />
                  <div>
                    <span>Education</span>
                    <strong>
                      {candidate.collegeUniversity || "Not provided"}
                    </strong>
                  </div>
                </div>
                <div className="candidate-profile-item">
                  <Briefcase size={16} />
                  <div>
                    <span>Experience</span>
                    <strong>{candidate.experience ?? 0} years</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="candidate-skills-block">
              <h4>Skills</h4>
              <div className="candidate-skills-list">
                {formatSkills(candidate.skills).length ? (
                  formatSkills(candidate.skills).map((skill) => (
                    <span key={skill} className="candidate-skill-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills listed yet.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "jobs" && (
          <section className="candidate-panel jobs-module-shell">
            <div className="candidate-panel-header jobs-toolbar">
              <div>
                <h3>View Jobs</h3>
                <p>Explore the latest openings posted by HR partners.</p>
              </div>
              <span className="jobs-summary-badge">
                {jobs.length} Open Role{jobs.length === 1 ? "" : "s"}
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="jobs-empty-state">
                No jobs have been posted yet. Please check back shortly.
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
                      <th>Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const candidateJobStatus = getCandidateJobStatus(
                        job,
                        candidate,
                      );
                      const hasResponded = Boolean(candidateJobStatus);
                      const isOpen =
                        (job.status || JOB_STATUS.OPEN) === JOB_STATUS.OPEN;

                      return (
                        <tr key={job.id}>
                          <td className="jobs-row-title">
                            <strong>{job.title}</strong>
                            <div className="jobs-row-company">
                              {job.company || "Unknown company"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`job-status-badge status-${job.status || JOB_STATUS.OPEN}`}
                            >
                              {getCandidateJobAvailability(job.status)}
                            </span>
                          </td>
                          <td>
                            <span className="job-pill">
                              {job.type || "Not specified"}
                            </span>
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
                            <p className="jobs-description-text">
                              {job.description || "No description provided."}
                            </p>
                          </td>
                          <td className="jobs-posted-cell">
                            <strong>{job.postedBy || "HR Team"}</strong>
                            <span>{formatPostedDate(job.createdAt)}</span>
                          </td>
                          <td className="jobs-actions-cell">
                            <div className="job-interest-row">
                              <button
                                type="button"
                                className={`job-interest-btn interested ${candidateJobStatus === "interested" ? "active" : ""}`}
                                onClick={() =>
                                  updateJobInterest(job.id, "interested")
                                }
                                disabled={hasResponded || !isOpen}
                              >
                                <ThumbsUp size={15} />
                                I'm Interested
                              </button>
                              <button
                                type="button"
                                className={`job-interest-btn not-interested ${candidateJobStatus === "not_interested" ? "active" : ""}`}
                                onClick={() =>
                                  updateJobInterest(job.id, "not_interested")
                                }
                                disabled={hasResponded || !isOpen}
                              >
                                <ThumbsDown size={15} />
                                Not Interested
                              </button>
                            </div>
                            {hasResponded ? (
                              <div className="jobs-row-company">
                                Response submitted.
                              </div>
                            ) : !isOpen ? (
                              <div className="jobs-row-company">
                                This job is not accepting responses right now.
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "resume" && (
          <CandidateResumeModule
            candidate={candidate}
            showAlert={showAlert}
            onCandidateUpdate={handleCandidateProfileUpdate}
          />
        )}
      </main>
    </div>
  );
}