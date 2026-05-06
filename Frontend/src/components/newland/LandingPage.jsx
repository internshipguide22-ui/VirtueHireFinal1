import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Users, Shield, Sparkles, Zap, TrendingUp } from "lucide-react";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleClick = (role) => {
    if (role === "Candidate") navigate("/candidate/login");
    if (role === "HR") navigate("/hrs/login");
    if (role === "Admin") navigate("/admin/login");
  };

  return (
    <div className="vh-landing-container">
      {/* Background Shapes */}
      <div className="vh-landing-shape vh-landing-shape-1"></div>
      <div className="vh-landing-shape vh-landing-shape-2"></div>
      <div className="vh-landing-shape vh-landing-shape-3"></div>

      <div className="vh-landing-content">
        {/* Left Side - Typography & Features */}
        <div className="vh-landing-left">
          <h1 className="vh-landing-title">
            Unlock Your
            <br />
            True Potential
          </h1>
          <p className="vh-landing-subtitle">
            VirtueHire is the ultimate AI-powered platform empowering talent and
            enabling seamless, intelligent recruitment.
          </p>

          <div className="vh-landing-features">
            <div className="vh-landing-feature-item">
              <div className="vh-feature-icon-wrapper">
                <Sparkles size={22} />
              </div>
              <span>AI-Powered Matching</span>
            </div>

            <div
              className="vh-landing-feature-item"
              style={{ transitionDelay: "0.1s" }}
            >
              <div
                className="vh-feature-icon-wrapper"
                style={{
                  background:
                    "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
                  boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)",
                }}
              >
                <Zap size={22} />
              </div>
              <span>Lightning Fast Hiring</span>
            </div>

            <div
              className="vh-landing-feature-item"
              style={{ transitionDelay: "0.2s" }}
            >
              <div
                className="vh-feature-icon-wrapper"
                style={{
                  background:
                    "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
                  boxShadow: "0 4px 15px rgba(244, 63, 94, 0.4)",
                }}
              >
                <TrendingUp size={22} />
              </div>
              <span>Data-Driven Growth</span>
            </div>
          </div>
        </div>

        {/* Right Side - Glassmorphism Login Selection */}
        <div className="vh-landing-right">
          <div className="vh-glass-card">
            <h2 className="vh-card-title">Welcome</h2>
            <p className="vh-card-subtitle">Choose your portal to continue</p>

            <div className="vh-role-buttons">
              <button
                className="vh-role-btn candidate"
                onClick={() => handleClick("Candidate")}
              >
                <User size={24} />
                <span>Candidate Portal</span>
              </button>

              <button
                className="vh-role-btn hr"
                onClick={() => handleClick("HR")}
              >
                <Users size={24} />
                <span>HR / Recruiter Portal</span>
              </button>

              <button
                className="vh-role-btn admin"
                onClick={() => handleClick("Admin")}
              >
                <Shield size={24} />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
