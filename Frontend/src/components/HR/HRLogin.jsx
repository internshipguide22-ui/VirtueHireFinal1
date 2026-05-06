// HRLogin.jsx
import React, { useState } from "react";
import api from "../../services/api";

const HRLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "HR",
      });
      if (res.data.user) {
        setMessage("Login successful!");
        // Persist both identity and JWT for protected HR requests.
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        localStorage.setItem("current_hr_user", JSON.stringify(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", "HR");
        localStorage.setItem("user_role", "hr");
        window.dispatchEvent(new Event("auth-change"));

        window.location.href = "/hr/dashboard";
      } else {
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
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
          HR Login
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

        <label>Email Address:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0 15px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxSizing: "border-box",
          }}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0 15px 0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "0.3s",
          }}
        >
          Login
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <a
            href="/hrs/register"
            style={{
              color: "#4CAF50",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Register as HR
          </a>
        </p>
      </form>
    </div>
  );
};

export default HRLogin;
