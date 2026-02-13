import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Medicines API
export const medicinesAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  create: (data) => api.post('/medicines', data),
  getOne: (id) => api.get(`/medicines/${id}`),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  search: (query) => api.get('/medicines/search', { params: { query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/medicine-categories'),
  create: (data) => api.post('/medicine-categories', data),
  update: (id, data) => api.put(`/medicine-categories/${id}`, data),
  delete: (id) => api.delete(`/medicine-categories/${id}`),
};

// Types API
export const typesAPI = {
  getAll: () => api.get('/medicine-types'),
  create: (data) => api.post('/medicine-types', data),
  update: (id, data) => api.put(`/medicine-types/${id}`, data),
  delete: (id) => api.delete(`/medicine-types/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  getOne: (id) => api.get(`/suppliers/${id}`),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export default api;
