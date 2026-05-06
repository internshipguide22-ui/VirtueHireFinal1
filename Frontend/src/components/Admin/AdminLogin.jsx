import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "ADMIN",
      });

      if (res.data.user) {
        setMessage("Admin Login successful!");
        localStorage.setItem("user_role", "admin");
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } else {
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Invalid Admin credentials.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        margin: 0,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#ffffff",
          padding: "30px 40px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          width: "350px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#333333",
            marginBottom: "25px",
          }}
        >
          Admin Login
        </h2>

        {message && (
          <div
            style={{
              backgroundColor: "#d1ecf1",
              border: "1px solid #bee5eb",
              color: "#0c5460",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              color: "#721c24",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <label>Admin Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@login.com"
          style={styles.input}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter admin password"
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login as Admin
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <a
            href="/landing"
            style={{
              color: "#4A5FC8",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            ← Back to Landing
          </a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0 20px 0",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    backgroundColor: "#4A5FC8",
    color: "white",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "0.3s",
  },
};

export default AdminLogin;
