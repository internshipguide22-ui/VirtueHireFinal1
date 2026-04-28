// // src/hr/HRWelcome.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const HRWelcome = () => {
//   const [hr, setHr] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch HR info from backend
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/dashboard", { withCredentials: true })
//       .then((res) => {
//         setHr(res.data.hr);
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Failed to load HR info. Please login again.");
//       });
//   }, []);

//   const handleDashboard = () => {
//     navigate("/hr/dashboard"); // Adjust route if needed
//   };

//   const handleLogout = () => {
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/logout", { withCredentials: true })
//       .then(() => {
//         navigate("/"); // Redirect to landing/login page
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Logout failed. Try again.");
//       });
//   };

//   return (
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         backgroundColor: "#f4f7f8",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         margin: 0,
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: "#ffffff",
//           padding: "40px 50px",
//           borderRadius: "12px",
//           boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
//           textAlign: "center",
//           width: "450px",
//         }}
//       >
//         <h2>Welcome HR</h2>
//         <p>
//           Welcome,{" "}
//           <span style={{ color: "#0d6efd" }}>{hr ? hr.name || hr.email : "Name"}</span>!
//         </p>

//         {hr && hr.verified && (
//           <div className="alert alert-success">
//             <strong>✓ Account Verified</strong>
//             <br />
//             You can access all HR features.
//           </div>
//         )}

//         {hr && !hr.verified && (
//           <div className="alert alert-warning">
//             <strong>⏳ Account Pending Verification</strong>
//             <br />
//             Please wait for admin approval to access candidate details.
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mt-3">
//           <button onClick={handleDashboard} className="btn btn-primary me-2">
//             Go to Dashboard
//           </button>
//           <button onClick={handleLogout} className="btn btn-outline-secondary">
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HRWelcome;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const HRWelcome = () => {
//   const [hr, setHr] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch HR dashboard info from backend
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/dashboard", { withCredentials: true })
//       .then((res) => {
//         if (res.data.hr) setHr(res.data.hr);
//         else navigate("/"); // If no HR info, redirect to login
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Failed to load HR info. Please login again.");
//         navigate("/"); // Redirect to login
//       });
//   }, [navigate]);

//   const handleDashboard = () => {
//     navigate("/hr/dashboard");
//   };

//   const handleLogout = () => {
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/logout", { withCredentials: true })
//       .then(() => {
//         localStorage.removeItem("user"); // Clear localStorage
//         navigate("/"); // Redirect to login
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Logout failed. Try again.");
//       });
//   };

//   return (
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         backgroundColor: "#f4f7f8",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         margin: 0,
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: "#ffffff",
//           padding: "40px 50px",
//           borderRadius: "12px",
//           boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
//           textAlign: "center",
//           width: "450px",
//         }}
//       >
//         <h2>Welcome HR</h2>
//         <p>
//           Welcome, <span style={{ color: "#0d6efd" }}>{hr ? hr.name || hr.email : "Name"}</span>!
//         </p>

//         {hr && hr.verified && (
//           <div className="alert alert-success">
//             <strong>✓ Account Verified</strong>
//             <br />
//             You can access all HR features.
//           </div>
//         )}

//         {hr && !hr.verified && (
//           <div className="alert alert-warning">
//             <strong>⏳ Account Pending Verification</strong>
//             <br />
//             Please wait for admin approval to access candidate details.
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mt-3">
//           <button onClick={handleDashboard} className="btn btn-primary me-2">
//             Go to Dashboard
//           </button>
//           <button onClick={handleLogout} className="btn btn-outline-secondary">
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HRWelcome;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const HRWelcome = () => {
//   const [hr, setHr] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     // 1️⃣ Frontend auth guard (same logic as Candidate)
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     const storedRole = localStorage.getItem("role");

//     if (!storedUser || storedRole?.toLowerCase() !== "hr") {
//       navigate("/");
//       return;
//     }

//     // 2️⃣ Load HR immediately from localStorage
//     setHr(storedUser);

//     // 3️⃣ OPTIONAL: verify HR session from backend
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/dashboard", {
//         withCredentials: true,
//       })
//       .then((res) => {
//         if (res.data?.hr) {
//           setHr(res.data.hr);
//         }
//       })
//       .catch(() => {
//         console.warn("⚠️ Backend HR verification failed — using local data");
//       });
//   }, [navigate]);

//   const handleDashboard = () => {
//     navigate("/hr/dashboard");
//   };

//   const handleLogout = () => {
//     axios
//       .get("https://backend.virtuehire.in/api/hrs/logout", {
//         withCredentials: true,
//       })
//       .finally(() => {
//         localStorage.removeItem("user");
//         localStorage.removeItem("role");
//         navigate("/");
//       });
//   };

//   if (!hr) return null;

//   return (
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         backgroundColor: "#f4f7f8",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: "#ffffff",
//           padding: "40px 50px",
//           borderRadius: "12px",
//           boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
//           textAlign: "center",
//           width: "450px",
//         }}
//       >
//         <h2>Welcome HR</h2>

//         <p>
//           Welcome,{" "}
//           <span style={{ color: "#0d6efd" }}>
//             {hr.name || hr.email}
//           </span>
//           !
//         </p>

//         {hr.verified ? (
//           <div className="alert alert-success">
//             <strong>✓ Account Verified</strong>
//             <br />
//             You can access all HR features.
//           </div>
//         ) : (
//           <div className="alert alert-warning">
//             <strong>⏳ Account Pending Verification</strong>
//             <br />
//             Please wait for admin approval.
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mt-3">
//           <button
//             onClick={handleDashboard}
//             className="btn btn-primary me-2"
//           >
//             Go to Dashboard
//           </button>
//           <button
//             onClick={handleLogout}
//             className="btn btn-outline-secondary"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const HRWelcome = () => {
  const [hr, setHr] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Verify session with backend
    api
      .get("/hrs/dashboard")
      .then((res) => {
        if (res.data?.hr) {
          setHr(res.data.hr);
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const handleDashboard = () => {
    navigate("/hr/dashboard");
  };

  const handleLogout = () => {
    api
      .get("/hrs/logout")
      .finally(() => {
        navigate("/login");
      });
  };

  if (!hr) return null;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "40px 50px",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          width: "450px",
        }}
      >
        <h2>Welcome HR</h2>

        <p>
          Welcome, <span style={{ color: "#0d6efd" }}>{hr.fullName || hr.email}</span>!
        </p>

        {hr.verified ? (
          <div className="alert alert-success">
            <strong>✓ Account Verified</strong>
            <br />
            You can access all HR features.
          </div>
        ) : (
          <div className="alert alert-warning">
            <strong>⏳ Account Pending Verification</strong>
            <br />
            Please wait for admin approval.
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mt-3">
          <button onClick={handleDashboard} className="btn btn-primary me-2">
            Go to Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-outline-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRWelcome;
