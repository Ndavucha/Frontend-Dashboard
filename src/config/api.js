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
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify',
    LOGOUT: '/auth/logout',
    
    // Analytics
    ANALYTICS: {
      OVERVIEW_STATS: '/analytics/overview',
      SUPPLY_DEMAND_CHART: '/analytics/supply-demand',
      VARIETY_DISTRIBUTION: '/analytics/variety-distribution',
      PERFORMANCE_TRENDS: '/analytics/performance-trends',
      FARMER_DEMOGRAPHICS: '/analytics/farmer-demographics',
      COUNTY_DISTRIBUTION: '/analytics/county-distribution',
      DEFICIT_ANALYSIS: '/analytics/deficit-analysis',
      FINANCIAL_METRICS: '/analytics/financial-metrics',
      PREDICTIVE_INSIGHTS: '/analytics/predictive-insights',
      TREND_FORECAST: '/analytics/trend-forecast',
      RISK_ALERTS: '/analytics/risk-alerts',
      COST_ANALYSIS: '/analytics/cost-analysis'
    },
    
    // Farmers
    FARMERS: '/farmers',
    FARMER_DETAIL: (id) => `/farmers/${id}`,
    FARMER_ALLOCATE: (id) => `/farmers/${id}/allocate`,
    FARMER_PERFORMANCE: (id) => `/farmers/${id}/performance`,
    FARMERS_TOP: '/farmers/top',
    FARMERS_SEARCH: '/farmers/search',
    FARMERS_EXPORT: '/farmers/export',
    FARMER_CROPS: (id) => `/farmers/${id}/crops`,
    FARMER_HISTORY: (id) => `/farmers/${id}/history`,
    
    // Crops
    CROPS: '/crops',
    CROPS_VARIETIES: '/crops/varieties',
    CROP_DETAIL: (id) => `/crops/${id}`,
    CROP_SEASONAL_TRENDS: (id) => `/crops/${id}/trends`,
    CROP_MARKET_PRICES: '/crops/market-prices',
    
    // Supply Planning - CRITICAL for SupplyPlanning.jsx
    SUPPLY: {
      // Allocations
      ALLOCATIONS: '/supply/allocations',
      ALLOCATIONS_BULK: '/supply/allocations/bulk',
      ALLOCATION_DETAIL: (id) => `/supply/allocations/${id}`,
      
      // Supply Planning
      PLAN: '/supply/plan',
      PLAN_DETAIL: (id) => `/supply/plan/${id}`,
      
      // Delivery Management
      DELIVERY_TIMELINE: '/supply/delivery-timeline',
      UPDATE_STATUS: (id) => `/supply/allocations/${id}/status`,
      
      // Demand Forecast
      DEMAND_FORECAST: '/supply/demand-forecast',
      
      // Analysis
      GAP_ANALYSIS: '/supply/gap-analysis',
      COVERAGE: '/supply/coverage',
      SUPPLY_DEMAND_BALANCE: '/supply/balance',
      
      // Scheduling
      SCHEDULE_ALLOCATION: '/supply/schedule',
      BULK_SCHEDULE: '/supply/bulk-schedule',
      RESCHEDULE: (id) => `/supply/allocations/${id}/reschedule`,
      
      // Reports
      SUPPLY_REPORT: '/supply/report',
      ALLOCATION_SUMMARY: '/supply/allocations/summary'
    },
    
    // Procurement
    PROCUREMENT: {
      // Orders
      ORDERS: '/procurement/orders',
      ORDERS_BULK: '/procurement/orders/bulk',
      ORDER_DETAIL: (id) => `/procurement/orders/${id}`,
      
      // Order Status
      UPDATE_ORDER_STATUS: (id) => `/procurement/orders/${id}/status`,
      RECEIVE_ORDER: (id) => `/procurement/orders/${id}/receive`,
      CANCEL_ORDER: (id) => `/procurement/orders/${id}/cancel`,
      
      // Supplement Requests
      SUPPLEMENT_REQUEST: '/procurement/supplement-request',
      SUPPLEMENT_REQUESTS: '/procurement/supplement-requests',
      SUPPLEMENT_DETAIL: (id) => `/procurement/supplement-requests/${id}`,
      
      // Demand & Forecasting
      DEMAND_FORECAST: '/procurement/demand-forecast',
      SUPPLY_RECONCILIATION: '/procurement/supply-reconciliation',
      HARVEST_READINESS: '/procurement/harvest-readiness',
      
      // Performance Metrics
      METRICS: '/procurement/metrics',
      ACCEPTANCE_RATE: '/procurement/acceptance-rate',
      ON_TIME_DELIVERY: '/procurement/on-time-delivery',
      COST_ANALYSIS: '/procurement/cost-analysis',
      
      // Export/Import
      EXPORT_ORDERS: '/procurement/orders/export',
      IMPORT_ORDERS: '/procurement/orders/import',
      ORDER_TEMPLATE: '/procurement/orders/template',
      
      // Manual Orders
      MANUAL_ORDER: '/procurement/manual-order',
      EXTERNAL_SUPPLIERS: '/procurement/external-suppliers'
    },
    
    // Aggregators
    AGGREGATORS: '/aggregators',
    AGGREGATOR_DETAIL: (id) => `/aggregators/${id}`,
    AGGREGATORS_AVAILABLE_CAPACITY: '/aggregators/available-capacity',
    AGGREGATOR_PERFORMANCE: (id) => `/aggregators/${id}/performance`,
    AGGREGATOR_RELIABILITY: (id) => `/aggregators/${id}/reliability`,
    AGGREGATOR_REQUEST: (id) => `/aggregators/${id}/request`,
    AGGREGATOR_REQUESTS: (id) => `/aggregators/${id}/requests`,
    AGGREGATOR_AVAILABILITY: (id) => `/aggregators/${id}/availability`,
    
    // Financial
    FINANCIAL: {
      PAYMENTS: '/financial/payments',
      PAYMENTS_BULK: '/financial/payments/bulk',
      PAYMENT_DETAIL: (id) => `/financial/payments/${id}`,
      OVERVIEW: '/financial/overview',
      COST_ANALYSIS: '/financial/cost-analysis',
      REVENUE_TRENDS: '/financial/revenue-trends',
      OUTSTANDING_PAYMENTS: '/financial/outstanding-payments',
      GENERATE_REPORT: '/financial/report',
      UPDATE_PAYMENT_STATUS: (id) => `/financial/payments/${id}/status`,
      SETTLE_PAYMENT: (id) => `/financial/payments/${id}/settle`,
      PAYMENT_HISTORY: '/financial/payments/history'
    },
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_DETAIL: (id) => `/notifications/${id}`,
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread/count',
    NOTIFICATIONS_READ_ALL: '/notifications/read-all',
    NOTIFICATIONS_PREFERENCES: '/notifications/preferences',
    NOTIFICATIONS_TYPES: '/notifications/types',
    NOTIFICATIONS_SUBSCRIBE: '/notifications/subscribe',
    
    // Contracts
    CONTRACTS: '/contracts',
    CONTRACT_DETAIL: (id) => `/contracts/${id}`,
    CONTRACTS_UPCOMING_RENEWALS: '/contracts/upcoming-renewals',
    CONTRACT_PERFORMANCE: (id) => `/contracts/${id}/performance`,
    UPDATE_CONTRACT_STATUS: (id) => `/contracts/${id}/status`,
    RENEW_CONTRACT: (id) => `/contracts/${id}/renew`,
    UPDATE_FULFILLMENT: (id) => `/contracts/${id}/fulfillment`,
    
    // Reports
    REPORTS: {
      GENERATE: '/reports/generate',
      TEMPLATES: '/reports/templates',
      HISTORY: '/reports/history',
      REPORT_DETAIL: (id) => `/reports/history/${id}`,
      SUPPLY_CHAIN: '/reports/supply-chain',
      FINANCIAL: '/reports/financial',
      PERFORMANCE: '/reports/performance',
      FARMER: '/reports/farmer',
      PROCUREMENT: '/reports/procurement',
      DOWNLOAD_REPORT: (id) => `/reports/history/${id}/download`,
      DELETE_REPORT: (id) => `/reports/history/${id}`
    },
    
    // Settings
    SETTINGS: '/settings',
    PROFILE: '/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    SYSTEM_SETTINGS: '/settings/system',
    USER_SETTINGS: '/settings/user',
    COMPANY_SETTINGS: '/settings/company',
    
    // Health
    HEALTH: '/health',
    HEALTH_METRICS: '/health/metrics',
    HEALTH_DATABASE: '/health/database',
    HEALTH_STATUS: '/health/status',
    
    // File Upload
    UPLOAD: '/upload',
    UPLOAD_IMAGES: '/upload/images',
    UPLOAD_DOCUMENTS: '/upload/documents',
    UPLOAD_TEMPLATES: '/upload/templates',
    
    // Miscellaneous
    DASHBOARD_STATS: '/dashboard/stats',
    ACTIVITY_LOG: '/activity/log',
    AUDIT_TRAIL: '/audit/trail',
    BACKUP: '/system/backup',
    RESTORE: '/system/restore'
  }
};
