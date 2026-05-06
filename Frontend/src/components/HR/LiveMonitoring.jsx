import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Clock, Activity } from "lucide-react";
import { WS_BASE_URL } from "../../config";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./LiveMonitoring.css";

const LiveMonitoring = () => {
  const [candidates, setCandidates] = useState({});
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_BASE_URL.replace("http", "ws") + "/ws-assessment",
      webSocketFactory: () => new SockJS(WS_BASE_URL + "/ws-assessment"),
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/exam-monitoring", (message) => {
          const activity = JSON.parse(message.body);
          updateCandidateData(activity);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const updateCandidateData = (activity) => {
    setCandidates((prev) => {
      const updated = { ...prev };
      updated[activity.candidateId] = {
        ...activity,
        lastUpdate: new Date().toLocaleTimeString(),
      };
      return updated;
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="lm-badge lm-badge-green">Active</span>;
      case "Warning":
        return <span className="lm-badge lm-badge-yellow">Warning</span>;
      case "Suspicious":
        return <span className="lm-badge lm-badge-red">Suspicious</span>;
      case "Submitted":
        return <span className="lm-badge lm-badge-blue">Submitted</span>;
      default:
        return <span className="lm-badge">{status}</span>;
    }
  };

  const getViolationColorClass = (count) => {
    if (count >= 3) return "lm-tr-danger";
    if (count > 0) return "lm-tr-warning";
    return "";
  };

  const formatTime = (seconds) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const candidateList = Object.values(candidates).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );

  return (
    <div className="lm-container">
      <div className="lm-header">
        <div>
          <h2>Live Assessment Monitoring</h2>
          <p>Real-time activity tracking for all active candidates.</p>
        </div>
        <div
          className={`lm-live-indicator ${connected ? "" : "lm-disconnected"}`}
        >
          <div className="lm-live-dot"></div>
          {connected ? "Live - Monitoring Active" : "Connecting to Server..."}
        </div>
      </div>

      <div className="lm-table-card">
        {candidateList.length === 0 ? (
          <div className="lm-empty-state">
            <Activity size={40} className="lm-empty-icon" />
            <h3>No Active Candidates</h3>
            <p>
              Real-time data will appear here when candidates start their
              assessments.
            </p>
          </div>
        ) : (
          <div className="lm-table-responsive">
            <table className="lm-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Assessment</th>
                  <th>Section</th>
                  <th>Progress</th>
                  <th>Time Left</th>
                  <th>Violations</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {candidateList.map((c) => (
                  <tr
                    key={c.candidateId}
                    className={getViolationColorClass(c.violationCount)}
                  >
                    <td>
                      <div className="lm-candidate-info">
                        <div className="lm-avatar">
                          {c.candidateName.charAt(0)}
                        </div>
                        <div>
                          <div className="lm-name">{c.candidateName}</div>
                          <div className="lm-subtext">ID: {c.candidateId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.assessmentName}</td>
                    <td>
                      <span className="lm-badge lm-badge-blue">
                        {c.section || "N/A"}
                      </span>
                    </td>
                    <td>Q{c.questionNumber || 1}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={14} /> {formatTime(c.timeLeft)}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: "700",
                        }}
                      >
                        {c.violationCount >= 3 && (
                          <AlertCircle size={16} className="lm-alert-badge" />
                        )}
                        <span
                          style={{
                            color:
                              c.violationCount >= 3
                                ? "#ef4444"
                                : c.violationCount > 0
                                  ? "#f59e0b"
                                  : "inherit",
                          }}
                        >
                          {c.violationCount} / 3
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      <div className="lm-subtext">
                        <strong>{c.eventType}</strong>
                        <br />
                        at {c.lastUpdate}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring;
