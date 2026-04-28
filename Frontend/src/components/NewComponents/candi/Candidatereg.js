import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function CandidateRegister() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    alternatePhoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "",
    city: "",
    state: "",
    highestEducation: "",
    collegeUniversity: "",
    yearOfGraduation: "",
    experience: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
  });

  const [skills, setSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(value)) {
        error = "Enter a valid Gmail address (example@gmail.com)";
      }
    }

    if (name === "phoneNumber") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        error = "Phone number must be exactly 10 digits";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSkillChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ show: false, message: "", type: "" });

    if (errors.email || errors.phoneNumber) {
      setToast({
        show: true,
        type: "error",
        message: "Please fix validation errors before submitting.",
      });
      return;
    }

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "experience") {
          data.append(key, parseInt(form[key]) || 0);
        } else {
          data.append(key, form[key]);
        }
      });

      data.append("skills", skills.join(","));

      if (resumeFile) data.append("resumeFile", resumeFile);
      if (profilePicFile) data.append("profilePicFile", profilePicFile);

      const res = await api.post("/candidates/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({
        show: true,
        type: "success",
        message: "✅ Registered successfully! Please verify your email.",
      });

      // Redirect to verification page
      setTimeout(() => {
        navigate(`/verify-email?email=${form.email}&role=candidate`);
      }, 1500);

      // Reset form
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        alternatePhoneNumber: "",
        password: "",
        confirmPassword: "",
        gender: "",
        city: "",
        state: "",
        highestEducation: "",
        collegeUniversity: "",
        yearOfGraduation: "",
        experience: "",
        dateOfBirth: "",
      });

      setSkills([]);
      setResumeFile(null);
      setProfilePicFile(null);
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Registration failed. Please try again.",
      });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    }
  };

  const navigate = useNavigate();

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Join VirtueHire</h1>
          <p style={styles.subtitle}>Create your account and start your journey</p>
        </div>

        <div style={styles.formWrapper}>
          {/* Toast Messages */}
          {toast.show && (
            <div
              style={{
                ...styles.messageDiv,
                backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
                borderLeft: `4px solid ${toast.type === "success" ? "#10b981" : "#ef4444"}`,
              }}
            >
              <p style={{
                ...styles.messageText,
                color: toast.type === "success" ? "#166534" : "#991b1b",
              }}>
                {toast.message}
              </p>
            </div>
          )}

          {/* Basic Info Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Personal Information</h3>

            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              name="email"
              type="email"
              placeholder="Email (Gmail required)"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={styles.input}
            />
            {errors.email && <p style={styles.errorText}>{errors.email}</p>}

            <input
              name="phoneNumber"
              placeholder="Phone Number (10 digits)"
              value={form.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={styles.input}
            />
            {errors.phoneNumber && (
              <p style={styles.errorText}>{errors.phoneNumber}</p>
            )}

            <input
              name="alternatePhoneNumber"
              placeholder="Alternate Phone (Optional)"
              value={form.alternatePhoneNumber}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="date"
              name="dateOfBirth"
              placeholder="Date of Birth"
              value={form.dateOfBirth}
              onChange={handleChange}
              style={styles.input}
            />

            {/* Gender Selection */}
            <div style={styles.genderGroup}>
              <label style={styles.genderLabel}>Gender:</label>
              <div style={styles.genderOptions}>
                {["Male", "Female"].map((g) => (
                  <label key={g} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Account Security Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔐 Account Security</h3>

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Location Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📍 Location</h3>

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Education Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🎓 Education</h3>

            <input
              name="highestEducation"
              placeholder="Highest Education (e.g., Bachelor, Master)"
              value={form.highestEducation}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              name="collegeUniversity"
              placeholder="College / University"
              value={form.collegeUniversity}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="number"
              name="yearOfGraduation"
              placeholder="Year of Graduation"
              value={form.yearOfGraduation}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Professional Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💼 Professional</h3>

            <input
              type="number"
              name="experience"
              placeholder="Work Experience (Years)"
              value={form.experience}
              onChange={handleChange}
              style={styles.input}
            />

            {/* Skills */}
            <div style={styles.skillsSection}>
              <label style={styles.skillsLabel}>Skills:</label>
              <div style={styles.skillsContainer}>
                {["C", "C++", "Java", "Python", "SQL", "JavaScript", "React", "Node.js"].map(
                  (skill) => (
                    <label key={skill} style={styles.skillItem}>
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => handleSkillChange(skill)}
                        style={styles.checkbox}
                      />
                      {skill}
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📄 Documents</h3>

            {/* Resume Upload */}
            <div style={styles.fileInputDiv}>
              <label style={styles.fileLabel}>
                Upload Resume <span style={styles.required}>*</span>
              </label>
              <label style={styles.fileUploadBox}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={styles.fileInput}
                />
                <span style={styles.uploadText}>
                  📁 {resumeFile ? resumeFile.name : "Choose file"}
                </span>
              </label>
              <small style={styles.smallText}>
                PDF, DOC, DOCX (Max: 5MB)
              </small>
            </div>

            {/* Profile Picture Upload */}
            <div style={styles.fileInputDiv}>
              <label style={styles.fileLabel}>
                Upload Profile Picture <span style={styles.required}>*</span>
              </label>
              <label style={styles.fileUploadBox}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicFile(e.target.files[0])}
                  style={styles.fileInput}
                />
                <span style={styles.uploadText}>
                  🖼️ {profilePicFile ? profilePicFile.name : "Choose image"}
                </span>
              </label>
              <small style={styles.smallText}>
                JPG, PNG, GIF (Max: 5MB)
              </small>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleSubmit}
            style={styles.button}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)";
              e.target.style.boxShadow = "0 8px 20px rgba(79, 70, 229, 0.4)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
              e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Create Account
          </button>

          {/* Success Message - Stays visible */}
          {toast.show && toast.type === "success" && (
            <div style={{
              ...styles.messageDiv,
              backgroundColor: "#dcfce7",
              borderLeft: "4px solid #10b981",
              marginTop: "20px"
            }}>
              <p style={{
                ...styles.messageText,
                color: "#166534",
              }}>
                {toast.message}
              </p>
            </div>
          )}

          {/* Links */}
          <div style={styles.linksContainer}>
            <p style={styles.linkParagraph}>
              Already registered?
              <a
                href="/candidate/login"
                style={styles.link}
                onClick={() => setToast({ show: false, message: "", type: "" })}
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
    margin: 0,
    padding: "40px 20px",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    padding: "40px 30px",
    textAlign: "center",
    color: "#ffffff",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "1rem",
    fontWeight: "500",
    opacity: 0.9,
    margin: "0",
  },
  formWrapper: {
    padding: "40px 30px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    boxSizing: "border-box",
    fontSize: "14px",
    color: "#1f2937",
    transition: "all 0.2s ease",
  },
  messageDiv: {
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    color: "#111",
    textAlign: "left",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "500",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "12px",
    margin: "5px 0 8px 0",
    fontWeight: "600",
  },
  genderGroup: {
    margin: "10px 0",
  },
  genderLabel: {
    display: "block",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },
  genderOptions: {
    display: "flex",
    gap: "20px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    cursor: "pointer",
    color: "#1f2937",
  },
  radio: {
    marginRight: "8px",
    cursor: "pointer",
    accentColor: "#4f46e5",
  },
  skillsSection: {
    margin: "16px 0",
  },
  skillsLabel: {
    display: "block",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  skillItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    cursor: "pointer",
    color: "#1f2937",
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },
  checkbox: {
    marginRight: "8px",
    cursor: "pointer",
    accentColor: "#4f46e5",
  },
  fileInputDiv: {
    margin: "16px 0",
  },
  fileLabel: {
    display: "block",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },
  fileUploadBox: {
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "8px",
  },
  fileInput: {
    display: "none",
  },
  uploadText: {
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
  },
  required: {
    color: "#ef4444",
  },
  smallText: {
    color: "#9ca3af",
    fontSize: "12px",
    display: "block",
  },
  button: {
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "20px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  },
  linksContainer: {
    marginTop: "24px",
    textAlign: "center",
  },
  linkParagraph: {
    margin: "12px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "700",
    marginLeft: "6px",
  },
};
