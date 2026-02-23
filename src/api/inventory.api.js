import apiClient from "./index.api.js";

/* ===============================
   GET ALL INVENTORY ITEMS
================================= */
export const getAllInventory = () => {
  return apiClient.get("/inventory");
};

/* ===============================
   GET INVENTORY TRANSACTIONS
================================= */
export const getInventoryTransactions = () => {
  return apiClient.get("/inventory/transactions");
};

/* ===============================
   CREATE INVENTORY ITEM
================================= */
export const createInventoryItem = (payload) => {
  return apiClient.post("/inventory", payload);
};

/* ===============================
   ADD INVENTORY STOCK
================================= */
export const addInventoryStock = (id, payload) => {
  return apiClient.put(`/inventory/add-stock/${id}`, payload);
};

/* ===============================
   UPDATE INVENTORY ITEM
================================= */
export const updateInventoryItem = (id, payload) => {
  return apiClient.put(`/inventory/${id}`, payload);
};

/* ===============================
   DELETE INVENTORY ITEM
================================= */
export const deleteInventoryItem = (id) => {
  return apiClient.delete(`/inventory/${id}`);
};

/* ===============================
   BORROW INVENTORY ITEM
================================= */
export const borrowInventoryItem = (payload) => {
  return apiClient.post("/inventory/borrow", payload);
};

/* ===============================
   RETURN INVENTORY ITEM
================================= */
export const returnInventoryItem = (payload) => {
  return apiClient.post("/inventory/return", payload);
};

export const returnInventoryQr = (payload) => {
  return apiClient.post("/inventory/return-by-qr", payload);
};

/* ===============================
   MARK INVENTORY AS DAMAGED
================================= */
export const markInventoryDamaged = (payload) => {
  return apiClient.post("/inventory/damaged", payload);
};

/* ===============================
   MARK INVENTORY AS LOST
================================= */
export const markInventoryLost = (payload) => {
  return apiClient.post("/inventory/lost", payload);
};
