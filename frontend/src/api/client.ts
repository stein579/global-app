import axios from "axios";

/**
 * Shared axios instance pointed at the FastAPI backend. Base URL is
 * injected via EXPO_PUBLIC_API_URL so it can differ between the iOS
 * simulator, Android emulator, and a physical device.
 */
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  // Article analysis calls Gemini with a full structured-output schema and
  // can take well over 30s for longer articles, so this needs more room
  // than a typical request.
  timeout: 90_000,
});
