import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssessmentComplete = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  const handleGoHome = () => {
    const storedCandidate = JSON.parse(localStorage.getItem("candidate") || "{}");
    storedCandidate.badge = storedCandidate.badge || "Certified";
    localStorage.setItem("candidate", JSON.stringify(storedCandidate));
    navigate("/candidates/welcome", { state: { refreshBadge: Date.now() } });
  };

  return (
    <div style={{
      fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        pointerEvents: "none",
        overflow: "hidden"
      }}>
        {/* Animated Circles */}
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          opacity: 0.1,
          top: "-100px",
          right: "-100px",
          animation: "float 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          opacity: 0.1,
          bottom: "-50px",
          left: "-50px",
          animation: "float 8s ease-in-out infinite reverse"
        }} />
      </div>

      {/* Main Card */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "60px 50px",
        borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
        animation: "slideUp 0.6s ease-out"
      }}>
        {/* Celebration Icon */}
        <div style={{
          fontSize: "4rem",
          marginBottom: "20px",
          animation: "bounce 1.5s ease-in-out infinite"
        }}>
          🎉
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: "2.8rem",
          fontWeight: "800",
          marginBottom: "16px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Congratulations!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "1.3rem",
          color: "#6b7280",
          marginBottom: "30px",
          fontWeight: "500",
          lineHeight: "1.8"
        }}>
          You have successfully completed <br />
          <span style={{ color: "#1f2937", fontWeight: "700", fontSize: "1.4rem" }}>
            all levels of the assessment
          </span>
        </p>

        {/* Achievement Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "40px"
        }}>
          {/* Stat 1 */}
          <div style={{
            backgroundColor: "#f0f9ff",
            padding: "24px",
            borderRadius: "12px",
            border: "2px solid #dbeafe"
          }}>
            <div style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#3b82f6",
              marginBottom: "8px"
            }}>
              3
            </div>
            <div style={{
              color: "#6b7280",
              fontWeight: "600",
              fontSize: "0.95rem"
            }}>
              Levels Completed
            </div>
          </div>

          {/* Stat 2 */}
          <div style={{
            backgroundColor: "#f0fdf4",
            padding: "24px",
            borderRadius: "12px",
            border: "2px solid #dcfce7"
          }}>
            <div style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#10b981",
              marginBottom: "8px"
            }}>
              100%
            </div>
            <div style={{
              color: "#6b7280",
              fontWeight: "600",
              fontSize: "0.95rem"
            }}>
              Success Rate
            </div>
          </div>
        </div>

        {/* Achievement Message */}
        <div style={{
          backgroundColor: "#fef3c7",
          border: "2px solid #fcd34d",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "40px"
        }}>
          <p style={{
            color: "#92400e",
            fontWeight: "600",
            margin: "0",
            fontSize: "1rem"
          }}>
            ⭐ Outstanding performance! You've demonstrated excellent skills and dedication.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleGoHome}
          style={{
            width: "100%",
            padding: "16px 32px",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(79, 70, 229, 0.3)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}
          onMouseOver={(e) => {
            e.target.style.boxShadow = "0 10px 30px rgba(79, 70, 229, 0.4)";
            e.target.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.3)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span>🏠</span>
          Back to Home
        </button>

        {/* Secondary Text */}
        <p style={{
          marginTop: "24px",
          color: "#9ca3af",
          fontSize: "0.9rem",
          fontWeight: "500"
        }}>
          You can now take assessments for other subjects or review your progress.
        </p>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 600px) {
          div[style*="padding: 60px"] {
            padding: 40px 30px !important;
          }

          h1 {
            font-size: 2.2rem !important;
          }

          p {
            font-size: 1.1rem !important;
          }

          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentComplete;
