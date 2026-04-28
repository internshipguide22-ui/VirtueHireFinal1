import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import AdminLayout from './AdminLayout';
import {
  Users,
  Search,
  Download,
  Eye,
  Trash2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Award,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import './AdminDashboard.css'; // Reuse dashboard styles for consistency
import { useAppDialog } from '../common/AppDialog';

export default function CandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    assessed: 0,
    fresher: 0,
    experienced: 0
  });
  const { showAlert, showConfirm, dialogNode } = useAppDialog();

  const API_BASE = '/admin/candidates';

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_BASE);
      const list = res.data.candidates || [];
      setCandidates(list);

      // Calculate stats
      setStats({
        total: list.length,
        assessed: list.filter(c => c.assessmentTaken).length,
        fresher: list.filter(c => c.experienceLevel === 'Fresher').length,
        experienced: list.filter(c => c.experienceLevel !== 'Fresher').length
      });
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    const confirmed = await showConfirm({
      title: "Delete Candidate",
      message: `Delete candidate "${candidateName}"? This action cannot be undone.`,
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel"
    });
    if (!confirmed) {
      return;
    }

    setDeletingId(candidateId);
    try {
      await api.delete(`${API_BASE}/${candidateId}`);
      await fetchCandidates();
    } catch (err) {
      console.error("Error deleting candidate:", err);
      await showAlert({
        title: "Delete Failed",
        message: err.response?.data?.error || "Failed to delete candidate.",
        tone: "danger"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'assessed') return matchesSearch && c.assessmentTaken;
    if (filter === 'fresher') return matchesSearch && c.experienceLevel === 'Fresher';
    if (filter === 'experienced') return matchesSearch && c.experienceLevel !== 'Fresher';
    return matchesSearch;
  });

  if (loading) return (
    <div className="adm-loading-screen">
      <div className="adm-spinner"></div>
      <p>Loading candidate database...</p>
    </div>
  );

  return (
    <AdminLayout
      description="Review the candidate pool, audit assessment outcomes, and manage candidate records."
      actions={
        <button onClick={fetchCandidates} className="adm-refresh-btn">
          <RefreshCw size={18} /> Refresh List
        </button>
      }
    >
      {dialogNode}
      <div className="adm-dashboard-body">
        <div className="adm-header adm-subpage-header">
          <div className="adm-header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/admin/dashboard" className="adm-back-icon">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1>Candidate Management</h1>
                <p>Browse, filter and manage all platform candidates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <section className="adm-stats-grid" style={{ marginBottom: '24px' }}>
          <div className="adm-stat-card blue">
            <div className="adm-stat-icon"><Users size={20} /></div>
            <div className="adm-stat-content">
              <div className="adm-stat-value">{stats.total}</div>
              <div className="adm-stat-label">Total Registered</div>
            </div>
          </div>
          <div className="adm-stat-card green">
            <div className="adm-stat-icon"><Award size={20} /></div>
            <div className="adm-stat-content">
              <div className="adm-stat-value">{stats.assessed}</div>
              <div className="adm-stat-label">Assessments Done</div>
            </div>
          </div>
          <div className="adm-stat-card yellow">
            <div className="adm-stat-icon"><Calendar size={20} /></div>
            <div className="adm-stat-content">
              <div className="adm-stat-value">{stats.fresher}</div>
              <div className="adm-stat-label">Freshers</div>
            </div>
          </div>
          <div className="adm-stat-card purple">
            <div className="adm-stat-icon"><Briefcase size={20} /></div>
            <div className="adm-stat-content">
              <div className="adm-stat-value">{stats.experienced}</div>
              <div className="adm-stat-label">Experienced</div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <div className="adm-card shadow-sm" style={{ padding: '20px', marginBottom: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                className="adm-input"
                style={{ paddingLeft: '40px', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`adm-filter-pill ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >All</button>
              <button
                className={`adm-filter-pill ${filter === 'assessed' ? 'active' : ''}`}
                onClick={() => setFilter('assessed')}
              >Assessed</button>
              <button
                className={`adm-filter-pill ${filter === 'fresher' ? 'active' : ''}`}
                onClick={() => setFilter('fresher')}
              >Freshers</button>
              <button
                className={`adm-filter-pill ${filter === 'experienced' ? 'active' : ''}`}
                onClick={() => setFilter('experienced')}
              >Experienced</button>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="adm-card table-card">
          <div className="adm-table-container">
            <table>
              <thead>
                <tr>
                  <th>Candidate Info</th>
                  <th>Contact Details</th>
                  <th>Assessment Status</th>
                  <th>Experience</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="adm-t-name">{c.fullName}</div>
                        <div className="adm-t-sub">{c.qualification || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="adm-t-email"><Mail size={12} style={{ marginRight: '4px' }} /> {c.email}</div>
                        <div className="adm-t-phone"><Phone size={12} style={{ marginRight: '4px' }} /> {c.phoneNumber || 'N/A'}</div>
                      </td>
                      <td>
                        {c.assessmentTaken ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="adm-badge success">{c.score}% Score</span>
                            {c.badge && <span className="adm-t-badge">{c.badge}</span>}
                          </div>
                        ) : (
                          <span className="adm-badge secondary">Not Attempted</span>
                        )}
                      </td>
                      <td>
                        <div className="adm-t-level">{c.experienceLevel || 'Fresher'}</div>
                        <div className="adm-t-sub">{c.experience ? `${c.experience} years` : ''}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/admin/candidates/${c.id}`} className="adm-t-btn primary" title="View Profile">
                            <Eye size={16} />
                          </Link>
                          {c.resumePath && (
                            <a
                              href={`${API_BASE_URL}/admin/download/resume/${c.id}`}
                              className="adm-t-btn secondary"
                              title="Download Resume"
                              download
                            >
                              <Download size={16} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="adm-t-btn danger"
                            title="Delete Candidate"
                            onClick={() => handleDeleteCandidate(c.id, c.fullName)}
                            disabled={deletingId === c.id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                      <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <p>No candidates found matching your criteria.</p>
                      <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className="adm-t-btn" style={{ marginTop: '12px' }}>
                        Clear all filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .adm-filter-pill {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-filter-pill.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }
        .adm-back-icon {
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f1f5f9;
          transition: all 0.2s;
        }
        .adm-back-icon:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        .adm-t-btn.primary { background: #3b82f6; color: white; }
        .adm-t-btn.secondary { background: #10b981; color: white; }
        .adm-t-btn.danger { background: #ef4444; color: white; border: none; }
        .adm-badge.success { background: #dcfce7; color: #166534; }
        .adm-badge.secondary { background: #f1f5f9; color: #475569; }
      `}} />
      </div>
    </AdminLayout>
  );
}
