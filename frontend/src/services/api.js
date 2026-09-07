import api from './apiClient';

// Auth API
export const authAPI = {
  requestOTP: (phoneNumber) => api.post('/auth/request-otp', { phoneNumber }),
  verifyOTP: (phoneNumber, otp, role, name) =>
    api.post('/auth/verify-otp', { phoneNumber, otp, role, name }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Farmer API
export const farmerAPI = {
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.put('/farmer/profile', data),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories/all'),
};

export default api;
