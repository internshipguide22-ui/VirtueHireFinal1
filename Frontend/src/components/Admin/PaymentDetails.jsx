import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

const PaymentDetails = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/payments/${id}`)
      .then((res) => {
        setPayment(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load payment details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading payment details...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!payment) return <p>No payment found.</p>;

  return (
    <div className="container my-4">
      <h1>Payment Details</h1>
      <div className="card mb-3">
        <div className="card-body">
          <p>
            <strong>Payment ID:</strong> {payment.id}
          </p>
          <p>
            <strong>HR Name:</strong> {payment.hr?.fullName || "N/A"}
          </p>
          <p>
            <strong>Plan Type:</strong> {payment.planType}
          </p>
          <p>
            <strong>Amount:</strong> ₹{payment.amount?.toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {payment.status}
          </p>
          <p>
            <strong>Transaction ID:</strong> {payment.paymentGatewayId}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(payment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <Link to="/admin/payments" className="btn btn-secondary">
        <i className="fas fa-arrow-left me-2"></i>Back to Payments
      </Link>
    </div>
  );
};

export default PaymentDetails;
