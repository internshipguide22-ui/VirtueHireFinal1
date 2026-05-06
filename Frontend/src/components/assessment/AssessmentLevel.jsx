import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AssessmentLevel.css";

const CAMERA_PERMISSION_KEY = "assessmentCameraGranted";
const ASSESSMENT_DELIVERY_MODE_KEY = "assessmentDeliveryMode";
const MAX_VIOLATIONS = 3;
const QUESTION_COUNT = { 1: 30, 2: 30, 3: 40 };

const LANGUAGE_CONFIG = {
  C: {
    id: 50,
    template: "#include <stdio.h>\n\nint main() {\n    return 0;\n}\n",
  },
  "C++": {
    id: 54,
    template:
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
  },
  Java: {
    id: 62,
    template:
      "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}\n",
  },
  Python: {
    id: 71,
    template:
      'def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
  },
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const serverMessage =
    error?.response?.data?.error ??
    error?.response?.data?.message ??
    error?.message;

  if (typeof serverMessage === "string") {
    const trimmedMessage = serverMessage.trim();
    if (trimmedMessage && trimmedMessage.toLowerCase() !== "null") {
      return trimmedMessage;
    }
  }

  return fallbackMessage;
};

const getDefaultLanguage = (supportedLanguages = []) => {
  const available = supportedLanguages.filter(
    (language) => LANGUAGE_CONFIG[language],
  );
  return available[0] || "Python";
};

const getLanguageId = (language) =>
  LANGUAGE_CONFIG[language]?.id || LANGUAGE_CONFIG.Python.id;

const getStarterCode = (language) =>
  LANGUAGE_CONFIG[language]?.template || LANGUAGE_CONFIG.Python.template;

const attachStreamToVideo = async (videoElement, stream) => {
  if (!videoElement || !stream) return false;

  try {
    if (videoElement.srcObject !== stream) {
      videoElement.srcObject = stream;
    }

    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;

    const playPromise = videoElement.play?.();
    if (playPromise && typeof playPromise.then === "function") {
      await playPromise;
    }

    return true;
  } catch (error) {
    console.error("Failed to attach webcam stream to video element:", error);
    return false;
  }
};

