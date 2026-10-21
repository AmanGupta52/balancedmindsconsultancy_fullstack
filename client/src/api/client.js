import axios from "axios";
import { API_BASE } from "../config/site";

export const TOKEN_KEY = "bm_token";
export const UNAUTHORIZED_EVENT = "bm:unauthorized";

const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 on an authenticated request means the session expired: let the
// AuthProvider sign the user out instead of leaving the UI in a broken state.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));
    const isAuthCall = error.config?.url?.startsWith("/auth/login");
    if (error.response?.status === 401 && hadToken && !isAuthCall) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (error.message === "Network Error") return "Cannot reach the server. Check your connection and try again.";
  return fallback;
};

export const expertPhotoUrl = (id) => `${API_BASE}/api/experts/${id}/photo`;

export default api;
