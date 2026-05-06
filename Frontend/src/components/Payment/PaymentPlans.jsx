import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  HR_SUBSCRIPTION_PLANS,
  activateHrSubscription,
  getHrIdentity,
  getHrSubscription,
  syncStoredHrUser,
} from "../../utils/hrSubscription";

function PaymentPlans() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const audience = searchParams.get("audience") || "hr";
  const emailFromQuery = searchParams.get("email") || "";

  const currentHr = (() => {
    try {
      return JSON.parse(localStorage.getItem("current_hr_user") || "null");
    } catch {
      return null;
    }
  })();

  const identity = getHrIdentity(currentHr) || emailFromQuery;
  const currentSubscription = identity ? getHrSubscription(identity) : null;
  const isFreeTrialActive =
    currentSubscription?.planType === "FREE_TRIAL_3_MONTHS" &&
    !currentSubscription?.isExpired;

  const handleChoosePlan = (planType) => {
    if (!identity) {
      navigate("/hrs/register");
      return;
    }

    if (isFreeTrialActive && planType !== "FREE_TRIAL_3_MONTHS") {
      return;
    }

    const subscription = activateHrSubscription(identity, planType);
    if (currentHr) {
      syncStoredHrUser(currentHr);
    }

    navigate("/payments/success", {
      state: {
        audience,
        subscription,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "48px 20px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
            color: "#fff",
            borderRadius: "28px",
            padding: "36px",
            boxShadow: "0 24px 50px rgba(37, 99, 235, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <ShieldCheck size={22} />
            <strong>VirtueHire HR Subscription</strong>
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: "2.1rem" }}>
            Choose how long the HR module stays active
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: "780px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            HR access is free for the first 3 months. After that, continue with
            a 1 month, 3 months, or 1 year subscription. This subscription
            applies only to the HR module.
          </p>
          {isFreeTrialActive ? (
            <p
              style={{
                margin: "14px 0 0",
                maxWidth: "780px",
                lineHeight: 1.7,
                color: "#bfdbfe",
                fontWeight: 600,
              }}
            >
              Your free 3-month trial is currently active. Paid subscriptions
              become available after this trial ends.
            </p>
          ) : null}
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {HR_SUBSCRIPTION_PLANS.map((plan) => {
            const isLockedByTrial =
              isFreeTrialActive && plan.type !== "FREE_TRIAL_3_MONTHS";
            const isCurrentPlan =
              currentSubscription?.planType === plan.type &&
              !currentSubscription?.isExpired;
            const isFreeTrialCurrentPlan =
              isCurrentPlan && plan.type === "FREE_TRIAL_3_MONTHS";

            return (
              <article
                key={plan.type}
                style={{
                  background: "#fff",
                  borderRadius: "22px",
                  padding: "24px",
                  border:
                    plan.type === "FREE_TRIAL_3_MONTHS"
                      ? "2px solid #60a5fa"
                      : "1px solid #e2e8f0",
                  boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  opacity: isLockedByTrial ? 0.72 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.15rem",
                        color: "#0f172a",
                      }}
                    >
                      {plan.label}
                    </h3>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#64748b",
                        fontSize: "0.92rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {plan.description}
                    </p>
                  </div>
                  {isCurrentPlan ? (
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: "#dcfce7",
                        color: "#166534",
                        fontWeight: 700,
                        fontSize: "0.76rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Active Now
                    </span>
                  ) : plan.type === "FREE_TRIAL_3_MONTHS" ? (
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontWeight: 700,
                        fontSize: "0.76rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Default
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {plan.priceLabel}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  <CalendarDays size={16} />
                  <span>{plan.durationDays} days access</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    color: "#475569",
                    fontSize: "0.88rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Applies only to the HR module</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Shows remaining days inside HR dashboard</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Can be renewed anytime</span>
                  </div>
                  {isLockedByTrial ? (
                    <div
                      style={{ display: "flex", gap: "8px", color: "#92400e" }}
                    >
                      <CheckCircle2 size={16} color="#d97706" />
                      <span>Available after the 3-month free trial ends</span>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleChoosePlan(plan.type)}
                  disabled={isFreeTrialCurrentPlan}
                  style={{
                    marginTop: "auto",
                    border: "none",
                    borderRadius: "14px",
                    padding: "13px 16px",
                    background: isFreeTrialCurrentPlan
                      ? "#94a3b8"
                      : plan.type === "FREE_TRIAL_3_MONTHS"
                        ? "#2563eb"
                        : "#0f172a",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: isFreeTrialCurrentPlan ? "not-allowed" : "pointer",
                  }}
                >
                  {isFreeTrialCurrentPlan
                    ? "Currently Active"
                    : isLockedByTrial
                      ? "Activate After Trial"
                      : plan.type === "FREE_TRIAL_3_MONTHS"
                        ? "Start Free Access"
                        : "Activate After Trial"}
                </button>
              </article>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(currentHr ? "/hr/dashboard" : "/hrs/register")
            }
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              borderRadius: "12px",
              padding: "12px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {currentHr ? "Back to HR Dashboard" : "Back to HR Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPlans;
