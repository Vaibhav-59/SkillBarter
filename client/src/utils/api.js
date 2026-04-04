import axios from "axios";

const BASE_URL =
  "https://skill-barter-kspn.vercel.app/api" || "http://localhost:5000/api";

export { BASE_URL };

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const adminPass = sessionStorage.getItem("sb_admin_auth");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (adminPass) {
    config.headers["x-admin-password"] = adminPass;
  }
  return config;
});

// Global error handler (e.g., unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Do not redirect to /login if we are in the admin panel
      if (!window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
