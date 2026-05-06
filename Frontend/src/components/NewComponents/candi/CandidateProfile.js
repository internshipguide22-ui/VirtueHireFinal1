import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateProfile.css";

function CandidateProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser) {
      setUser(loggedUser);
      setFormData(loggedUser);
    } else {
      // If no user data, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setUser(formData);
    localStorage.setItem("loggedInUser", JSON.stringify(formData));
    setIsEditing(false);
    // ✅ Navigate to Candidate Welcome page after saving
    navigate("/candidates/welcome", { state: { user: formData } });
  };

  if (!user) {
    return (
      <h2 className="no-data">No profile data found. Please log in again.</h2>
    );
  }

  const formatSkills = (skills) => {
    if (Array.isArray(skills)) return skills.join(", ");
    if (typeof skills === "string") return skills;
    return "";
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <h1>
            👋 Welcome,{" "}
            <span>
              {user.firstName} {user.lastName}
            </span>
          </h1>
          <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-item">
            <strong>Email:</strong>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.email}</span>
            )}
          </div>

          <div className="detail-item">
            <strong>Mobile:</strong>
            {isEditing ? (
              <input
                type="text"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.mobile}</span>
            )}
          </div>

          <div className="detail-item">
            <strong>College:</strong>
            {isEditing ? (
              <input
                type="text"
                name="college"
                value={formData.college || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.college}</span>
            )}
          </div>

          <div className="detail-item">
            <strong>Passout Year:</strong>
            {isEditing ? (
              <input
                type="text"
                name="passoutYear"
                value={formData.passoutYear || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.passoutYear}</span>
            )}
          </div>

          <div className="detail-item">
            <strong>Experience:</strong>
            {isEditing ? (
              <input
                type="text"
                name="experience"
                value={formData.experience || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{user.experience}</span>
            )}
          </div>

          <div className="detail-item">
            <strong>Skills:</strong>
            {isEditing ? (
              <input
                type="text"
                name="skills"
                value={formatSkills(formData.skills)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skills: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            ) : (
              <span>{formatSkills(user.skills)}</span>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button className="save-btn" onClick={handleSave}>
            💾 Save Changes & Go to Assessment Home
          </button>
        )}

        {/* Assessment Home Button */}
        {!isEditing && (
          <button
            className="assessment-btn"
            onClick={() => navigate("/candidates/welcome", { state: { user } })}
            style={{ marginTop: "20px" }}
          >
            📝 Go to Assessment Home
          </button>
        )}
      </div>
    </div>
  );
}

export default CandidateProfile;
