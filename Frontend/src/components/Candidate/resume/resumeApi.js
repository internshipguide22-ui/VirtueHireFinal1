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

export function getResumePdfUrl(resumeId, disposition = "inline") {
  return `${API_BASE_URL}/candidates/resumes/${resumeId}/pdf?disposition=${encodeURIComponent(disposition)}`;
}
