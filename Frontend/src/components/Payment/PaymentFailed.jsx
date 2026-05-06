import React from "react";
import { useNavigate } from "react-router-dom";

function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f8fafc",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 12px", color: "#b91c1c" }}>
          Subscription Activation Failed
        </h2>
        <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
          We could not activate the selected HR subscription. Please try again
          from the plans screen.
        </p>
        <button
          type="button"
          onClick={() => navigate("/payments/plans?audience=hr")}
          style={{
            border: "none",
            background: "#2563eb",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 18px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Plans
        </button>
      </div>
    </div>
  );
}

export default PaymentFailed;
