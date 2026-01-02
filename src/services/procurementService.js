import { apiService } from '@/api/services';
import { websocketClient } from '@/api/websocket';
import { WS_EVENTS } from '@/config/api';

class RealProcurementService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Demand-Supply Reconciliation
  async getDemandSupplyReconciliation(forceRefresh = false) {
    const cacheKey = 'demand-supply-reconciliation';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const [demandForecast, supplyReconciliation] = await Promise.all([
        apiService.procurement.getDemandForecast(),
        apiService.procurement.getSupplyReconciliation(),
      ]);

      const reconciliation = demandForecast.map(item => {
        const productReconciliation = supplyReconciliation.find(s => s.product === item.product) || {};
        
        return {
          ...item,
          ...productReconciliation,
          outsourcingNeeded: Math.max(0, item.deficit - (productReconciliation.availableBackup || 0) * 0.5),
          deliveryTimeline: item.deficit > 0 ? '7-14 days' : 'On schedule',
          recommendations: this.generateRecommendations(item, productReconciliation),
        };
      });

      this.setCache(cacheKey, reconciliation);
      return reconciliation;
    } catch (error) {
      console.error('Error fetching demand-supply reconciliation:', error);
      throw error;
    }
  }

  generateRecommendations(demandItem, supplyItem) {
    const recommendations = [];
    
    if (demandItem.deficit > 0) {
      recommendations.push({
        action: 'Increase procurement',
        volume: `${demandItem.deficit} tons`,
        priority: demandItem.deficit > 100 ? 'high' : 'medium',
      });
      
      if (supplyItem.availableBackup > 0) {
        recommendations.push({
          action: 'Contact backup farmers',
          volume: `${Math.min(demandItem.deficit, supplyItem.availableBackup)} tons`,
          priority: 'medium',
        });
      }
    }
    
    if (demandItem.surplus > 0) {
      recommendations.push({
        action: 'Adjust next month procurement',
        volume: `Reduce by ${Math.round(demandItem.surplus * 0.7)} tons`,
        priority: 'low',
      });
    }
    
    return recommendations;
  }

  // Harvest Readiness
  async getHarvestReadiness(days = 7, forceRefresh = false) {
    const cacheKey = `harvest-readiness-${days}`;
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const readiness = await apiService.procurement.getHarvestReadiness(days);
      this.setCache(cacheKey, readiness);
      return readiness;
    } catch (error) {
      console.error('Error fetching harvest readiness:', error);
      throw error;
    }
  }

  // Risk Alerts
  async getRiskAlerts(forceRefresh = false) {
    const cacheKey = 'risk-alerts';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const alerts = await apiService.analytics.getRiskAlerts();
      this.setCache(cacheKey, alerts);
      return alerts;
    } catch (error) {
      console.error('Error fetching risk alerts:', error);
      throw error;
    }
  }

  // Cost Analysis
  async getCostAnalysis(forceRefresh = false) {
    const cacheKey = 'cost-analysis';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const analysis = await apiService.analytics.getCostAnalysis();
      this.setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
      throw error;
    }
  }

  // Create Procurement Order
  async createOrder(orderData) {
    try {
      const order = await apiService.procurement.createOrder(orderData);
      
      // Emit WebSocket event
      websocketClient.send(WS_EVENTS.ORDER_CREATED, order);
      
      // Clear relevant cache
      this.clearCache('demand-supply-reconciliation');
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update Order Status
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const order = await apiService.procurement.updateOrderStatus(orderId, status, notes);
      
      // Emit WebSocket event
      websocketClient.send(WS_EVENTS.ORDER_UPDATED, order);
      
      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get Backup Farmers
  async getBackupFarmers(product, limit = 10) {
    try {
      return await apiService.procurement.getBackupFarmers(product, limit);
    } catch (error) {
      console.error('Error fetching backup farmers:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribe(event, callback) {
    return websocketClient.subscribe(event, callback);
  }

  // Real-time event helpers
  subscribeToOrderUpdates(callback) {
    return this.subscribe(WS_EVENTS.ORDER_UPDATED, callback);
  }

  subscribeToRiskAlerts(callback) {
    return this.subscribe(WS_EVENTS.RISK_ALERT, callback);
  }

  subscribeToHarvestUpdates(callback) {
    return this.subscribe(WS_EVENTS.HARVEST_READY, callback);
  }

  // Invalidate cache on external updates
  onExternalUpdate(event, data) {
    switch (event) {
      case WS_EVENTS.ORDER_CREATED:
      case WS_EVENTS.ORDER_UPDATED:
        this.clearCache('demand-supply-reconciliation');
        break;
      
      case WS_EVENTS.FARMER_UPDATED:
      case WS_EVENTS.CROP_PROGRESS_UPDATED:
        this.clearCache();
        break;
      
      case WS_EVENTS.RISK_ALERT:
        this.clearCache('risk-alerts');
        break;
      
      case WS_EVENTS.WEATHER_UPDATE:
        this.clearCache(['harvest-readiness-7', 'harvest-readiness-14', 'harvest-readiness-30']);
        break;
    }
  }
}

// Create singleton instance
export const realProcurementService = new RealProcurementService();

// Fallback to mock data if backend is not available
export const procurementService = realProcurementService;
