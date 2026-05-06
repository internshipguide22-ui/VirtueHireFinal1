import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  X,
  Check,
  Loader2,
  FileText,
  Clock,
  HelpCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import "./AssignTestModal.css";

const AssignTestModal = ({ candidate, onClose, onAssigned }) => {
  const [availableTests, setAvailableTests] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTests();
    fetchAssignedTests();
  }, [candidate.id]);

  const fetchTests = async () => {
    try {
      const response = await api.get("/hrs/available-tests");
      setAvailableTests(response.data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load available tests");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTests = async () => {
    try {
      const response = await api.get(`/hrs/candidates/${candidate.id}/assigned-tests`);
      setAssignedTests(response.data.assignedTests || []);
    } catch (err) {
      console.error("Error fetching assigned tests:", err);
    }
  };

  const handleTestSelect = (testName) => {
    setSelectedTests(prev => {
      if (prev.includes(testName)) {
        return prev.filter(t => t !== testName);
      }
      return [...prev, testName];
    });
  };

  const handleSelectAll = () => {
    const filteredTests = getFilteredTests();
    const allSelected = filteredTests.every(t => selectedTests.includes(t.testName));
    
    if (allSelected) {
      // Deselect all filtered tests
      setSelectedTests(prev => prev.filter(t => !filteredTests.some(ft => ft.testName === t)));
    } else {
      // Select all filtered tests that aren't already assigned
      const newSelections = filteredTests
        .filter(t => !isTestAssigned(t.testName))
        .map(t => t.testName);
      setSelectedTests(prev => [...new Set([...prev, ...newSelections])]);
    }
  };

  const isTestAssigned = (testName) => {
    return assignedTests.some(t => t.testName?.toLowerCase() === testName?.toLowerCase());
  };

  const handleAssign = async () => {
    if (selectedTests.length === 0) {
      setError("Please select at least one test");
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      const results = [];
      const errors = [];

      // Assign each selected test
      for (const testName of selectedTests) {
        try {
          const response = await api.post("/hrs/assign-test", {
            candidateId: candidate.id,
            testName: testName,
          });
          results.push(response.data);
        } catch (err) {
          if (err.response?.data?.error?.includes("already assigned")) {
            errors.push(`${testName}: Already assigned`);
          } else {
            errors.push(`${testName}: ${err.response?.data?.error || "Failed to assign"}`);
          }
        }
      }

      if (errors.length > 0 && results.length === 0) {
        setError(errors.join("\n"));
      } else if (errors.length > 0) {
        setSuccess(`Assigned ${results.length} test(s). Some skipped: ${errors.join(", ")}`);
      } else {
        setSuccess(`Successfully assigned ${results.length} test(s) to ${candidate.fullName}`);
      }

      if (results.length > 0) {
        onAssigned(candidate.id);
        fetchAssignedTests();
        setSelectedTests([]);
      }
    } catch (err) {
      console.error("Error assigning tests:", err);
      setError(err.response?.data?.error || "Failed to assign tests");
    } finally {
      setAssigning(false);
    }
  };

  const getFilteredTests = () => {
    return availableTests.filter(test => 
      (test.testName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (test.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  };

  const filteredTests = getFilteredTests();

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="assign-test-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-loading">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading available tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="assign-test-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={24} />
            <div>
              <h2>Assign Test</h2>
              <p>Candidate: <strong>{candidate.fullName}</strong></p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="modal-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="modal-alert success">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Currently Assigned Tests */}
          {assignedTests.length > 0 && (
            <div className="assigned-tests-section">
              <h3>Already Assigned</h3>
              <div className="assigned-tests-list">
                {assignedTests.map((test, idx) => (
                  <div key={idx} className="assigned-test-tag">
                    <Check size={14} />
                    <span>{test.testName || test.testId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Search */}
          <div className="test-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Available Tests - Admin Format */}
          <div className="available-tests-section">
            <div className="section-header">
              <h3>Available Tests ({filteredTests.length})</h3>
              <button className="select-all-btn" onClick={handleSelectAll}>
                {filteredTests.every(t => selectedTests.includes(t.testName)) ? "Deselect All" : "Select All"}
              </button>
            </div>

            {filteredTests.length === 0 ? (
              <div className="no-tests">
                <HelpCircle size={32} />
                <p>No tests found</p>
              </div>
            ) : (
              <div className="tests-list">
                {filteredTests.map((test) => {
                  const isAssigned = isTestAssigned(test.testName);
                  const isSelected = selectedTests.includes(test.testName);

                  return (
                    <div
                      key={test.testName}
                      className={`test-card ${isAssigned ? "assigned" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => !isAssigned && handleTestSelect(test.testName)}
                    >
                      <div className="test-checkbox">
                        {isAssigned ? (
                          <div className="checkbox-assigned">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                            {isSelected && <Check size={14} />}
                          </div>
                        )}
                      </div>

                      <div className="test-info">
                        <div className="test-header">
                          <h4>{test.testName}</h4>
                          {isAssigned && <span className="assigned-badge">Already Assigned</span>}
                        </div>
                        
                        <p className="test-description">
                          {test.description || "No description available"}
                        </p>
                        
                        <div className="test-meta">
                          <span className="meta-item">
                            <HelpCircle size={14} />
                            {test.questionCount || 0} Questions
                          </span>
                          <span className="meta-item">
                            <Clock size={14} />
                            {test.durationMinutes || 60} Minutes
                          </span>
                          {test.questionsIncluded && (
                            <span className="meta-item">
                              <FileText size={14} />
                              {test.questionsIncluded} Included
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {selectedTests.length > 0 && (
            <div className="selection-summary">
              <span>{selectedTests.length} test(s) selected</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleAssign}
            disabled={assigning || selectedTests.length === 0}
          >
            {assigning ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Assign {selectedTests.length > 0 && `(${selectedTests.length})`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTestModal;
