// // src/lib/axios.ts
// import axios, { AxiosError, AxiosInstance } from "axios";

// const BASE_URL_1 = "http://192.168.1.6:8001/api";
// const BASE_URL_2 ="https://9nutsapi.nearbydoctors.in/public/api";

// const api: AxiosInstance = axios.create({
//   baseURL: BASE_URL_2,
//   timeout: 30_000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });
// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("token"); 
//       if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (resp) => resp,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       try {
//         localStorage.removeItem("token"); 
//         localStorage.removeItem("token"); 
//       } catch {}
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/lib/axios.ts
// src/lib/axios.ts (debug variant)
// src/lib/axios.ts
import axios, { AxiosError, AxiosInstance } from "axios";

// CHANGE THIS to your API base if needed
export const BASE_URL = "https://9nutsapi.nearbydoctors.in/public/api";
// export const BASE_URL = "http://192.168.1.6:8001/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request interceptor: read token from localStorage each request so the header
 * is always current (handles multi-tab changes).
 */
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
        } else {
          // ensure header removed if no token
          if (config.headers && "Authorization" in config.headers) {
            // @ts-ignore
            delete config.headers.Authorization;
          }
        }
      }
    } catch (e) {
      console.warn("[api] request interceptor localStorage read failed", e);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/**
 * Response interceptor: helpful logging. IMPORTANT: we do NOT remove token here.
 * Centralized removal is done by AuthContext so we avoid race conditions.
 */
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    console.warn("[api] response error", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export default api;



