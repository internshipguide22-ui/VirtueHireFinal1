import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
  Upload,
} from "lucide-react";
import api from "../../services/api";
import "./CandidateRegister.css";

export default function CandidateRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    alternatePhoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    city: "",
    state: "",
    highestEducation: "",
    collegeUniversity: "",
    yearOfGraduation: "",
    skills: "",
    experience: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const registeredEmail = form.email.trim().toLowerCase();
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        const value = key === "email" ? registeredEmail : form[key];
        data.append(key, value);
      });
      if (resumeFile) data.append("resumeFile", resumeFile);
      if (profilePicFile) data.append("profilePicFile", profilePicFile);

      const res = await api.post("/candidates/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Candidate registered successfully!");
      localStorage.setItem("pendingVerificationEmail", registeredEmail);
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        alternatePhoneNumber: "",
        password: "",
        confirmPassword: "",
        gender: "",
        dateOfBirth: "",
        city: "",
        state: "",
        highestEducation: "",
        collegeUniversity: "",
        yearOfGraduation: "",
        skills: "",
        experience: "",
      });
      setResumeFile(null);
      setProfilePicFile(null);
      setTimeout(
        () =>
          navigate(
            `/candidate/verify-otp?email=${encodeURIComponent(registeredEmail)}`,
          ),
        1200,
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-reg-wrapper">
      <div className="vh-reg-container">
        <div className="vh-reg-header">
          <button className="vh-back-btn" onClick={() => navigate("/landing")}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1>Create Candidate Account</h1>
          <p>Join VirtueHire and accelerate your career journey.</p>
        </div>

        {message && <div className="vh-alert vh-alert-success">{message}</div>}
        {error && <div className="vh-alert vh-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="vh-reg-form">
          <div className="vh-form-grid">
            {/* Basic Info Section */}
            <div className="vh-form-section">
              <h3>
                <User size={18} /> Basic Information
              </h3>
              <div className="vh-input-group">
                <label>Full Name *</label>
                <div className="vh-input-with-icon">
                  <User className="vh-icon" size={16} />
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="vh-input-group">
                <label>Email Address *</label>
                <div className="vh-input-with-icon">
                  <Mail className="vh-icon" size={16} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="vh-row">
                <div className="vh-input-group">
                  <label>Phone *</label>
                  <div className="vh-input-with-icon">
                    <Phone className="vh-icon" size={16} />
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
                <div className="vh-input-group">
                  <label>Alternate Phone</label>
                  <div className="vh-input-with-icon">
                    <Phone className="vh-icon" size={16} />
                    <input
                      name="alternatePhoneNumber"
                      value={form.alternatePhoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="vh-row">
                <div className="vh-input-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="vh-input-group">
                  <label>Date of Birth</label>
                  <div className="vh-input-with-icon">
                    <Calendar className="vh-icon" size={16} />
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="vh-row">
                <div className="vh-input-group">
                  <label>Password *</label>
                  <div className="vh-input-with-icon">
                    <Lock className="vh-icon" size={16} />
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="vh-input-group">
                  <label>Confirm Password *</label>
                  <div className="vh-input-with-icon">
                    <Lock className="vh-icon" size={16} />
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Experience Section */}
            <div className="vh-form-section">
              <h3>
                <GraduationCap size={18} /> Education & Experience
              </h3>
              <div className="vh-row">
                <div className="vh-input-group">
                  <label>City</label>
                  <div className="vh-input-with-icon">
                    <MapPin className="vh-icon" size={16} />
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="vh-input-group">
                  <label>State</label>
                  <div className="vh-input-with-icon">
                    <MapPin className="vh-icon" size={16} />
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="vh-input-group">
                <label>Highest Education</label>
                <div className="vh-input-with-icon">
                  <GraduationCap className="vh-icon" size={16} />
                  <input
                    name="highestEducation"
                    value={form.highestEducation}
                    onChange={handleChange}
                    placeholder="e.g. Master of Technology"
                  />
                </div>
              </div>

              <div className="vh-input-group">
                <label>College/University</label>
                <div className="vh-input-with-icon">
                  <GraduationCap className="vh-icon" size={16} />
                  <input
                    name="collegeUniversity"
                    value={form.collegeUniversity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="vh-row">
                <div className="vh-input-group">
                  <label>Graduation Year</label>
                  <input
                    name="yearOfGraduation"
                    type="number"
                    value={form.yearOfGraduation}
                    onChange={handleChange}
                  />
                </div>
                <div className="vh-input-group">
                  <label>Exp (Years)</label>
                  <div className="vh-input-with-icon">
                    <Briefcase className="vh-icon" size={16} />
                    <input
                      name="experience"
                      type="number"
                      value={form.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="vh-input-group">
                <label>Skills (comma separated)</label>
                <div className="vh-input-with-icon">
                  <Code className="vh-icon" size={16} />
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Java, React, SQL..."
                  />
                </div>
              </div>

              <div className="vh-row">
                <div className="vh-file-group">
                  <label>
                    <Upload size={14} /> Resume
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </div>
                <div className="vh-file-group">
                  <label>
                    <Upload size={14} /> Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="vh-reg-actions">
            <button type="submit" className="vh-reg-submit" disabled={loading}>
              {loading ? "Registering..." : "Complete Registration"}
            </button>
            <p className="vh-login-redirect">
              Already joined?{" "}
              <span onClick={() => navigate("/candidate/login")}>
                Login here
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
