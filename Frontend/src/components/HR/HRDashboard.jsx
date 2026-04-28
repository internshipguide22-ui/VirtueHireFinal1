import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  LayoutDashboard,
  Users,
  LogOut,
  CheckCircle,
  AlertCircle,
  Clock,
  FileSearch,
  Search,
  RefreshCw,
  BriefcaseBusiness,
  PlusSquare,
  List,
  PencilLine,
  Trash2,
  X,
  Save
} from 'lucide-react';
import './HRDashboard.css';
import '../Jobs/JobsModule.css';
import { createJob, deleteJob, getInterestedCandidates, getJobs, JOB_STATUS, subscribeJobs, updateJob, updateJobStatus } from '../../utils/jobsStore';
import { ensureHrSubscription, syncStoredHrUser } from '../../utils/hrSubscription';
import { useAppDialog } from '../common/AppDialog';

const EMPTY_JOB_FORM = {
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  experience: '',
  skills: '',
  description: ''
};

const formatPostedDate = (value) => {
  if (!value) return 'Not available';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'Not available' : parsedDate.toLocaleDateString();
};

const HRDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [hr, setHr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalCandidates: 0,
    assessmentsTaken: 0,
    pendingApprovals: 0
  });

  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [scoreSort, setScoreSort] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [jobError, setJobError] = useState('');
  const [jobSuccess, setJobSuccess] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobForm, setEditJobForm] = useState(EMPTY_JOB_FORM);
  const [hrSubscription, setHrSubscription] = useState(null);
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobRoleFilter, setJobRoleFilter] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('');
  const { showConfirm, dialogNode } = useAppDialog();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setJobs(getJobs());
    const unsubscribe = subscribeJobs(setJobs);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const dashboardRes = await api.get('/hrs/dashboard');
      const hydratedHr = syncStoredHrUser(dashboardRes.data.hr);
      setHr(hydratedHr);
      setHrSubscription(ensureHrSubscription(hydratedHr || dashboardRes.data.hr));
      if (dashboardRes.data?.hr) {
        localStorage.setItem('current_hr_user', JSON.stringify(hydratedHr || dashboardRes.data.hr));
        localStorage.setItem('user', JSON.stringify(hydratedHr || dashboardRes.data.hr));
      }

      const candidatesRes = await api.get('/hrs/candidates');
      const allCandidates = candidatesRes.data.candidates || [];
      setCandidates(allCandidates);
      setAllCandidates(allCandidates);

      setStats({
        totalCandidates: allCandidates.length,
        assessmentsTaken: allCandidates.filter(c => c.hasAccess).length,
        pendingApprovals: allCandidates.filter(c => c.requestStatus === 'PENDING').length
      });
      setJobs(getJobs());

    } catch (err) {
      console.error('Error fetching data:', err);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/hrs/login');
      }
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = candidateSearch.trim().toLowerCase();
    const normalizedSkill = skillFilter.trim().toLowerCase();

    const filtered = allCandidates.filter((candidate) => {
      const fullName = candidate.fullName?.toLowerCase() || '';
      const role = candidate.role?.toLowerCase() || '';
      const experience = candidate.experience ?? 0;

      const matchesName = !normalizedSearch || fullName.includes(normalizedSearch);
      const matchesSkill = !normalizedSkill || role.includes(normalizedSkill);
      const matchesExperience =
        experienceFilter === 'all' ||
        (experienceFilter === '0-1' && experience <= 1) ||
        (experienceFilter === '1' && experience === 1) ||
        (experienceFilter === '2+' && experience >= 2) ||
        (experienceFilter === '3+' && experience >= 3);

      return matchesName && matchesSkill && matchesExperience;
    });

    if (scoreSort === 'asc') {
      return [...filtered].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    }

    if (scoreSort === 'desc') {
      return [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return filtered;
  }, [allCandidates, candidateSearch, skillFilter, experienceFilter, scoreSort]);

  const clearCandidateFilters = () => {
    setCandidateSearch('');
    setSkillFilter('');
    setExperienceFilter('all');
    setScoreSort('');
  };

  const handleJobInput = (event) => {
    const { name, value } = event.target;
    setJobForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleCreateJob = (event) => {
    event.preventDefault();
    setJobError('');
    setJobSuccess('');

    const requiredFields = ['title', 'company', 'location', 'description'];
    const hasMissingField = requiredFields.some((field) => !jobForm[field].trim());
    if (hasMissingField) {
      setJobError('Please complete title, company, location, and job description.');
      return;
    }

    createJob({
      ...jobForm,
      postedBy: hr?.fullName || 'HR Team'
    });

    setJobForm(EMPTY_JOB_FORM);
    setJobSuccess('Job created successfully. It is now visible across all portals.');
    setActiveTab('view-jobs');
  };

  const startEditJob = (job) => {
    setJobError('');
    setJobSuccess('');
    setEditingJobId(job.id);
    setEditJobForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      salary: job.salary || '',
      experience: job.experience || '',
      skills: job.skills || '',
      description: job.description || ''
    });
  };

  const cancelEditJob = () => {
    setEditingJobId(null);
    setEditJobForm(EMPTY_JOB_FORM);
  };

  const handleEditJobInput = (event) => {
    const { name, value } = event.target;
    setEditJobForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleUpdateJob = (event, jobId) => {
    event.preventDefault();
    const requiredFields = ['title', 'company', 'location', 'description'];
    const hasMissingField = requiredFields.some((field) => !editJobForm[field].trim());
    if (hasMissingField) {
      setJobError('Please complete title, company, location, and job description.');
      return;
    }

    updateJob(jobId, editJobForm);
    setJobSuccess('Job updated successfully.');
    cancelEditJob();
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = await showConfirm({
      title: 'Delete Job Post',
      message: 'Delete this job post? This will remove it from all portals.',
      tone: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;
    deleteJob(jobId);
    setJobSuccess('Job deleted successfully.');
    if (editingJobId === jobId) {
      cancelEditJob();
    }
  };

  const handleJobStatusChange = async (job, nextStatus) => {
    if (!job || !nextStatus || nextStatus === job.status) return;

    if (nextStatus === JOB_STATUS.CLOSED) {
      const closeConfirmed = await showConfirm({
        title: 'Close Job Post',
        message: 'Do you want to close this job post?',
        tone: 'warning',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel'
      });
      if (!closeConfirmed) {
        return;
      }

      const deleteConfirmed = await showConfirm({
        title: 'Delete Permanently',
        message: 'Do you want to permanently delete this job post?',
        tone: 'danger',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      });
      if (deleteConfirmed) {
        deleteJob(job.id);
        setJobSuccess('Job post deleted successfully.');
        if (editingJobId === job.id) {
          cancelEditJob();
        }
        return;
      }

      updateJobStatus(job.id, JOB_STATUS.CLOSED);
      setJobSuccess('Job status updated to Closed.');
      return;
    }

    updateJobStatus(job.id, nextStatus);
    setJobSuccess(`Job status updated to ${nextStatus === JOB_STATUS.PAUSED ? 'Paused' : 'Open'}.`);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = jobStatusFilter === 'all' || job.status === jobStatusFilter;
    const matchesRole = !jobRoleFilter.trim() || (job.title || '').toLowerCase().includes(jobRoleFilter.trim().toLowerCase());
    const matchesLocation = !jobLocationFilter.trim() || (job.location || '').toLowerCase().includes(jobLocationFilter.trim().toLowerCase());
    return matchesStatus && matchesRole && matchesLocation;
  });

  const handleLogout = async () => {
    try {
      await api.post('/hrs/logout');
      localStorage.clear();
      navigate('/hrs/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if API fails, clear local and redirect
      localStorage.clear();
      navigate('/hrs/login');
    }
  };

  if (loading) return (
    <div className="hcl-loading" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="hcl-spinner"></div>
      <p>Synchronizing with Virtue Intelligence...</p>
    </div>
  );

  return (
    <div className="hr-dashboard-wrapper">
      {dialogNode}
      {/* Sidebar */}
      <aside className="hr-sidebar">
        <div className="hr-sidebar-brand">
          <div className="hr-sidebar-mark">V</div>
          <div>
            <h1>VirtueHire</h1>
            <p>HR Workspace</p>
          </div>
        </div>

        <ul className="hr-nav-list">
          <li
            className={`hr-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li
            className={`hr-nav-item ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => {
              // We could navigate, but let's keep it SPA within the tab
              setActiveTab('candidates');
            }}
          >
            <Users size={20} /> Candidates
          </li>
          <li className={`hr-nav-group ${activeTab === 'create-job' || activeTab === 'view-jobs' ? 'open' : ''}`}>
            <button
              type="button"
              className={`hr-nav-item hr-nav-group-trigger ${activeTab === 'create-job' || activeTab === 'view-jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('view-jobs')}
            >
              <BriefcaseBusiness size={20} /> Job Portal
            </button>
            <div className="hr-nav-group-panel">
              <button
                type="button"
                className={`hr-sub-nav-item ${activeTab === 'create-job' ? 'active' : ''}`}
                onClick={() => setActiveTab('create-job')}
              >
                <PlusSquare size={18} /> Create a Job
              </button>
              <button
                type="button"
                className={`hr-sub-nav-item ${activeTab === 'view-jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('view-jobs')}
              >
                <List size={18} /> View Jobs
              </button>
            </div>
          </li>
        </ul>

        <div className="hr-sidebar-footer">
          <button className="hr-btn-logout" onClick={handleLogout}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hr-content-main">
        <section className="hr-hero">
          <div className="hr-hero-copy-block">
            <p className="hr-hero-eyebrow">HR WORKSPACE</p>
            <h2>Welcome back, HR!</h2>
            <p className="hr-hero-copy">
              Manage your recruitment flow, monitor candidate progress, and keep every hiring decision organized from one clean workspace.
            </p>
          </div>
          <div className="hr-hero-meta">
            {hrSubscription ? (
              <div className="hr-hero-badge">
                <BriefcaseBusiness size={16} />
                <span>
                  {hrSubscription.planLabel} • {hrSubscription.isExpired ? "Expired" : `${hrSubscription.remainingDays} day${hrSubscription.remainingDays === 1 ? "" : "s"} left`}
                </span>
              </div>
            ) : null}
            <div className="hr-hero-user">
              <strong>{hr?.fullName || 'HR Team'}</strong>
              <span>Talent operations dashboard</span>
            </div>
          </div>
        </section>

        {error && <div className="hrm-alert error"><AlertCircle size={18} /> {error}</div>}
        {hrSubscription ? (
          <div className={`hr-subscription-banner ${hrSubscription.isExpired ? 'expired' : ''}`}>
            <div>
              <strong>{hrSubscription.planLabel}</strong>
              <p>
                {hrSubscription.isExpired
                  ? 'Your HR module access period has ended. Renew to continue with uninterrupted HR access.'
                  : `Your HR module is active for ${hrSubscription.remainingDays} more day${hrSubscription.remainingDays === 1 ? '' : 's'}.`}
              </p>
            </div>
            <button
              type="button"
              className="hr-subscription-btn"
              onClick={() => navigate('/payments/plans?audience=hr')}
            >
              {hrSubscription.isExpired ? 'Renew Now' : 'Manage Subscription'}
            </button>
          </div>
        ) : null}
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="hr-overview-tab">
            <div className="hr-stats-grid">
              <div className="hr-stat-card">
                <div className="hr-stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}><Users size={24} /></div>
                <div className="hr-stat-info">
                  <h3>Total Talent Pool</h3>
                  <p>{stats.totalCandidates}</p>
                </div>
              </div>
              <div className="hr-stat-card">
                <div className="hr-stat-icon" style={{ background: '#f0fdf4', color: '#15803d' }}><CheckCircle size={24} /></div>
                <div className="hr-stat-info">
                  <h3>Approved Access</h3>
                  <p>{stats.assessmentsTaken}</p>
                </div>
              </div>
              <div className="hr-stat-card">
                <div className="hr-stat-icon" style={{ background: '#fff7ed', color: '#c2410c' }}><Clock size={24} /></div>
                <div className="hr-stat-info">
                  <h3>Pending Access Requests</h3>
                  <p>{stats.pendingApprovals}</p>
                </div>
              </div>
            </div>

            <section className="hr-panel">
              <div className="hr-panel-header">
                <div>
                  <h3>Recent Candidate Activity</h3>
                  <p>Track the latest candidate assessment progress and review status at a glance.</p>
                </div>
                <div className="hr-panel-icon">
                  <FileSearch size={18} />
                </div>
              </div>

              <div className="hr-table-shell">
                <div className="hr-table-container">
                  <table className="hr-data-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td>
                            <div className="hrm-user-info">
                              <div className="hrm-avatar">{c.fullName.charAt(0)}</div>
                              <div>
                                <div className="hrm-name">{c.fullName}</div>
                                <div className="hrm-email">{c.role || 'Candidate'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {c.requestStatus === 'APPROVED' ?
                              <span className="hrm-badge verified">Approved</span> :
                              c.requestStatus === 'PENDING' ?
                                <span className="hrm-badge pending">Pending</span> :
                              <span className="hrm-badge pending">Restricted</span>}
                          </td>
                          <td>
                            <button
                              className="hcl-btn-view hr-view-btn"
                              onClick={() => navigate(`/hr/candidate/${c.id}`, {
                                state: {
                                  candidate: c,
                                  from: '/hr/dashboard',
                                  fromTab: 'overview'
                                }
                              })}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="hr-section-card">
            <div className="hr-section-header">
              <h2>Talent Pool</h2>
            </div>
            <div className="hr-candidate-filters">
              <div className="hr-filter-input-wrap">
                <Search size={18} className="hr-filter-icon" />
                <input
                  type="text"
                  className="hr-filter-input"
                  placeholder="Search by candidate name..."
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                />
              </div>

              <input
                type="text"
                className="hr-filter-input"
                placeholder="Filter by role, e.g. Candidate"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
              />

              <select
                className="hr-filter-select"
                value={experienceFilter}
                onChange={(event) => setExperienceFilter(event.target.value)}
              >
                <option value="all">All Experience</option>
                <option value="0-1">0-1 Year</option>
                <option value="1">1 Year</option>
                <option value="2+">2+ Years</option>
                <option value="3+">3+ Years</option>
              </select>

              <select
                className="hr-filter-select"
                value={scoreSort}
                onChange={(event) => setScoreSort(event.target.value)}
              >
                <option value="">Score Sort</option>
                <option value="desc">Highest Score</option>
                <option value="asc">Lowest Score</option>
              </select>

              <button
                type="button"
                className="hr-filter-reset"
                onClick={clearCandidateFilters}
              >
                <RefreshCw size={16} />
                Clear
              </button>
            </div>
            <div className="hr-table-container">
              <table className="hr-data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Experience</th>
                    <th>Role</th>
                    <th>Access</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="hrm-user-info">
                          <div className="hrm-name">{c.fullName}</div>
                        </div>
                      </td>
                      <td>{c.experience ?? 0} Years</td>
                      <td>{c.role || 'Candidate'}</td>
                      <td>
                        <span className="hr-plan-badge">
                          {c.requestStatus === 'APPROVED' ? 'Approved' :
                            c.requestStatus === 'PENDING' ? 'Pending' :
                              c.requestStatus === 'REJECTED' ? 'Rejected' : 'Restricted'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="hcl-btn-view"
                          style={{ padding: '6px 12px' }}
                          onClick={() => navigate(`/hr/candidate/${c.id}`, {
                            state: {
                              candidate: c,
                              from: '/hr/dashboard',
                              fromTab: 'candidates'
                            }
                          })}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="hr-candidate-empty">
                        No candidates found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create-job' && (
          <section className="hr-section-card">
            <div className="hr-section-header">
              <h2>Create a Job</h2>
              <p>Publish a new role for candidates and platform admins to view instantly.</p>
            </div>

            {jobError && <div className="hrm-alert error"><AlertCircle size={18} /> {jobError}</div>}
            {jobSuccess && <div className="hrm-alert success"><CheckCircle size={18} /> {jobSuccess}</div>}

            <form className="hr-job-form" onSubmit={handleCreateJob}>
              <div className="hr-job-grid">
                <label className="hr-job-field">
                  <span>Job Title *</span>
                  <input
                    type="text"
                    name="title"
                    value={jobForm.title}
                    onChange={handleJobInput}
                    placeholder="e.g. Frontend Developer"
                  />
                </label>

                <label className="hr-job-field">
                  <span>Company *</span>
                  <input
                    type="text"
                    name="company"
                    value={jobForm.company}
                    onChange={handleJobInput}
                    placeholder="e.g. VirtueHire Pvt Ltd"
                  />
                </label>

                <label className="hr-job-field">
                  <span>Location *</span>
                  <input
                    type="text"
                    name="location"
                    value={jobForm.location}
                    onChange={handleJobInput}
                    placeholder="e.g. Hyderabad / Remote"
                  />
                </label>

                <label className="hr-job-field">
                  <span>Job Type</span>
                  <select name="type" value={jobForm.type} onChange={handleJobInput}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </label>

                <label className="hr-job-field">
                  <span>Salary Range</span>
                  <input
                    type="text"
                    name="salary"
                    value={jobForm.salary}
                    onChange={handleJobInput}
                    placeholder="e.g. 6 LPA - 10 LPA"
                  />
                </label>

                <label className="hr-job-field">
                  <span>Experience</span>
                  <input
                    type="text"
                    name="experience"
                    value={jobForm.experience}
                    onChange={handleJobInput}
                    placeholder="e.g. 2+ years"
                  />
                </label>
              </div>

              <label className="hr-job-field">
                <span>Skills</span>
                <input
                  type="text"
                  name="skills"
                  value={jobForm.skills}
                  onChange={handleJobInput}
                  placeholder="e.g. React, JavaScript, REST APIs"
                />
              </label>

              <label className="hr-job-field">
                <span>Job Description *</span>
                <textarea
                  rows={5}
                  name="description"
                  value={jobForm.description}
                  onChange={handleJobInput}
                  placeholder="Describe role responsibilities, team context, and expectations."
                />
              </label>

              <button type="submit" className="hr-job-submit">
                <PlusSquare size={18} /> Publish Job
              </button>
            </form>
          </section>
        )}

        {activeTab === 'view-jobs' && (
          <section className="hr-section-card jobs-module-shell">
            <div className="hr-section-header jobs-toolbar">
              <div>
                <h2>View Jobs</h2>
                <p>All roles posted by HR. These are visible in Candidate and Admin portals too.</p>
              </div>
              <span className="jobs-summary-badge">{jobs.length} Active Job{jobs.length === 1 ? '' : 's'}</span>
            </div>
            {jobError && <div className="hrm-alert error"><AlertCircle size={18} /> {jobError}</div>}
            {jobSuccess && <div className="hrm-alert success"><CheckCircle size={18} /> {jobSuccess}</div>}

            {jobs.length === 0 ? (
              <div className="jobs-empty-state">
                No jobs published yet. Use <strong>Create a Job</strong> to publish your first role.
              </div>
            ) : (
              <>
                <div className="jobs-filter-row">
                  <select value={jobStatusFilter} onChange={(event) => setJobStatusFilter(event.target.value)} className="jobs-filter-input">
                    <option value="all">All Status</option>
                    <option value={JOB_STATUS.OPEN}>Open</option>
                    <option value={JOB_STATUS.PAUSED}>Paused</option>
                    <option value={JOB_STATUS.CLOSED}>Closed</option>
                  </select>
                  <input
                    type="text"
                    value={jobRoleFilter}
                    onChange={(event) => setJobRoleFilter(event.target.value)}
                    className="jobs-filter-input"
                    placeholder="Filter by role"
                  />
                  <input
                    type="text"
                    value={jobLocationFilter}
                    onChange={(event) => setJobLocationFilter(event.target.value)}
                    className="jobs-filter-input"
                    placeholder="Filter by location"
                  />
                </div>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="hr-candidate-empty">
                          No jobs match the selected filters.
                        </td>
                      </tr>
                    ) : filteredJobs.map((job) => (
                      editingJobId === job.id ? (
                        <tr key={job.id}>
                          <td colSpan="9">
                            <form className="hr-job-edit-form" onSubmit={(event) => handleUpdateJob(event, job.id)}>
                              <div className="hr-job-grid">
                                <label className="hr-job-field">
                                  <span>Job Title *</span>
                                  <input name="title" value={editJobForm.title} onChange={handleEditJobInput} />
                                </label>
                                <label className="hr-job-field">
                                  <span>Company *</span>
                                  <input name="company" value={editJobForm.company} onChange={handleEditJobInput} />
                                </label>
                                <label className="hr-job-field">
                                  <span>Location *</span>
                                  <input name="location" value={editJobForm.location} onChange={handleEditJobInput} />
                                </label>
                                <label className="hr-job-field">
                                  <span>Job Type</span>
                                  <select name="type" value={editJobForm.type} onChange={handleEditJobInput}>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                  </select>
                                </label>
                                <label className="hr-job-field">
                                  <span>Salary Range</span>
                                  <input name="salary" value={editJobForm.salary} onChange={handleEditJobInput} />
                                </label>
                                <label className="hr-job-field">
                                  <span>Experience</span>
                                  <input name="experience" value={editJobForm.experience} onChange={handleEditJobInput} />
                                </label>
                              </div>
                              <label className="hr-job-field">
                                <span>Skills</span>
                                <input name="skills" value={editJobForm.skills} onChange={handleEditJobInput} />
                              </label>
                              <label className="hr-job-field">
                                <span>Job Description *</span>
                                <textarea rows={4} name="description" value={editJobForm.description} onChange={handleEditJobInput} />
                              </label>
                              <div className="hr-job-action-row">
                                <button type="submit" className="hr-job-submit hr-job-submit-inline">
                                  <Save size={16} /> Save
                                </button>
                                <button type="button" className="hr-job-cancel-btn" onClick={cancelEditJob}>
                                  <X size={16} /> Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={job.id}>
                          <td className="jobs-row-title">
                            <strong>{job.title}</strong>
                            <div className="jobs-row-company">{job.company || 'Unknown company'}</div>
                          </td>
                          <td>
                            <select
                              value={job.status || JOB_STATUS.OPEN}
                              onChange={(event) => handleJobStatusChange(job, event.target.value)}
                              className="jobs-filter-input jobs-status-select"
                            >
                              <option value={JOB_STATUS.OPEN}>Open</option>
                              <option value={JOB_STATUS.PAUSED}>Paused</option>
                              <option value={JOB_STATUS.CLOSED}>Closed</option>
                            </select>
                          </td>
                          <td>
                            <span className="job-pill">{job.type || 'Not specified'}</span>
                          </td>
                          <td>{job.location || 'Not specified'}</td>
                          <td>{job.experience || 'Not specified'}</td>
                          <td>{job.salary || 'Not specified'}</td>
                          <td className="jobs-description-cell">
                            {job.skills ? (
                              <p className="jobs-description-skills">
                                <strong>Skills:</strong> {job.skills}
                              </p>
                            ) : null}
                            <p className="jobs-description-text">{job.description || 'No description provided.'}</p>
                          </td>
                          <td className="jobs-posted-cell">
                            <strong>{job.postedBy || 'HR Team'}</strong>
                            <span>{formatPostedDate(job.createdAt)}</span>
                          </td>
                          <td className="jobs-actions-cell">
                            <div className="job-manage-row">
                              <button
                                type="button"
                                className="interested-toggle-btn"
                                onClick={() => navigate('/hr/interested-candidates', {
                                  state: {
                                    selectedJobId: job.id,
                                    selectedJobTitle: job.title
                                  }
                                })}
                              >
                                <Users size={15} />
                                Interested Candidates ({getInterestedCandidates(job).length})
                              </button>
                            </div>
                            <div className="hr-job-action-row">
                              <button type="button" className="hr-job-edit-btn" onClick={() => startEditJob(job)}>
                                <PencilLine size={16} /> Edit
                              </button>
                              <button type="button" className="hr-job-delete-btn" onClick={() => handleDeleteJob(job.id)}>
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </section>
        )}

      </main>
    </div>
  );
};

export default HRDashboard;
