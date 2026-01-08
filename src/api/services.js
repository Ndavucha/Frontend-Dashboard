// src/api/services.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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

// Response interceptor for error handling
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

    throw error;
  }
);

// ====================== AUTH API ======================
const authApi = {
  login: (credentials) => api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials),
  register: (userData) => api.post(API_CONFIG.ENDPOINTS.REGISTER, userData),
  verifyToken: () => api.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN),
  logout: () => api.post(API_CONFIG.ENDPOINTS.LOGOUT),
};

// ====================== ANALYTICS API ======================
const analyticsApi = {
  getOverviewStats: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW_STATS),
  getSupplyDemandChart: (period = '30days') => 
    api.get(API_CONFIG.ENDPOINTS.ANALYTICS.SUPPLY_DEMAND_CHART, { params: { period } }),
  getVarietyDistribution: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.VARIETY_DISTRIBUTION),
};

// ====================== FARMERS API ======================
const farmersApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.FARMERS, { params }),
  getById: (id) => api.get(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id)),
  create: (farmerData) => api.post(API_CONFIG.ENDPOINTS.FARMERS, farmerData),
  update: (id, farmerData) => api.put(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id), farmerData),
  delete: (id) => api.delete(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id)),
};

// ====================== CROPS API ======================
const cropsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.CROPS, { params }),
  getByFarmer: (farmerId) => api.get(API_CONFIG.ENDPOINTS.CROPS, { params: { farmer_id: farmerId } }),
  create: (cropData) => api.post(API_CONFIG.ENDPOINTS.CROPS, cropData),
  update: (id, cropData) => api.put(`${API_CONFIG.ENDPOINTS.CROPS}/${id}`, cropData),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.CROPS}/${id}`),
};

// ====================== SUPPLY PLANNING API ======================
const supplyApi = {
  // Allocations - CRITICAL for SupplyPlanning.jsx
  getAllocations: (params = {}) => api.get(API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS, { params }),
  getAllocationById: (id) => api.get(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`),
  createAllocation: (allocationData) => api.post(API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS, allocationData),
  updateAllocation: (id, allocationData) => 
    api.put(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`, allocationData),
  deleteAllocation: (id) => api.delete(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`),
  
  // Demand Forecast - CRITICAL for SupplyPlanning.jsx
  getDemandForecast: (days = 30) => 
    api.get(API_CONFIG.ENDPOINTS.SUPPLY.DEMAND_FORECAST, { params: { days } }),
  
  // Delivery Management
  getDeliveryTimeline: (days = 7) => 
    api.get(API_CONFIG.ENDPOINTS.SUPPLY.DELIVERY_TIMELINE, { params: { days } }),
  
  // Supply Analysis
  getSupplyGapAnalysis: () => api.get(API_CONFIG.ENDPOINTS.SUPPLY.GAP_ANALYSIS),
};

// ====================== PROCUREMENT API ======================
const procurementApi = {
  // Orders
  getOrders: (params = {}) => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS, { params }),
  getOrderById: (id) => api.get(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`),
  createOrder: (orderData) => api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS, orderData),
  updateOrder: (id, orderData) => api.put(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`, orderData),
  deleteOrder: (id) => api.delete(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`),
  
  // Order Status Management
  updateOrderStatus: (id, statusData) => 
    api.patch(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}/status`, statusData),
  receiveOrder: (id, receiptData) => 
    api.post(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}/receive`, receiptData),
  
  // Supplement Requests
  requestSupplement: (supplementData) => 
    api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.SUPPLEMENT_REQUEST, supplementData),
  
  // Demand & Forecasting
  getDemandForecast: (days = 30) => 
    api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.DEMAND_FORECAST, { params: { days } }),
};

// ====================== AGGREGATORS API ======================
const aggregatorsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.AGGREGATORS, { params }),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`),
  create: (aggregatorData) => api.post(API_CONFIG.ENDPOINTS.AGGREGATORS, aggregatorData),
  update: (id, aggregatorData) => api.put(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`, aggregatorData),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`),
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
