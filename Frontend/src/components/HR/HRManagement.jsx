import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../Admin/AdminLayout';
import { Check, X, User, Building2, Mail, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import './HRManagement.css';
import { API_BASE_URL } from '../../config';
import { useAppDialog } from '../common/AppDialog';

export default function HRManagement() {
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, hrId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { showConfirm, dialogNode } = useAppDialog();

  // API Base URL - points to Virtue-Candidate backend
  const API_BASE = '/admin/hrs';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterFromUrl = params.get('filter') || 'all';
    setFilter(filterFromUrl);
    fetchHrs(filterFromUrl);
  }, [location.search]);

  const fetchHrs = async (filterValue = filter) => {
    setLoading(true);
    try {
      const response = await api.get(`${API_BASE}?filter=${filterValue}`);
      // Backend returns Map.of("hrs", hrs), so we need response.data.hrs
      setHrs(response.data.hrs || []);
    } catch (err) {
      showMsg('error', 'Failed to load HR data from server.');
      console.error(err);
      setHrs([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/admin/verify/${id}`);
      await fetchHrs(filter);
      showMsg('success', 'HR account successfully verified!');
    } catch (err) {
      showMsg('error', 'Failed to verify HR account.');
      console.error(err);
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      // Assuming unverify logic for rejection in this demo
      await api.post(`/admin/unverify/${rejectModal.hrId}`, { reason: rejectReason });
      await fetchHrs(filter);
      showMsg('info', `Verification rejected. Reason: ${rejectReason}`);
      setRejectModal({ open: false, hrId: null });
      setRejectReason('');
    } catch (err) {
      showMsg('error', 'Failed to reject HR verification.');
      console.error(err);
    }
  };

  const handleDeleteHr = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Delete HR Account',
      message: `Delete HR account for ${name || 'this user'}? This action cannot be undone.`,
      tone: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    try {
      await api.delete(`/admin/hrs/${id}`);
      await fetchHrs(filter);
      showMsg('success', 'HR account deleted successfully.');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed to delete HR account.');
      console.error(err);
    }
  };

  const filteredHrs = hrs.filter(hr => {
    if (filter === 'verified') return hr.verified;
    if (filter === 'unverified') return hr.emailVerified && !hr.verified;
    return true;
  });

  return (
    <AdminLayout
      description="Review HR registrations, verify partner accounts, and keep access aligned with platform policies."
      actions={
        <button onClick={fetchHrs} className="adm-refresh-btn" title="Refresh Data">
          <RefreshCw size={18} className={loading ? 'spinning' : ''} /> Refresh
        </button>
      }
    >
      {dialogNode}
      <div className="hrm-container hrm-admin-shell">
        <header className="hrm-header">
          <div className="hrm-header-title">
            <h1>HR Account Management</h1>
            <p>Review and verify HR professional accounts for Virtue Hire platform</p>
          </div>
        </header>

        {/* Status Messages */}
        {message.text && (
          <div className={`hrm-alert ${message.type}`}>
            {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="hrm-filters">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All Accounts
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={filter === 'unverified' ? 'active' : ''}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={filter === 'verified' ? 'active' : ''}
          >
            Verified HRs
          </button>
        </div>

        {/* Table/Cards Container */}
        <div className="hrm-content-card">
          <div className="hrm-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>HR Professional</th>
                  <th>Company Details</th>
                  <th>ID Proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="hrm-empty-state">
                      <div className="hrm-loader"></div>
                      <p>Fetching HR data...</p>
                    </td>
                  </tr>
                ) : filteredHrs.length > 0 ? (
                  filteredHrs.map((hr) => (
                    <tr key={hr.id}>
                      <td>
                        <div className="hrm-user-info">
                          <div className="hrm-avatar">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="hrm-name">{hr.fullName}</div>
                            <div className="hrm-email">
                              <Mail size={12} /> {hr.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="hrm-company">
                          <Building2 size={16} />
                          <span>{hr.companyName || 'N/A'}</span>
                        </div>
                        <div className="hrm-job-title">{hr.jobTitle || 'HR Manager'}</div>
                      </td>
                      <td>
                        {hr.idProofPath ? (
                          <a
                            href={`${API_BASE_URL}/hrs/file/${hr.idProofPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hrm-proof-link"
                          >
                            <ExternalLink size={16} />
                            View Document
                          </a>
                        ) : (
                          <span className="hrm-no-proof">No Proof Uploaded</span>
                        )}
                      </td>
                      <td>
                        {hr.verified ? (
                          <span className="hrm-badge verified">Verified</span>
                        ) : hr.emailVerified ? (
                          <span className="hrm-badge pending">Pending Admin Approval</span>
                        ) : (
                          <span className="hrm-badge pending">Pending Email Verification</span>
                        )}
                      </td>
                      <td>
                        <div className="hrm-actions">
                          {!hr.verified ? (
                            <>
                              <button
                                onClick={() => handleVerify(hr.id)}
                                className="hrm-btn verify"
                                title="Approve Account"
                              >
                                <Check size={18} />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => setRejectModal({ open: true, hrId: hr.id })}
                                className="hrm-btn reject"
                                title="Reject Account"
                              >
                                <X size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteHr(hr.id, hr.fullName)}
                                className="hrm-btn delete"
                                title="Delete HR Account"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="hrm-verified-mark">
                                <Check size={18} />
                                <span>Approved</span>
                              </div>
                              <button
                                onClick={() => handleDeleteHr(hr.id, hr.fullName)}
                                className="hrm-btn delete"
                                title="Delete HR Account"
                              >
                                <Trash2 size={18} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="hrm-empty-state">
                      <User size={48} />
                      <p>No HR accounts found matching this filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hrm-footer">
          <Link to="/admin/dashboard" className="hrm-back-link">
            &larr; Back to Admin Dashboard
          </Link>
        </div>
      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal">
            <div className="hrm-modal-header">
              <h3>Reject HR Verification</h3>
              <button onClick={() => setRejectModal({ open: false, hrId: null })}><X size={20} /></button>
            </div>
            <div className="hrm-modal-body">
              <p>Please provide a specific reason for rejecting this HR professional's account request.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., ID proof image is blurred or invalid..."
                rows="4"
              />
            </div>
            <div className="hrm-modal-footer">
              <button
                className="hrm-modal-btn secondary"
                onClick={() => setRejectModal({ open: false, hrId: null })}
              >
                Cancel
              </button>
              <button
                className="hrm-modal-btn primary reject"
                disabled={!rejectReason.trim()}
                onClick={submitReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
