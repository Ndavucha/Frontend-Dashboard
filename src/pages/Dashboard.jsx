import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { SupplyDemandChart } from '@/components/charts/SupplyDemandChart';
import { VarietyDistributionChart } from '@/components/charts/VarietyDistributionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '@/api/services';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const { subscribe, isConnected } = useWebSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewStats, supplyDemand, varietyDistribution] = await Promise.all([
        apiService.analytics.getOverviewStats(),
        apiService.analytics.getSupplyDemandChart(),
        apiService.analytics.getVarietyDistribution(),
      ]);

      setStats({
        overview: overviewStats,
        supplyDemand,
        varietyDistribution,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Subscribe to WebSocket updates
    const unsubscribe = subscribe('dashboard_update', (data) => {
      console.log('Dashboard update received:', data);
      toast.info('Dashboard updated with latest data');
      fetchDashboardData(); // Refresh data
    });
    
    // Check WebSocket connection
    const checkWs = setInterval(() => {
      setWsConnected(isConnected());
    }, 5000);
    
    return () => {
      unsubscribe();
      clearInterval(checkWs);
    };
  }, [subscribe, isConnected]);

  if (loading) {
    return (
      <DashboardLayout 
        title="Supply Chain Overview" 
        description="Monitor your agricultural supply chain at a glance"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title="Supply Chain Overview" 
        description="Monitor your agricultural supply chain at a glance"
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <p className="text-gray-600 mb-4">Check if backend server is running on port 5000</p>
          <Button onClick={fetchDashboardData} className="bg-brand-green hover:bg-green-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Supply Chain Overview" 
      description="Monitor your agricultural supply chain at a glance"
    >
      <div className="space-y-6">
        {/* Connection Status - Moved to top right corner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Optional: You can keep a minimal connection indicator here if needed */}
            {/* <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {wsConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {wsConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
              </span>
            </div> */}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Minimal connection indicator */}
            <div className={`flex items-center gap-2 ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {wsConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <OverviewStats stats={stats?.overview} />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supply vs Demand Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Supply vs Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplyDemandChart data={stats?.supplyDemand} />
            </CardContent>
          </Card>
          
          {/* Variety Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average by Variety</CardTitle>
            </CardHeader>
            <CardContent>
              <VarietyDistributionChart data={stats?.varietyDistribution} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}