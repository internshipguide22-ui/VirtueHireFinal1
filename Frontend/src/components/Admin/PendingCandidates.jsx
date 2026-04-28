import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { WS_BASE_URL } from '../../config';

const PendingCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/candidates/pending")
      .then((res) => {
        setCandidates(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load pending candidates.");
        setLoading(false);
      });
  }, []);

  const handleApprove = (id) => {
    api
      .post(`/admin/candidates/approve/${id}`, {})
      .then(() => {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      })
      .catch((err) => console.error(err));
  };

  const handleReject = (id, reason) => {
    api
      .post(`/admin/candidates/reject/${id}`, { reason })
      .then(() => {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p>Loading candidates...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><i className="fas fa-user-clock me-2"></i>Pending Candidate Verification</h1>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fas fa-check-circle fa-2x mb-2"></i>
          <p>No pending candidate verifications</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              Candidates Waiting for Verification <span className="badge bg-danger">{candidates.length}</span>
            </h5>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>College/University</th>
                  <th>Graduation Year</th>
                  <th>ID Card</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.id}</td>
                    <td>{candidate.fullName}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.phoneNumber}</td>
                    <td>{candidate.collegeUniversity}</td>
                    <td>{candidate.yearOfGraduation}</td>
                    <td>
                      {candidate.idCardPath ? (
                        <a
                          href={`${WS_BASE_URL}/candidates/file/${candidate.idCardPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-eye me-1"></i>View ID
                        </a>
                      ) : (
                        <span className="text-muted">No ID</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => handleApprove(candidate.id)}
                          className="btn btn-success"
                        >
                          <i className="fas fa-check me-1"></i>Approve
                        </button>

                        {/* Reject Button triggers prompt for reason */}
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            const reason = prompt(`Reject ${candidate.fullName}? Enter reason:`);
                            if (reason) handleReject(candidate.id, reason);
                          }}
                        >
                          <i className="fas fa-times me-1"></i>Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCandidates;
