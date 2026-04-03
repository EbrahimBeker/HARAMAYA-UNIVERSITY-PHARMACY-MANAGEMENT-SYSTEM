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
    if (error.response?.status === 401) {
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
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get("/roles"),
};

export default api;
