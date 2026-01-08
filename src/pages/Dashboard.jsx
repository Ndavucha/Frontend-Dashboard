// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  Package, 
  TrendingUp,
  PlusCircle,
  FileText,
  BarChart3,
  PieChart,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Percent,
  Calendar,
  Truck,
  Target,
  CheckSquare
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isFreshSystem, setIsFreshSystem] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeCrops: 0,
    pendingOrders: 0,
    revenue: 0,
    profit: 0,
    fulfillmentRate: 0,
    totalAllocations: 0,
    totalAllocatedQty: 0,
    completionRate: 0,
    acceptanceRate: 0,
    aggregatorDependency: 0,
    paidToFarmers: 0,
    totalAcreage: 0,
    completedOrders: 0,
    totalVolume: 0
  });
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');
      
      const overview = await apiService.analytics.getOverview();
      console.log('📊 Dashboard data received:', overview);
      
      setStats({
        totalFarmers: overview.totalFarmers || 0,
        activeCrops: overview.activeCrops || 0,
        pendingOrders: overview.pendingOrders || 0,
        revenue: overview.revenue || 0,
        profit: overview.profit || 0,
        fulfillmentRate: overview.fulfillmentRate || 0,
        totalAllocations: overview.totalAllocations || 0,
        totalAllocatedQty: overview.totalAllocatedQty || 0,
        completionRate: overview.completionRate || 0,
        acceptanceRate: overview.acceptanceRate || 0,
        aggregatorDependency: overview.aggregatorDependency || 0,
        paidToFarmers: overview.paidToFarmers || 0,
        totalAcreage: overview.totalAcreage || 0,
        completedOrders: overview.completedOrders || 0,
        totalVolume: overview.totalVolume || 0
      });
      
      setIsFreshSystem(overview.isFreshSystem || (overview.totalFarmers === 0 && overview.activeCrops === 0));
      
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      toast.error('Unable to load dashboard data');
      setIsFreshSystem(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout 
        title="Welcome" 
        description="Setting up your supply chain dashboard"
      >
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state for fresh system
  if (isFreshSystem) {
    return (
      <DashboardLayout 
        title="Welcome to Your Supply Chain" 
        description="Let's set up your agricultural supply chain management"
      >
        <div className="max-w-4xl mx-auto">
          {/* Welcome Hero */}
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Your Supply Chain Awaits
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Get started by adding your first farmers, crops, and orders. 
                  Your dashboard will populate with insights as you build your supply chain.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                    <Link to="/farmers">
                      <Users className="h-5 w-5 mr-2" />
                      Add First Farmer
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/onboarding">
                      <FileText className="h-5 w-5 mr-2" />
                      View Setup Guide
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Add Farmers</CardTitle>
                <CardDescription>Register your farming partners</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Track farmer details
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Monitor contracts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Record locations
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link to="/farmers">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Add Crops</CardTitle>
                <CardDescription>Record crop information</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Track varieties
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Monitor harvest dates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Record quantities
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link to="/farmers">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Create Orders</CardTitle>
                <CardDescription>Manage procurement</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Track orders
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Monitor fulfillment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Generate reports
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link to="/procurement">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { 
                title: 'Farmers', 
                value: '0', 
                icon: Users, 
                color: 'blue',
                description: 'Add farmers to track'
              },
              { 
                title: 'Crops', 
                value: '0', 
                icon: Package, 
                color: 'green',
                description: 'Record crop varieties'
              },
              { 
                title: 'Orders', 
                value: '0', 
                icon: FileText, 
                color: 'purple',
                description: 'Create procurement orders'
              },
              { 
                title: 'Allocations', 
                value: '0', 
                icon: Calendar, 
                color: 'amber',
                description: 'Plan supply allocations'
              },
            ].map((stat, index) => (
              <Card key={index} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Normal dashboard when there's data
  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Overview of your supply chain operations"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {stats.totalFarmers > 0 
                ? `Managing ${stats.totalFarmers} farmers and ${stats.activeCrops} crops` 
                : 'Welcome to your supply chain dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/farmers')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Data
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: 'Farmers', 
              value: stats.totalFarmers, 
              icon: Users,
              description: 'Total registered farmers',
              color: 'blue'
            },
            { 
              title: 'Active Crops', 
              value: stats.activeCrops, 
              icon: Package,
              description: 'Crop varieties',
              color: 'green'
            },
            { 
              title: 'Pending Orders', 
              value: stats.pendingOrders, 
              icon: FileText,
              description: 'Awaiting fulfillment',
              color: 'purple'
            },
            { 
              title: 'Allocations', 
              value: stats.totalAllocations || 0, 
              icon: Calendar,
              description: 'Supply scheduled',
              color: 'amber'
            },
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              title: 'Acceptance Rate', 
              value: `${stats.acceptanceRate || 0}%`, 
              icon: Percent,
              description: 'Order quality compliance',
              color: 'emerald'
            },
            { 
              title: 'Paid to Farmers', 
              value: `KES ${stats.paidToFarmers?.toLocaleString() || '0'}`, 
              icon: DollarSign,
              description: 'Total payments made',
              color: 'green'
            },
            { 
              title: 'Total Volume', 
              value: `${stats.totalVolume || 0} tons`, 
              icon: Truck,
              description: 'Total procured quantity',
              color: 'blue'
            },
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              title: 'Completed Orders', 
              value: stats.completedOrders || 0, 
              icon: CheckSquare,
              description: 'Orders fulfilled',
              color: 'green'
            },
            { 
              title: 'Total Acreage', 
              value: `${stats.totalAcreage || 0} acres`, 
              icon: MapPin,
              description: 'Total farm land',
              color: 'amber'
            },
            { 
              title: 'Allocated Quantity', 
              value: `${stats.totalAllocatedQty || 0} tons`, 
              icon: Target,
              description: 'Total supply planned',
              color: 'blue'
            },
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your supply chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => navigate('/procurement')}
              >
                <FileText className="h-8 w-8 mb-2 text-blue-600" />
                <span className="font-medium">Create Order</span>
                <span className="text-xs text-muted-foreground mt-1">Start procurement process</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => navigate('/farmers')}
              >
                <Users className="h-8 w-8 mb-2 text-green-600" />
                <span className="font-medium">Add Farmer</span>
                <span className="text-xs text-muted-foreground mt-1">Register new farmer</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => navigate('/supply-planning')}
              >
                <Calendar className="h-8 w-8 mb-2 text-amber-600" />
                <span className="font-medium">Plan Supply</span>
                <span className="text-xs text-muted-foreground mt-1">Schedule allocations</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supply vs Demand</CardTitle>
                  <CardDescription>
                    {stats.totalAllocations > 0 
                      ? 'Recent supply-demand trends' 
                      : 'Chart will appear as you add allocations'}
                  </CardDescription>
                </div>
                {stats.totalAllocations > 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
                    View Details
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {stats.totalAllocations > 0 ? (
                <div className="h-80 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="font-medium text-blue-600">Supply-Demand Data Available</p>
                    <p className="text-sm text-blue-500 mt-2">
                      {stats.totalAllocations} allocations tracked
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No supply/demand data yet</p>
                  <p className="text-sm text-gray-400">Create allocations to see trends</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/supply-planning')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Planning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Crop Distribution</CardTitle>
                  <CardDescription>
                    {stats.activeCrops > 0 
                      ? 'Variety breakdown across farmers' 
                      : 'Chart will appear as you add crops'}
                  </CardDescription>
                </div>
                {stats.activeCrops > 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
                    View Details
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {stats.activeCrops > 0 ? (
                <div className="h-80 flex items-center justify-center bg-gradient-to-b from-green-50 to-white rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="font-medium text-green-600">Crop Distribution Available</p>
                    <p className="text-sm text-green-500 mt-2">
                      {stats.activeCrops} crop varieties
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <PieChart className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No crop distribution data yet</p>
                  <p className="text-sm text-gray-400">Add crops to see variety breakdown</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/farmers')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Add Crops
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
