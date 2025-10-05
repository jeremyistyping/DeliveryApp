import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track recent errors to prevent duplicate toasts
let lastErrorMessage = '';
let lastErrorTime = 0;
const ERROR_DEBOUNCE_MS = 1000; // Prevent same error within 1 second

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      // Only show toast once for 401
      const now = Date.now();
      if (lastErrorMessage !== '401' || now - lastErrorTime > ERROR_DEBOUNCE_MS) {
        toast.error('Session expired. Please login again.');
        lastErrorMessage = '401';
        lastErrorTime = now;
      }
      window.location.href = '/auth/login';
    } else if (error.response?.data?.error) {
      const errorMsg = error.response.data.error;
      const now = Date.now();
      // Only show toast if different error or enough time passed
      if (lastErrorMessage !== errorMsg || now - lastErrorTime > ERROR_DEBOUNCE_MS) {
        toast.error(errorMsg);
        lastErrorMessage = errorMsg;
        lastErrorTime = now;
      }
    } else if (error.message && error.message !== 'Network Error') {
      const errorMsg = error.message;
      const now = Date.now();
      if (lastErrorMessage !== errorMsg || now - lastErrorTime > ERROR_DEBOUNCE_MS) {
        toast.error(errorMsg);
        lastErrorMessage = errorMsg;
        lastErrorTime = now;
      }
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const auth = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  completeProfile: (data: any) => api.post('/auth/complete-profile', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Merchant endpoints
export const merchants = {
  profile: () => api.get('/merchants/profile'),
  dashboardStats: () => api.get('/merchants/dashboard-stats'),
};

// Order endpoints
export const orders = {
  list: (params?: any) => api.get('/orders', { params }),
  create: (data: any) => api.post('/orders', data),
  get: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  generateLabel: (id: string) => api.get(`/orders/${id}/label`, { responseType: 'blob' }),
  bulkImport: (formData: FormData) => api.post('/orders/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadTemplate: () => api.get('/orders/bulk-import/template', { responseType: 'blob' }),
};

// Shipping endpoints
export const shipping = {
  getRates: (data: any) => api.post('/shipping/rates', data),
  trackByNumber: (trackingNumber: string) => api.get(`/shipping/track/${trackingNumber}`),
  trackByOrder: (orderId: string) => api.get(`/shipping/track/order/${orderId}`),
};

// COD endpoints
export const cod = {
  list: (params?: any) => api.get('/cod', { params }),
  get: (id: string) => api.get(`/cod/${id}`),
  summary: () => api.get('/cod/summary'),
  updateStatus: (id: string, data: any) => api.patch(`/cod/${id}/status`, data),
  bulkSettle: (codIds: string[]) => api.post('/cod/bulk-settle', { codIds }),
};

// Returns endpoints
export const returns = {
  list: (params?: any) => api.get('/returns', { params }),
  create: (data: any) => api.post('/returns', data),
  get: (id: string) => api.get(`/returns/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/returns/${id}/status`, data),
  delete: (id: string) => api.delete(`/returns/${id}`),
  stats: () => api.get('/returns/stats/summary'),
};

// Reports endpoints
export const reports = {
  sales: (params?: any) => api.get('/reports/sales', { params }),
  cod: (params?: any) => api.get('/reports/cod', { params }),
  shipping: (params?: any) => api.get('/reports/shipping', { params }),
  returns: (params?: any) => api.get('/reports/returns', { params }),
};