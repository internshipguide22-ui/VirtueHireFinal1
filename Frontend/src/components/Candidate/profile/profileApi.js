import api from "../../../services/api";
import { getSkillList } from "./profileUtils";

export async function fetchCandidateProfile() {
  const response = await api.get("/candidates/me", { withCredentials: true });
  return response.data?.candidate;
}

export async function updateCandidateProfile(formValues, files = {}) {
  const payload = new FormData();

  Object.entries(formValues).forEach(([key, value]) => {
    if (key === "skills") {
      payload.append("skills", getSkillList(value).join(","));
      return;
    }

    payload.append(key, value ?? "");
  });

  if (files.resumeFile) {
    payload.append("resumeFile", files.resumeFile);
  }

  if (files.profilePicFile) {
    payload.append("profilePicFile", files.profilePicFile);
  }

  const response = await api.put("/candidates/me", payload, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  return response.data?.candidate;
}
