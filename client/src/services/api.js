// ============================================
// API Service — works in dev AND production
// ============================================

import axios from 'axios';

// ── Base URL resolution ───────────────────────────────────────────────
// Dev:        Vite proxy handles /api → localhost:5000
// Production: VITE_API_URL must be set to your deployed backend URL
//             e.g. https://ai-summarizer-api.onrender.com
const getBaseURL = () => {
  const env = import.meta.env.VITE_API_URL;

  if (env) {
    // Strip trailing slash, ensure /api suffix
    const base = env.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  // In dev, Vite proxy forwards /api → localhost:5000/api
  if (import.meta.env.DEV) return '/api';

  // Production build without VITE_API_URL — fail fast with a loud, actionable error.
  // Without this, axios will call the relative '/api' which won’t exist on the frontend domain.
  const msg =
    '[API] VITE_API_URL is not set in production. ' +
    'Set it in Vercel/Netlify env vars to your backend base URL, e.g. ' +
    'VITE_API_URL=https://your-backend.onrender.com';
  console.error(msg);
  throw new Error(msg);
};

const BASE_URL = getBaseURL();

// ── Axios instance ────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — AI calls can be slow
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT ─────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalize errors ──────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    // Auto-logout on 401 — but NOT during login/signup requests
    if (status === 401) {
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Attach a human-readable message to the error object
    if (!error.userMessage) {
      if (!error.response) {
        error.userMessage = 'Cannot connect to server. Check your internet connection.';
      } else if (status === 400) {
        error.userMessage = message || 'Invalid request. Check your input.';
      } else if (status === 401) {
        error.userMessage = message || 'Session expired. Please log in again.';
      } else if (status === 403) {
        error.userMessage = message || 'You do not have permission to do that.';
      } else if (status === 404) {
        error.userMessage = message || 'Resource not found.';
      } else if (status === 429) {
        error.userMessage = message || 'Too many requests. Please wait and try again.';
      } else if (status >= 500) {
        error.userMessage = message || 'Server error. Please try again later.';
      } else {
        error.userMessage = message || 'Something went wrong.';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================
export const authAPI = {
  signup:         (data) => apiClient.post('/auth/signup', data),
  login:          (data) => apiClient.post('/auth/login', data),
  getCurrentUser: ()     => apiClient.get('/auth/me'),
  updateProfile:  (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  logout:         ()     => apiClient.post('/auth/logout'),
};

// ============================================
// Summary API
// ============================================
export const summaryAPI = {
  createTextSummary: (data)     => apiClient.post('/summaries/text', data),
  getSummaries:      (params)   => apiClient.get('/summaries', { params }),
  getSummaryById:    (id)       => apiClient.get(`/summaries/${id}`),
  updateSummary:     (id, data) => apiClient.put(`/summaries/${id}`, data),
  deleteSummary:     (id)       => apiClient.delete(`/summaries/${id}`),
  searchSummaries:   (query)    => apiClient.get('/summaries/search/query', { params: { query } }),
  toggleBookmark:    (id)       => apiClient.patch(`/summaries/${id}/bookmark`),
};

// ============================================
// File API
// ============================================
export const fileAPI = {
  uploadFile: (formData) => apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for large files
  }),
  processURL: (data) => apiClient.post('/files/url', data),
};

// ============================================
// Admin API
// ============================================
export const adminAPI = {
  getDashboardAnalytics:  ()           => apiClient.get('/admin/analytics/dashboard'),
  getAPIUsageStats:       (params)     => apiClient.get('/admin/analytics/api-usage', { params }),
  getSummaryStats:        ()           => apiClient.get('/admin/analytics/summaries'),
  getUsersData:           (params)     => apiClient.get('/admin/users', { params }),
  updateUserSubscription: (id, data)   => apiClient.put(`/admin/users/${id}/subscription`, data),
  deactivateUser:         (id)         => apiClient.put(`/admin/users/${id}/deactivate`),
};

export default apiClient;
