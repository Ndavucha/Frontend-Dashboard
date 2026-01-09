// src/api/services.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://dashboard-azd9.onrender.com/api', // Adjust port if needed
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // Return a more user-friendly error
    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.error || 'Network error occurred',
      originalError: error
    });
  }
);

// ====================== AUTH API ======================
const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// ====================== ANALYTICS API ======================
const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getSupplyDemand: (period = '30days') => api.get('/analytics/supply-demand', { params: { period } }),
  getVarietyDistribution: () => api.get('/analytics/variety-distribution'),
  getCountyDistribution: () => api.get('/analytics/county-distribution'),
  getDemographics: () => api.get('/analytics/demographics'),
  getPerformanceTrends: () => api.get('/analytics/performance-trends'),
  getRiskAlerts: () => api.get('/analytics/risk-alerts'),
  getCostAnalysis: () => api.get('/analytics/cost-analysis'),
};

// ====================== FARMERS API ======================
const farmersApi = {
  getAll: () => api.get('/farmers'),
  getById: (id) => api.get(`/farmers/${id}`),
  create: (farmerData) => api.post('/farmers', farmerData),
  update: (id, farmerData) => api.put(`/farmers/${id}`, farmerData),
  delete: (id) => api.delete(`/farmers/${id}`),
  allocate: (id, allocationData) => api.post(`/farmers/${id}/allocate`, allocationData),
  getOrders: (id) => api.get(`/farmers/${id}/orders`),
};

// ====================== CROPS API ======================
const cropsApi = {
  getAll: () => api.get('/crops'),
  create: (cropData) => api.post('/crops', cropData),
  update: (id, cropData) => api.put(`/crops/${id}`, cropData),
  delete: (id) => api.delete(`/crops/${id}`),
};

// ====================== SUPPLY PLANNING API ======================
const supplyApi = {
  // Allocations
  getAllocations: () => api.get('/supply/allocations'),
  getAllocationById: (id) => api.get(`/supply/allocations/${id}`),
  createAllocation: (allocationData) => api.post('/supply/allocations', allocationData),
  updateAllocation: (id, allocationData) => api.put(`/supply/allocations/${id}`, allocationData),
  deleteAllocation: (id) => api.delete(`/supply/allocations/${id}`),
  
  // Demand Forecast
  getDemandForecast: (days = 30) => api.get('/procurement/demand-forecast', { params: { days } }),
  
  // Supply Analysis
  getDemandAnalysis: () => api.get('/supply/demand-analysis'),
  getUpcomingAllocations: (days = 7) => api.get('/supply/upcoming-allocations', { params: { days } }),
  
  // Plan
  getPlan: () => api.get('/supply/plan'),
  createPlan: (planData) => api.post('/supply/plan', planData),
  updatePlan: (id, planData) => api.put(`/supply/plan/${id}`, planData),
  
  // Availability & Calendar
  getFarmerAvailability: () => api.get('/supply/farmer-availability'),
  getHarvestCalendar: () => api.get('/supply/harvest-calendar'),
};

// ====================== PROCUREMENT API ======================
const procurementApi = {
  // Orders
  getOrders: () => api.get('/procurement/orders'),
  getOrderById: (id) => api.get(`/procurement/orders/${id}`),
  createOrder: (orderData) => api.post('/procurement/orders', orderData),
  updateOrder: (id, orderData) => api.put(`/procurement/orders/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/procurement/orders/${id}`),
  
  // Supplement Requests
  requestSupplement: (supplementData) => api.post('/procurement/request-supplement', supplementData),
  getSupplementRequests: () => api.get('/procurement/supplement-requests'),
  
  // Demand & Forecasting
  getDemandForecast: (days = 30) => api.get('/procurement/demand-forecast', { params: { days } }),
  
  // Reconciliation
  getSupplyReconciliation: () => api.get('/procurement/supply-reconciliation'),
  getHarvestReadiness: (days = 7) => api.get('/procurement/harvest-readiness', { params: { days } }),
};

// ====================== AGGREGATORS API ======================
const aggregatorsApi = {
  getAll: () => api.get('/aggregators'),
  getById: (id) => api.get(`/aggregators/${id}`),
  create: (aggregatorData) => api.post('/aggregators', aggregatorData),
  update: (id, aggregatorData) => api.put(`/aggregators/${id}`, aggregatorData),
  delete: (id) => api.delete(`/aggregators/${id}`),
  getStats: () => api.get('/aggregators/stats'), // Updated to match server endpoint
};

// ====================== CONTRACTS API ======================
const contractsApi = {
  getAll: () => api.get('/contracts'),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (contractData) => api.post('/contracts', contractData),
  update: (id, contractData) => api.put(`/contracts/${id}`, contractData),
  delete: (id) => api.delete(`/contracts/${id}`),
  updateFulfillment: (id, percentage) => api.patch(`/contracts/${id}/fulfillment`, { fulfillment_percentage: percentage }),
  getStats: () => api.get('/contracts/stats'), // Updated to match server endpoint
};

// ====================== NOTIFICATIONS API ======================
const notificationsApi = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ====================== UTILITY API ======================
const utilityApi = {
  getHealth: () => api.get('/health'),
  resetDatabase: () => api.post('/reset'),
  seedDatabase: () => api.post('/seed'),
};

// ====================== MAIN API SERVICE ======================
export const apiService = {
  auth: authApi,
  analytics: analyticsApi,
  farmers: farmersApi,
  crops: cropsApi,
  supply: supplyApi,
  procurement: procurementApi,
  aggregators: aggregatorsApi,
  contracts: contractsApi,
  notifications: notificationsApi,
  utility: utilityApi,
  
  // Legacy/compatibility methods
  aggregators: {
    getAll: aggregatorsApi.getAll,
    getStats: aggregatorsApi.getStats,
    create: aggregatorsApi.create,
    update: aggregatorsApi.update,
    delete: aggregatorsApi.delete,
  },
  
  contracts: {
    getAll: contractsApi.getAll,
    getStats: contractsApi.getStats,
    create: contractsApi.create,
    update: contractsApi.update,
    delete: contractsApi.delete,
    updateFulfillment: contractsApi.updateFulfillment,
  },
};

// ====================== HELPER FUNCTIONS ======================

// Helper for file uploads
export const uploadFile = async (endpoint, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(percentCompleted);
    } : undefined,
  });

  return response;
};

// Export axios instance for custom requests
export { api };

