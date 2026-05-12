// HRRegistration.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  Globe,
  Briefcase,
  Upload,
  CheckCircle,
  X,
  Shield,
  ArrowRight,
  FileText,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";
import "./HRRegistration.css";
import {
  HR_SUBSCRIPTION_PLANS,
  activateHrSubscription,
} from "../../utils/hrSubscription";

const HRRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    jobTitle: "",
    companyWebsite: "",
    industry: "",
    city: "",
    state: "",
    idProof: null,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !allowedFileTypes.includes(file.type)) {
      setError("Only JPG, PNG, or PDF files are allowed.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    setFormData((prev) => ({ ...prev, idProof: file }));
    setError("");
  };

  const validateForm = () => {
    const trimmedData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      companyName: formData.companyName.trim(),
      jobTitle: formData.jobTitle.trim(),
      companyWebsite: formData.companyWebsite.trim(),
      industry: formData.industry.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
    };

    const requiredFields = [
      "fullName",
      "email",
      "phoneNumber",
      "password",
      "confirmPassword",
      "companyName",
      "jobTitle",
      "industry",
      "city",
      "state",
    ];

    if (requiredFields.some((field) => trimmedData[field] === "")) {
      setError("Please fill in all required fields.");
      return null;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedData.email)) {
      setError("Please enter a valid email address.");
      return null;
    }

    if (!/^[0-9+\-\s()]{10,15}$/.test(trimmedData.phoneNumber)) {
      setError("Please enter a valid phone number.");
      return null;
    }

    if (trimmedData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return null;
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      setError("Passwords do not match.");
      return null;
    }

    if (trimmedData.companyWebsite) {
      try {
        const url = trimmedData.companyWebsite.startsWith("http")
          ? trimmedData.companyWebsite
          : `https://${trimmedData.companyWebsite}`;
        new URL(url);
        trimmedData.companyWebsite = url;
      } catch {
        setError("Please enter a valid company website URL.");
        return null;
      }
    }

    if (!formData.idProof) {
      setError("Please upload your ID proof.");
      return null;
    }

    setError("");
    return trimmedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validatedData = validateForm();
    if (!validatedData) {
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.entries({
      ...formData,
      ...validatedData,
      idProof: formData.idProof,
    }).forEach(([key, value]) => {
      if (value !== null) {
        data.append(key, value);
      }
    });

    try {
      const res = await api.post("/hrs/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      activateHrSubscription(validatedData.email, "FREE_TRIAL_3_MONTHS");
      setMessage(
        res.data.message ||
          "Registration successful! Status: Pending Verification.",
      );
      setError("");

      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(validatedData.email)}&role=hr`,
        );
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-reg-container">
      {/* Left Info Side */}
      <div className="hr-reg-info-side">
        <div className="hr-reg-logo">
          <Shield size={32} />
          <span>VirtueHire HR</span>
        </div>

        <div className="hr-reg-welcome">
          <h1>Find Top Talent with Precision</h1>
          <p>
            Join the elite network of HR professionals using VirtueHire's
            AI-powered assessment platform to streamline recruitment.
          </p>
        </div>

        <div className="hr-reg-subscription-panel">
          <div className="hr-reg-subscription-head">
            <CalendarDays size={20} />
            <div>
              <h3>HR Module Access</h3>
              <p>
                Every HR account starts with a free 3-month access window. After
                that, you can continue with a subscription.
              </p>
            </div>
          </div>

          <div className="hr-reg-plan-list">
            {HR_SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.type}
                className={`hr-reg-plan-item ${plan.type === "FREE_TRIAL_3_MONTHS" ? "highlight" : ""}`}
              >
                <strong>{plan.label}</strong>
                <span>{plan.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hr-reg-features">
          <div className="hr-reg-feature-item">
            <div className="hr-reg-feature-icon">
              <CheckCircle size={24} />
            </div>
            <div className="hr-reg-feature-text">
              <h3>Verified Candidates</h3>
              <p>
                Access pre-vetted candidates with validated skill assessments
                and badges.
              </p>
            </div>
          </div>

          <div className="hr-reg-feature-item">
            <div className="hr-reg-feature-icon">
              <Briefcase size={24} />
            </div>
            <div className="hr-reg-feature-text">
              <h3>Smart Dashboards</h3>
              <p>
                Advanced tracking for your recruitment pipeline and candidate
                progress.
              </p>
            </div>
          </div>

          <div className="hr-reg-feature-item">
            <div className="hr-reg-feature-icon">
              <FileText size={24} />
            </div>
            <div className="hr-reg-feature-text">
              <h3>In-depth Analytics</h3>
              <p>
                Detailed performance reports and skill analytics for every
                candidate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="hr-reg-form-side">
        <div className="hr-reg-card">
          <button
            type="button"
            className="hr-reg-back-btn"
            onClick={() => navigate("/hrs/login")}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="hr-reg-pricing-note">
            <strong>Subscription note:</strong> HR access is free for the first
            3 months only. Renewal plans are available as 1 month, 3 months, and
            1 year subscriptions.
          </div>

          {message && (
            <div className="hr-reg-alert success">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="hr-reg-alert error">
              <X size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="hr-reg-grid">
              {/* Personal Info */}
              <div className="hr-reg-field full">
                <label>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    name="fullName"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    name="phoneNumber"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="hr-reg-field">
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="password"
                    name="password"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="hr-reg-field">
                <label>Company Name</label>
                <div style={{ position: "relative" }}>
                  <Building2
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    name="companyName"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="VirtueHire Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Job Title</label>
                <div style={{ position: "relative" }}>
                  <Briefcase
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    name="jobTitle"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="Talent Acquisition"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Company Website</label>
                <div style={{ position: "relative" }}>
                  <Globe
                    size={18}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    name="companyWebsite"
                    className="hr-reg-input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="https://..."
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="hr-reg-field">
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  className="hr-reg-input"
                  placeholder="e.g. Technology"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Location */}
              <div className="hr-reg-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="hr-reg-input"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="hr-reg-field">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  className="hr-reg-input"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ID Proof */}
              <div className="hr-reg-field full">
                <label>ID Proof (Identity Verification)</label>
                <label className="hr-reg-file-upload">
                  <input
                    type="file"
                    name="idProof"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="hr-reg-file-content">
                    <Upload className="hr-reg-file-icon" size={32} />
                    {formData.idProof ? (
                      <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                        {formData.idProof.name}
                      </span>
                    ) : (
                      <span>Drop your ID proof here or click to browse</span>
                    )}
                    <span style={{ fontSize: "12px" }}>
                      Accepted: JPG, PNG, PDF (Max: 5MB)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="hr-reg-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  Sign Up <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="hr-reg-footer plain">
            Already have an HR account?{" "}
            <Link to="/hrs/login">Sign In here</Link>
            <br />
            <Link to="/payments/plans?audience=hr">
              View HR subscription plans
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HRRegistration;
