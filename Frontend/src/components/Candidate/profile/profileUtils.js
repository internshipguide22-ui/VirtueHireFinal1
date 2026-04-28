import { API_BASE_URL } from "../../../config";

export const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="32" fill="#dbeafe" />
      <circle cx="80" cy="60" r="28" fill="#60a5fa" />
      <path d="M34 133c8-24 28-38 46-38s38 14 46 38" fill="#60a5fa" />
    </svg>
  `);

export const EMPTY_PROFILE = {
  fullName: "",
  email: "",
  phoneNumber: "",
  alternatePhoneNumber: "",
  gender: "",
  dateOfBirth: "",
  city: "",
  state: "",
  highestEducation: "",
  collegeUniversity: "",
  yearOfGraduation: "",
  experience: "",
  skills: "",
  resumePath: "",
  profilePic: "",
};

export function normalizeCandidate(candidate = {}) {
  return {
    ...EMPTY_PROFILE,
    ...candidate,
    dateOfBirth: candidate?.dateOfBirth || "",
    yearOfGraduation: candidate?.yearOfGraduation ?? "",
    experience: candidate?.experience ?? "",
    skills: Array.isArray(candidate?.skills)
      ? candidate.skills.join(", ")
      : candidate?.skills || "",
  };
}

export function getCandidateFileUrl(filename) {
  return filename ? `${API_BASE_URL}/candidates/file/${filename}` : "";
}

export function getSkillList(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);

  return String(skills)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return value;
}

export function getResumeFileName(resumePath) {
  if (!resumePath) return "";
  const parts = resumePath.split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : resumePath;
}

export function isPdfResume(resumePath) {
  return /\.pdf$/i.test(resumePath || "");
}
