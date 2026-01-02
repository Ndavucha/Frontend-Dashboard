// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  CircleDollarSign, 
  Package,
  Truck,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    supplyDemand: [],
    varietyDistribution: [],
    countyData: [],
    ageData: [],
    genderData: []
  });

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [overview, supplyDemand, varietyDistribution] = await Promise.all([
        apiService.analytics.getOverviewStats(),
        apiService.analytics.getSupplyDemandChart('30days'),
        apiService.analytics.getVarietyDistribution(),
      ]);

      // Transform data for charts
      const supplyDemandData = supplyDemand?.data || [];
      const varietyData = varietyDistribution || [];

      // Generate mock county data if we have farmers
      const countyData = overview.totalFarmers > 0 ? [
        { name: 'Narok', farmers: 0, volume: 0 },
        { name: 'Nakuru', farmers: 0, volume: 0 },
        { name: 'Nyandarua', farmers: 0, volume: 0 },
      ] : [];

      // Age distribution (empty for fresh system)
      const ageData = [
        { name: '18-30', value: 0 },
        { name: '31-45', value: 0 },
        { name: '46-60', value: 0 },
        { name: '60+', value: 0 }
      ];

      // Gender distribution (empty for fresh system)
      const genderData = [
        { name: 'Female', value: 0 },
        { name: 'Male', value: 0 }
      ];

      setAnalyticsData({
        overview,
        supplyDemand: supplyDemandData,
        varietyDistribution: varietyData,
        countyData,
        ageData,
        genderData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Empty state component
  const EmptyAnalyticsState = () => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <BarChart3 className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-3">
        No Analytics Data Yet
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Your analytics dashboard will populate with insights as you add farmers, crops, and orders to the system.
        Start building your supply chain to see real-time analytics.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/farmers">
            <Users className="h-5 w-5 mr-2" />
            Add Farmers
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/onboarding">
            View Setup Guide
          </Link>
        </Button>
      </div>
    </div>
  );

  // Empty chart component
  const EmptyChart = ({ title, description, icon: Icon }) => (
    <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
      <Icon className="h-12 w-12 text-gray-300 mb-4" />
      <h4 className="text-lg font-semibold text-gray-500 mb-2">{title}</h4>
      <p className="text-sm text-gray-400 text-center max-w-xs">{description}</p>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Analytics & Insights"
        description="Deep dive into supply chain performance metrics"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if system has data
  const hasData = analyticsData.overview.totalFarmers > 0 || 
                  analyticsData.overview.activeCrops > 0 || 
                  analyticsData.overview.pendingOrders > 0;

  return (
    <DashboardLayout
      title="Analytics & Insights"
      description="Deep dive into supply chain performance metrics"
    >
      {!hasData ? (
        <Card className="shadow-card">
          <CardContent className="pt-8">
            <EmptyAnalyticsState />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="supply" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="supply">Supply Analytics</TabsTrigger>
              <TabsTrigger value="farmers">Farmer Insights</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
            >
              Refresh Data
            </Button>
          </div>

          {/* Supply Analytics Tab */}
          <TabsContent value="supply" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.activeCrops || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Active Crops</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.pendingOrders || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Aggregator Dep.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Supply vs Demand Chart */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Supply vs Demand Trend</CardTitle>
                  <CardDescription>30-day rolling view</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.supplyDemand.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.supplyDemand}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="supply" 
                            stackId="1"
                            stroke="hsl(var(--chart-1))" 
                            fill="hsl(var(--chart-1))" 
                            fillOpacity={0.6}
                            name="Supply"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="demand" 
                            stackId="1"
                            stroke="hsl(var(--chart-2))" 
                            fill="hsl(var(--chart-2))" 
                            fillOpacity={0.6}
                            name="Demand"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Supply/Demand Data"
                      description="Create procurement orders to see supply vs demand trends"
                      icon={TrendingUp}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Supply by County */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Supply by County</CardTitle>
                  <CardDescription>Regional distribution of supply</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.countyData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.countyData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="volume" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Volume (tons)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Regional Data"
                      description="Add farmers with location data to see regional distribution"
                      icon={MapPin}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Farmer Insights Tab */}
          <TabsContent value="farmers" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.totalFarmers || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Farmers</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Female Farmers</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Acreage</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-2xl font-bold">KES 0</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid to Farmers</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gender Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>Farmer demographic breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.overview.totalFarmers > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.genderData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analyticsData.genderData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Gender Data"
                      description="Add farmers with gender information to see distribution"
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Farmer age group breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.overview.totalFarmers > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.ageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Age Data"
                      description="Add farmers with age information to see distribution"
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">KES 0</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">KES 0</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid Supplies</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-2xl font-bold">KES 0</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">KES 0/kg</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Variety Distribution */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Variety Distribution</CardTitle>
                <CardDescription>Crop variety breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.varietyDistribution.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.varietyDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analyticsData.varietyDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {analyticsData.varietyDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color || COLORS[index] }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-lg font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyChart
                    title="No Crop Variety Data"
                    description="Add crops with variety information to see distribution"
                    icon={Package}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions for Empty System */}
      {!hasData && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Add Farmers</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by registering your contracted farmers
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/farmers">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Add Crops</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Record crop information for each farmer
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/farmers">
                      Add Crops
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Truck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Create Orders</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start procurement and track deliveries
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/procurement">
                      Create Order
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
