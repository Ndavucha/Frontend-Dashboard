// src/pages/Procurement.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package,
  PackageCheck,
  PackageX,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Users,
  Calendar,
  ShoppingCart,
  BarChart3,
  Plus,
  Filter,
  Download,
  Send,
  Mail,
  Phone,
  MapPin,
  Sprout
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [allocations, setAllocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const [isAggregatorDialogOpen, setIsAggregatorDialogOpen] = useState(false);
  const [selectedAggregator, setSelectedAggregator] = useState(null);
  const [supplementForm, setSupplementForm] = useState({
    quantity: '',
    urgency: 'medium',
    notes: ''
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching procurement data...');
      
      const [allocationsResponse, ordersResponse, aggregatorsResponse] = await Promise.all([
        apiService.supply.getAllocations(),
        apiService.procurement.getOrders(),
        apiService.aggregators.getAll()
      ]);
      
      console.log('📊 Data loaded:', {
        allocations: Array.isArray(allocationsResponse) ? allocationsResponse.length : 0,
        orders: Array.isArray(ordersResponse) ? ordersResponse.length : 0,
        aggregators: Array.isArray(aggregatorsResponse) ? aggregatorsResponse.length : 0
      });
      
      // Ensure arrays
      const allocationsArray = Array.isArray(allocationsResponse) ? allocationsResponse : [];
      const ordersArray = Array.isArray(ordersResponse) ? ordersResponse : [];
      const aggregatorsArray = Array.isArray(aggregatorsResponse) ? aggregatorsResponse : [];
      
      setAllocations(allocationsArray);
      setOrders(ordersArray);
      setAggregators(aggregatorsArray);
      
    } catch (error) {
      console.error('❌ Error fetching procurement data:', error);
      toast.error('Failed to load procurement data');
      setAllocations([]);
      setOrders([]);
      setAggregators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate key metrics
  const calculateMetrics = () => {
    // Get active allocations (scheduled or in-progress)
    const activeAllocations = allocations.filter(a => 
      a.status === 'scheduled' || a.status === 'in-progress'
    );
    
    // Get completed allocations
    const completedAllocations = allocations.filter(a => a.status === 'completed');
    
    // Calculate totals
    const totalAllocated = activeAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const totalCompleted = completedAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    
    // Find orders related to allocations
    const ordersWithAllocations = orders.filter(order => {
      return activeAllocations.some(allocation => 
        allocation.farmerId === order.farmerId ||
        allocation.farmerName === order.supplierName
      );
    });
    
    const totalOrdered = ordersWithAllocations.reduce((sum, o) => sum + (o.quantityOrdered || 0), 0);
    const totalReceived = ordersWithAllocations.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);
    
    // Calculate deficit
    const deficit = Math.max(0, totalAllocated - totalReceived);
    const deficitPercentage = totalAllocated > 0 ? (deficit / totalAllocated) * 100 : 0;
    
    // Get upcoming allocations (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingAllocations = activeAllocations.filter(a => {
      if (!a.date) return false;
      const allocationDate = new Date(a.date);
      return allocationDate >= today && allocationDate <= nextWeek;
    });
    
    const totalUpcoming = upcomingAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    
    return {
      totalAllocated: totalAllocated.toFixed(1),
      totalOrdered: totalOrdered.toFixed(1),
      totalReceived: totalReceived.toFixed(1),
      deficit: deficit.toFixed(1),
      deficitPercentage: deficitPercentage.toFixed(1),
      totalUpcoming: totalUpcoming.toFixed(1),
      upcomingCount: upcomingAllocations.length,
      allocationsCount: activeAllocations.length,
      ordersCount: ordersWithAllocations.length,
      completionRate: totalAllocated > 0 ? (totalCompleted / totalAllocated * 100).toFixed(1) : '0.0'
    };
  };

  // Get allocations grouped by date
  const getGroupedAllocations = () => {
    const grouped = {};
    
    allocations.forEach(allocation => {
      if (!allocation.date) return;
      
      const date = new Date(allocation.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(allocation);
    });
    
    // Sort dates chronologically
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .reduce((acc, [date, allocations]) => {
        acc[date] = allocations.sort((a, b) => a.farmerName?.localeCompare(b.farmerName));
        return acc;
      }, {});
  };

  // Find related order for an allocation
  const getRelatedOrder = (allocation) => {
    return orders.find(order => {
      const matchesFarmer = order.farmerId === allocation.farmerId || 
                           order.supplierName === allocation.farmerName;
      const matchesDate = !order.orderDate || 
                         new Date(order.orderDate).toDateString() === new Date(allocation.date).toDateString();
      return matchesFarmer && matchesDate;
    });
  };

  // Get delivery timeline
  const getDeliveryTimeline = () => {
    const timeline = [];
    const today = new Date();
    
    allocations.forEach(allocation => {
      if (!allocation.date) return;
      
      const deliveryDate = new Date(allocation.date);
      const daysDiff = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0) {
        const relatedOrder = getRelatedOrder(allocation);
        
        timeline.push({
          id: allocation.id,
          farmerName: allocation.farmerName,
          crop: allocation.farmerCrop,
          quantity: allocation.quantity,
          deliveryDate: allocation.date,
          daysUntilDelivery: daysDiff,
          status: allocation.status,
          orderStatus: relatedOrder ? (relatedOrder.goodsReceived ? 'received' : 'ordered') : 'not-ordered',
          orderQuantity: relatedOrder?.quantityOrdered,
          receivedQuantity: relatedOrder?.quantityAccepted
        });
      }
    });
    
    // Sort by delivery date
    return timeline.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
          <Clock className="h-3 w-3" />
          Scheduled
        </Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Truck className="h-3 w-3" />
          Order Sent
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <PackageCheck className="h-3 w-3" />
          Delivered
        </Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Get order status badge
  const getOrderStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case 'received':
        return <Badge variant="success" className="gap-1">
          <PackageCheck className="h-3 w-3" />
          Received
        </Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 gap-1">
          <Truck className="h-3 w-3" />
          Ordered
        </Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">
          Not Ordered
        </Badge>;
    }
  };

  // Handle supplement form input
  const handleSupplementInputChange = (e) => {
    const { name, value } = e.target;
    setSupplementForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle request supplement
  const handleRequestSupplement = async () => {
    try {
      if (!supplementForm.quantity || parseFloat(supplementForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      const metrics = calculateMetrics();
      const deficit = parseFloat(metrics.deficit);
      const requestedQuantity = parseFloat(supplementForm.quantity);
      
      if (requestedQuantity > deficit * 2) {
        toast.warning(`Requested quantity (${requestedQuantity}t) is more than double the deficit (${deficit}t)`);
      }

      // Simulate API call
      console.log('📤 Sending supplement request:', {
        ...supplementForm,
        deficit: metrics.deficit
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Supplement request for ${supplementForm.quantity} tons sent!`);
      setIsSupplementDialogOpen(false);
      setSupplementForm({
        quantity: '',
        urgency: 'medium',
        notes: ''
      });
      
    } catch (error) {
      console.error('❌ Error sending supplement request:', error);
      toast.error('Failed to send supplement request');
    }
  };

  // Handle request to aggregator
  const handleAggregatorRequest = async () => {
    try {
      if (!selectedAggregator) {
        toast.error('Please select an aggregator');
        return;
      }

      if (!supplementForm.quantity || parseFloat(supplementForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      console.log('📤 Sending request to aggregator:', {
        aggregator: selectedAggregator.name,
        ...supplementForm
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Request sent to ${selectedAggregator.name}!`);
      setIsAggregatorDialogOpen(false);
      setSelectedAggregator(null);
      setSupplementForm({
        quantity: '',
        urgency: 'medium',
        notes: ''
      });
      
    } catch (error) {
      console.error('❌ Error sending aggregator request:', error);
      toast.error('Failed to send request to aggregator');
    }
  };

  // Export data
  const handleExportData = () => {
    const data = {
      metrics: calculateMetrics(),
      timeline: getDeliveryTimeline(),
      allocations: allocations,
      orders: orders,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `procurement-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const metrics = calculateMetrics();
  const groupedAllocations = getGroupedAllocations();
  const deliveryTimeline = getDeliveryTimeline();

  if (loading) {
    return (
      <DashboardLayout
        title="Procurement Dashboard"
        description="Monitor supply, orders, and manage deficits"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading procurement data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Procurement Dashboard"
      description="Monitor supply allocations, orders sent, and manage deficits"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Delivery Timeline
          </TabsTrigger>
          <TabsTrigger value="supplement" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Supplement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-fade-in space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-2xl font-bold">{metrics.totalAllocated}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Allocated (tons)</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {metrics.allocationsCount} farmers
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <PackageCheck className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-2xl font-bold">{metrics.totalReceived}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Received (tons)</p>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.ordersCount} orders
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-2xl font-bold">{metrics.deficit}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Deficit (tons)</p>
                  <div className="flex items-center justify-center mt-1">
                    <Progress value={parseFloat(metrics.deficitPercentage)} className="w-3/4 h-2" />
                    <span className="text-xs text-red-600 ml-2">{metrics.deficitPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-2xl font-bold">{metrics.upcomingCount}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Upcoming (7 days)</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {metrics.totalUpcoming} tons
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deficit Alert */}
          {parseFloat(metrics.deficit) > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">Supply Deficit Detected</h3>
                      <p className="text-red-600 text-sm">
                        You have a deficit of {metrics.deficit} tons ({metrics.deficitPercentage}% of allocated supply).
                        {metrics.upcomingCount > 0 && ` ${metrics.upcomingCount} deliveries upcoming in 7 days.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsSupplementDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request Supplement
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setActiveTab('supplement')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Options
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Timeline Preview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Deliveries
                  </CardTitle>
                  <CardDescription>
                    Next 7 days: {metrics.upcomingCount} deliveries, {metrics.totalUpcoming} tons
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={fetchData}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setActiveTab('timeline')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {deliveryTimeline.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No upcoming deliveries scheduled</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Farmer</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Order Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryTimeline.slice(0, 5).map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>{item.farmerName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Sprout className="h-3 w-3 text-green-600" />
                              {item.crop || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.quantity ? `${item.quantity.toFixed(1)}t` : '-'}
                            {item.receivedQuantity && (
                              <div className="text-xs text-green-600">
                                ✓ {item.receivedQuantity.toFixed(1)}t received
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(item.deliveryDate)}
                          </TableCell>
                          <TableCell>
                            {item.daysUntilDelivery === 0 ? (
                              <Badge variant="default" className="bg-green-600">Today</Badge>
                            ) : item.daysUntilDelivery === 1 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Tomorrow
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {item.daysUntilDelivery} days
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getOrderStatusBadge(item.orderStatus)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Timeline Tab */}
        <TabsContent value="timeline" className="animate-fade-in space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Delivery Timeline
                  </CardTitle>
                  <CardDescription>
                    All scheduled deliveries and order status
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={fetchData}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {deliveryTimeline.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Deliveries Scheduled
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Schedule deliveries in the Farmers or Supply Planning sections.
                    Once scheduled, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group by week */}
                  {(() => {
                    const groupedByWeek = {};
                    deliveryTimeline.forEach(item => {
                      const deliveryDate = new Date(item.deliveryDate);
                      const weekStart = new Date(deliveryDate);
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
                      const weekKey = weekStart.toDateString();
                      
                      if (!groupedByWeek[weekKey]) {
                        groupedByWeek[weekKey] = [];
                      }
                      groupedByWeek[weekKey].push(item);
                    });
                    
                    return Object.entries(groupedByWeek)
                      .sort(([weekA], [weekB]) => new Date(weekA) - new Date(weekB))
                      .map(([weekStart, weekItems]) => {
                        const weekStartDate = new Date(weekStart);
                        const weekEnd = new Date(weekStartDate);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        
                        const totalWeekTons = weekItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                        const receivedWeekTons = weekItems.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
                        
                        return (
                          <div key={weekStart} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  Week of {weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <Badge variant="secondary">
                                    {weekItems.length} delivery{weekItems.length !== 1 ? 's' : ''}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {totalWeekTons.toFixed(1)} tons total
                                    {receivedWeekTons > 0 && (
                                      <span className="text-green-600 ml-2">
                                        ✓ {receivedWeekTons.toFixed(1)}t received
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Crop</TableHead>
                                    <TableHead>Allocated</TableHead>
                                    <TableHead>Ordered</TableHead>
                                    <TableHead>Received</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {weekItems.map(item => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        {formatDate(item.deliveryDate)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="font-medium">{item.farmerName}</div>
                                      </TableCell>
                                      <TableCell>
                                        {item.crop || '-'}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {item.quantity ? `${item.quantity.toFixed(1)}t` : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {item.orderQuantity ? `${item.orderQuantity.toFixed(1)}t` : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {item.receivedQuantity ? (
                                          <div className="font-medium text-green-600">
                                            {item.receivedQuantity.toFixed(1)}t
                                          </div>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {getOrderStatusBadge(item.orderStatus)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplement Tab */}
        <TabsContent value="supplement" className="animate-fade-in space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Aggregators Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Request from Aggregators
                </CardTitle>
                <CardDescription>
                  Fill deficits from trusted aggregator partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aggregators.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No aggregators in your network</p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/aggregators'}
                      >
                        Manage Aggregators
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Current deficit: <span className="font-bold">{metrics.deficit} tons</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Select an aggregator to request additional supply
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {aggregators.map(aggregator => (
                          <div key={aggregator.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div>
                              <p className="font-medium">{aggregator.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {aggregator.county} • {aggregator.type}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {aggregator.historical_volume || 0} tons capacity
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {aggregator.reliability_score || 0}% reliable
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAggregator(aggregator);
                                setIsAggregatorDialogOpen(true);
                              }}
                            >
                              Request
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full"
                        onClick={() => setIsAggregatorDialogOpen(true)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Request to Aggregator
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* FarmMall Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  FarmMall Marketplace
                </CardTitle>
                <CardDescription>
                  External marketplace for spot purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">About FarmMall</h4>
                    <p className="text-sm text-green-700">
                      Access a wide network of verified suppliers for immediate spot purchases.
                    </p>
                    <ul className="text-sm text-green-600 mt-3 space-y-1">
                      <li>• Verified suppliers with quality ratings</li>
                      <li>• Competitive spot market prices</li>
                      <li>• Quick delivery (24-72 hours)</li>
                      <li>• Multiple payment options</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">24h</p>
                        <p className="text-xs text-muted-foreground">Avg. Response</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">95%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        // Open FarmMall in new tab
                        window.open('https://farmmall.example.com', '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit FarmMall Website
                    </Button>
                    
                    <Button
                      className="w-full"
                      onClick={() => setIsSupplementDialogOpen(true)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Request Supplement via FarmMall
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deficit Analysis */}
          {parseFloat(metrics.deficit) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Deficit Analysis & Recommendations
                </CardTitle>
                <CardDescription>
                  Analysis of current supply gap and suggested actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Deficit</p>
                      <p className="text-3xl font-bold text-red-600">{metrics.deficit} tons</p>
                      <p className="text-sm text-muted-foreground">
                        {metrics.deficitPercentage}% of allocated supply
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Coverage Rate</p>
                      <p className="text-3xl font-bold">
                        {((parseFloat(metrics.totalReceived) / parseFloat(metrics.totalAllocated) * 100) || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {metrics.totalReceived} / {metrics.totalAllocated} tons
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Supply Coverage</span>
                      <span>{metrics.totalReceived} / {metrics.totalAllocated} tons</span>
                    </div>
                    <Progress 
                      value={(parseFloat(metrics.totalReceived) / parseFloat(metrics.totalAllocated) * 100) || 0} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Recommended Actions</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">1.</div>
                        <div>
                          <span className="font-medium">Request {metrics.deficit} tons from aggregators</span>
                          <p className="text-blue-600">For reliability and established relationships</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">2.</div>
                        <div>
                          <span className="font-medium">Check FarmMall for competitive prices</span>
                          <p className="text-blue-600">For quick spot purchases and price comparison</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">3.</div>
                        <div>
                          <span className="font-medium">Review upcoming deliveries</span>
                          <p className="text-blue-600">Consider accelerating {metrics.upcomingCount} upcoming deliveries</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Supplement Request Dialog */}
      <Dialog open={isSupplementDialogOpen} onOpenChange={setIsSupplementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Additional Supply</DialogTitle>
            <DialogDescription>
              Send supplement request via FarmMall or broadcast to all aggregators
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Current deficit: <span className="font-bold">{metrics.deficit} tons</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Required (tons) *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={supplementForm.quantity}
                onChange={handleSupplementInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Based on current deficit of {metrics.deficit} tons
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <select
                id="urgency"
                name="urgency"
                value={supplementForm.urgency}
                onChange={handleSupplementInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="low">Low - Within 2 weeks</option>
                <option value="medium">Medium - Within 1 week</option>
                <option value="high">High - Within 3 days</option>
                <option value="critical">Critical - Within 24 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={supplementForm.notes}
                onChange={handleSupplementInputChange}
                placeholder="Crop specifications, quality requirements, delivery instructions..."
              />
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-700 mb-1">Request will be sent to:</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• FarmMall marketplace (external)</li>
                <li>• Email notifications to procurement team</li>
                <li>• Available aggregators in network</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupplementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSupplement} disabled={!supplementForm.quantity}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Send Supplement Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aggregator Request Dialog */}
      <Dialog open={isAggregatorDialogOpen} onOpenChange={setIsAggregatorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAggregator ? `Request from ${selectedAggregator.name}` : 'Select Aggregator'}
            </DialogTitle>
            <DialogDescription>
              Send supply request to specific aggregator
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedAggregator ? (
              <div className="space-y-2">
                <Label>Select Aggregator *</Label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                  onChange={(e) => {
                    const aggregator = aggregators.find(a => a.id.toString() === e.target.value);
                    setSelectedAggregator(aggregator);
                  }}
                >
                  <option value="">Choose an aggregator</option>
                  {aggregators.map(agg => (
                    <option key={agg.id} value={agg.id}>
                      {agg.name} - {agg.county} ({agg.type})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">{selectedAggregator.name}</p>
                <p className="text-sm text-blue-600">
                  {selectedAggregator.county} • {selectedAggregator.type} • {selectedAggregator.reliability_score || 0}% reliable
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Historical volume: {selectedAggregator.historical_volume || 0} tons
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="agg-quantity">Quantity Required (tons) *</Label>
              <Input
                id="agg-quantity"
                name="quantity"
                type="number"
                value={supplementForm.quantity}
                onChange={handleSupplementInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agg-urgency">Urgency Level</Label>
              <select
                id="agg-urgency"
                name="urgency"
                value={supplementForm.urgency}
                onChange={handleSupplementInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="low">Low - Within 2 weeks</option>
                <option value="medium">Medium - Within 1 week</option>
                <option value="high">High - Within 3 days</option>
                <option value="critical">Critical - Within 24 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agg-notes">Additional Notes</Label>
              <Input
                id="agg-notes"
                name="notes"
                value={supplementForm.notes}
                onChange={handleSupplementInputChange}
                placeholder="Special requirements, delivery instructions..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAggregatorDialogOpen(false);
              setSelectedAggregator(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAggregatorRequest} 
              disabled={!selectedAggregator || !supplementForm.quantity}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
