import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT Token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maitri_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// --- API Helper Functions ---
export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const menuApi = {
  getMenu: () => api.get('/menu'),
  createCategory: (data: any) => api.post('/menu/categories', data),
  createItem: (data: any) => api.post('/menu/items', data),
  updateItem: (id: number, data: any) => api.put(`/menu/items/${id}`, data),
  toggleAvailability: (id: number) => api.patch(`/menu/items/${id}/toggle-availability`),
  deleteItem: (id: number) => api.delete(`/menu/items/${id}`),
};

export const tablesApi = {
  getAll: () => api.get('/tables'),
  validateQr: (tableNumber: string, token: string) =>
    api.get(`/tables/${tableNumber}/validate?token=${token}`),
  getQrCode: (tableNumber: string) =>
    api.get(`/tables/${tableNumber}/qr-code?origin_url=${encodeURIComponent(window.location.origin)}`),
  create: (data: any) => api.post('/tables', data),
  updateStatus: (id: number, status: string) => api.put(`/tables/${id}/status`, { status }),
};

export const bookingsApi = {
  createTableBooking: (data: any) => api.post('/bookings', data),
  getAllTableBookings: (status?: string) =>
    api.get('/bookings', { params: { status } }),
  updateTableBookingStatus: (id: number, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
};

export const celebrationsApi = {
  createCelebrationBooking: (data: any) => api.post('/celebrations', data),
  getAllCelebrations: (status?: string) =>
    api.get('/celebrations', { params: { status } }),
  updateCelebrationStatus: (id: number, status: string) =>
    api.put(`/celebrations/${id}/status`, { status }),
};

export const ordersApi = {
  placeOrder: (orderData: any) => api.post('/orders', orderData),
  getAllOrders: (status?: string) =>
    api.get('/orders', { params: { status } }),
  getOrderById: (id: number) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  createServiceRequest: (tableNumber: string, requestType: string) =>
    api.post('/orders/service-request', { table_number: tableNumber, request_type: requestType }),
  getServiceRequests: () => api.get('/orders/service-requests'),
  attendServiceRequest: (id: number) => api.put(`/orders/service-requests/${id}/attend`),
};

export const feedbackApi = {
  submitFeedback: (data: any) => api.post('/feedback', data),
  getFeedback: (publicOnly = false) =>
    api.get('/feedback', { params: { public_only: publicOnly } }),
  getSummary: () => api.get('/feedback/summary'),
};

export const reportsApi = {
  getAnalytics: (period: string = 'Today') =>
    api.get('/reports/analytics', { params: { period } }),
};

export const loyaltyApi = {
  getCustomer: (phone: string) => api.get(`/loyalty/customer/${phone}`),
  getRewards: () => api.get('/loyalty/rewards'),
  redeem: (phone: string, rewardId: number) =>
    api.post('/loyalty/redeem', { phone, reward_id: rewardId }),
  getAdminCustomers: () => api.get('/loyalty/admin/customers'),
  adminAdjustPoints: (phone: string, name: string, pointsChange: number, description: string) =>
    api.post('/loyalty/admin/adjust-points', { phone, name, points_change: pointsChange, description }),
  adminCreateReward: (rewardName: string, pointsRequired: number, discountAmount: number) =>
    api.post('/loyalty/admin/rewards', { reward_name: rewardName, points_required: pointsRequired, discount_amount: discountAmount }),
};
