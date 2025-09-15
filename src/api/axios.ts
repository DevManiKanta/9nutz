// src/lib/axios.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.VITE_API_BASE_URL as string) ||
  "http://192.168.29.102:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000, // 30s
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach Authorization header automatically if token available
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: central response error handler
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    // You can inspect error.response?.status and do global logic (logout on 401, etc.)
    // Example: if unauthorized -> remove token
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("auth_token");
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default api;
