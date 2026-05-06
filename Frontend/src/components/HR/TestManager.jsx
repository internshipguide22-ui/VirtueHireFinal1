import React, { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";
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

/* ── Toast Notification ─────────────────────────────────── */
const Toast = ({ toasts, remove }) => (
  <div className="tm-toast-stack">
    {toasts.map((t) => (
      <div key={t.id} className={`tm-toast tm-toast-${t.type}`}>
        <i
          className={
            t.type === "success"
              ? "fas fa-check-circle"
              : t.type === "error"
                ? "fas fa-times-circle"
                : "fas fa-info-circle"
          }
        />
        <span>{t.message}</span>
        <button className="tm-toast-close" onClick={() => remove(t.id)}>
          &times;
        </button>
      </div>
    ))}
  </div>
);

/* ── Upload Progress Bar ─────────────────────────────────── */
const ProgressBar = ({ progress, visible }) => {
  if (!visible) return null;
  return (
    <div className="tm-progress-wrap">
      <div className="tm-progress-bar" style={{ width: `${progress}%` }} />
      <span className="tm-progress-text">{progress}%</span>
    </div>
  );
};

/* ── Section Row in Assessment Config ────────────────────── */
const SectionRow = ({
  section,
  index,
  allSubjectsInfo,
  onChange,
  onRemove,
}) => {
  const selectedSubjectInfo = allSubjectsInfo.find(
    (s) => s.subject === section.subject,
  );
  const maxAvailable = selectedSubjectInfo
    ? section.sectionMode === "COMPILER"
      ? (selectedSubjectInfo.compilerCount ?? 0)
      : (selectedSubjectInfo.noCompilerCount ?? selectedSubjectInfo.count ?? 0)
    : 0;
  const availableLabel =
    section.sectionMode === "COMPILER" ? "coding/compiler" : "no-compiler";

  return (
    <div className="tm-section-row">
      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Question Bank (Subject)</label>
        <select
          className="tm-input"
          value={section.subject}
          onChange={(e) => onChange(index, "subject", e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {allSubjectsInfo.map((s) => (
            <option key={s.subject} value={s.subject}>
              {s.subject} ({s.noCompilerCount ?? s.count} no compiler,{" "}
              {s.compilerCount ?? 0} compiler)
            </option>
          ))}
        </select>
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Mode</label>
        <select
          className="tm-input"
          value={section.sectionMode}
          onChange={(e) => onChange(index, "sectionMode", e.target.value)}
        >
          <option value="NO_COMPILER">No Compiler</option>
          <option value="COMPILER">Compiler</option>
        </select>
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">
          Questions (max {maxAvailable} {availableLabel})
        </label>
        <input
          type="number"
          min="1"
          max={maxAvailable}
          value={section.questionCount}
          className="tm-input"
          onChange={(e) =>
            onChange(
              index,
              "questionCount",
              Math.min(parseInt(e.target.value) || 1, maxAvailable),
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
          value={section.timeLimit}
          className="tm-input"
          onChange={(e) =>
            onChange(index, "timeLimit", parseInt(e.target.value) || 1)
          }
        />
      </div>

      <div className="tm-section-ctrl">
        <label className="tm-ctrl-label">Pass %</label>
        <input
          type="number"
          min="1"
          max="100"
          value={section.passPercentage}
          className="tm-input"
          onChange={(e) =>
            onChange(
              index,
              "passPercentage",
              Math.min(parseInt(e.target.value) || 1, 100),
            )
          }
        />
      </div>

      {section.sectionMode === "COMPILER" && (
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
                      const nextLanguages = checked
                        ? section.supportedLanguages.filter(
                            (item) => item !== language,
                          )
                        : [...section.supportedLanguages, language];
                      onChange(index, "supportedLanguages", nextLanguages);
                    }}
                  />
                  <span>{language}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <button
        className="tm-btn-remove"
        title="Remove section"
        onClick={() => onRemove(index)}
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const TestManager = ({ hr, onSuccess, apiBase = "/hrs" }) => {
  const toastId = useRef(0);
  const [toasts, setToasts] = useState([]);

  /* ---------- helpers ---------- */
  const addToast = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ---------- shared state ---------- */
  const [allSubjectsInfo, setAllSubjectsInfo] = useState([]);

  const fetchSubjectsInfo = useCallback(async () => {
    try {
      const res = await api.get(`${apiBase}/subjects-info`, {
        withCredentials: true,
      });
      setAllSubjectsInfo(res.data.subjects || []); // Expecting [{subject: "Aptitude", count: 50}, ...]
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchSubjectsInfo();
  }, [fetchSubjectsInfo]);

  /* =====================================================
     SECTION 1 — QUESTION BANK UPLOAD
     ===================================================== */
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTestName, setUploadTestName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [pdfTestCases, setPdfTestCases] = useState({
    input1: "",
    output1: "",
    input2: "",
    output2: "",
  });

  const getUploadStatusMeta = (status) => {
    const message = status?.message || "";
    const authIssue =
      /unauthorized|bearer token|token missing|token invalid|not logged in/i.test(
        message,
      );

    if (authIssue) {
      return {
        title: "Authentication Required",
        hint: "Please log in again and retry the upload.",
      };
    }

    return {
      title: "Invalid CSV Format",
      hint: "Please check the CSV structure and try again.",
    };
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  }, []);

  const validateAndSetFile = (f) => {
    const fileName = (f.name || "").toLowerCase();
    const fileType = (f.type || "").toLowerCase();
    const isCsv =
      fileName.endsWith(".csv") ||
      fileType === "text/csv" ||
      fileType.includes("csv");
    const isPdf =
      fileName.endsWith(".pdf") ||
      fileType === "application/pdf" ||
      fileType.includes("pdf");

    if (!isCsv && !isPdf) {
      addToast("Please upload a PDF or CSV file.", "error");
      return;
    }
    setFile(f);
    setUploadStatus(null);
  };

  const validateCSV = (content) => {
    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const rows = (results.data || []).filter((row) =>
            Object.values(row || {}).some(
              (value) => String(value ?? "").trim() !== "",
            ),
          );

          if (rows.length === 0) {
            reject("The CSV file is empty or contains only blank rows.");
            return;
          }

          const rawHeaders = Object.keys(rows[0] || {});
          const normalizedHeaders = rawHeaders.reduce((acc, header) => {
            acc[header.trim().toLowerCase().replace(/\s+/g, "")] = header;
            return acc;
          }, {});

          const hasAnyHeader = (...keys) =>
            keys.some((key) => normalizedHeaders[key]);

          const subjectFormatMissing = [
            "subject",
            "text",
            "option1",
            "option2",
            "option3",
            "option4",
            "correctanswer",
          ].filter((key) => !normalizedHeaders[key]);

          const questionFormatMissing = [
            "question",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_answer",
          ].filter((key) => !normalizedHeaders[key]);

          const hasModernFormat = subjectFormatMissing.length === 0;
          const hasLegacyFormat = questionFormatMissing.length === 0;
          const hasMixedFormat = [
            hasAnyHeader("type"),
            hasAnyHeader("question"),
            hasAnyHeader("option1"),
            hasAnyHeader("option2"),
            hasAnyHeader("option3"),
            hasAnyHeader("option4"),
            hasAnyHeader("correctan", "correctanswer", "correctanswers"),
            hasAnyHeader("hascompi", "hascompiler"),
            hasAnyHeader("description"),
            hasAnyHeader("input1"),
            hasAnyHeader("output1"),
            hasAnyHeader("input2"),
            hasAnyHeader("output2"),
          ].every(Boolean);

          if (!hasModernFormat && !hasLegacyFormat && !hasMixedFormat) {
            reject(
              `Missing columns for subject format: ${subjectFormatMissing.join(", ") || "none"}. ` +
                `Missing columns for question format: ${questionFormatMissing.join(", ") || "none"}. ` +
                `For compiler CSV use: type,question,option1,option2,option3,option4,correctAn,hasCompi,description,input1,output1,input2,output2.`,
            );
            return;
          }

          const activeFormat = hasMixedFormat
            ? "mixed"
            : hasModernFormat
              ? "subject"
              : "question";

          if (activeFormat === "question" && !uploadTestName.trim()) {
            reject(
              "Enter a Target Subject Name before uploading the question format CSV.",
            );
            return;
          }

          for (let index = 0; index < rows.length; index += 1) {
            const row = rows[index];
            const rowNumber = index + 2;

            const getValue = (normalizedKey) => {
              const actualHeader = normalizedHeaders[normalizedKey];
              return String(
                actualHeader ? (row[actualHeader] ?? "") : "",
              ).trim();
            };

            const getAnyValue = (...keys) => {
              for (const key of keys) {
                const value = getValue(key);
                if (value) return value;
              }
              return "";
            };

            const subject =
              activeFormat === "subject"
                ? getValue("subject")
                : activeFormat === "mixed"
                  ? getValue("subject") || uploadTestName.trim()
                  : uploadTestName.trim();
            const text =
              activeFormat === "subject"
                ? getValue("text")
                : getValue("question");
            const options =
              activeFormat === "subject"
                ? [
                    getValue("option1"),
                    getValue("option2"),
                    getValue("option3"),
                    getValue("option4"),
                  ]
                : [
                    getValue("option_a"),
                    getValue("option_b"),
                    getValue("option_c"),
                    getValue("option_d"),
                  ];
            const correctAnswer =
              activeFormat === "subject"
                ? getValue("correctanswer")
                : activeFormat === "mixed"
                  ? getAnyValue("correctan", "correctanswer", "correctanswers")
                  : getValue("correct_answer");

            if (activeFormat === "mixed") {
              const type = getValue("type").toUpperCase();
              const hasCompiler =
                getAnyValue("hascompi", "hascompiler").toLowerCase() === "true";
              const isCoding = hasCompiler || type === "CODING";

              if (isCoding) {
                const missingCodingFields = [];
                if (!subject) missingCodingFields.push("subject/testName");
                if (!getValue("description"))
                  missingCodingFields.push("description");
                if (!getValue("input1")) missingCodingFields.push("input1");
                if (!getValue("output1")) missingCodingFields.push("output1");
                if (!getValue("input2")) missingCodingFields.push("input2");
                if (!getValue("output2")) missingCodingFields.push("output2");

                if (missingCodingFields.length > 0) {
                  reject(
                    `Row ${rowNumber} (CODING) is missing required value(s): ${missingCodingFields.join(", ")}.`,
                  );
                  return;
                }
                continue;
              }
            }

            const missingFields = [];
            if (!subject) missingFields.push("subject");
            if (!text)
              missingFields.push(
                activeFormat === "subject" ? "text" : "question",
              );
            options.forEach((option, optionIndex) => {
              if (!option) {
                missingFields.push(
                  activeFormat === "subject"
                    ? `option${optionIndex + 1}`
                    : `option_${String.fromCharCode(97 + optionIndex)}`,
                );
              }
            });
            if (!correctAnswer) {
              missingFields.push(
                activeFormat === "subject" ? "correctAnswer" : "correct_answer",
              );
            }

            if (missingFields.length > 0) {
              reject(
                `Row ${rowNumber} is missing required value(s): ${missingFields.join(", ")}.`,
              );
              return;
            }

            const answerMatches = options.some(
              (option) => option.toLowerCase() === correctAnswer.toLowerCase(),
            );
            if (!answerMatches) {
              reject(
                `Row ${rowNumber} has an invalid correct answer. It must match one of the provided options.`,
              );
              return;
            }
          }

          const sections = [
            ...new Set(
              rows
                .map((row) => {
                  if (activeFormat === "subject") {
                    const actualHeader = normalizedHeaders.subject;
                    return String(
                      actualHeader ? (row[actualHeader] ?? "") : "",
                    ).trim();
                  }
                  if (activeFormat === "mixed") {
                    const actualHeader = normalizedHeaders.subject;
                    return String(
                      actualHeader
                        ? (row[actualHeader] ?? "")
                        : uploadTestName.trim(),
                    ).trim();
                  }
                  return uploadTestName.trim();
                })
                .filter(Boolean),
            ),
          ];
          resolve({ count: rows.length, sections });
        },
        error: (err) => reject(err.message),
      });
    });
  };

  const handleUploadCSV = async () => {
    if (!file) {
      addToast("Please select a CSV file first.", "error");
      return;
    }
    const isPdfUpload =
      String(file.name || "")
        .toLowerCase()
        .endsWith(".pdf") ||
      String(file.type || "")
        .toLowerCase()
        .includes("pdf");

    if (isPdfUpload) {
      if (!uploadTestName.trim()) {
        addToast(
          "Please enter a Target Subject Name before uploading the PDF.",
          "error",
        );
        return;
      }
      const missingPdfTestCases = Object.entries(pdfTestCases)
        .filter(([, value]) => !String(value || "").trim())
        .map(([key]) => key);
      if (missingPdfTestCases.length > 0) {
        addToast(
          `PDF upload requires ${missingPdfTestCases.join(", ")}.`,
          "error",
        );
        return;
      }
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadStatus(null);

    try {
      let meta = null;
      if (!isPdfUpload) {
        const text = await file.text();
        try {
          meta = await validateCSV(text);
        } catch (valErr) {
          addToast(`Invalid CSV Format - ${valErr}`, "error");
          setUploadStatus({ ok: false, message: `Invalid CSV: ${valErr}` });
          setUploading(false);
          setUploadProgress(0);
          return;
        }
      }

      setUploadProgress(40);

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "testName",
        uploadTestName || meta?.sections?.[0] || "General",
      );
      if (isPdfUpload) {
        formData.append("input1", pdfTestCases.input1);
        formData.append("output1", pdfTestCases.output1);
        formData.append("input2", pdfTestCases.input2);
        formData.append("output2", pdfTestCases.output2);
      }

      await api.post(`${apiBase}/questions/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (e) => {
          if (e.total)
            setUploadProgress(40 + Math.round((e.loaded / e.total) * 50));
        },
      });

      setUploadProgress(100);
      setUploadStatus(
        isPdfUpload
          ? {
              ok: true,
              count: 1,
              sections: [uploadTestName || "General"],
              message: "PDF coding question uploaded successfully.",
            }
          : { ok: true, count: meta.count, sections: meta.sections },
      );
      addToast(
        isPdfUpload
          ? `Upload Successful! PDF question added under ${uploadTestName || "General"}.`
          : `Upload Successful! ${meta.count} questions uploaded. Sections: ${meta.sections.join(", ")}`,
        "success",
      );
      fetchSubjectsInfo();
      setFile(null);
      setUploadTestName("");
      setPdfTestCases({ input1: "", output1: "", input2: "", output2: "" });
    } catch (err) {
      const msg =
        err.response?.data?.error || "Upload failed. Please try again.";
      addToast(msg, "error");
      setUploadStatus({ ok: false, message: msg });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  /* =====================================================
     SECTION 2 — ASSESSMENT CREATION
     ===================================================== */
  const [assessmentName, setAssessmentName] = useState("");
  const [description, setDescription] = useState("");
  const [chosenSections, setChosenSections] = useState([
    { ...DEFAULT_SECTION },
  ]);
  const [savingAssessment, setSavingAssessment] = useState(false);

  const addSection = () => {
    setChosenSections((prev) => [...prev, { ...DEFAULT_SECTION }]);
  };

  const updateSection = (i, field, value) => {
    setChosenSections((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };

      // If subject or mode changed, validate max questions immediately
      if (field === "subject" || field === "sectionMode") {
        const info = allSubjectsInfo.find((s) => s.subject === copy[i].subject);
        const max = info
          ? copy[i].sectionMode === "COMPILER"
            ? (info.compilerCount ?? 0)
            : (info.noCompilerCount ?? info.count ?? 0)
          : 0;
        if (copy[i].questionCount > max) {
          copy[i].questionCount = Math.max(max, 1);
        }
      }

      if (field === "sectionMode" && value === "NO_COMPILER") {
        copy[i].supportedLanguages = [];
      }

      if (
        field === "subject" &&
        copy[i].sectionMode === "COMPILER" &&
        copy[i].supportedLanguages.length === 0
      ) {
        copy[i].supportedLanguages = ["Python"];
      }

      if (
        field === "sectionMode" &&
        value === "COMPILER" &&
        copy[i].supportedLanguages.length === 0
      ) {
        copy[i].supportedLanguages = ["Python"];
      }

      return copy;
    });
  };

  const removeSection = (i) => {
    setChosenSections((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSaveAssessment = async () => {
    if (!assessmentName.trim()) {
      addToast("Please enter an assessment name.", "error");
      return;
    }
    if (chosenSections.length === 0) {
      addToast("Please add at least one section.", "error");
      return;
    }

    // Validate sections
    for (let i = 0; i < chosenSections.length; i++) {
      const sec = chosenSections[i];
      if (!sec.subject) {
        addToast(`Please select a subject for Section ${i + 1}.`, "error");
        return;
      }
      if (sec.questionCount < 1) {
        addToast(`Section ${i + 1} must have at least 1 question.`, "error");
        return;
      }
      if (
        sec.sectionMode === "COMPILER" &&
        (!Array.isArray(sec.supportedLanguages) ||
          sec.supportedLanguages.length === 0)
      ) {
        addToast(
          `Please select at least one compiler language for Section ${i + 1}.`,
          "error",
        );
        return;
      }
    }

    setSavingAssessment(true);
    try {
      const payload = {
        assessmentName,
        description,
        sections: chosenSections,
      };
      await api.post(`${apiBase}/assessments/create`, payload, {
        withCredentials: true,
      });
      addToast(
        `Assessment "${assessmentName}" created successfully!`,
        "success",
      );
      if (onSuccess) onSuccess();
      setAssessmentName("");
      setDescription("");
      setChosenSections([{ ...DEFAULT_SECTION }]);
    } catch (err) {
      addToast(
        err.response?.data?.error || "Failed to save assessment.",
        "error",
      );
    } finally {
      setSavingAssessment(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────── */
  return (
    <div className="tm-page">
      <Toast toasts={toasts} remove={removeToast} />

      {/* ── PAGE TITLE ── */}
      <div className="tm-page-header">
        <h2 className="tm-page-title">
          <i className="fas fa-tasks" /> Manage Tests
        </h2>
        <p className="tm-page-sub">
          Upload questions to the Question Bank and create assessments for
          candidates.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════
          SECTION 1 — QUESTION BANK UPLOAD
          ════════════════════════════════════════════════════ */}
      <div className="tm-card tm-card-upload">
        <div className="tm-card-head">
          <div className="tm-card-icon tm-icon-blue">
            <i className="fas fa-cloud-upload-alt" />
          </div>
          <div>
            <h3 className="tm-card-title">Question Bank Upload</h3>
            <p className="tm-card-desc">
              Upload a CSV file containing questions for multiple subjects in
              one go.
            </p>
          </div>
        </div>

        {/* CSV Format Box */}
        <div className="tm-format-box">
          <div className="tm-format-header">
            <i className="fas fa-file-csv" /> CSV Format Required
          </div>
          <div className="tm-format-code">
            subject,text,option1,option2,option3,option4,correctAnswer
            <br />
            or
            <br />
            question,option_a,option_b,option_c,option_d,correct_answer
            <br />
            or
            <br />
            type,question,option1,option2,option3,option4,correctAn,hasCompi,description,input1,output1,input2,output2
            <br />
            or
            <br />
            PDF file + manual test cases below
          </div>
          <div className="tm-format-examples">
            <div className="tm-format-row">
              <span className="tm-tag tm-tag-aptitude">Aptitude</span>What is
              5+5?, 8, 9, 10, 11, <strong>10</strong>
            </div>
            <div className="tm-format-row">
              <span className="tm-tag tm-tag-vocab">Vocabulary</span>Meaning of
              Abundant?, Scarce, Plenty, Rare, None, <strong>Plenty</strong>
            </div>
            <div className="tm-format-row">
              <span className="tm-tag tm-tag-tech">Technical</span>What is JVM?,
              Java Virtual Machine, Java Vendor...,{" "}
              <strong>Java Virtual Machine</strong>
            </div>
          </div>
          <p className="tm-format-note">
            <i className="fas fa-lightbulb" /> CSV uploads can contain bulk
            questions. PDF uploads are treated as a coding problem statement and
            use the manual test cases entered below.
          </p>
        </div>

        {/* Optional Subject Name */}
        <div className="tm-field-group">
          <label className="tm-label">
            Target Subject Name{" "}
            <span className="tm-optional">(optional fallback)</span>
          </label>
          <input
            type="text"
            className="tm-input"
            placeholder="e.g., Java Backend Pool, Python Test"
            value={uploadTestName}
            onChange={(e) => setUploadTestName(e.target.value)}
          />
        </div>

        {file &&
          (String(file.name || "")
            .toLowerCase()
            .endsWith(".pdf") ||
            String(file.type || "")
              .toLowerCase()
              .includes("pdf")) && (
            <div className="tm-field-group">
              <label className="tm-label">
                PDF Test Cases <span className="tm-required">*</span>
              </label>
              <p className="tm-field-hint">
                <i className="fas fa-info-circle" /> The PDF can be in any
                readable format. Enter two test cases here for compiler
                evaluation.
              </p>
              <div className="tm-pdf-testcase-grid">
                <textarea
                  className="tm-input"
                  rows="3"
                  placeholder="Input 1"
                  value={pdfTestCases.input1}
                  onChange={(e) =>
                    setPdfTestCases((prev) => ({
                      ...prev,
                      input1: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="tm-input"
                  rows="3"
                  placeholder="Output 1"
                  value={pdfTestCases.output1}
                  onChange={(e) =>
                    setPdfTestCases((prev) => ({
                      ...prev,
                      output1: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="tm-input"
                  rows="3"
                  placeholder="Input 2"
                  value={pdfTestCases.input2}
                  onChange={(e) =>
                    setPdfTestCases((prev) => ({
                      ...prev,
                      input2: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="tm-input"
                  rows="3"
                  placeholder="Output 2"
                  value={pdfTestCases.output2}
                  onChange={(e) =>
                    setPdfTestCases((prev) => ({
                      ...prev,
                      output2: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

        {/* Drag & Drop Zone */}
        <div
          className={`tm-dropzone ${isDragging ? "tm-dropzone-drag" : ""} ${file ? "tm-dropzone-filled" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("tm-file-input").click()}
        >
          <input
            id="tm-file-input"
            type="file"
            accept=".csv,.pdf"
            hidden
            onChange={(e) => {
              if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          {file ? (
            <div className="tm-drop-filled">
              <i
                className={`fas ${
                  String(file.name || "")
                    .toLowerCase()
                    .endsWith(".pdf") ||
                  String(file.type || "")
                    .toLowerCase()
                    .includes("pdf")
                    ? "fa-file-pdf"
                    : "fa-file-csv"
                } tm-file-icon`}
              />
              <div>
                <p className="tm-file-name">{file.name}</p>
                <p className="tm-file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                className="tm-remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setUploadStatus(null);
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ) : (
            <div className="tm-drop-empty">
              <i className="fas fa-cloud-upload-alt tm-drop-icon" />
              <p className="tm-drop-main">
                Drag and drop your CSV / PDF file here
              </p>
              <p className="tm-drop-sub">
                or <span className="tm-drop-link">click to browse</span>
              </p>
              <div className="tm-drop-badge">Supported Formats: CSV, PDF</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={uploadProgress} visible={uploading} />

        {/* Upload Status */}
        {uploadStatus && (
          <div
            className={`tm-status-box ${uploadStatus.ok ? "tm-status-ok" : "tm-status-err"}`}
          >
            {uploadStatus.ok ? (
              <>
                <i className="fas fa-check-circle" />
                <div>
                  <strong>Upload Successful</strong>
                  <p>
                    Total Questions Uploaded:{" "}
                    <strong>{uploadStatus.count}</strong>
                  </p>
                  <p>
                    Subjects Detected:{" "}
                    <strong>{uploadStatus.sections.join(", ")}</strong>
                  </p>
                </div>
              </>
            ) : (
              (() => {
                const statusMeta = getUploadStatusMeta(uploadStatus);
                return (
                  <>
                    <i className="fas fa-exclamation-triangle" />
                    <div>
                      <strong>{statusMeta.title}</strong>
                      <p>{uploadStatus.message}</p>
                      <p>{statusMeta.hint}</p>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        )}

        <button
          className="tm-btn tm-btn-primary"
          onClick={handleUploadCSV}
          disabled={!file || uploading}
        >
          {(() => {
            const isPdf =
              String(file?.name || "")
                .toLowerCase()
                .endsWith(".pdf") ||
              String(file?.type || "")
                .toLowerCase()
                .includes("pdf");

            if (uploading) {
              return (
                <>
                  <i className="fas fa-spinner fa-spin" /> Uploading...
                </>
              );
            }
            return (
              <>
                <i className="fas fa-upload" /> Upload {isPdf ? "PDF" : "CSV"}
              </>
            );
          })()}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          SECTION 2 — ASSESSMENT CREATION
          ════════════════════════════════════════════════════ */}
      <div className="tm-card tm-card-assessment">
        <div className="tm-card-head">
          <div className="tm-card-icon tm-icon-indigo">
            <i className="fas fa-clipboard-list" />
          </div>
          <div>
            <h3 className="tm-card-title">Assessment Creation</h3>
            <p className="tm-card-desc">
              Create dynamically generated assessments by pulling randomized
              questions from the available subjects.
            </p>
          </div>
        </div>

        {/* Assessment Name */}
        <div className="tm-field-group">
          <label className="tm-label">
            Assessment Name <span className="tm-required">*</span>
          </label>
          <input
            type="text"
            className="tm-input tm-input-lg"
            placeholder="e.g., Senior Frontend Engineer Assessment"
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="tm-field-group">
          <label className="tm-label">
            Description <span className="tm-optional">(optional)</span>
          </label>
          <textarea
            className="tm-input"
            rows="2"
            placeholder="e.g., Covers React, CSS, and basic algorithms."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Section Configuration Table */}
        <div className="tm-sections-container">
          <h4 className="tm-sections-title">Assessment Sections</h4>
          <p className="tm-field-hint">
            <i className="fas fa-info-circle" /> Configure each section
            independently. Questions will be randomly pulled per candidate.
          </p>

          {chosenSections.length > 0 && (
            <div className="tm-config-table-wrap">
              {chosenSections.map((sec, i) => (
                <div key={i} className="tm-section-wrapper">
                  <div className="tm-section-header">Section {i + 1}</div>
                  <SectionRow
                    section={sec}
                    index={i}
                    allSubjectsInfo={allSubjectsInfo}
                    onChange={updateSection}
                    onRemove={removeSection}
                  />
                </div>
              ))}
            </div>
          )}

          {allSubjectsInfo.length === 0 && (
            <div className="tm-empty-state">
              <i className="fas fa-database" />
              <p>
                No subjects found in the Question Bank. Please upload a CSV
                first.
              </p>
            </div>
          )}

          {/* Add Section Button */}
          {allSubjectsInfo.length > 0 && (
            <div className="tm-add-section-row">
              <button className="tm-btn tm-btn-outline" onClick={addSection}>
                <i className="fas fa-plus" /> Add Another Section
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="tm-save-row">
          <button
            className="tm-btn tm-btn-success"
            onClick={handleSaveAssessment}
            disabled={savingAssessment || chosenSections.length === 0}
          >
            {savingAssessment ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Publishing...
              </>
            ) : (
              <>
                <i className="fas fa-save" /> Publish Assessment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestManager;
