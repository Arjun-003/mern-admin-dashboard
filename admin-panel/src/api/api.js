import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // from .env
  withCredentials: true, // optional (useful if using cookies)
});

// 🔥 Attach token automatically on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Handle global errors (like expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirect if token invalid
    }

    return Promise.reject(error);
  }
);

export default api;