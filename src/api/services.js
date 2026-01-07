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

    // Handle specific error statuses
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Optional: Redirect to login page
      // window.location.href = '/login';
    }

    throw error;
  }
);

// ====================== AUTH API ======================
const authApi = {
  login: (credentials) => api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials),
  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },
  register: (userData) => api.post(API_CONFIG.ENDPOINTS.REGISTER, userData),
  verifyToken: () => api.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN),
};

// ====================== ANALYTICS API ======================
const analyticsApi = {
  getOverviewStats: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW_STATS),
  getSupplyDemandChart: (period = '30days') => 
    api.get(API_CONFIG.ENDPOINTS.ANALYTICS.SUPPLY_DEMAND_CHART, { params: { period } }),
  getVarietyDistribution: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.VARIETY_DISTRIBUTION),
  getRiskAlerts: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.RISK_ALERTS),
  getCostAnalysis: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.COST_ANALYSIS),
  
  // New analytics endpoints for enhanced features
  getPerformanceTrends: (months = 6) => 
    api.get(API_CONFIG.ENDPOINTS.ANALYTICS.PERFORMANCE_TRENDS, { params: { months } }),
  getFarmerDemographics: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.FARMER_DEMOGRAPHICS),
  getCountyDistribution: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.COUNTY_DISTRIBUTION),
  getDeficitAnalysis: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.DEFICIT_ANALYSIS),
  getFinancialMetrics: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.FINANCIAL_METRICS),
  getPredictiveInsights: () => api.get(API_CONFIG.ENDPOINTS.ANALYTICS.PREDICTIVE_INSIGHTS),
  getTrendForecast: (days = 30) => 
    api.get(API_CONFIG.ENDPOINTS.ANALYTICS.TREND_FORECAST, { params: { days } }),
};

// ====================== FARMERS API ======================
const farmersApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.FARMERS, { params }),
  getById: (id) => api.get(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id)),
  create: (farmerData) => api.post(API_CONFIG.ENDPOINTS.FARMERS, farmerData),
  update: (id, farmerData) => api.put(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id), farmerData),
  delete: (id) => api.delete(API_CONFIG.ENDPOINTS.FARMER_DETAIL(id)),
  allocate: (id, allocationData) => 
    api.post(API_CONFIG.ENDPOINTS.FARMER_ALLOCATE(id), allocationData),
  getPerformance: (id) => api.get(API_CONFIG.ENDPOINTS.FARMER_PERFORMANCE(id)),
  getTopPerformers: (limit = 10) => 
    api.get(API_CONFIG.ENDPOINTS.FARMERS_TOP, { params: { limit } }),
  search: (query) => api.get(API_CONFIG.ENDPOINTS.FARMERS_SEARCH, { params: { query } }),
  export: () => api.get(API_CONFIG.ENDPOINTS.FARMERS_EXPORT, { responseType: 'blob' }),
};

// ====================== CROPS API ======================
const cropsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.CROPS, { params }),
  getByFarmer: (farmerId) => api.get(API_CONFIG.ENDPOINTS.CROPS, { params: { farmer_id: farmerId } }),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.CROPS}/${id}`),
  create: (cropData) => api.post(API_CONFIG.ENDPOINTS.CROPS, cropData),
  update: (id, cropData) => api.put(`${API_CONFIG.ENDPOINTS.CROPS}/${id}`, cropData),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.CROPS}/${id}`),
  getVarieties: () => api.get(API_CONFIG.ENDPOINTS.CROPS_VARIETIES),
  getSeasonalTrends: (cropId) => api.get(`${API_CONFIG.ENDPOINTS.CROPS}/${cropId}/trends`),
};

