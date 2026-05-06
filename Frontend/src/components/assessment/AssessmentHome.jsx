import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AssessmentHome = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const candidate = localStorage.getItem("candidate");
    if (!candidate) {
      navigate("/candidates/login");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await api.get("/assessment/status", {
          withCredentials: true,
        });
        if (res.data.error) setError(res.data.error);
        else setStatus(res.data);
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("Failed to load assessment status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const handleStart = (level) => navigate(`/assessment/level/${level}`);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2>Assessment Progress</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {status.levelResults ? (
          <div>
            {Object.entries(status.levelResults).map(([lvl, passed]) => (
              <div key={lvl} style={styles.levelBox}>
                Level {lvl}:{" "}
                <span style={passed ? styles.passed : styles.failed}>
                  {passed ? "Passed ✅" : "Failed ❌"}
                </span>
              </div>
            ))}
            <div style={styles.nextBox}>
              <p>
                Next Available Level:{" "}
                <strong style={{ color: "#1976D2" }}>{status.nextLevel}</strong>
              </p>
              <button
                style={styles.startBtn}
                onClick={() => handleStart(status.nextLevel)}
              >
                Start Level {status.nextLevel}
              </button>
            </div>
          </div>
        ) : (
          <p>No progress data available.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "Arial",
    backgroundColor: "#f4f7f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    margin: 0,
  },
  container: {
    backgroundColor: "#fff",
    padding: "40px 50px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "500px",
  },
  levelBox: { marginBottom: "10px", fontSize: "16px" },
  passed: { color: "#4CAF50", fontWeight: "bold" },
  failed: { color: "#f44336", fontWeight: "bold" },
  nextBox: { marginTop: "20px", fontWeight: "bold", fontSize: "16px" },
  startBtn: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
};

export default AssessmentHome;
