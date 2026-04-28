import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import "../VerifyEmail.css";

export default function CandidateOtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email") || localStorage.getItem("pendingVerificationEmail") || "";
    setEmail(emailFromQuery);
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setStatus({ type: "error", msg: "Missing candidate email. Please register again." });
      return;
    }

    if (code.trim().length !== 6) {
      setStatus({ type: "error", msg: "Please enter a valid 6-digit OTP." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const response = await api.post("/candidates/verify-otp", {
        email,
        code: code.trim(),
      });

      localStorage.removeItem("pendingVerificationEmail");
      setStatus({
        type: "success",
        msg: response.data.message || "Email verified successfully. You can now log in.",
      });

      setTimeout(() => {
        navigate("/candidate/login", { state: { verifiedEmail: email } });
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        msg: error.response?.data?.error || "OTP verification failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setStatus({ type: "error", msg: "Missing candidate email. Please register again." });
      return;
    }

    setResending(true);
    setStatus({ type: "", msg: "" });

    try {
      const response = await api.post("/candidates/resend-otp", { email });
      setStatus({
        type: "success",
        msg: response.data.message || "A new OTP has been sent to your email.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        msg: error.response?.data?.error || "Failed to resend OTP. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="vfy-page">
      <div className="vfy-card">
        <div className="vfy-icon-box">
          <ShieldCheck size={48} className="vfy-main-icon" />
        </div>

        <h1 className="vfy-title">Verify Candidate Email</h1>
        <p className="vfy-subtitle">
          We sent a 6-digit OTP to <span className="vfy-email-highlight">{email || "your email"}</span>.
          Enter it below to activate your candidate account.
        </p>

        {status.msg && (
          <div className={`vfy-alert ${status.type}`}>
            {status.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vfy-form">
          <div className="vfy-input-group">
            <input
              type="text"
              maxLength="6"
              placeholder="0 0 0 0 0 0"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              className="vfy-code-input"
              disabled={loading || status.type === "success"}
            />
          </div>

          <button
            type="submit"
            className="vfy-submit-btn"
            disabled={loading || status.type === "success"}
          >
            {loading ? "Verifying..." : "Verify OTP"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="vfy-footer">
          <p>Didn't receive the email?</p>
          <button
            type="button"
            className="vfy-resend-btn"
            onClick={handleResendOtp}
            disabled={resending || loading || status.type === "success"}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <button
          type="button"
          className="vfy-resend-btn"
          onClick={() => navigate("/candidate/login")}
          style={{ marginTop: "12px" }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
}