// ====================== SUPPLY PLANNING API ======================
const supplyApi = {
  // Allocations - CRITICAL for procurement page
  getAllocations: (params = {}) => api.get(API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS, { params }),
  getAllocationById: (id) => api.get(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`),
  createAllocation: (allocationData) => api.post(API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS, allocationData),
  updateAllocation: (id, allocationData) => 
    api.put(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`, allocationData),
  deleteAllocation: (id) => api.delete(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}`),
  bulkUpdateAllocations: (updates) => 
    api.patch(API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS_BULK, { updates }),
  
  // Supply Planning
  getSupplyPlan: (params = {}) => api.get(API_CONFIG.ENDPOINTS.SUPPLY.PLAN, { params }),
  createSupplyPlan: (planData) => api.post(API_CONFIG.ENDPOINTS.SUPPLY.PLAN, planData),
  updateSupplyPlan: (id, planData) => api.put(`${API_CONFIG.ENDPOINTS.SUPPLY.PLAN}/${id}`, planData),
  
  // Delivery Management
  getDeliveryTimeline: (days = 7) => 
    api.get(API_CONFIG.ENDPOINTS.SUPPLY.DELIVERY_TIMELINE, { params: { days } }),
  updateDeliveryStatus: (id, statusData) => 
    api.patch(`${API_CONFIG.ENDPOINTS.SUPPLY.ALLOCATIONS}/${id}/status`, statusData),
  
  // Supply Analysis
  getSupplyGapAnalysis: () => api.get(API_CONFIG.ENDPOINTS.SUPPLY.GAP_ANALYSIS),
  getSupplyCoverage: () => api.get(API_CONFIG.ENDPOINTS.SUPPLY.COVERAGE),
};

// ====================== PROCUREMENT API ======================
const procurementApi = {
  // Orders
  getOrders: (params = {}) => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS, { params }),
  getOrderById: (id) => api.get(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`),
  createOrder: (orderData) => api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS, orderData),
  updateOrder: (id, orderData) => api.put(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`, orderData),
  deleteOrder: (id) => api.delete(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}`),
  bulkCreateOrders: (ordersData) => 
    api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS_BULK, ordersData),
  
  // Order Status Management
  updateOrderStatus: (id, statusData) => 
    api.patch(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}/status`, statusData),
  receiveOrder: (id, receiptData) => 
    api.post(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}/receive`, receiptData),
  cancelOrder: (id, reason) => 
    api.post(`${API_CONFIG.ENDPOINTS.PROCUREMENT.ORDERS}/${id}/cancel`, { reason }),
  
  // Supplement Requests
  requestSupplement: (supplementData) => 
    api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.SUPPLEMENT_REQUEST, supplementData),
  getSupplementRequests: () => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.SUPPLEMENT_REQUESTS),
  updateSupplementRequest: (id, updateData) => 
    api.put(`${API_CONFIG.ENDPOINTS.PROCUREMENT.SUPPLEMENT_REQUESTS}/${id}`, updateData),
  
  // Other procurement endpoints
  getDemandForecast: (days = 30) => 
    api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.DEMAND_FORECAST, { params: { days } }),
  getSupplyReconciliation: () => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.SUPPLY_RECONCILIATION),
  getHarvestReadiness: (days = 7) => 
    api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.HARVEST_READINESS, { params: { days } }),
  
  // Performance Metrics
  getProcurementMetrics: () => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.METRICS),
  getAcceptanceRate: () => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.ACCEPTANCE_RATE),
  getOnTimeDeliveryRate: () => api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.ON_TIME_DELIVERY),
  
  // Export/Import
  exportOrders: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.PROCUREMENT.EXPORT_ORDERS, { params, responseType: 'blob' }),
  importOrders: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(API_CONFIG.ENDPOINTS.PROCUREMENT.IMPORT_ORDERS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ====================== AGGREGATORS API ======================
const aggregatorsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.AGGREGATORS, { params }),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`),
  create: (aggregatorData) => api.post(API_CONFIG.ENDPOINTS.AGGREGATORS, aggregatorData),
  update: (id, aggregatorData) => api.put(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`, aggregatorData),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}`),
  
  // Aggregator Performance
  getPerformance: (id) => api.get(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}/performance`),
  getReliability: (id) => api.get(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${id}/reliability`),
  
  // Requests to Aggregators
  sendRequest: (aggregatorId, requestData) => 
    api.post(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${aggregatorId}/request`, requestData),
  getRequests: (aggregatorId) => 
    api.get(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${aggregatorId}/requests`),
  
  // Capacity & Availability
  getAvailableCapacity: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.AGGREGATORS_AVAILABLE_CAPACITY, { params }),
  checkAvailability: (aggregatorId, checkData) => 
    api.post(`${API_CONFIG.ENDPOINTS.AGGREGATORS}/${aggregatorId}/availability`, checkData),
};

// ====================== FINANCIAL API ======================
const financialApi = {
  // Payments
  getPayments: (params = {}) => api.get(API_CONFIG.ENDPOINTS.FINANCIAL.PAYMENTS, { params }),
  createPayment: (paymentData) => api.post(API_CONFIG.ENDPOINTS.FINANCIAL.PAYMENTS, paymentData),
  updatePaymentStatus: (id, statusData) => 
    api.patch(`${API_CONFIG.ENDPOINTS.FINANCIAL.PAYMENTS}/${id}/status`, statusData),
  bulkPayments: (paymentsData) => 
    api.post(API_CONFIG.ENDPOINTS.FINANCIAL.PAYMENTS_BULK, paymentsData),
  
  // Financial Metrics
  getFinancialOverview: () => api.get(API_CONFIG.ENDPOINTS.FINANCIAL.OVERVIEW),
  getCostAnalysis: (period = 'monthly') => 
    api.get(API_CONFIG.ENDPOINTS.FINANCIAL.COST_ANALYSIS, { params: { period } }),
  getRevenueTrends: () => api.get(API_CONFIG.ENDPOINTS.FINANCIAL.REVENUE_TRENDS),
  
  // Outstanding & Settlements
  getOutstandingPayments: () => api.get(API_CONFIG.ENDPOINTS.FINANCIAL.OUTSTANDING_PAYMENTS),
  settlePayment: (id, settlementData) => 
    api.post(`${API_CONFIG.ENDPOINTS.FINANCIAL.PAYMENTS}/${id}/settle`, settlementData),
  
  // Reports
  generateFinancialReport: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.FINANCIAL.GENERATE_REPORT, { params, responseType: 'blob' }),
};

// ====================== NOTIFICATIONS API ======================
const notificationsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS, { params }),
  getUnreadCount: () => api.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/unread/count`),
  markAsRead: (id) => api.patch(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${id}/read`),
  markAllAsRead: () => api.patch(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/read-all`),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${id}`),
  
  // Notification Preferences
  getPreferences: () => api.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/preferences`),
  updatePreferences: (preferences) => 
    api.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/preferences`, preferences),
  
  // Notification Types
  getTypes: () => api.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/types`),
  subscribe: (subscriptionData) => 
    api.post(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/subscribe`, subscriptionData),
};

// ====================== CONTRACTS API ======================
const contractsApi = {
  getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.CONTRACTS, { params }),
  getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}`),
  create: (contractData) => api.post(API_CONFIG.ENDPOINTS.CONTRACTS, contractData),
  update: (id, contractData) => api.put(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}`, contractData),
  updateFulfillment: (id, fulfillment_percentage) => 
    api.patch(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}/fulfillment`, { fulfillment_percentage }),
  delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}`),
  
  // Contract Status
  updateStatus: (id, statusData) => 
    api.patch(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}/status`, statusData),
  renew: (id, renewalData) => 
    api.post(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}/renew`, renewalData),
  
  // Contract Analytics
  getContractPerformance: (id) => 
    api.get(`${API_CONFIG.ENDPOINTS.CONTRACTS}/${id}/performance`),
  getUpcomingRenewals: (days = 30) => 
    api.get(API_CONFIG.ENDPOINTS.CONTRACTS_UPCOMING_RENEWALS, { params: { days } }),
};

// ====================== REPORTS API ======================
const reportsApi = {
  generateReport: (reportData) => api.post(API_CONFIG.ENDPOINTS.REPORTS.GENERATE, reportData),
  getReportTemplates: () => api.get(API_CONFIG.ENDPOINTS.REPORTS.TEMPLATES),
  getReportHistory: (params = {}) => api.get(API_CONFIG.ENDPOINTS.REPORTS.HISTORY, { params }),
  downloadReport: (id) => 
    api.get(`${API_CONFIG.ENDPOINTS.REPORTS.HISTORY}/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`${API_CONFIG.ENDPOINTS.REPORTS.HISTORY}/${id}`),
  
  // Standard Reports
  getSupplyChainReport: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.REPORTS.SUPPLY_CHAIN, { params, responseType: 'blob' }),
  getFinancialReport: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.REPORTS.FINANCIAL, { params, responseType: 'blob' }),
  getPerformanceReport: (params = {}) => 
    api.get(API_CONFIG.ENDPOINTS.REPORTS.PERFORMANCE, { params, responseType: 'blob' }),
};

