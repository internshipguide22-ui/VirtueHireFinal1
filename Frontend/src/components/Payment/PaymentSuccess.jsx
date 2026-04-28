import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const subscription = location.state?.subscription;
  const isFreeTrial = subscription?.planType === "FREE_TRIAL_3_MONTHS";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", padding: "20px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 12px", color: "#166534" }}>
          {isFreeTrial ? "Free Trial Activated" : "Subscription Activated"}
        </h2>
        <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
          {isFreeTrial
            ? "Your HR module free trial is now active."
            : "Your HR module subscription is now active."}
          {subscription?.planLabel ? ` ${subscription.planLabel} has been applied successfully.` : ""}
        </p>

        {subscription ? (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "18px",
              textAlign: "left",
              marginBottom: "20px",
            }}
          >
            <div><strong>Plan:</strong> {subscription.planLabel}</div>
            <div><strong>Duration:</strong> {subscription.durationDays} days</div>
            <div><strong>Ends on:</strong> {new Date(subscription.endsAt).toLocaleDateString()}</div>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => navigate("/hr/dashboard")}
            style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: "12px", padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}
          >
            Go to HR Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/payments/plans?audience=hr")}
            style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#334155", borderRadius: "12px", padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
