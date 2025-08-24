import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_BASE_URL = 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  resetPassword: (passwordData) => api.put('/auth/reset-password', passwordData),
};

// Achievements APIs
export const achievementsAPI = {
  getAll: () => api.get('/achievements'),
  getById: (id) => api.get(`/achievements/${id}`),
  create: (data) => api.post('/achievements', data),
  update: (id, data) => api.put(`/achievements/${id}`, data),
  delete: (id) => api.delete(`/achievements/${id}`),
  validate: (id, status) => api.put(`/achievements/${id}/validate`, { status }),
  getByUser: (userId) => api.get(`/achievements/user/${userId}`),
  uploadDocument: (formData) => api.post('/achievements/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Notifications APIs
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getTopAchievers: () => api.get('/leaderboard/top'),
  getByCategory: (category) => api.get(`/leaderboard/category/${category}`),
  getStats: () => api.get('/leaderboard/stats'),
};

// Portfolio APIs
export const portfolioAPI = {
  generate: (userId) => api.get(`/portfolio/${userId}`),
  exportPDF: (userId) => api.get(`/portfolio/${userId}/export`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  importUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/import-users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Analytics APIs
export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
  getUserAnalytics: (userId) => api.get(`/analytics/user/${userId}`),
};

// Search APIs
export const searchAPI = {
  searchAchievements: (params) => api.get('/search/achievements', { params }),
  getSuggestions: (query) => api.get('/search/suggestions', { params: { query } }),
  getFilterOptions: () => api.get('/search/filters'),
};

// Import APIs
export const importAPI = {
  importFromCSV: (formData) => api.post('/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  importManually: (data) => api.post('/import/manual', data),
  getTemplate: () => api.get('/import/template', { responseType: 'text' }),
  getStats: () => api.get('/import/stats'),
};

// Utility function to get full document URL
export const getDocumentUrl = (documentPath) => {
  if (!documentPath) return null;
  if (documentPath.startsWith('http')) return documentPath;
  return `${BACKEND_BASE_URL}${documentPath}`;
};

export default api; 