// ====================== SETTINGS API ======================
const settingsApi = {
  getSettings: () => api.get(API_CONFIG.ENDPOINTS.SETTINGS),
  updateSettings: (settingsData) => api.put(API_CONFIG.ENDPOINTS.SETTINGS, settingsData),
  
  // User Profile
  getProfile: () => api.get(API_CONFIG.ENDPOINTS.PROFILE),
  updateProfile: (profileData) => api.put(API_CONFIG.ENDPOINTS.PROFILE, profileData),
  changePassword: (passwordData) => 
    api.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData),
  
  // System Settings
  getSystemSettings: () => api.get(API_CONFIG.ENDPOINTS.SYSTEM_SETTINGS),
  updateSystemSettings: (systemData) => 
    api.put(API_CONFIG.ENDPOINTS.SYSTEM_SETTINGS, systemData),
};

// ====================== HEALTH API ======================
const healthApi = {
  check: () => api.get(API_CONFIG.ENDPOINTS.HEALTH),
  metrics: () => api.get(API_CONFIG.ENDPOINTS.HEALTH_METRICS),
  database: () => api.get(API_CONFIG.ENDPOINTS.HEALTH_DATABASE),
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
  financial: financialApi,
  notifications: notificationsApi,
  contracts: contractsApi,
  reports: reportsApi,
  settings: settingsApi,
  health: healthApi,
};

