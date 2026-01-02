// src/config/api.js

// Get environment from import.meta.env or use defaults
// For RENDER: https://dashboard-azd9.onrender.com (without /api)
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://dashboard-azd9.onrender.com';
const WS_URL = import.meta.env?.VITE_WS_URL || 'wss://dashboard-azd9.onrender.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,  // Should be: https://dashboard-azd9.onrender.com
  WS_URL: WS_URL,
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // ALL endpoints MUST include /api prefix for RENDER
    
    // Health
    HEALTH: '/api/health',
    
    // Auth
    LOGIN: '/api/auth/login',
    
    // Analytics
    OVERVIEW_STATS: '/api/analytics/overview',
    SUPPLY_DEMAND_CHART: '/api/analytics/supply-demand',
    VARIETY_DISTRIBUTION: '/api/analytics/variety-distribution',
    RISK_ALERTS: '/api/analytics/risk-alerts',
    COST_ANALYSIS: '/api/analytics/cost-analysis',
    
    // Farmers
    FARMERS: '/api/farmers',
    FARMER_DETAIL: (id) => `/api/farmers/${id}`,
    
    // Crops
    CROPS: '/api/crops',
    
    // Procurement
    PROCUREMENT_ORDERS: '/api/procurement/orders',
    DEMAND_FORECAST: '/api/procurement/demand-forecast',
    SUPPLY_RECONCILIATION: '/api/procurement/supply-reconciliation',
    HARVEST_READINESS: '/api/procurement/harvest-readiness',
    
    // Aggregators - CRITICAL: Add these endpoints
    AGGREGATORS: '/api/aggregators',
    AGGREGATOR_DETAIL: (id) => `/api/aggregators/${id}`,
    AGGREGATORS_STATS: '/api/aggregators-stats',
    
    // Contracts
    CONTRACTS: '/api/contracts',
    CONTRACT_DETAIL: (id) => `/api/contracts/${id}`,
    CONTRACTS_STATS: '/api/contracts-stats',
    CONTRACT_FULFILLMENT: (id) => `/api/contracts/${id}/fulfillment`,
    
    // Notifications
    NOTIFICATIONS: '/api/notifications',
  }
};

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  DASHBOARD_UPDATE: 'dashboard_update',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  RISK_ALERT: 'risk_alert',
  NOTIFICATION: 'notification',
};
