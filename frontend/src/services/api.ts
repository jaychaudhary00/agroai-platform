import axios from 'axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefresh);
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const aiAPI = {
  detectDisease: (formData: FormData) => api.post('/ai/disease-detect', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  calculateFertilizer: (data: object) => api.post('/ai/fertilizer-calc', data),
  getPlantCare: (formData: FormData) => api.post('/ai/plant-care', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  chat: (message: string, language: string, history: object[]) => api.post('/ai/chat', { message, language, history }),
  getWeatherAdvice: (data: object) => api.post('/ai/weather-advice', data),
  getMyReports: (page?: number) => api.get('/ai/disease-reports', { params: { page } }),
};

export const productAPI = {
  getAll: (params?: object) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (formData: FormData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderAPI = {
  create: (data: object) => api.post('/orders', data),
  getAll: (page?: number) => api.get('/orders', { params: { page } }),
  getOne: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: object) => api.patch(`/orders/${id}/status`, data),
};

export const expenseAPI = {
  add: (data: object) => api.post('/expenses', data),
  getAll: (params?: object) => api.get('/expenses', { params }),
  getAnalytics: (year?: number) => api.get('/expenses/analytics', { params: { year } }),
  exportPDF: () => api.get('/expenses/export-pdf', { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const cropPriceAPI = {
  getAll: (params?: object) => api.get('/crop-prices', { params }),
};

export const reminderAPI = {
  getAll: () => api.get('/reminders'),
  create: (data: object) => api.post('/reminders', data),
  complete: (id: string) => api.patch(`/reminders/${id}/complete`),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

export const reviewAPI = {
  getProductReviews: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: object) => api.post('/reviews', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingSellers: () => api.get('/admin/sellers/pending'),
  verifySeller: (id: string) => api.patch(`/admin/sellers/${id}/verify`),
  getPendingProducts: () => api.get('/admin/products/pending'),
  approveProduct: (id: string, approve: boolean) => api.patch(`/admin/products/${id}/approve`, { approve }),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`),
};

export const sellerAPI = {
  register: (data: object) => api.post('/sellers/register', data),
  getMe: () => api.get('/sellers/me'),
  getProducts: () => api.get('/sellers/my-products'),
  addProduct: (data: object) => api.post('/sellers/products', data),
  editProduct: (id: string, data: object) => api.put(`/sellers/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/sellers/products/${id}`),
  getOrders: () => api.get('/sellers/orders'),
  getAnalytics: () => api.get('/sellers/analytics'),
};

export const paymentAPI = {
  createOrder: (data: object) => api.post('/payments/create-order', data),
  verify: (data: object) => api.post('/payments/verify', data),
};
