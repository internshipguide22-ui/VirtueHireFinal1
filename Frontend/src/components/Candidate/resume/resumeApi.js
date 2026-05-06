// PATH: Frontend/src/components/Candidate/resume/resumeApi.js

import api from "../../../services/api";
import { API_BASE_URL } from "../../../config";

export async function fetchResumes() {
  const response = await api.get("/candidates/resumes", { withCredentials: true });
  return response.data?.resumes || [];
}

export async function createResume(payload) {
  const response = await api.post("/candidates/resumes", payload, { withCredentials: true });
  return response.data?.resume;
}

export async function updateResume(resumeId, payload) {
  const response = await api.put(`/candidates/resumes/${resumeId}`, payload, { withCredentials: true });
  return response.data?.resume;
}

export async function deleteResume(resumeId) {
  await api.delete(`/candidates/resumes/${resumeId}`, { withCredentials: true });
}

// FIX: Instead of returning a bare URL (which <a href> would open without
// the session cookie, causing a 401), we fetch the PDF as a binary blob
// through axios which automatically sends withCredentials / the session cookie.
// The caller receives a Blob they can turn into an object URL for viewing
// or trigger a download from — all without any auth failure.
export async function fetchResumePdfBlob(resumeId, disposition = "inline") {
  const response = await api.get(
    `/candidates/resumes/${resumeId}/pdf?disposition=${encodeURIComponent(disposition)}`,
    { withCredentials: true, responseType: "blob" }
  );
  return response.data; // Blob
}