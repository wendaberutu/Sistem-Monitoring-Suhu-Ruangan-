import apiClient from "./index.api";

export const getAdminDashboard = () => {
  return apiClient.get("/dashboard/admin");
};