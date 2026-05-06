import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/history");
        const data = res.data || [];

        const totalPayments = data.length;
        const successfulPayments = data.filter(
          (p) => p.status === "SUCCESS",
        ).length;
        const failedPayments = totalPayments - successfulPayments;
        const totalRevenue = data.reduce((sum, p) => sum + (p.amount || 0), 0);

        setPayments(data);
        setStats({
          totalPayments,
          successfulPayments,
          failedPayments,
          totalRevenue,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load payments.");
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "SUCCESS":
        return "badge bg-success";
      case "FAILED":
        return "badge bg-danger";
      case "PENDING":
        return "badge bg-warning";
      default:
        return "badge bg-secondary";
    }
  };

  if (loading) return <p>Loading payment dashboard...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container-fluid my-4">
      <h1 className="mb-4">
        <i className="fas fa-chart-line me-2"></i>Payment Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-primary">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5>{stats.totalRevenue.toFixed(2)}</h5>
                <p>Total Revenue</p>
              </div>
              <i className="fas fa-rupee-sign fa-2x"></i>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-success">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5>{stats.totalPayments}</h5>
                <p>Total Payments</p>
              </div>
              <i className="fas fa-receipt fa-2x"></i>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5>{stats.successfulPayments}</h5>
                <p>Successful</p>
              </div>
              <i className="fas fa-check-circle fa-2x"></i>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-danger">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5>{stats.failedPayments}</h5>
                <p>Failed</p>
              </div>
              <i className="fas fa-times-circle fa-2x"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Transactions</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>HR Name</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.hr?.fullName || "N/A"}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {payment.planType}
                      </span>
                    </td>
                    <td>₹{payment.amount?.toFixed(2)}</td>
                    <td>
                      <span className={getStatusClass(payment.status)}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() =>
                          navigate(`/admin/payments/${payment.id}`)
                        }
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    <i className="fas fa-inbox fa-2x mb-2"></i>
                    <p>No transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Data Export</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <button className="btn btn-outline-primary w-100">
                <i className="fas fa-file-excel me-2"></i>Export to Excel
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-success w-100">
                <i className="fas fa-file-csv me-2"></i>Export to CSV
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-info w-100">
                <i className="fas fa-chart-bar me-2"></i>Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
