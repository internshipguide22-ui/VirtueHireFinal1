import axios from 'axios';
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

// 🔑 Attach JWT token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      localStorage.removeItem("token");
      // window.location.href = "/hrs/login"; 
      // Note: In some environments, window.location.href might cause issues during testing, 
      // but it's the standard way to force a re-auth in a simple production app.
    }
    return Promise.reject(error);
  }
);

export default api;
