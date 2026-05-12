import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FileText,
  Clock,
  CheckCircle,
  X,
  Play,
  Loader2,
  Calendar,
  Award,
  Briefcase,
} from "lucide-react";
import "./CandidateTests.css";

const CandidateTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingTest, setStartingTest] = useState(null);

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    try {
      const response = await api.get("/candidates/my-tests");
      setTests(response.data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      if (err.response?.status === 401) {
        navigate("/candidate/login");
      } else {
        setError("Failed to load your assigned tests");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (test) => {
    if (test.submitted) {
      return; // Already submitted
    }

    setStartingTest(test.id);
    
    try {
      const detailsResponse = await api.get(`/candidates/me/tests/${test.testId}`);
      const assessmentName = detailsResponse.data?.testName || test.testName;

      localStorage.setItem("selectedAssessment", assessmentName);
      sessionStorage.setItem("selectedAssessment", assessmentName);
      navigate("/assessment");
    } catch (err) {
      console.error("Error starting test:", err);
      setError("Failed to start test. Please try again.");
    } finally {
      setStartingTest(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const submittedTests = tests.filter(t => t.submitted);
  const pendingTests = tests.filter(t => !t.submitted);

  if (loading) {
    return (
      <div className="candidate-tests-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="candidate-tests">
      <div className="candidate-tests-header">
        <div className="header-title">
          <Briefcase size={24} />
          <h1>My Assigned Tests</h1>
        </div>
        <p className="header-subtitle">
          Complete the tests assigned to you by the hiring team
        </p>
      </div>

      {error && (
        <div className="candidate-tests-error">
          <X size={20} />
          <span>{error}</span>
          <button onClick={fetchAssignedTests}>Retry</button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="tests-summary">
        <div className="summary-card total">
          <span className="summary-number">{tests.length}</span>
          <span className="summary-label">Total Assigned</span>
        </div>
        <div className="summary-card submitted">
          <span className="summary-number">{submittedTests.length}</span>
          <span className="summary-label">Completed</span>
        </div>
        <div className="summary-card pending">
          <span className="summary-number">{pendingTests.length}</span>
          <span className="summary-label">Pending</span>
        </div>
      </div>

      {/* Pending Tests Section */}
      {pendingTests.length > 0 && (
        <div className="tests-section">
          <h2 className="section-title">
            <X size={20} />
            Pending Tests ({pendingTests.length})
          </h2>
          <div className="tests-grid">
            {pendingTests.map((test) => (
              <div key={test.id} className="test-card pending">
                <div className="test-header">
                  <div className="test-icon">
                    <FileText size={24} />
                  </div>
                  <div className="test-status-badge pending">
                    Pending
                  </div>
                </div>

                <h3 className="test-name">{test.testName || "Test"}</h3>
                
                {test.testDescription && (
                  <p className="test-description">{test.testDescription}</p>
                )}

                <div className="test-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{test.durationMinutes || 60} minutes</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Assigned: {formatDate(test.assignedAt)}</span>
                  </div>
                </div>

                <button
                  className="start-test-btn"
                  onClick={() => handleStartTest(test)}
                  disabled={startingTest === test.id}
                >
                  {startingTest === test.id ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Start Test</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Tests Section */}
      {submittedTests.length > 0 && (
        <div className="tests-section">
          <h2 className="section-title">
            <CheckCircle size={20} />
            Completed Tests ({submittedTests.length})
          </h2>
          <div className="tests-grid">
            {submittedTests.map((test) => (
              <div key={test.id} className="test-card submitted">
                <div className="test-header">
                  <div className="test-icon submitted">
                    <CheckCircle size={24} />
                  </div>
                  <div className="test-status-badge submitted">
                    Completed
                  </div>
                </div>

                <h3 className="test-name">{test.testName || "Test"}</h3>
                
                {test.testDescription && (
                  <p className="test-description">{test.testDescription}</p>
                )}

                <div className="test-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{test.durationMinutes || 60} minutes</span>
                  </div>
                  {test.scoreObtained !== undefined && (
                    <div className="meta-item score">
                      <Award size={16} />
                      <span>Score: {test.scoreObtained}%</span>
                    </div>
                  )}
                </div>

                <div className="submission-info">
                  <Calendar size={14} />
                  <span>Submitted: {formatDate(test.submittedAt)}</span>
                </div>

                <button className="view-results-btn" disabled>
                  <CheckCircle size={16} />
                  <span>Completed</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tests.length === 0 && !error && (
        <div className="no-tests">
          <FileText size={64} />
          <h3>No Tests Assigned</h3>
          <p>You don't have any tests assigned to you yet.</p>
          <p className="sub-text">
            The hiring team will assign tests to you when they're ready to review your application.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateTests;