// ====================== WEBSOCKET SERVICE ======================
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = null;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
      this.socket = new WebSocket(API_CONFIG.WS_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        clearInterval(this.reconnectInterval);
        
        // Send initial subscription
        this.socket.send(JSON.stringify({
          event: 'subscribe',
          payload: { 
            channels: [
              'dashboard_update', 
              'risk_alert', 
              'notification',
              'supply_update',
              'order_update',
              'analytics_update'
            ] 
          }
        }));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.notifyListeners(data.event, data.payload);
          
          // Trigger analytics refresh on relevant events
          if (['supply_update', 'order_update', 'analytics_update'].includes(data.event)) {
            this.notifyListeners('analytics_refresh', {});
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
    clearInterval(this.reconnectInterval);
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Reconnecting WebSocket in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
      this.startPeriodicReconnect();
    }
  }

  startPeriodicReconnect() {
    this.reconnectInterval = setInterval(() => {
      console.log('Attempting periodic WebSocket reconnection...');
      this.reconnectAttempts = 0;
      this.connect();
    }, 60000); // Try every minute
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Use setTimeout to avoid blocking
      setTimeout(() => {
        eventListeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in WebSocket listener:', error);
          }
        });
      }, 0);
    }
  }

  send(event, payload) {
    if (this.isConnected()) {
      this.socket.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send:', event);
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Export singleton WebSocket instance
export const webSocketService = new WebSocketService();

// Connect WebSocket on module load
if (typeof window !== 'undefined') {
  // Connect with a small delay to let the app initialize
  setTimeout(() => {
    webSocketService.connect();
  }, 1000);
  
  // Reconnect when window gains focus
  window.addEventListener('focus', () => {
    if (!webSocketService.isConnected()) {
      webSocketService.connect();
    }
  });
}

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

// Helper for batch operations
export const batchOperation = async (endpoint, items, operation) => {
  const responses = await Promise.allSettled(
    items.map(item => api[operation](`${endpoint}/${item.id}`, item.data))
  );
  
  const results = {
    success: [],
    failed: []
  };
  
  responses.forEach((response, index) => {
    if (response.status === 'fulfilled') {
      results.success.push({
        item: items[index],
        data: response.value
      });
    } else {
      results.failed.push({
        item: items[index],
        error: response.reason
      });
    }
  });
  
  return results;
};

// Helper for formatting query parameters
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, v));
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (nestedValue !== undefined && nestedValue !== null) {
            searchParams.append(`${key}[${nestedKey}]`, nestedValue);
          }
        });
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Cache helper for frequently used data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cachedRequest = async (key, requestFunction, ttl = CACHE_TTL) => {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }
  
  try {
    const data = await requestFunction();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    // If cache exists and request fails, return cached data even if stale
    if (cached) {
      console.warn(`Returning stale cache for ${key} due to request error:`, error);
      return cached.data;
    }
    throw error;
  }
};

// Clear cache helper
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Export axios instance for custom requests
export { api };
