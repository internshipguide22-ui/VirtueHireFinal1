// src/config.js
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal 
  ? "http://localhost:8081/api" 
  : "https://backend.virtuehire.in/api";

export const WS_BASE_URL = isLocal 
  ? "http://localhost:8081" 
  : "https://backend.virtuehire.in";

export default {
  API_BASE_URL,
  WS_BASE_URL
};
