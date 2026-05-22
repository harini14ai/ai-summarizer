// ============================================
// API Service Configuration
// ============================================
// Centralized API calls with error handling

import axios from 'axios';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
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

// ============================================
// Authentication API Calls
// ============================================
export const authAPI = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

// ============================================
// Summary API Calls
// ============================================
export const summaryAPI = {
  createTextSummary: (data) => apiClient.post('/summaries/text', data),
  getSummaries: (params) => apiClient.get('/summaries', { params }),
  getSummaryById: (id) => apiClient.get(`/summaries/${id}`),
  updateSummary: (id, data) => apiClient.put(`/summaries/${id}`, data),
  deleteSummary: (id) => apiClient.delete(`/summaries/${id}`),
  searchSummaries: (query) => apiClient.get('/summaries/search/query', { params: { query } }),
  toggleBookmark: (id) => apiClient.patch(`/summaries/${id}/bookmark`),
};

// ============================================
// File API Calls
// ============================================
export const fileAPI = {
  uploadFile: (formData) => apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  processURL: (data) => apiClient.post('/files/url', data),
};

// ============================================
// Admin API Calls
// ============================================
export const adminAPI = {
  getDashboardAnalytics: () => apiClient.get('/admin/analytics/dashboard'),
  getAPIUsageStats: (params) => apiClient.get('/admin/analytics/api-usage', { params }),
  getSummaryStats: () => apiClient.get('/admin/analytics/summaries'),
  getUsersData: (params) => apiClient.get('/admin/users', { params }),
  updateUserSubscription: (userId, data) => apiClient.put(`/admin/users/${userId}/subscription`, data),
  deactivateUser: (userId) => apiClient.put(`/admin/users/${userId}/deactivate`),
};

export default apiClient;
