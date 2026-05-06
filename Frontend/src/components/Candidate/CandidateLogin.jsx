// import React, { useState } from "react";
// import api from "../../services/api";
// import "./CandidateLogin.css";
// import { useNavigate } from "react-router-dom";

// export default function CandidateLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await api.post(
//         "/candidates/login",
//         new URLSearchParams({ email, password }),
//         { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//       );

//       console.log("Login Response:", res.data);

//       // ✅ ensure data is valid before saving
//       if (res.status === 200 && res.data && res.data.candidate) {
//         alert("Login successful!");

//         const { candidate, attemptedLevels, results, levelMarks } = res.data;

//         localStorage.setItem("candidate", JSON.stringify(candidate || {}));
//         localStorage.setItem("attemptedLevels", JSON.stringify(attemptedLevels || []));
//         localStorage.setItem("results", JSON.stringify(results || []));
//         localStorage.setItem("levelMarks", JSON.stringify(levelMarks || {}));

//         navigate("/candidates/welcome");
//       } else {
//         console.error("Unexpected structure:", res.data);
//         setError("Unexpected response from server");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="login-body">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>Candidate Login</h2>

//         {error && <div className="error-msg">{error}</div>}

//         <label>Email Address:</label>
//         <input
//           type="email"
//           name="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <label>Password:</label>
//         <input
//           type="password"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button type="submit">Login</button>

//         <p>
//           <a href="/candidates/register">Register as Candidate</a>
//         </p>
//       </form>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import api from "../../services/api";
// import "./CandidateLogin.css";
// import { useNavigate } from "react-router-dom";

// export default function CandidateLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await api.post(
//         "/candidates/login",
//         new URLSearchParams({ email, password }),
//         { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//       );

//       console.log("Login Response:", res.data);

//       if (res.status === 200 && res.data && res.data.candidate) {
//         alert("Login successful!");

//         const { candidate, attemptedLevels, results, levelMarks } = res.data;

//         localStorage.setItem("candidate", JSON.stringify(candidate || {}));
//         localStorage.setItem("attemptedLevels", JSON.stringify(attemptedLevels || []));
//         localStorage.setItem("results", JSON.stringify(results || []));
//         localStorage.setItem("levelMarks", JSON.stringify(levelMarks || {}));

//         navigate("/candidates/welcome");
//       } else {
//         console.error("Unexpected structure:", res.data);
//         setError("Unexpected response from server");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="login-body">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>Candidate Login</h2>

//         {error && <div className="error-msg">{error}</div>}

//         <label>Email Address:</label>
//         <input
//           type="email"
//           name="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <label>Password:</label>
//         <input
//           type="password"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button type="submit">Login</button>

//         {/* ✅ Add Forgot Password + Register links below */}
//         <p style={{ textAlign: "center", marginTop: "10px" }}>
//           <a href="/forgot-password" style={{ marginRight: "15px" }}>
//             Forgot Password?
//           </a>
//           |
//           <a href="/candidates/register" style={{ marginLeft: "15px" }}>
//             Register
//           </a>
//         </p>
//       </form>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import api from "../../services/api";
// import "./CandidateLogin.css";
// import { useNavigate, Link } from "react-router-dom"; // ✅ import Link

// export default function CandidateLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await api.post(
//         "/candidates/login",
//         new URLSearchParams({ email, password }),
//         { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//       );

//       console.log("Login Response:", res.data);

//       if (res.status === 200 && res.data && res.data.candidate) {
//         alert("Login successful!");

//         const { candidate, attemptedLevels, results, levelMarks } = res.data;

//         localStorage.setItem("candidate", JSON.stringify(candidate || {}));
//         localStorage.setItem("attemptedLevels", JSON.stringify(attemptedLevels || []));
//         localStorage.setItem("results", JSON.stringify(results || []));
//         localStorage.setItem("levelMarks", JSON.stringify(levelMarks || {}));

//         navigate("/candidates/welcome");
//       } else {
//         setError("Unexpected response from server");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="login-body">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>Candidate Login</h2>

//         {error && <div className="error-msg">{error}</div>}

//         <label>Email Address:</label>
//         <input
//           type="email"
//           name="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <label>Password:</label>
//         <input
//           type="password"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button type="submit">Login</button>

//         {/* ✅ Fixed with Link components */}
//         <p style={{ textAlign: "center", marginTop: "10px" }}>
//           <Link to="/forgot-password" style={{ marginRight: "15px" }}>
//             Forgot Password?
//           </Link>
//           |
//           <Link to="/candidates/register" style={{ marginLeft: "15px" }}>
//             Register
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";

// function CandidateLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await api.post("/auth/login", { email, password, role: "Candidate" });
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       localStorage.setItem("role", "Candidate");
//       navigate("/candidate/welcome");
//     } catch (err) {
//       setError("Invalid email or password!");
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h2>Candidate Login</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         /><br />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         /><br />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default CandidateLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Axios instance with baseURL https://backend.virtuehire.in/api

function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showToast("❌ Email and password cannot be empty!", "error");
      return;
    }

    // Clear previous login data
    localStorage.clear();

    try {
      // Candidate login (JSON body)
      const res = await api.post(
        "/auth/login",
        { email: trimmedEmail, password: trimmedPassword, role: "Candidate" },
        { withCredentials: true },
      );

      const { user } = res.data;
      const loggedInUser = { ...user, role: "Candidate" };
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("role", "Candidate");

      showToast("✅ Login Successful as Candidate", "success");
      navigate("/candidates/welcome");
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.error || "❌ Invalid email or password!";
      showToast(msg, "error");
    }
  };

  return (
    <div className="login-page">
      <div className="left-panel">
        <div className="cyber-grid"></div>
        <h1 className="brand">
          Virtue <span>Hire</span>
        </h1>
        <p className="tagline">Connecting Talent with Opportunities ⚡</p>
      </div>

      <div className="right-panel">
        <div className="login-card">
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Login with your credentials</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="🔑 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">
              Login as Candidate
            </button>
          </form>

          <div className="forgot-btn-container">
            <button
              type="button"
              className="forgot-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {toast.message && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default CandidateLogin;
