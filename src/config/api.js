// src/config/api.js

// Get environment from import.meta.env or use defaults
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://dashboard-azd9.onrender.com';
const WS_URL = import.meta.env?.VITE_WS_URL || 'wss://dashboard-azd9.onrender.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_URL: WS_URL,
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_TOKEN: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    
    // Analytics - Individual endpoints for easy access
    OVERVIEW_STATS: '/api/analytics/overview',
    SUPPLY_DEMAND_CHART: '/api/analytics/supply-demand',
    VARIETY_DISTRIBUTION: '/api/analytics/variety-distribution',
    PERFORMANCE_TRENDS: '/api/analytics/performance-trends',
    FARMER_DEMOGRAPHICS: '/api/analytics/farmer-demographics',
    COUNTY_DISTRIBUTION: '/api/analytics/county-distribution',
    DEFICIT_ANALYSIS: '/api/analytics/deficit-analysis',
    FINANCIAL_METRICS: '/api/analytics/financial-metrics',
    PREDICTIVE_INSIGHTS: '/api/analytics/predictive-insights',
    TREND_FORECAST: '/api/analytics/trend-forecast',
    RISK_ALERTS: '/api/analytics/risk-alerts',
    COST_ANALYSIS: '/api/analytics/cost-analysis',
    
    // Farmers
    FARMERS: '/api/farmers',
    FARMER_DETAIL: (id) => `/api/farmers/${id}`,
    FARMER_ALLOCATE: (id) => `/api/farmers/${id}/allocate`,
    FARMER_PERFORMANCE: (id) => `/api/farmers/${id}/performance`,
    FARMERS_TOP: '/api/farmers/top',
    FARMERS_SEARCH: '/api/farmers/search',
    FARMERS_EXPORT: '/api/farmers/export',
    FARMER_CROPS: (id) => `/api/farmers/${id}/crops`,
    FARMER_HISTORY: (id) => `/api/farmers/${id}/history`,
    
    // Crops
    CROPS: '/api/crops',
    CROPS_VARIETIES: '/api/crops/varieties',
    CROP_DETAIL: (id) => `/api/crops/${id}`,
    CROP_SEASONAL_TRENDS: (id) => `/api/crops/${id}/trends`,
    CROP_MARKET_PRICES: '/api/crops/market-prices',
    
    // Supply Planning
    SUPPLY_ALLOCATIONS: '/api/supply/allocations',
    SUPPLY_PLAN: '/api/supply/plan',
    
    // Also keep the structured version for backward compatibility
    SUPPLY: {
      // Allocations
      ALLOCATIONS: '/api/supply/allocations',
      ALLOCATIONS_BULK: '/api/supply/allocations/bulk',
      ALLOCATION_DETAIL: (id) => `/api/supply/allocations/${id}`,
      
      // Supply Planning
      PLAN: '/api/supply/plan',
      PLAN_DETAIL: (id) => `/api/supply/plan/${id}`,
      
      // Delivery Management
      DELIVERY_TIMELINE: '/api/supply/delivery-timeline',
      UPDATE_STATUS: (id) => `/api/supply/allocations/${id}/status`,
      
      // Demand Forecast
      DEMAND_FORECAST: '/api/supply/demand-forecast',
      
      // Analysis
      GAP_ANALYSIS: '/api/supply/gap-analysis',
      COVERAGE: '/api/supply/coverage',
      SUPPLY_DEMAND_BALANCE: '/api/supply/balance',
      
      // Scheduling
      SCHEDULE_ALLOCATION: '/api/supply/schedule',
      BULK_SCHEDULE: '/api/supply/bulk-schedule',
      RESCHEDULE: (id) => `/api/supply/allocations/${id}/reschedule`,
      
      // Reports
      SUPPLY_REPORT: '/api/supply/report',
      ALLOCATION_SUMMARY: '/api/supply/allocations/summary'
    },
    
    // Procurement
    PROCUREMENT_ORDERS: '/api/procurement/orders',
    DEMAND_FORECAST: '/api/procurement/demand-forecast',
    SUPPLY_RECONCILIATION: '/api/procurement/supply-reconciliation',
    HARVEST_READINESS: '/api/procurement/harvest-readiness',
    
    // Structured version for backward compatibility
    PROCUREMENT: {
      // Orders
      ORDERS: '/api/procurement/orders',
      ORDERS_BULK: '/api/procurement/orders/bulk',
      ORDER_DETAIL: (id) => `/api/procurement/orders/${id}`,
      
      // Order Status
      UPDATE_ORDER_STATUS: (id) => `/api/procurement/orders/${id}/status`,
      RECEIVE_ORDER: (id) => `/api/procurement/orders/${id}/receive`,
      CANCEL_ORDER: (id) => `/api/procurement/orders/${id}/cancel`,
      
      // Supplement Requests
      SUPPLEMENT_REQUEST: '/api/procurement/supplement-request',
      SUPPLEMENT_REQUESTS: '/api/procurement/supplement-requests',
      SUPPLEMENT_DETAIL: (id) => `/api/procurement/supplement-requests/${id}`,
      
      // Demand & Forecasting
      DEMAND_FORECAST: '/api/procurement/demand-forecast',
      SUPPLY_RECONCILIATION: '/api/procurement/supply-reconciliation',
      HARVEST_READINESS: '/api/procurement/harvest-readiness',
      
      // Performance Metrics
      METRICS: '/api/procurement/metrics',
      ACCEPTANCE_RATE: '/api/procurement/acceptance-rate',
      ON_TIME_DELIVERY: '/api/procurement/on-time-delivery',
      COST_ANALYSIS: '/api/procurement/cost-analysis',
      
      // Export/Import
      EXPORT_ORDERS: '/api/procurement/orders/export',
      IMPORT_ORDERS: '/api/procurement/orders/import',
      ORDER_TEMPLATE: '/api/procurement/orders/template',
      
      // Manual Orders
      MANUAL_ORDER: '/api/procurement/manual-order',
      EXTERNAL_SUPPLIERS: '/api/procurement/external-suppliers'
    },
    
     // Farmmall
    FARM_MALL_FARMERS: '/api/farmmall/farmers',
    FARM_MALL_ORDER: '/api/farmmall/orders',
    FARM_MALL_FARMER_DETAIL: (id) => `/api/farmmall/farmers/${id}`, 
  
    
    // Aggregators
    AGGREGATORS: '/api/aggregators',
    AGGREGATOR_DETAIL: (id) => `/api/aggregators/${id}`,
    AGGREGATORS_AVAILABLE_CAPACITY: '/api/aggregators/available-capacity',
    AGGREGATOR_PERFORMANCE: (id) => `/api/aggregators/${id}/performance`,
    AGGREGATOR_RELIABILITY: (id) => `/api/aggregators/${id}/reliability`,
    AGGREGATOR_REQUEST: (id) => `/api/aggregators/${id}/request`,
    AGGREGATOR_REQUESTS: (id) => `/api/aggregators/${id}/requests`,
    AGGREGATOR_AVAILABILITY: (id) => `/api/aggregators/${id}/availability`,
    
    // Financial
    FINANCIAL: {
      PAYMENTS: '/api/financial/payments',
      PAYMENTS_BULK: '/api/financial/payments/bulk',
      PAYMENT_DETAIL: (id) => `/api/financial/payments/${id}`,
      OVERVIEW: '/api/financial/overview',
      COST_ANALYSIS: '/api/financial/cost-analysis',
      REVENUE_TRENDS: '/api/financial/revenue-trends',
      OUTSTANDING_PAYMENTS: '/api/financial/outstanding-payments',
      GENERATE_REPORT: '/api/financial/report',
      UPDATE_PAYMENT_STATUS: (id) => `/api/financial/payments/${id}/status`,
      SETTLE_PAYMENT: (id) => `/api/financial/payments/${id}/settle`,
      PAYMENT_HISTORY: '/api/financial/payments/history'
    },
    
    // Notifications
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATION_DETAIL: (id) => `/api/notifications/${id}`,
    NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread/count',
    NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
    NOTIFICATIONS_PREFERENCES: '/api/notifications/preferences',
    NOTIFICATIONS_TYPES: '/api/notifications/types',
    NOTIFICATIONS_SUBSCRIBE: '/api/notifications/subscribe',
    
    // Contracts
    CONTRACTS: '/api/contracts',
    CONTRACT_DETAIL: (id) => `/api/contracts/${id}`,
    CONTRACTS_UPCOMING_RENEWALS: '/api/contracts/upcoming-renewals',
    CONTRACT_PERFORMANCE: (id) => `/api/contracts/${id}/performance`,
    UPDATE_CONTRACT_STATUS: (id) => `/api/contracts/${id}/status`,
    RENEW_CONTRACT: (id) => `/api/contracts/${id}/renew`,
    UPDATE_FULFILLMENT: (id) => `/api/contracts/${id}/fulfillment`,
    
    // Reports
    REPORTS: {
      GENERATE: '/api/reports/generate',
      TEMPLATES: '/api/reports/templates',
      HISTORY: '/api/reports/history',
      REPORT_DETAIL: (id) => `/api/reports/history/${id}`,
      SUPPLY_CHAIN: '/api/reports/supply-chain',
      FINANCIAL: '/api/reports/financial',
      PERFORMANCE: '/api/reports/performance',
      FARMER: '/api/reports/farmer',
      PROCUREMENT: '/api/reports/procurement',
      DOWNLOAD_REPORT: (id) => `/api/reports/history/${id}/download`,
      DELETE_REPORT: (id) => `/api/reports/history/${id}`
    },
    
    // Settings
    SETTINGS: '/api/settings',
    PROFILE: '/api/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    SYSTEM_SETTINGS: '/api/settings/system',
    USER_SETTINGS: '/api/settings/user',
    COMPANY_SETTINGS: '/api/settings/company',
    
    // Health
    HEALTH: '/api/health',
    HEALTH_METRICS: '/api/health/metrics',
    HEALTH_DATABASE: '/api/health/database',
    HEALTH_STATUS: '/api/health/status',
    
    // File Upload
    UPLOAD: '/api/upload',
    UPLOAD_IMAGES: '/api/upload/images',
    UPLOAD_DOCUMENTS: '/api/upload/documents',
    UPLOAD_TEMPLATES: '/api/upload/templates',
    
    // Miscellaneous
    DASHBOARD_STATS: '/api/dashboard/stats',
    ACTIVITY_LOG: '/api/activity/log',
    AUDIT_TRAIL: '/api/audit/trail',
    BACKUP: '/api/system/backup',
    RESTORE: '/api/system/restore'
  }
};

