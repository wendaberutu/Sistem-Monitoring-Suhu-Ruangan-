import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL_SERVICES,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   AUTO ATTACH TOKEN
================================ */

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
