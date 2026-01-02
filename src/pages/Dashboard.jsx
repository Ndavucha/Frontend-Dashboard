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
  CheckCircle
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isFreshSystem, setIsFreshSystem] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeCrops: 0,
    pendingOrders: 0,
    revenue: 0,
    profit: 0,
    fulfillmentRate: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const overview = await apiService.analytics.getOverviewStats();
      
      setStats(overview);
      setIsFreshSystem(overview.totalFarmers === 0 && overview.activeCrops === 0);
      
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      toast.error('Unable to load dashboard');
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

          {/* Empty Stats Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Farmers', value: '0', icon: Users, color: 'blue' },
              { title: 'Crops', value: '0', icon: Package, color: 'green' },
              { title: 'Orders', value: '0', icon: FileText, color: 'purple' },
              { title: 'Revenue', value: '$0', icon: TrendingUp, color: 'amber' },
            ].map((stat, index) => (
              <Card key={index} className="opacity-75">
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
                    Add data to see changes here
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
            <p className="text-muted-foreground">Welcome back! Your supply chain is growing.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: 'Farmers', 
              value: stats.totalFarmers, 
              icon: Users,
              change: '+0%',
              trend: 'up',
              color: 'blue'
            },
            { 
              title: 'Active Crops', 
              value: stats.activeCrops, 
              icon: Package,
              change: '+0%',
              trend: 'up',
              color: 'green'
            },
            { 
              title: 'Pending Orders', 
              value: stats.pendingOrders, 
              icon: FileText,
              change: '+0%',
              trend: 'up',
              color: 'purple'
            },
            { 
              title: 'Revenue', 
              value: `$${stats.revenue?.toLocaleString() || '0'}`, 
              icon: TrendingUp,
              change: '+0%',
              trend: 'up',
              color: 'amber'
            },
          ].map((stat, index) => (
            <Card key={index}>
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
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    {stat.change} vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply vs Demand</CardTitle>
              <CardDescription>Chart will appear as you add orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No supply/demand data yet</p>
                <p className="text-sm text-gray-400">Create orders to see trends</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crop Distribution</CardTitle>
              <CardDescription>Chart will appear as you add crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <PieChart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No crop distribution data yet</p>
                <p className="text-sm text-gray-400">Add crops to see variety breakdown</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
