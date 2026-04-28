import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
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
    margin-bottom: 24px;
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
    margin-top: 8px;
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/candidates/forgot-password", { email });

      if (response.status === 200) {
        setMessage("✅ Reset link and code sent to your email!");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError("❌ Email not found!");
      }
    } catch (err) {
      setError(err.response?.data?.error || "⚠️ Error sending email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="vh-auth-container">
        <div className="vh-auth-card">
          <button className="vh-back-btn" onClick={() => navigate("/candidate/login")}>
            <ArrowLeft size={18} /> Back to Login
          </button>

          <h1 className="vh-auth-title">Forgot Password</h1>
          <p className="vh-auth-subtitle">Enter your email to receive a password reset link and code.</p>

          {message && <div className="vh-alert vh-alert-success">{message}</div>}
          {error && <div className="vh-alert vh-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="vh-form-group">
              <label>Email Address</label>
              <div className="vh-input-wrapper">
                <Mail className="vh-input-icon" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="vh-input"
                />
              </div>
            </div>

            <button type="submit" className="vh-submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
