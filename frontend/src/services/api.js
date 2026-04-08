import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || "token";
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if it's not a login request
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      const tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || "token";
      const userKey = import.meta.env.VITE_USER_STORAGE_KEY || "user";
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  create: (data) => api.post("/users", data),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get("/patients", { params }),
  create: (data) => api.post("/patients", data),
  getOne: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get("/prescriptions", { params }),
  create: (data) => api.post("/prescriptions", data),
  getOne: (id) => api.get(`/prescriptions/${id}`),
  dispense: (id, data) => api.post(`/prescriptions/${id}/dispense`, data),
  getPending: () => api.get("/prescriptions/status/pending"),
  // Feature 1: Patient History
  getPatientHistory: (patientId) =>
    api.get(`/prescriptions/patient/${patientId}/history`),
  // Feature 2: Refill Prescription
  refill: (id) => api.post(`/prescriptions/${id}/refill`),
  // Feature 3: Partial Dispensing
  dispensePartial: (id, data) =>
    api.post(`/prescriptions/${id}/dispense-partial`, data),
  getPartial: () => api.get("/prescriptions/status/partial"),
};

// Diagnoses API
export const diagnosesAPI = {
  getAll: (params) => api.get("/diagnoses", { params }),
  create: (data) => api.post("/diagnoses", data),
  getOne: (id) => api.get(`/diagnoses/${id}`),
  update: (id, data) => api.put(`/diagnoses/${id}`, data),
  getPatientDiagnoses: (patientId) =>
    api.get(`/diagnoses/patient/${patientId}`),
};

// Inventory API
export const inventoryAPI = {
  getCurrentStock: (params) => api.get("/inventory/stock", { params }),
  receiveStock: (data) => api.post("/inventory/receive", data),
  getMovements: (params) => api.get("/inventory/movements", { params }),
  getExpiring: (params) => api.get("/inventory/expiring", { params }),
  adjustStock: (data) => api.post("/inventory/adjust", data),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get("/reports/dashboard"),
  getPatients: (params) => api.get("/reports/patients", { params }),
  getStock: (params) => api.get("/reports/stock", { params }),
  getPrescriptions: (params) => api.get("/reports/prescriptions", { params }),
  getSuppliers: (params) => api.get("/reports/suppliers", { params }),
  getActivity: (params) => api.get("/reports/activity", { params }),
  // Pharmacy-specific reports
  getPharmacySales: (params) => api.get("/reports/pharmacy/sales", { params }),
  getPharmacyInventory: (params) =>
    api.get("/reports/pharmacy/inventory", { params }),
  getPharmacyPerformance: (params) =>
    api.get("/reports/pharmacy/performance", { params }),
  getPharmacyDashboard: () => api.get("/reports/pharmacy/dashboard"),
};

// Backup API
export const backupAPI = {
  getAll: () => api.get("/backup"),
  create: (data) => api.post("/backup", data),
  restore: (id) => api.post(`/backup/${id}/restore`),
  download: (id) => api.get(`/backup/${id}/download`, { responseType: "blob" }),
  delete: (id) => api.delete(`/backup/${id}`),
};

// Medicines API
export const medicinesAPI = {
  getAll: (params) => api.get("/medicines", { params }),
  create: (data) => api.post("/medicines", data),
  getOne: (id) => api.get(`/medicines/${id}`),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  search: (query) => api.get("/medicines/search", { params: { query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/medicine-categories"),
  create: (data) => api.post("/medicine-categories", data),
  update: (id, data) => api.put(`/medicine-categories/${id}`, data),
  delete: (id) => api.delete(`/medicine-categories/${id}`),
};

// Types API
export const typesAPI = {
  getAll: () => api.get("/medicine-types"),
  create: (data) => api.post("/medicine-types", data),
  update: (id, data) => api.put(`/medicine-types/${id}`, data),
  delete: (id) => api.delete(`/medicine-types/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (params) => api.get("/suppliers", { params }),
  create: (data) => api.post("/suppliers", data),
  getOne: (id) => api.get(`/suppliers/${id}`),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getMyInfo: () => api.get("/suppliers/me/info"),
  updateBankAccount: (data) => api.put("/suppliers/me/bank-account", data),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get("/roles"),
};

// Sales API
export const salesAPI = {
  processSale: (data) => api.post("/sales", data),
  getAll: (params) => api.get("/sales", { params }),
  getOne: (id) => api.get(`/sales/${id}`),
};

// Feature 4: Emergency Dispensing API
export const emergencyDispensingAPI = {
  create: (data) => api.post("/emergency-dispensing", data),
  getAll: (params) => api.get("/emergency-dispensing", { params }),
  getPending: () => api.get("/emergency-dispensing/pending"),
  getOne: (id) => api.get(`/emergency-dispensing/${id}`),
  linkPrescription: (id, prescriptionId) =>
    api.put(`/emergency-dispensing/${id}/link`, {
      prescription_id: prescriptionId,
    }),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: (params) => api.get("/purchase-orders", { params }),
  create: (data) => api.post("/purchase-orders", data),
  getOne: (id) => api.get(`/purchase-orders/${id}`),
  updateStatus: (id, data) => api.put(`/purchase-orders/${id}/status`, data),
  confirm: (id, data) => api.post(`/purchase-orders/${id}/confirm`, data),
  markDelivered: (id, data) => api.post(`/purchase-orders/${id}/deliver`, data),
  receiveStock: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),
  cancel: (id, reason) => api.post(`/purchase-orders/${id}/cancel`, { reason }),
  uploadPaymentReceipt: (id, formData) =>
    api.post(`/purchase-orders/${id}/upload-receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  confirmPaymentAndDeliver: (id, data) =>
    api.post(`/purchase-orders/${id}/confirm-payment-deliver`, data),
  getPaymentDetails: (id) => api.get(`/purchase-orders/${id}/payment-details`),
};

// Supplier Catalog API
export const supplierCatalogAPI = {
  getAll: (params) => api.get("/supplier-catalog", { params }),
  getStats: (params) => api.get("/supplier-catalog/stats", { params }),
  upsert: (data) => api.post("/supplier-catalog", data),
  bulkUpload: (formData) =>
    api.post("/supplier-catalog/bulk-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/supplier-catalog/${id}`),
};

export default api;
