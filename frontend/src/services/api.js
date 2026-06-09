// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ventechstore.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});
});

// ─── Interceptors ─────────────────────────────────────────────────────────────

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ventech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ventech_token');
      localStorage.removeItem('ventech_user');
      if (window.location.pathname.startsWith('/admin') &&
          !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword });

// ─── Products (public) ────────────────────────────────────────────────────────
export const getProducts = (params) =>
  api.get('/products', { params });

export const getProduct = (id) =>
  api.get(`/products/${id}`);

// ─── Products (admin) ─────────────────────────────────────────────────────────
export const getAdminProducts = (params) =>
  api.get('/products/admin/all', { params });

export const getAdminProduct = (id) =>
  api.get(`/products/admin/${id}`);

export const createProduct = (data) =>
  api.post('/products', data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

export const toggleProductActive = (id) =>
  api.patch(`/products/${id}/toggle-active`);

export const toggleProductStock = (id) =>
  api.patch(`/products/${id}/toggle-stock`);

export const toggleProductFeatured = (id) =>
  api.patch(`/products/${id}/featured`);

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/categories');

export const getAdminCategories = () =>
  api.get('/categories/admin/all');

export const createCategory = (data) =>
  api.post('/categories', data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/dashboard/stats');

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = () =>
  api.get('/settings');

export const updateSettings = (data) =>
  api.put('/settings', data);

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ─── Import ───────────────────────────────────────────────────────────────────
export const importJSON = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/import/products/json', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const importCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/import/products/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportJSON = () =>
  api.get('/export/products/json', { responseType: 'blob' });

export const exportCSV = () =>
  api.get('/export/products/csv', { responseType: 'blob' });

export default api;
