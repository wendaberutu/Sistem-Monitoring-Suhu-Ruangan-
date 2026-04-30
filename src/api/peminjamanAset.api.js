import apiClient from "./index.api.js";

export const getDashboard = () =>
  apiClient.get("/peminjaman-aset/dashboard");

export const getInventory = () =>
  apiClient.get("/peminjaman-aset/inventory");

export const getHistory = () =>
  apiClient.get("/peminjaman-aset/history");

export const createBorrow = (payload) =>
  apiClient.post("/peminjaman-aset/pinjam", payload);

export const checkReturn = (scanCode) =>
  apiClient.post("/peminjaman-aset/pengembalian/check", { scanCode });

export const processReturn = (payload) =>
  apiClient.post("/peminjaman-aset/pengembalian/process", payload);

export const getKaryawanById = (id) =>
  apiClient.get(`/peminjaman-aset/karyawan/${encodeURIComponent(id)}`);