import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../../../config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clear old data
      localStorage.removeItem("candidate");
      localStorage.removeItem("candidateResults");

      // Send login request
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch(`${API_BASE_URL}/candidates/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await res.json();
      const candidate = data.candidate;

      if (!candidate) {
        showToast("❌ Invalid credentials!", "error");
        return;
      }

      // Store candidate info and results separately
      localStorage.setItem("candidate", JSON.stringify(candidate));
      if (data.results) {
        localStorage.setItem("candidateResults", JSON.stringify(data.results));
      }

      showToast("✅ Login Successful!", "success");
      navigate("/candidates/welcome");
    } catch (err) {
      console.error(err);
      showToast("❌ Invalid credentials!", "error");
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    margin: "0",
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    overflow: "auto",
  };

  const leftSideStyle = {
    display: "flex",
    flexDirection: "column",
    color: "white",
    maxWidth: "450px",
    marginRight: "80px",
  };

  const titleStyle = {
    fontSize: "3.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "white",
  };

  const subtitleStyle = {
    fontSize: "1.25rem",
    marginBottom: "2rem",
    color: "rgba(255, 255, 255, 0.9)",
  };

  const featureItemStyle = {
    display: "flex",
    alignItems: "start",
    gap: "15px",
    marginBottom: "20px",
  };

  const checkmarkStyle = {
    fontSize: "1.5rem",
    color: "white",
  };

  const featureTitleStyle = {
    fontWeight: "600",
    fontSize: "1.125rem",
    color: "white",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
    position: "relative",
  };

  const backButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#6b7280",
    marginBottom: "20px",
    transition: "all 0.2s",
  };

  const cardTitleStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
  };

  const cardSubtitleStyle = {
    color: "#6b7280",
    marginBottom: "2rem",
  };

  const tabContainerStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0",
  };

  const activeTabStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  };

  const inactiveTabStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: "transparent",
    color: "#6b7280",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  };

  const formGroupStyle = {
    marginBottom: "20px",
  };

  const labelStyle = {
    display: "block",
    color: "#374151",
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "0.95rem",
  };

  const inputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const inputIconStyle = {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 12px 12px 42px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s",
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: "42px",
  };

  const eyeIconStyle = {
    position: "absolute",
    right: "12px",
    color: "#9ca3af",
    cursor: "pointer",
  };

  const helperTextStyle = {
    fontSize: "0.85rem",
    color: "#6b7280",
    marginTop: "4px",
  };

  const rememberRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  };

  const checkboxLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#374151",
    fontSize: "0.9rem",
    cursor: "pointer",
  };

  const forgotLinkStyle = {
    color: "#4f46e5",
    fontSize: "0.9rem",
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "600",
  };

  const signInButtonStyle = {
    width: "100%",
    background: "#4f46e5",
    color: "white",
    fontWeight: "600",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "16px",
    transition: "all 0.2s",
  };

  const registerTextStyle = {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "0.95rem",
  };

  const registerLinkStyle = {
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    marginLeft: "4px",
  };

  const toastStyle = {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 24px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    background: toast.type === "success" ? "#10b981" : "#ef4444",
  };

  return (
    <div style={containerStyle}>
      {/* Left Side - Branding */}
      <div style={leftSideStyle}>
        <h1 style={titleStyle}>VirtueHire</h1>
        <p style={subtitleStyle}>Empowering Talent, Enabling Success</p>

        <div>
          <div style={featureItemStyle}>
            <div style={checkmarkStyle}>✓</div>
            <div>
              <h3 style={featureTitleStyle}>Smart Recruitment Solutions</h3>
            </div>
          </div>

          <div style={featureItemStyle}>
            <div style={checkmarkStyle}>✓</div>
            <div>
              <h3 style={featureTitleStyle}>AI-Powered Matching</h3>
            </div>
          </div>

          <div style={featureItemStyle}>
            <div style={checkmarkStyle}>✓</div>
            <div>
              <h3 style={featureTitleStyle}>Seamless Hiring Process</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div style={cardStyle}>
        <button
          style={backButtonStyle}
          onClick={() => navigate("/landing")}
          onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
          onMouseOut={(e) => (e.currentTarget.style.background = "white")}
        >
          ← Back
        </button>

        <div style={{ marginBottom: "2rem" }}>
          <h2 style={cardTitleStyle}>Welcome Back</h2>
          <p style={cardSubtitleStyle}>Sign in to continue to VirtueHire</p>
        </div>

        {/* Role Tabs */}
        <div style={tabContainerStyle}>
          <button style={activeTabStyle}>
            <User size={18} />
            <span>Candidate</span>
          </button>
          <button style={inactiveTabStyle}>
            <User size={18} />
            <span>HR</span>
          </button>
          <button style={inactiveTabStyle}>
            <User size={18} />
            <span>Admin</span>
          </button>
        </div>

        <div onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Email</label>
            <div style={inputContainerStyle}>
              <Mail size={18} style={inputIconStyle} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
            </div>
            <div style={helperTextStyle}>Use registered email</div>
          </div>

          {/* Password Field */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputContainerStyle}>
              <Lock size={18} style={inputIconStyle} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={passwordInputStyle}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
              <div
                style={eyeIconStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={rememberRowStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span>Remember me</span>
            </label>
            <span
              style={forgotLinkStyle}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="button"
            onClick={handleSubmit}
            style={signInButtonStyle}
            onMouseOver={(e) => (e.currentTarget.style.background = "#4338ca")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#4f46e5")}
          >
            Sign In
          </button>
        </div>

        {/* Register Link */}
        <div style={registerTextStyle}>
          Don't have an account?
          <span
            style={registerLinkStyle}
            onClick={() => navigate("/candidate-registration")}
          >
            Register Now
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.message && <div style={toastStyle}>{toast.message}</div>}
    </div>
  );
}

export default Login;
