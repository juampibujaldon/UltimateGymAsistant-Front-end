/**
 * API client configuration with authentication interceptor.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const AUTH_ROUTES = new Set(["/auth/login", "/auth/register", "/auth/demo-login"]);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
    (config) => {
        const requestPath = typeof config.url === "string" ? config.url : "";
        const token = localStorage.getItem("gym_ai_token");
        if (token && !AUTH_ROUTES.has(requestPath)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("gym_ai_token");
            localStorage.removeItem("gym_ai_user");
            // Optional: window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;
