import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Key } from "lucide-react";
import api from "../../services/api";

const styles = `
  .vh-auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4A5FC8 0%, #3d50b5 100%);
    padding: 20px;
    font-family: 'Inter', sans-serif;
  }

  .vh-auth-card {
    width: 100%;
    max-width: 450px;
    background: #ffffff;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .vh-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 24px;
    transition: color 0.2s;
    padding: 0;
  }

  .vh-back-btn:hover {
    color: #4f46e5;
  }

  .vh-auth-title {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .vh-auth-subtitle {
    font-size: 0.9375rem;
    color: #64748b;
    margin-bottom: 32px;
  }

  .vh-form-group {
    margin-bottom: 20px;
  }

  .vh-form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  .vh-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .vh-input-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
  }

  .vh-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    font-size: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.2s;
  }

  .vh-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }

  .auth-input-readonly {
    background-color: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }

  .vh-submit-btn {
    width: 100%;
    padding: 14px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 16px;
  }

  .vh-submit-btn:hover:not(:disabled) {
    background: #4338ca;
  }

  .vh-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .vh-alert {
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 24px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .vh-alert-success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .vh-alert-error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
`;

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const emailFromLink = queryParams.get("email");

  const [email, setEmail] = useState(emailFromLink || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailFromLink) {
      setError("❌ Invalid or missing email in reset parameters.");
    }
  }, [emailFromLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/candidates/reset-password", {
        email,
        code,
        newPassword: password,
      });

      if (response.status === 200) {
        setMessage("✅ Password successfully updated!");
        setTimeout(() => navigate("/candidate/login"), 2000);
      } else {
        setError("❌ Failed to reset password. Check your reset code.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "⚠️ Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="vh-auth-container">
        <div className="vh-auth-card">
          <button
            className="vh-back-btn"
            onClick={() => navigate("/candidate/login")}
          >
            <ArrowLeft size={18} /> Back to Login
          </button>

          <h1 className="vh-auth-title">Reset Password</h1>
          <p className="vh-auth-subtitle">
            Create a new secure password for your account.
          </p>

          {message && (
            <div className="vh-alert vh-alert-success">{message}</div>
          )}
          {error && <div className="vh-alert vh-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="vh-form-group">
              <label>Email Address</label>
              <div className="vh-input-wrapper">
                <Mail className="vh-input-icon" size={18} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="vh-input auth-input-readonly"
                />
              </div>
            </div>

            <div className="vh-form-group">
              <label>Reset Code</label>
              <div className="vh-input-wrapper">
                <Key className="vh-input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Enter the code from your email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="vh-input"
                />
              </div>
            </div>

            <div className="vh-form-group">
              <label>New Password</label>
              <div className="vh-input-wrapper">
                <Lock className="vh-input-icon" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="vh-input"
                />
              </div>
            </div>

            <div className="vh-form-group">
              <label>Confirm Password</label>
              <div className="vh-input-wrapper">
                <Lock className="vh-input-icon" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="vh-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="vh-submit-btn"
              disabled={loading || !!error}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
