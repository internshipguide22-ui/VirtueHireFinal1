// src/components/Admin/QuestionManagement.jsx
// Changes from original:
//   1. Added "Coding Question CSV Format" hint in the CSV upload card
//   2. Added a new "Test Cases" column hint in the format description
//   All existing functionality is UNCHANGED.

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppDialog } from "../common/AppDialog";

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    level: "1",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [testTitle, setTestTitle] = useState("");
  const [sections, setSections] = useState([
    { sectionNumber: 1, sectionName: "Aptitude", timeLimit: 10 },
    { sectionNumber: 2, sectionName: "Technical", timeLimit: 20 },
    { sectionNumber: 3, sectionName: "Vocabulary", timeLimit: 5 },
  ]);
  const [saveLoading, setSaveLoading] = useState(false);
  // ── NEW: toggle to show coding CSV format hint ──
  const [showCodingFormat, setShowCodingFormat] = useState(false);
  const { showAlert, showConfirm, dialogNode } = useAppDialog();

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/questions")
      .then((res) => {
        setQuestions(res.data.questions || []);
        setSubjects(res.data.subjects || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load questions.");
        setLoading(false);
      });
  }, []);

  const filteredQuestions = selectedSubject
    ? questions.filter((q) => q.subject === selectedSubject)
    : questions;

  const handleNewQuestionChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === "options") {
      const updatedOptions = [...newQuestion.options];
      updatedOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    api
      .post("/admin/questions/add", newQuestion)
      .then((res) => {
        setQuestions((prev) => [...prev, res.data]);
        setNewQuestion({
          subject: "",
          level: "1",
          text: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        });
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: "Delete Question",
      message: "Are you sure you want to delete this question?",
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;
    api
      .post(`/admin/questions/delete/${id}`, {})
      .then(() => setQuestions((prev) => prev.filter((q) => q.id !== id)))
      .catch((err) => console.error(err));
  };

  const handleCSVUpload = async () => {
    if (!csvFile || !testTitle) {
      await showAlert({
        title: "Missing Details",
        message: "Please select a file and enter a Test Name",
        tone: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("testName", testTitle);

    setSaveLoading(true);
    api
      .post("/admin/questions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(async (res) => {
        await showAlert({
          title: "Upload Complete",
          message: res.data.message,
          tone: "success",
        });
        window.location.reload();
      })
      .catch(async (err) => {
        console.error(err);
        await showAlert({
          title: "Upload Failed",
          message: "Upload failed: " + (err.response?.data?.error || err.message),
          tone: "danger",
        });
      })
      .finally(() => setSaveLoading(false));
  };

  const handleSaveConfig = async () => {
    if (!testTitle) {
      await showAlert({
        title: "Missing Test Name",
        message: "Please enter a Test Name first",
        tone: "warning",
      });
      return;
    }
    const configData = sections.map((s) => ({ ...s, subject: testTitle }));
    setSaveLoading(true);
    api
      .post("/admin/assessment/config", configData)
      .then(async () => {
        await showAlert({
          title: "Configuration Saved",
          message: "Assessment configuration saved!",
          tone: "success",
        });
      })
      .catch(async (err) => {
        console.error(err);
        await showAlert({
          title: "Save Failed",
          message: "Failed to save config",
          tone: "danger",
        });
      })
      .finally(() => setSaveLoading(false));
  };

  const addSectionRow = () => {
    setSections([
      ...sections,
      { sectionNumber: sections.length + 1, sectionName: "", timeLimit: 10 },
    ]);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container my-4">
      {dialogNode}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-question-circle me-2"></i>Question Bank Management
        </h1>
      </div>

      {/* Filter */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Filter Questions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Filter by Assessment Name</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Assessments</option>
                {subjects.map((subject, idx) => (
                  <option key={idx} value={subject}>
                    {subject} Assessment
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary me-2" onClick={() => {}}>
                Filter
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSelectedSubject("")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question / Create Assessment */}
      <div className="row">
        <div className="col-lg-7">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Manual Question Entry</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddQuestion}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Assessment Name (Company) *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={newQuestion.subject}
                      onChange={handleNewQuestionChange}
                      placeholder="e.g., Wipro, Indigo, TCS"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Assessment Section *</label>
                    <select
                      className="form-select"
                      name="level"
                      value={newQuestion.level}
                      onChange={handleNewQuestionChange}
                      required
                    >
                      <option value="1">Aptitude (Phase 1)</option>
                      <option value="2">Vocabulary (Phase 2)</option>
                      <option value="3">Technical (Phase 3)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="form-control"
                    name="text"
                    value={newQuestion.text}
                    onChange={handleNewQuestionChange}
                    rows="3"
                    required
                    placeholder="Enter the question text..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Options (4 required) *</label>
                  {newQuestion.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="form-control mb-2"
                      name="options"
                      value={opt}
                      onChange={(e) => handleNewQuestionChange(e, idx)}
                      placeholder={`Option ${idx + 1}`}
                      required
                    />
                  ))}
                </div>

                <div className="mb-3">
                  <label className="form-label">Correct Answer *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={handleNewQuestionChange}
                    placeholder="Must match one of the options exactly"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success">
                    Add To Bank
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          {/* ── CSV Upload card — UPDATED with coding format hint ── */}
          <div className="card mb-4 border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">CSV Bulk Upload</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">1. Enter Test Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Java Developer Assessment"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">2. Upload CSV File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />

                {/* ── CSV format toggle hint — NEW ── */}
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => setShowCodingFormat((v) => !v)}
                  >
                    {showCodingFormat ? "▲ Hide" : "▼ Show"} CSV format guide
                  </button>

                  {showCodingFormat && (
                    <div className="mt-2 p-2 bg-light border rounded small">
                      <p className="mb-1 fw-bold">MCQ / MSQ questions:</p>
                      <code className="d-block mb-2" style={{ fontSize: "0.72rem" }}>
                        type, question, option1, option2, option3, option4,
                        correctAn, hasCompi, description,
                        input1, output1, input2, output2
                      </code>
                      <p className="mb-1">MCQ example:</p>
                      <code className="d-block mb-2" style={{ fontSize: "0.72rem" }}>
                        MCQ, What is 2+2?, 3, 4, 5, 6, 4, false, , , , ,
                      </code>
                      <p className="mb-1 fw-bold">Coding questions:</p>
                      <code className="d-block" style={{ fontSize: "0.72rem" }}>
                        CODING, , , , , , , true, Add two numbers, "1 2", 3, "5 7", 12
                      </code>
                      <hr className="my-2" />
                      <p className="mb-0 text-muted">
                        OR use the original format (MCQ only):<br />
                        question, option_a, option_b, option_c, option_d, correct_answer
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={handleCSVUpload}
                disabled={saveLoading}
              >
                {saveLoading ? "Uploading..." : "Upload Assessment Questions"}
              </button>
            </div>
          </div>

          {/* Section Configuration — UNCHANGED */}
          <div className="card mb-4 border-info">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Assessment Sections & Timers</h5>
            </div>
            <div className="card-body">
              <p className="small text-muted mb-3">
                Define time limits for each section in "{testTitle || "..."}"
              </p>
              {sections.map((sec, idx) => (
                <div key={idx} className="row g-2 mb-2 align-items-center">
                  <div className="col-2">
                    <span className="badge bg-secondary">#{sec.sectionNumber}</span>
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Section Name"
                      value={sec.sectionName}
                      onChange={(e) =>
                        handleSectionChange(idx, "sectionName", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-4">
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Mins"
                        value={sec.timeLimit}
                        onChange={(e) =>
                          handleSectionChange(idx, "timeLimit", e.target.value)
                        }
                      />
                      <span className="input-group-text">min</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={addSectionRow}
                >
                  <i className="fas fa-plus me-1"></i> Add Section
                </button>
                <button
                  className="btn btn-info btn-sm text-white"
                  onClick={handleSaveConfig}
                  disabled={saveLoading}
                >
                  <i className="fas fa-save me-1"></i> Save Config
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List — UNCHANGED, but now shows CODING badge */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            Questions List{" "}
            <span className="badge bg-light text-dark">
              {filteredQuestions.length}
            </span>
          </h5>
        </div>
        <div className="card-body table-responsive">
          {filteredQuestions.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="fas fa-inbox fa-2x mb-2"></i>
              <p>No questions found</p>
            </div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Assessment Name</th>
                  <th>Type</th>
                  <th>Section</th>
                  <th>Question / Description</th>
                  <th>Options</th>
                  <th>Correct Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id}>
                    <td>{question.id}</td>
                    <td>
                      <span className="badge bg-info">
                        {question.subject} Assessment
                      </span>
                    </td>
                    {/* ── NEW: type badge ── */}
                    <td>
                      {question.hasCompiler ? (
                        <span className="badge bg-warning text-dark">
                          💻 CODING
                        </span>
                      ) : (
                        <span className="badge bg-secondary">MCQ</span>
                      )}
                    </td>
                    <td>
                      {question.level === 1 && (
                        <span className="badge bg-primary">Aptitude</span>
                      )}
                      {question.level === 2 && (
                        <span className="badge bg-secondary">Vocabulary</span>
                      )}
                      {question.level === 3 && (
                        <span className="badge bg-dark">Technical</span>
                      )}
                    </td>
                    <td>
                      <small>{question.text || "(coding question)"}</small>
                    </td>
                    <td>
                      {question.options && question.options.length > 0 ? (
                        <ol className="small mb-0">
                          {question.options.map((opt, idx) => (
                            <li key={idx}>{opt}</li>
                          ))}
                        </ol>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      {question.correctAnswer ? (
                        <span className="badge bg-success">
                          {question.correctAnswer}
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(question.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement;