const AssessmentLevel = () => {
  const params = useParams();
  const navigate = useNavigate();

  // ✅ FIX: Proper subject resolution with fallbacks
  const subject =
    params.subject ||
    localStorage.getItem("selectedAssessment") ||
    sessionStorage.getItem("selectedAssessment") ||
    "";

  const levelNum = parseInt(params.level, 10);
  const encodedSubject = encodeURIComponent(subject);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [codingDetails, setCodingDetails] = useState({});
  const [codingExecution, setCodingExecution] = useState({});
  const [sectionMetadata, setSectionMetadata] = useState({
    name: "",
    timeLimit: 0,
    mode: "NO_COMPILER",
    supportedLanguages: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [lastActivity, setLastActivity] = useState("");
  const [deliveryMode, setDeliveryMode] = useState(() => {
    const storedMode =
      sessionStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY) ||
      localStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY);
    return storedMode === "offline" ? "offline" : "online";
  });
  const isOfflineMode = deliveryMode === "offline";

  const currentQuestion = questions[currentQuestionIndex];
  const currentCodingAnswer = currentQuestion?.hasCompiler
    ? codingAnswers[currentQuestion.id]
    : null;
  const currentCodingDetail = currentQuestion?.hasCompiler
    ? codingDetails[currentQuestion.id]
    : null;
  const currentExecutionState = currentQuestion?.hasCompiler
    ? codingExecution[currentQuestion.id] || {}
    : {};

  // ✅ Safety check - redirect if no subject
  useEffect(() => {
    if (!subject && !loading) {
      setError(
        "No assessment selected. Please select an assessment from the dashboard.",
      );
      setIsLocked(true);
      setTimeout(() => {
        navigate("/candidates/welcome");
      }, 3000);
    }
  }, [subject, navigate, loading]);

  useEffect(() => {
    const storedMode =
      sessionStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY) ||
      localStorage.getItem(ASSESSMENT_DELIVERY_MODE_KEY);
    setDeliveryMode(storedMode === "offline" ? "offline" : "online");
  }, [subject, levelNum]);

  useEffect(() => {
    const initializeCameraAndAssessment = async () => {
      setLoading(true);
      setCameraError("");

      // ✅ Validate subject before proceeding
      if (!subject) {
        setError("Invalid assessment. Please start again from the dashboard.");
        setIsLocked(true);
        setLoading(false);
        return;
      }

      try {
        if (!isOfflineMode) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          cameraStreamRef.current = stream;
          const attached = await attachStreamToVideo(videoRef.current, stream);
          setCameraReady(attached || Boolean(stream.active));
        } else {
          setCameraReady(false);
          setCameraError("");
        }

        await fetchStatus();
      } catch (err) {
        console.error("Failed to start webcam:", err);
        setCameraReady(false);
        setCameraError(
          "Webcam access is required during the assessment. Please allow camera permission and try again.",
        );
        setError("Webcam access is required during the assessment.");
        setIsLocked(true);
        setLoading(false);
      }
    };

    const fetchStatus = async () => {
      setLoading(true);
      setError("");
      setIsLocked(false);
      setSubmitted(false);
      setQuestions([]);
      setAnswers({});
      setCodingAnswers({});
      setCodingDetails({});
      setCodingExecution({});
      setCurrentQuestionIndex(0);
      setSectionMetadata({
        name: "",
        timeLimit: 0,
        mode: "NO_COMPILER",
        supportedLanguages: [],
      });
      setTimeLeft(0);

      try {
        const candData = JSON.parse(localStorage.getItem("candidate") || "{}");
        setCandidate(candData);

        // ✅ Use encodedSubject for API call
        const res = await api.get(`/assessment/status/${encodedSubject}`, {
          withCredentials: true,
        });

        if (res.data?.error) {
          setError(res.data.error);
          setIsLocked(true);
          setLoading(false);
          return;
        }

        const nextLevel = Number(res.data.nextLevel) || 1;
        if (nextLevel < levelNum) {
          setError("You cannot attempt this level.");
          setIsLocked(true);
          setLoading(false);
          return;
        }

        await fetchQuestions();
      } catch (err) {
        console.error("Status check failed:", err);
        setError(
          getApiErrorMessage(
            err,
            "Failed to check level status. Make sure you are logged in.",
          ),
        );
        setIsLocked(true);
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      try {
        // ✅ Debug log to verify API call
        console.log(
          `Calling API: /assessment/${encodedSubject}/level/${levelNum}`,
        );

        const res = await api.get(
          `/assessment/${encodedSubject}/level/${levelNum}`,
          { withCredentials: true },
        );

        if (!res?.data) {
          setError("No response received for this section. Please try again.");
          setIsLocked(true);
          setLoading(false);
          return;
        }

        if (res.data?.error) {
          setError(res.data.error);
          setIsLocked(true);
          setLoading(false);
          return;
        }

        const qs = Array.isArray(res.data.questions) ? res.data.questions : [];
        if (qs.length === 0) {
          setError(
            typeof res.data.message === "string" &&
              res.data.message.trim() &&
              res.data.message.trim().toLowerCase() !== "null"
              ? res.data.message
              : "No questions found for this level.",
          );
          setIsLocked(true);
          setLoading(false);
          return;
        }

        const supportedLanguages =
          Array.isArray(res.data.supportedLanguages) &&
          res.data.supportedLanguages.length > 0
            ? res.data.supportedLanguages.filter(
                (language) => LANGUAGE_CONFIG[language],
              )
            : ["Python", "Java", "C++", "C"];

        const nextCodingAnswers = {};
        qs.forEach((question) => {
          if (question.hasCompiler) {
            const defaultLanguage = getDefaultLanguage(supportedLanguages);
            nextCodingAnswers[question.id] = {
              sourceCode: getStarterCode(defaultLanguage),
              language: defaultLanguage,
              languageId: getLanguageId(defaultLanguage),
              stdin: "",
              submitted: false,
            };
          }
        });

        setQuestions(qs);
        setCodingAnswers(nextCodingAnswers);
        setCurrentQuestionIndex(0);
        setSectionMetadata({
          name: res.data.sectionName || "Assessment Section",
          timeLimit: res.data.timeLimit || 10,
          mode:
            res.data.sectionMode ||
            (qs.some((question) => question.hasCompiler)
              ? "COMPILER"
              : "NO_COMPILER"),
          supportedLanguages,
        });
        setTimeLeft((res.data.timeLimit || 10) * 60);
        setAnswers({});
        setSubmitted(false);
        setError("");
        setIsLocked(false);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load questions:", err);
        setError(
          getApiErrorMessage(
            err,
            "Failed to load questions for the next section. Please try again.",
          ),
        );
        setIsLocked(true);
        setLoading(false);
      }
    };

    initializeCameraAndAssessment();

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [encodedSubject, levelNum, subject, navigate, isOfflineMode]);

  useEffect(() => {
    const syncVideo = async () => {
      if (!videoRef.current || !cameraStreamRef.current) return;
      const attached = await attachStreamToVideo(
        videoRef.current,
        cameraStreamRef.current,
      );
      if (attached) {
        setCameraReady(true);
      }
    };

    syncVideo();
  }, [loading, currentQuestionIndex]);

  useEffect(() => {
    if (currentQuestion?.hasCompiler && !codingDetails[currentQuestion.id]) {
      api
        .get(`/questions/${currentQuestion.id}/coding`, {
          withCredentials: true,
        })
        .then((res) => {
          setCodingDetails((prev) => ({
            ...prev,
            [currentQuestion.id]: {
              description:
                res.data?.description || "Solve the coding problem below.",
              testCaseCount: res.data?.testCaseCount || 0,
            },
          }));
        })
        .catch((err) => {
          setCodingDetails((prev) => ({
            ...prev,
            [currentQuestion.id]: {
              description: getApiErrorMessage(
                err,
                "Unable to load coding question details.",
              ),
              testCaseCount: 0,
              error: true,
            },
          }));
        });
    }
  }, [currentQuestion, codingDetails]);

  useEffect(() => {
    if (isLocked || submitted || timeLeft <= 0) return;

    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [timeLeft, isLocked, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const logActivity = async (eventType, details = "") => {
    if (!candidate || submitted) return;
    try {
      await api.post(
        "/monitoring/log",
        {
          candidateId: candidate.id,
          candidateName: candidate.fullName || candidate.name,
          assessmentName: subject,
          section: sectionMetadata.name,
          questionNumber: currentQuestionIndex + 1,
          eventType,
          eventDetails: details,
          violationCount,
          timeLeft,
        },
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  useEffect(() => {
    if (!loading && questions.length > 0) {
      logActivity("EXAM_STARTED", "Candidate started the level");
    }
  }, [loading, questions.length]);

  useEffect(() => {
    if (questions.length > 0) {
      logActivity(
        "QUESTION_CHANGED",
        `Moved to question ${currentQuestionIndex + 1}`,
      );
    }
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (submitted || isLocked || questions.length === 0) return;

    const autoSaveInterval = setInterval(() => {
      const formattedAnswers = {};
      questions.forEach((question) => {
        if (!question.hasCompiler) {
          formattedAnswers[question.id.toString()] = answers[question.id] || "";
        }
      });

      // ✅ FIX 4: Final submission payload
      const formattedCodingAnswers = {};
      Object.entries(codingAnswers).forEach(([questionId, value]) => {
        const safeCode = value.sourceCode?.trim() || "";

        if (!safeCode) {
          console.warn("Empty code detected for question:", questionId); // ✅ debug
        }

        formattedCodingAnswers[questionId] = {
          sourceCode: safeCode, // ✅ FIXED
          languageId: value.languageId,
          submitted: value.submitted,
        };
      });

      api
        .post(
          `/assessment/${encodedSubject}/submit/${levelNum}?autosave=true`,
          {
            answers: formattedAnswers,
            codingAnswers: formattedCodingAnswers,
            violations: violationCount,
            lastActivity,
            isAutoSave: true,
          },
          { withCredentials: true },
        )
        .catch((err) => console.error("Auto-save failed:", err));

      logActivity("AUTO_SAVE", "Answers auto-saved");
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [
    answers,
    codingAnswers,
    questions,
    submitted,
    isLocked,
    encodedSubject,
    levelNum,
    violationCount,
    lastActivity,
  ]);

  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS && !submitted) {
      alert("Maximum violations reached. Your exam is being submitted.");
      handleSubmit(null, true);
    }
  }, [violationCount, submitted]);

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !submitted) {
        setViolationCount((prev) => prev + 1);
        setLastActivity("Tab switched");
        logActivity("TAB_SWITCH", "Candidate switched tabs");
        alert("Tab switching is not allowed during the exam.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
        setViolationCount((prev) => prev + 1);
        setLastActivity("Fullscreen exited");
        logActivity("FULLSCREEN_EXIT", "Candidate exited fullscreen");
        alert(
          "Exiting fullscreen is not allowed during the exam. Re-entering fullscreen...",
        );
        enterFullscreen();
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey &&
          (e.keyCode === 67 ||
            e.keyCode === 86 ||
            e.keyCode === 88 ||
            e.keyCode === 65)) ||
        e.keyCode === 116 ||
        (e.ctrlKey && e.keyCode === 82)
      ) {
        e.preventDefault();
        setViolationCount((prev) => prev + 1);
        const details = `Blocked key combo: ${e.key}`;
        setLastActivity(details);
        logActivity("FORBIDDEN_KEY", details);
        alert("This action is prohibited during the exam.");
      }
    };

    const handleBlur = () => {
      if (!submitted) {
        setViolationCount((prev) => prev + 1);
        setLastActivity("Window focus lost");
        logActivity("WINDOW_BLUR", "Exam window lost focus");
      }
    };

    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.body.style.userSelect = "auto";
    };
  }, [submitted]);

  const handleAutoSubmit = () => {
    if (!submitted) {
      handleSubmit(null, true);
    }
  };

  const handleSelect = (questionId, selected) => {
    if (submitted || isLocked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selected }));
  };

  const updateCodingAnswer = (questionId, nextValues) => {
    setCodingAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...nextValues,
      },
    }));
  };

  const handleLanguageChange = (questionId, language) => {
    updateCodingAnswer(questionId, {
      language,
      languageId: getLanguageId(language),
      sourceCode: getStarterCode(language),
    });
  };

  // ✅ FIX 2: handleRunCode
  const handleRunCode = async () => {
    if (!currentQuestion?.hasCompiler || !currentCodingAnswer) return;

    const safeCode = currentCodingAnswer.sourceCode?.trim();

    // ✅ Prevent empty code
    if (!safeCode) {
      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          error: "Code cannot be empty",
        },
      }));
      return;
    }

    console.log("SENDING CODE:", safeCode); // ✅ Debug

    setCodingExecution((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        running: true,
        error: "",
      },
    }));

    try {
      const res = await api.post(
        "/assessment/run",
        {
          questionId: currentQuestion.id,
          sourceCode: safeCode,
          languageId: currentCodingAnswer.languageId,
          stdin: currentCodingAnswer.stdin || "",
        },
        { withCredentials: true },
      );

      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          running: false,
          runResult: res.data,
          error: "",
        },
      }));
      logActivity("CODE_RUN", `Executed ${currentCodingAnswer.language} code`);
    } catch (err) {
      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          running: false,
          error: getApiErrorMessage(err, "Failed to run code."),
        },
      }));
    }
  };

  // ✅ FIX 3: handleSubmitCode
  const handleSubmitCode = async () => {
    if (!currentQuestion?.hasCompiler || !currentCodingAnswer) return;

    const safeCode = currentCodingAnswer.sourceCode?.trim();

    // ✅ Prevent empty code
    if (!safeCode) {
      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          error: "Please write code before submitting",
        },
      }));
      return;
    }

    setCodingExecution((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        submitting: true,
        error: "",
      },
    }));

    try {
      const res = await api.post(
        "/questions/code/submit",
        {
          questionId: currentQuestion.id,
          sourceCode: safeCode,
          languageId: currentCodingAnswer.languageId,
        },
        { withCredentials: true },
      );

      updateCodingAnswer(currentQuestion.id, { submitted: true });

      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          submitting: false,
          judgeResult: res.data,
          error: "",
        },
      }));
      logActivity(
        "CODE_SUBMIT",
        `Submitted ${currentCodingAnswer.language} code for evaluation`,
      );
    } catch (err) {
      setCodingExecution((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          submitting: false,
          error: getApiErrorMessage(err, "Failed to submit code."),
        },
      }));
    }
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e?.preventDefault) e.preventDefault();
    if (isLocked) return;

    try {
      const formattedAnswers = {};
      questions.forEach((question) => {
        if (!question.hasCompiler) {
          formattedAnswers[question.id.toString()] = answers[question.id] || "";
        }
      });

      // ✅ FIX 4: Final submission payload
      const formattedCodingAnswers = {};
      Object.entries(codingAnswers).forEach(([questionId, value]) => {
        const safeCode = value.sourceCode?.trim() || "";

        if (!safeCode) {
          console.warn("Empty code detected for question:", questionId); // ✅ debug
        }

        formattedCodingAnswers[questionId] = {
          sourceCode: safeCode, // ✅ FIXED
          languageId: value.languageId,
          submitted: value.submitted,
        };
      });

      const res = await api.post(
        `/assessment/${encodedSubject}/submit/${levelNum}`,
        {
          answers: formattedAnswers,
          codingAnswers: formattedCodingAnswers,
          violations: violationCount,
          lastActivity,
          isAutoSubmit,
          deliveryMode,
        },
        { withCredentials: true },
      );

      if (res.data?.error) {
        alert(res.data.error);
        return;
      }

      const score = res.data.score ?? res.data.percentage ?? 0;
      const percentage = res.data.percentage ?? null;
      const passed =
        res.data.passed ??
        (percentage !== null ? percentage >= 60 : score >= 60);

      setSubmitted(true);
      logActivity(
        "EXAM_SUBMITTED",
        isAutoSubmit
          ? "Auto-submitted due to violations or timeout"
          : "Manually submitted",
      );

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      sessionStorage.removeItem(CAMERA_PERMISSION_KEY);

      if (isAutoSubmit) {
        navigate("/candidates/welcome");
      } else {
        navigate("/assessment/result", {
          state: {
            score: percentage !== null ? percentage : score,
            passed: !!passed,
            level: levelNum,
            subject,
            deliveryMode,
            isLastLevel: levelNum === Object.keys(QUESTION_COUNT).length,
            autoSubmitted: isAutoSubmit,
          },
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      const msg = getApiErrorMessage(
        err,
        "Error submitting answers. Please check your connection and try again.",
      );
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const answeredCount = questions.filter((question) =>
    question.hasCompiler
      ? Boolean(codingAnswers[question.id]?.sourceCode?.trim())
      : Boolean(answers[question.id]),
  ).length;

  const renderExecutionPanel = () => {
    if (!currentQuestion?.hasCompiler) return null;

    const runResult = currentExecutionState.runResult;
    const judgeResult = currentExecutionState.judgeResult;

    return (
      <div className="exam-code-output">
        <div className="exam-code-output-card">
          <div className="exam-code-output-head">
            <span>Run Output</span>
            {runResult?.statusDescription && (
              <span>{runResult.statusDescription}</span>
            )}
          </div>
          <pre>
            {runResult?.stdout ||
              runResult?.stderr ||
              runResult?.compileOutput ||
              "Run the code with custom input to inspect output."}
          </pre>
        </div>

        <div className="exam-code-output-card">
          <div className="exam-code-output-head">
            <span>Judge Result</span>
            {judgeResult && (
              <span>
                {judgeResult.passedTestCases}/{judgeResult.totalTestCases}{" "}
                passed
              </span>
            )}
          </div>
          {judgeResult?.results?.length ? (
            <div className="exam-testcase-list">
              {judgeResult.results.map((result) => (
                <div
                  key={result.index}
                  className={`exam-testcase-item ${result.passed ? "pass" : "fail"}`}
                >
                  <strong>Test {result.index}</strong>
                  <span>{result.passed ? "Passed" : "Failed"}</span>
                  <small>Expected: {result.expectedOutput}</small>
                  <small>Actual: {result.actualOutput || "(no output)"}</small>
                </div>
              ))}
            </div>
          ) : (
            <pre>Submit the code to run it against the hidden test cases.</pre>
          )}
        </div>

        {currentExecutionState.error && (
          <div className="exam-inline-error">{currentExecutionState.error}</div>
        )}
      </div>
    );
  };

  const renderCodingWorkspace = () => {
    if (!currentQuestion?.hasCompiler || !currentCodingAnswer) return null;

    return (
      <div className="exam-code-layout">
        <div className="exam-code-problem">
          <div className="exam-code-chip-row">
            <span className="exam-mode-chip compiler">Compiler Mode</span>
            <span className="exam-mode-chip neutral">
              {currentCodingDetail?.testCaseCount || 0} hidden test cases
            </span>
          </div>
          <h4 className="exam-question-text">
            {currentCodingDetail?.description ||
              "Loading coding problem statement..."}
          </h4>
          <div className="exam-code-help">
            Write the full program for the selected language. Use the custom
            input box for quick runs, and use submit code to validate against
            the stored test cases.
          </div>
        </div>

        <div className="exam-code-editor-panel">
          <div className="exam-code-toolbar">
            <select
              className="exam-code-select"
              value={currentCodingAnswer.language}
              onChange={(e) =>
                handleLanguageChange(currentQuestion.id, e.target.value)
              }
              disabled={submitted || isLocked}
            >
              {sectionMetadata.supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            <div className="exam-code-actions">
              <button
                type="button"
                className="exam-secondary-btn"
                onClick={handleRunCode}
                disabled={
                  submitted || isLocked || currentExecutionState.running
                }
              >
                {currentExecutionState.running ? "Running..." : "Run Code"}
              </button>
              <button
                type="button"
                className="exam-nav-btn btn btn-success px-4 fw-bold"
                onClick={handleSubmitCode}
                disabled={
                  submitted || isLocked || currentExecutionState.submitting
                }
              >
                {currentExecutionState.submitting
                  ? "Submitting..."
                  : "Submit Code"}
              </button>
            </div>
          </div>

          {/* ✅ FIX 1: textarea binding */}
          <textarea
            className="exam-code-editor"
            value={currentCodingAnswer.sourceCode || ""} // ✅ FIXED
            onChange={(e) =>
              updateCodingAnswer(currentQuestion.id, {
                sourceCode: e.target.value,
              })
            }
            spellCheck={false}
            disabled={submitted || isLocked}
          />

          <textarea
            className="exam-code-stdin"
            placeholder="Custom input for Run Code"
            value={currentCodingAnswer.stdin}
            onChange={(e) =>
              updateCodingAnswer(currentQuestion.id, { stdin: e.target.value })
            }
            spellCheck={false}
            disabled={submitted || isLocked}
          />

          {renderExecutionPanel()}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f7fa",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          backgroundColor: "#fff",
          padding: "1rem 2rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h5
              className="exam-title"
              style={{ margin: 0, fontWeight: "800", color: "#1e293b" }}
            >
              {subject || "Assessment"}
            </h5>
            <span
              className="exam-subtitle"
              style={{ fontSize: "0.85rem", color: "#64748b" }}
            >
              {sectionMetadata.name}
            </span>
          </div>
          <div className="exam-camera-pill">
            <i
              className={`fas ${isOfflineMode ? "fa-video-slash" : "fa-video"}`}
            ></i>{" "}
            {isOfflineMode
              ? "Offline Mode"
              : cameraReady
                ? "Webcam On"
                : "Webcam Required"}
          </div>
          <div className="exam-mode-chip-row">
            <span
              className={`exam-mode-chip ${sectionMetadata.mode === "COMPILER" ? "compiler" : "neutral"}`}
            >
              {sectionMetadata.mode === "COMPILER"
                ? "Compiler Enabled"
                : "No Compiler"}
            </span>
            {sectionMetadata.mode === "COMPILER" &&
              sectionMetadata.supportedLanguages.length > 0 && (
                <span className="exam-mode-chip neutral">
                  {sectionMetadata.supportedLanguages.join(", ")}
                </span>
              )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: violationCount >= 2 ? "#fee2e2" : "#f1f5f9",
              color: violationCount >= 2 ? "#ef4444" : "#475569",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            <i className="fas fa-shield-alt"></i> Violations: {violationCount}/
            {MAX_VIOLATIONS}
          </div>
        </div>
        {!isLocked && (
          <div className="timer-badge-fixed">
            <i className="far fa-clock"></i> {formatTime(timeLeft)}
          </div>
        )}
        <button
          className="exam-nav-btn btn btn-sm fw-bold"
          onClick={() => handleSubmit()}
          disabled={submitted || isLocked}
        >
          Submit Test
        </button>
      </nav>

      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "2rem",
          gap: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            alignSelf: "flex-start",
            position: "sticky",
            top: "100px",
            boxSizing: "border-box",
          }}
        >
          <h6 style={{ fontWeight: "700", marginBottom: "1rem" }}>Questions</h6>

          {!isOfflineMode ? (
            <div className="exam-camera-preview-card">
              <div className="exam-camera-preview-header">
                <span>Live webcam</span>
                <span
                  className={
                    cameraReady
                      ? "exam-camera-status on"
                      : "exam-camera-status off"
                  }
                >
                  {cameraReady ? "Active" : "Off"}
                </span>
              </div>
              <div className="exam-camera-preview-shell">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`exam-camera-preview ${cameraReady ? "visible" : "hidden"}`}
                  onLoadedMetadata={(e) => {
                    e.target.play?.().catch(() => {});
                    setCameraReady(true);
                  }}
                  onCanPlay={() => setCameraReady(true)}
                />
                {!cameraReady && (
                  <div className="exam-camera-placeholder">
                    <div>
                      <i
                        className="fas fa-video-slash"
                        style={{
                          fontSize: "1.5rem",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      ></i>
                      {cameraError || "Waiting for camera access..."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="exam-camera-preview-card">
              <div className="exam-camera-preview-header">
                <span>Camera access</span>
                <span className="exam-camera-status off">Disabled</span>
              </div>
              <div className="exam-camera-placeholder">
                <div>
                  <i
                    className="fas fa-video-slash"
                    style={{
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  ></i>
                  Offline mode selected. Webcam monitoring is removed for this
                  attempt.
                </div>
              </div>
            </div>
          )}

          <div className="exam-progress-summary">
            <strong>{answeredCount}</strong> of {questions.length} answered
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              width: "100%",
            }}
          >
            {questions.map((question, idx) => {
              const isAnswered = question.hasCompiler
                ? Boolean(codingAnswers[question.id]?.sourceCode?.trim())
                : Boolean(answers[question.id]);

              return (
                <button
                  key={question.id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "8px",
                    border:
                      currentQuestionIndex === idx
                        ? "2px solid #4f46e5"
                        : "1px solid #e2e8f0",
                    backgroundColor: isAnswered
                      ? "#4f46e5"
                      : currentQuestionIndex === idx
                        ? "#eef2ff"
                        : "#fff",
                    color: isAnswered
                      ? "#fff"
                      : currentQuestionIndex === idx
                        ? "#4f46e5"
                        : "#64748b",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    position: "relative",
                  }}
                >
                  {idx + 1}
                  {question.hasCompiler && (
                    <span className="exam-code-dot">&lt;/&gt;</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#4f46e5",
                }}
              ></div>{" "}
              Answered
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                }}
              ></div>{" "}
              Not Answered
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  backgroundColor: "#e0e7ff",
                }}
              ></div>{" "}
              Coding Question
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {error ? (
            <div className="exam-error-box alert alert-danger shadow-sm">
              {error}
            </div>
          ) : currentQuestion ? (
            <div
              className="exam-question-container"
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "2.5rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#4f46e5",
                    fontWeight: "700",
                    backgroundColor: "#eef2ff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                  }}
                >
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span
                  className={`exam-mode-chip ${currentQuestion.hasCompiler ? "compiler" : "neutral"}`}
                >
                  {currentQuestion.hasCompiler ? "Coding" : "MCQ"}
                </span>
              </div>

              {!currentQuestion.hasCompiler ? (
                <>
                  <h4
                    className="exam-question-text"
                    style={{
                      fontWeight: "700",
                      color: "#1e293b",
                      lineHeight: "1.5",
                      marginBottom: "2rem",
                    }}
                  >
                    {currentQuestion.text}
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "12px",
                      marginBottom: "2rem",
                    }}
                  >
                    {(currentQuestion.options || []).map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelect(currentQuestion.id, opt)}
                        className="exam-option-item"
                        style={{
                          padding: "1rem 1.5rem",
                          borderRadius: "12px",
                          border:
                            answers[currentQuestion.id] === opt
                              ? "2px solid #4f46e5"
                              : "1px solid #e2e8f0",
                          backgroundColor:
                            answers[currentQuestion.id] === opt
                              ? "#f5f3ff"
                              : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          className={`exam-radio-indicator ${answers[currentQuestion.id] === opt ? "selected" : ""}`}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor:
                              answers[currentQuestion.id] === opt
                                ? "#4f46e5"
                                : "#cbd5e1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                              answers[currentQuestion.id] === opt
                                ? "#4f46e5"
                                : "transparent",
                          }}
                        >
                          {answers[currentQuestion.id] === opt && (
                            <div
                              className="exam-radio-dot"
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#fff",
                              }}
                            />
                          )}
                        </div>
                        <span
                          className="exam-option-text"
                          style={{ fontWeight: "500", color: "#334155" }}
                        >
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                renderCodingWorkspace()
              )}

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="exam-nav-btn btn btn-outline-secondary px-4 fw-bold"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    className="exam-nav-btn btn btn-primary px-4 fw-bold"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    className="exam-nav-btn btn btn-success px-4 fw-bold"
                    onClick={() => handleSubmit()}
                    disabled={submitted}
                  >
                    Review & Submit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Readying your evaluation...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentLevel;
