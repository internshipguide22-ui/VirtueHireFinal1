import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle2,
  ClipboardList,
  Code2,
  FilePlus2,
  PencilLine,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import "./TestManager.css";

const COMPILER_LANGUAGE_OPTIONS = ["C", "C++", "Java", "Python"];
const DEFAULT_SECTION = {
  subject: "",
  questionCount: 10,
  timeLimit: 10,
  passPercentage: 60,
  sectionMode: "NO_COMPILER",
  supportedLanguages: [],
};

const emptyQuestionForm = () => ({
  id: null,
  subject: "",
  questionType: "MCQ",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  codingDescription: "",
  testCases: [
    { input: "", expectedOutput: "" },
    { input: "", expectedOutput: "" },
  ],
});

const SectionRow = ({ section, index, allSubjectsInfo, onChange, onRemove }) => {
  const selectedSubjectInfo = allSubjectsInfo.find(
    (item) => item.subject === section.subject,
  );
  const maxAvailable = selectedSubjectInfo
    ? section.sectionMode === "COMPILER"
      ? (selectedSubjectInfo.compilerCount ?? 0)
      : (selectedSubjectInfo.noCompilerCount ?? selectedSubjectInfo.count ?? 0)
    : 0;

  return (
    <div className="tm-section-row">
      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Question Bank</label>
        <select
          className="tm-input"
          value={section.subject}
          onChange={(event) => onChange(index, "subject", event.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {allSubjectsInfo.map((subject) => (
            <option key={subject.subject} value={subject.subject}>
              {subject.subject} ({subject.noCompilerCount ?? subject.count} no compiler,{" "}
              {subject.compilerCount ?? 0} compiler)
            </option>
          ))}
        </select>
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Mode</label>
        <select
          className="tm-input"
          value={section.sectionMode}
          onChange={(event) => onChange(index, "sectionMode", event.target.value)}
        >
          <option value="NO_COMPILER">No Compiler</option>
          <option value="COMPILER">Compiler</option>
        </select>
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Questions</label>
        <input
          type="number"
          min="1"
          max={Math.max(maxAvailable, 1)}
          className="tm-input"
          value={section.questionCount}
          onChange={(event) =>
            onChange(
              index,
              "questionCount",
              Math.min(parseInt(event.target.value, 10) || 1, Math.max(maxAvailable, 1)),
            )
          }
          disabled={!section.subject}
        />
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Minutes</label>
        <input
          type="number"
          min="1"
          className="tm-input"
          value={section.timeLimit}
          onChange={(event) =>
            onChange(index, "timeLimit", parseInt(event.target.value, 10) || 1)
          }
        />
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Pass %</label>
        <input
          type="number"
          min="1"
          max="100"
          className="tm-input"
          value={section.passPercentage}
          onChange={(event) =>
            onChange(
              index,
              "passPercentage",
              Math.min(parseInt(event.target.value, 10) || 1, 100),
            )
          }
        />
      </div>

      {section.sectionMode === "COMPILER" ? (
        <div className="tm-section-ctrl tm-section-ctrl-wide">
          <label className="tm-ctrl-label">Languages</label>
          <div className="tm-language-grid">
            {COMPILER_LANGUAGE_OPTIONS.map((language) => {
              const checked = section.supportedLanguages.includes(language);
              return (
                <label
                  key={language}
                  className={`tm-language-chip ${checked ? "active" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? section.supportedLanguages.filter((item) => item !== language)
                        : [...section.supportedLanguages, language];
                      onChange(index, "supportedLanguages", next);
                    }}
                  />
                  <span>{language}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="tm-btn-remove"
        onClick={() => onRemove(index)}
        title="Remove section"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default function HRManualTestBuilder() {
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [questions, setQuestions] = useState([]);
  const [subjectsInfo, setSubjectsInfo] = useState([]);
  const [questionFilter, setQuestionFilter] = useState("");
  const [assessmentName, setAssessmentName] = useState("");
  const [description, setDescription] = useState("");
  const [chosenSections, setChosenSections] = useState([{ ...DEFAULT_SECTION }]);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadSubjectsInfo = async () => {
    const response = await api.get("/hrs/subjects-info");
    setSubjectsInfo(response.data?.subjects || []);
  };

  const loadQuestions = async (subject = "") => {
    setLoadingQuestions(true);
    try {
      const response = await api.get("/hrs/questions/manual", {
        params: subject ? { subject } : {},
      });
      setQuestions(response.data?.questions || []);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const refreshAll = async (subject = questionFilter) => {
    await Promise.all([loadSubjectsInfo(), loadQuestions(subject)]);
  };

  useEffect(() => {
    refreshAll().catch(() => {
      setError("Failed to load HR question builder data.");
    });
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!questionFilter) {
      return questions;
    }
    return questions.filter((question) => question.subject === questionFilter);
  }, [questions, questionFilter]);

  const setOption = (index, value) => {
    setQuestionForm((current) => {
      const options = [...current.options];
      options[index] = value;
      return { ...current, options };
    });
  };

  const setTestCaseValue = (index, field, value) => {
    setQuestionForm((current) => {
      const testCases = [...current.testCases];
      testCases[index] = { ...testCases[index], [field]: value };
      return { ...current, testCases };
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm(emptyQuestionForm());
  };

  const handleSaveQuestion = async () => {
    setError(null);
    setMessage(null);
    setSavingQuestion(true);
    try {
      const payload = {
        subject: questionForm.subject,
        questionType: questionForm.questionType,
        questionText: questionForm.questionText,
        options: questionForm.options,
        correctAnswer: questionForm.correctAnswer,
        codingDescription: questionForm.codingDescription,
        testCases: questionForm.testCases,
      };

      if (questionForm.id) {
        await api.put(`/hrs/questions/manual/${questionForm.id}`, payload);
        setMessage("Question updated successfully.");
      } else {
        await api.post("/hrs/questions/manual", payload);
        setMessage("Question created successfully.");
      }

      const nextFilter = questionForm.subject || questionFilter;
      resetQuestionForm();
      if (nextFilter) {
        setQuestionFilter(nextFilter);
      }
      await refreshAll(nextFilter);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleEditQuestion = (question) => {
    setError(null);
    setMessage(null);
    setQuestionForm({
      id: question.id,
      subject: question.subject || "",
      questionType: question.questionType || "MCQ",
      questionText: question.questionText || "",
      options:
        Array.isArray(question.options) && question.options.length === 4
          ? question.options
          : ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
      codingDescription: question.codingDescription || "",
      testCases:
        Array.isArray(question.testCases) && question.testCases.length >= 2
          ? question.testCases.slice(0, 2).map((testCase) => ({
              input: testCase.input || "",
              expectedOutput: testCase.expectedOutput || "",
            }))
          : [
              { input: "", expectedOutput: "" },
              { input: "", expectedOutput: "" },
            ],
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    setError(null);
    setMessage(null);
    try {
      await api.delete(`/hrs/questions/manual/${questionId}`);
      setMessage("Question deleted successfully.");
      await refreshAll();
      if (questionForm.id === questionId) {
        resetQuestionForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete question.");
    }
  };

  const addSection = () => {
    setChosenSections((current) => [...current, { ...DEFAULT_SECTION }]);
  };

  const updateSection = (index, field, value) => {
    setChosenSections((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };

      if (field === "subject" || field === "sectionMode") {
        const info = subjectsInfo.find((subject) => subject.subject === next[index].subject);
        const max = info
          ? next[index].sectionMode === "COMPILER"
            ? (info.compilerCount ?? 0)
            : (info.noCompilerCount ?? info.count ?? 0)
          : 0;
        if (next[index].questionCount > Math.max(max, 1)) {
          next[index].questionCount = Math.max(max, 1);
        }
      }

      if (field === "sectionMode" && value === "NO_COMPILER") {
        next[index].supportedLanguages = [];
      }

      if (
        field === "sectionMode" &&
        value === "COMPILER" &&
        next[index].supportedLanguages.length === 0
      ) {
        next[index].supportedLanguages = ["Python"];
      }

      return next;
    });
  };

  const removeSection = (index) => {
    setChosenSections((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSaveAssessment = async () => {
    setError(null);
    setMessage(null);
    if (!assessmentName.trim()) {
      setError("Assessment name is required.");
      return;
    }
    if (chosenSections.length === 0) {
      setError("Add at least one assessment section.");
      return;
    }

    setSavingAssessment(true);
    try {
      await api.post("/hrs/assessments/create", {
        assessmentName,
        description,
        sections: chosenSections,
      });
      setMessage(`Assessment "${assessmentName}" created successfully.`);
      setAssessmentName("");
      setDescription("");
      setChosenSections([{ ...DEFAULT_SECTION }]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create assessment.");
    } finally {
      setSavingAssessment(false);
    }
  };

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <h2 className="tm-page-title">
          <ClipboardList size={22} /> HR Manual Test Builder
        </h2>
        <p className="tm-page-sub">
          Create your own HR question bank manually, then publish assessments from only your
          own questions.
        </p>
      </div>

      {message ? (
        <div className="hrm-alert success">
          <CheckCircle2 size={18} /> {message}
        </div>
      ) : null}
      {error ? (
        <div className="hrm-alert error">
          <X size={18} /> {error}
        </div>
      ) : null}

      <div className="tm-card tm-card-upload">
        <div className="tm-card-head">
          <div className="tm-card-icon tm-icon-blue">
            <FilePlus2 size={18} />
          </div>
          <div>
            <h3 className="tm-card-title">
              {questionForm.id ? "Edit Question" : "Create Question"}
            </h3>
            <p className="tm-card-desc">
              Add MCQ or coding questions directly without CSV or PDF upload.
            </p>
          </div>
        </div>

        <div className="tm-field-group">
          <label className="tm-label">Subject</label>
          <input
            type="text"
            className="tm-input"
            placeholder="e.g. Java Backend"
            value={questionForm.subject}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, subject: event.target.value }))
            }
          />
        </div>

        <div className="tm-field-group">
          <label className="tm-label">Question Type</label>
          <div className="tm-manual-type-row">
            <button
              type="button"
              className={`tm-manual-type-btn ${questionForm.questionType === "MCQ" ? "active" : ""}`}
              onClick={() =>
                setQuestionForm((current) => ({ ...current, questionType: "MCQ" }))
              }
            >
              <ClipboardList size={16} /> MCQ
            </button>
            <button
              type="button"
              className={`tm-manual-type-btn ${questionForm.questionType === "CODING" ? "active" : ""}`}
              onClick={() =>
                setQuestionForm((current) => ({ ...current, questionType: "CODING" }))
              }
            >
              <Code2 size={16} /> Coding
            </button>
          </div>
        </div>

        {questionForm.questionType === "MCQ" ? (
          <>
            <div className="tm-field-group">
              <label className="tm-label">Question Text</label>
              <textarea
                className="tm-input"
                rows="3"
                value={questionForm.questionText}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    questionText: event.target.value,
                  }))
                }
              />
            </div>

            <div className="tm-manual-grid">
              {questionForm.options.map((option, index) => (
                <div key={`option-${index}`} className="tm-field-group">
                  <label className="tm-label">Option {index + 1}</label>
                  <input
                    type="text"
                    className="tm-input"
                    value={option}
                    onChange={(event) => setOption(index, event.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="tm-field-group">
              <label className="tm-label">Correct Answer</label>
              <input
                type="text"
                className="tm-input"
                value={questionForm.correctAnswer}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    correctAnswer: event.target.value,
                  }))
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="tm-field-group">
              <label className="tm-label">Coding Problem Description</label>
              <textarea
                className="tm-input"
                rows="5"
                value={questionForm.codingDescription}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    codingDescription: event.target.value,
                  }))
                }
              />
            </div>

            <div className="tm-pdf-testcase-grid">
              {questionForm.testCases.map((testCase, index) => (
                <React.Fragment key={`testcase-${index}`}>
                  <textarea
                    className="tm-input"
                    rows="3"
                    placeholder={`Input ${index + 1}`}
                    value={testCase.input}
                    onChange={(event) =>
                      setTestCaseValue(index, "input", event.target.value)
                    }
                  />
                  <textarea
                    className="tm-input"
                    rows="3"
                    placeholder={`Expected Output ${index + 1}`}
                    value={testCase.expectedOutput}
                    onChange={(event) =>
                      setTestCaseValue(index, "expectedOutput", event.target.value)
                    }
                  />
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        <div className="tm-save-row">
          <button
            type="button"
            className="tm-btn tm-btn-success"
            onClick={handleSaveQuestion}
            disabled={savingQuestion}
          >
            {savingQuestion ? (
              <>
                <Save size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> {questionForm.id ? "Update Question" : "Save Question"}
              </>
            )}
          </button>
          {questionForm.id ? (
            <button type="button" className="tm-btn tm-btn-outline" onClick={resetQuestionForm}>
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="tm-card tm-card-assessment">
        <div className="tm-card-head">
          <div className="tm-card-icon tm-icon-indigo">
            <PencilLine size={18} />
          </div>
          <div>
            <h3 className="tm-card-title">My Question Bank</h3>
            <p className="tm-card-desc">
              Review and maintain the questions you created as HR.
            </p>
          </div>
        </div>

        <div className="tm-filter-row">
          <select
            className="tm-input"
            value={questionFilter}
            onChange={async (event) => {
              const nextSubject = event.target.value;
              setQuestionFilter(nextSubject);
              await loadQuestions(nextSubject);
            }}
          >
            <option value="">All Subjects</option>
            {subjectsInfo.map((subject) => (
              <option key={subject.subject} value={subject.subject}>
                {subject.subject}
              </option>
            ))}
          </select>
        </div>

        {loadingQuestions ? (
          <div className="tm-empty-state">
            <p>Loading your questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="tm-empty-state">
            <p>No HR questions created yet for this subject.</p>
          </div>
        ) : (
          <div className="tm-manual-list">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="tm-manual-card">
                <div className="tm-manual-card-head">
                  <div>
                    <strong>{question.subject}</strong>
                    <span className="tm-manual-badge">
                      {question.questionType === "CODING" ? "Coding" : "MCQ"}
                    </span>
                  </div>
                  <div className="tm-manual-actions">
                    <button type="button" className="tm-btn tm-btn-outline" onClick={() => handleEditQuestion(question)}>
                      <PencilLine size={14} /> Edit
                    </button>
                    <button type="button" className="tm-btn tm-btn-remove" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
                <p className="tm-manual-text">
                  {question.questionType === "CODING"
                    ? question.codingDescription
                    : question.questionText}
                </p>
                {question.questionType === "MCQ" ? (
                  <div className="tm-manual-options">
                    {(question.options || []).map((option, index) => (
                      <span key={`${question.id}-option-${index}`} className="tm-language-chip active">
                        {option}
                      </span>
                    ))}
                    <div className="tm-manual-answer">
                      Correct: <strong>{question.correctAnswer}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="tm-manual-options">
                    {(question.testCases || []).map((testCase, index) => (
                      <div key={`${question.id}-case-${index}`} className="tm-manual-testcase">
                        <strong>Case {index + 1}</strong>
                        <span>Input: {testCase.input}</span>
                        <span>Expected: {testCase.expectedOutput}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tm-card tm-card-assessment">
        <div className="tm-card-head">
          <div className="tm-card-icon tm-icon-indigo">
            <Plus size={18} />
          </div>
          <div>
            <h3 className="tm-card-title">Publish Assessment</h3>
            <p className="tm-card-desc">
              Turn your HR-owned question bank into an assignable test.
            </p>
          </div>
        </div>

        <div className="tm-field-group">
          <label className="tm-label">Assessment Name</label>
          <input
            type="text"
            className="tm-input tm-input-lg"
            value={assessmentName}
            onChange={(event) => setAssessmentName(event.target.value)}
          />
        </div>

        <div className="tm-field-group">
          <label className="tm-label">Description</label>
          <textarea
            className="tm-input"
            rows="2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {subjectsInfo.length === 0 ? (
          <div className="tm-empty-state">
            <p>Create at least one HR-owned question before publishing an assessment.</p>
          </div>
        ) : (
          <>
            <div className="tm-config-table-wrap">
              {chosenSections.map((section, index) => (
                <div key={`section-${index}`} className="tm-section-wrapper">
                  <div className="tm-section-header">Section {index + 1}</div>
                  <SectionRow
                    section={section}
                    index={index}
                    allSubjectsInfo={subjectsInfo}
                    onChange={updateSection}
                    onRemove={removeSection}
                  />
                </div>
              ))}
            </div>

            <div className="tm-add-section-row">
              <button type="button" className="tm-btn tm-btn-outline" onClick={addSection}>
                <Plus size={16} /> Add Another Section
              </button>
            </div>
          </>
        )}

        <div className="tm-save-row">
          <button
            type="button"
            className="tm-btn tm-btn-success"
            onClick={handleSaveAssessment}
            disabled={savingAssessment || subjectsInfo.length === 0}
          >
            {savingAssessment ? (
              <>
                <Save size={16} /> Publishing...
              </>
            ) : (
              <>
                <Save size={16} /> Publish Assessment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
