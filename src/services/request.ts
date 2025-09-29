import axios from "axios";
import { authService } from "./auth.service";

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

request.interceptors.request.use(async (config) => {
  const token = await authService.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authService.logout();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
