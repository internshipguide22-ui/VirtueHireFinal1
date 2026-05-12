import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  X,
  Check,
  Loader2,
  FileText,
  Clock,
  HelpCircle,
  Search,
  User,
  ChevronDown,
} from "lucide-react";
import "./AssignTestModal.css";

const AssignTestModal = ({ candidate, onClose, onAssigned, candidates: initialCandidates }) => {
  const [availableTests, setAvailableTests] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [candidates, setCandidates] = useState(initialCandidates || []);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidate?.id || "");
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const lockTargetToOpenedCandidate =
    candidate != null && candidate.id != null && candidate.id !== "";

  const resolvedCandidateId = useMemo(() => {
    if (lockTargetToOpenedCandidate) {
      const n = Number(candidate.id);
      return Number.isFinite(n) ? n : null;
    }
    if (selectedCandidateId === "" || selectedCandidateId == null) {
      return null;
    }
    const n = Number(selectedCandidateId);
    return Number.isFinite(n) ? n : null;
  }, [lockTargetToOpenedCandidate, candidate?.id, selectedCandidateId]);

  // Sync candidates when initialCandidates prop changes
  useEffect(() => {
    if (initialCandidates && initialCandidates.length > 0) {
      setCandidates(initialCandidates);
    }
  }, [initialCandidates]);

  useEffect(() => {
    if (candidate?.id != null && candidate.id !== "") {
      setSelectedCandidateId(candidate.id);
    }
  }, [candidate?.id]);

  useEffect(() => {
    fetchTests();
    // Only fetch candidates from API if not provided via props
    if (!initialCandidates || initialCandidates.length === 0) {
      fetchCandidates();
    }
  }, [candidate?.id]);

  useEffect(() => {
    fetchAssignedTests();
  }, [resolvedCandidateId]);

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
      if (resolvedCandidateId == null) return;
      const response = await api.get(`/hrs/candidates/${resolvedCandidateId}/assigned-tests`);
      setAssignedTests(response.data.assignedTests || []);
    } catch (err) {
      console.error("Error fetching assigned tests:", err);
    }
  };

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await api.get("/hrs/candidates-for-action");
      setCandidates(response.data.candidates || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleTestSelect = (testId) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(t => t !== testId);
      }
      return [...prev, testId];
    });
  };

  const handleSelectAll = () => {
    const filteredTests = getFilteredTests();
    const allSelected = filteredTests.every(t => selectedTests.includes(t.testId));
    
    if (allSelected) {
      // Deselect all filtered tests
      setSelectedTests(prev => prev.filter(t => !filteredTests.some(ft => ft.testId === t)));
    } else {
      // Select all filtered tests that aren't already assigned
      const newSelections = filteredTests
        .filter(t => !isTestAssigned(t.testId))
        .map(t => t.testId);
      setSelectedTests(prev => [...new Set([...prev, ...newSelections])]);
    }
  };

  const isTestAssigned = (testId) => {
    return assignedTests.some(t => t.testId === testId);
  };

  const handleAssign = async () => {
    if (selectedTests.length === 0) {
      setError("Please select at least one test");
      return;
    }

    if (resolvedCandidateId == null) {
      setError("Please select a candidate");
      return;
    }

    // Prevent double submission
    if (assigning) {
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      // Ensure candidateId is sent as a number/string properly
      const payload = {
        candidateId: resolvedCandidateId,
        testIds: selectedTests,
        availableFrom: availableFrom || null,
      };

      const response = await api.post("/hrs/assign-test", payload);

      if (response.data?.assignedCount > 0) {
        const selectedCandidate = candidates.find(c => c.id == resolvedCandidateId) || candidate;
        setSuccess(`Successfully assigned ${response.data.assignedCount} test(s) to ${selectedCandidate?.fullName || 'candidate'}`);
        onAssigned(resolvedCandidateId);
        fetchAssignedTests();
        setSelectedTests([]);
        setAvailableFrom("");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign tests");
    } finally {
      setAssigning(false);
    }
  };

  const handleCandidateChange = (e) => {
    setSelectedCandidateId(e.target.value);
    setSelectedTests([]);
  };

  const getFilteredTests = () => {
    return availableTests.filter(test => 
      (test.title?.toLowerCase() || test.testName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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
              <p>
                Assigning to: <strong>{candidate?.fullName || "Candidate"}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="modal-alert error">
              <X size={18} />
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
                    <span>{test.testName || test.title || test.testId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidate picker only when no specific row was opened (assign-from-list mode) */}
          {!lockTargetToOpenedCandidate && (
            <div className="candidate-select-container" style={{ marginBottom: 16 }}>
              <label className="candidate-select-label" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>
                <User size={16} />
                Select Candidate
              </label>
              <div className="candidate-select-wrapper" style={{ position: "relative" }}>
                <select
                  value={selectedCandidateId}
                  onChange={handleCandidateChange}
                  className="candidate-select"
                  disabled={candidatesLoading || (candidates.length === 0 && !candidate)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingRight: "40px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#1e293b",
                    background: "#f8fafc",
                    cursor: candidatesLoading || (candidates.length === 0 && !candidate) ? "not-allowed" : "pointer",
                    appearance: "none",
                  }}
                >
                  {candidatesLoading ? (
                    <option value="">Loading candidates...</option>
                  ) : candidates.length === 0 && !candidate ? (
                    <option value="">No candidates available</option>
                  ) : (
                    <>
                      <option value="">Select a candidate...</option>
                      {candidate && !candidates.find(c => c.id === candidate.id) && (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.fullName || candidate.candidateName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || `Candidate #${candidate.id}`} (Current)
                        </option>
                      )}
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName || c.candidateName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Candidate #${c.id}`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 6 }}>
                Choose the candidate who will receive this test assignment and email notification.
              </div>
            </div>
          )}

          {/* Schedule Test Timer */}
          <div className="test-search" style={{ marginBottom: 10 }}>
            <Clock size={18} />
            <input
              type="datetime-local"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 12 }}>
            Leave empty to make tests available immediately, or choose a start time.
          </div>

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
                {filteredTests.every(t => selectedTests.includes(t.testId) || isTestAssigned(t.testId)) ? "Deselect All" : "Select All"}
              </button>
            </div>

            {filteredTests.length === 0 ? (
              <div className="no-tests">
                <HelpCircle size={32} />
                <p>No HR-owned tests found</p>
                <span>Create your own HR questions and assessment first to assign a test.</span>
              </div>
            ) : (
              <div className="tests-list">
                {filteredTests.map((test) => {
                  const isAssigned = isTestAssigned(test.testId);
                  const isSelected = selectedTests.includes(test.testId);

                  return (
                    <div
                      key={test.testId}
                      className={`test-card ${isAssigned ? "assigned" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => !isAssigned && handleTestSelect(test.testId)}
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
                          <h4>{test.title || test.testName}</h4>
                          {isAssigned && <span className="assigned-badge">Already Assigned</span>}
                        </div>
                        
                        <p className="test-description">
                          {test.description || "No description available"}
                        </p>
                        
                        <div className="test-meta">
                          <span className="meta-item">
                            <HelpCircle size={14} />
                            {test.questionCount || test.questions || 0} Questions
                          </span>
                          <span className="meta-item">
                            <Clock size={14} />
                            {test.durationMinutes || 60} Minutes
                          </span>
                          {test.sectionCount ? (
                            <span className="meta-item">
                              <FileText size={14} />
                              {test.sectionCount} Sections
                            </span>
                          ) : null}
                        </div>

                        {Array.isArray(test.sections) && test.sections.length > 0 && (
                          <div className="test-meta" style={{ marginTop: 8, flexWrap: "wrap" }}>
                            {test.sections.map((section) => (
                              <span key={section.id || `${test.testId}-${section.sectionNumber}`} className="meta-item">
                                {section.subject} - {section.questionCount}Q / {section.sectionTime}m
                              </span>
                            ))}
                          </div>
                        )}
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
            disabled={assigning || selectedTests.length === 0 || resolvedCandidateId == null}
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
