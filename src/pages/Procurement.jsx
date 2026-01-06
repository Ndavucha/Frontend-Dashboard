// src/pages/Procurement.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
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
  Download
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [allocations, setAllocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const [isSendRequestDialogOpen, setIsSendRequestDialogOpen] = useState(false);
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
        apiService.procurement.getOrders ? apiService.procurement.getOrders() : Promise.resolve([]),
        apiService.aggregators.getAll()
      ]);
      
      console.log('📊 Allocations:', allocationsResponse?.length || 0);
      console.log('📊 Orders:', ordersResponse?.length || 0);
      console.log('📊 Aggregators:', aggregatorsResponse?.length || 0);
      
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
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // Filter allocations
    const activeAllocations = allocations.filter(a => 
      a.status === 'scheduled' || a.status === 'in-progress'
    );

    const upcomingAllocations = allocations.filter(a => 
      a.date >= today && a.date <= nextWeekStr
    );

    const pastAllocations = allocations.filter(a => 
      a.date < today
    );

    // Calculate totals
    const totalAllocated = activeAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const totalUpcoming = upcomingAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const totalPast = pastAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);

    // Find orders related to allocations
    const ordersWithAllocations = orders.filter(order => 
      activeAllocations.some(allocation => 
        allocation.farmerId === order.farmerId ||
        allocation.farmerName === order.supplierName
      )
    );

    const totalOrdered = ordersWithAllocations.reduce((sum, o) => sum + (o.quantityOrdered || 0), 0);
    const totalReceived = ordersWithAllocations.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);

    // Calculate deficit
    const deficit = Math.max(0, totalAllocated - totalReceived);

    return {
      totalAllocated: totalAllocated.toFixed(1),
      totalOrdered: totalOrdered.toFixed(1),
      totalReceived: totalReceived.toFixed(1),
      deficit: deficit.toFixed(1),
      deficitPercentage: totalAllocated > 0 ? ((deficit / totalAllocated) * 100).toFixed(1) : '0.0',
      upcomingCount: upcomingAllocations.length,
      upcomingTons: totalUpcoming.toFixed(1),
      pastCount: pastAllocations.length,
      pastTons: totalPast.toFixed(1),
      activeAllocationCount: activeAllocations.length,
      orderCount: ordersWithAllocations.length
    };
  };

  // Get allocations grouped by date
  const getGroupedAllocations = () => {
    const grouped = {};
    
    allocations.forEach(allocation => {
      if (selectedDateFilter === 'past' && allocation.date >= new Date().toISOString().split('T')[0]) {
        return;
      }
      if (selectedDateFilter === 'upcoming' && allocation.date < new Date().toISOString().split('T')[0]) {
        return;
      }
      
      const date = new Date(allocation.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(allocation);
    });
    
    // Sort dates chronologically
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        if (selectedDateFilter === 'past') {
          return new Date(dateB) - new Date(dateA); // Reverse for past
        }
        return new Date(dateA) - new Date(dateB);
      })
      .reduce((acc, [date, allocations]) => {
        acc[date] = allocations.sort((a, b) => a.farmerName?.localeCompare(b.farmerName));
        return acc;
      }, {});
  };

  // Find related order for an allocation
  const getRelatedOrder = (allocation) => {
    return orders.find(order => 
      order.farmerId === allocation.farmerId && 
      new Date(order.orderDate).toDateString() === new Date(allocation.date).toDateString()
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date for table
  const formatTableDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <PackageX className="h-3 w-3" />
          Cancelled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get order status badge
  const getOrderStatusBadge = (order) => {
    if (!order.goodsReceived) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Ordered
      </Badge>;
    }
    
    if (order.quantityAccepted === 0) {
      return <Badge variant="destructive" className="gap-1">
        <PackageX className="h-3 w-3" />
        Rejected
      </Badge>;
    } else if (order.quantityAccepted < order.quantityDelivered) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Partial
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
        <CheckCircle className="h-3 w-3" />
        Received
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

      // In a real app, this would send a request to aggregators/FarmMall
      console.log('📤 Sending supplement request:', supplementForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Supplement request for ${supplementForm.quantity} tons sent successfully!`);
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

  // Handle send request to aggregator
  const handleSendAggregatorRequest = async () => {
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Request sent to ${selectedAggregator.name} successfully!`);
      setIsSendRequestDialogOpen(false);
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
      allocations: allocations,
      orders: orders,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `procurement-overview-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const metrics = calculateMetrics();
  const groupedAllocations = getGroupedAllocations();

  if (loading) {
    return (
      <DashboardLayout
        title="Procurement Overview"
        description="Monitor supply allocations, orders, and manage deficits"
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
      title="Procurement Overview"
      description="Monitor supply allocations, orders, and manage deficits"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="allocations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Allocations
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
                    {metrics.activeAllocationCount} farmers
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
                    {metrics.orderCount} orders
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
                  <p className="text-sm text-muted-foreground">Upcoming Deliveries</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {metrics.upcomingTons} tons
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deficit Alert Card */}
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
                        Consider supplementing from aggregators or FarmMall.
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

          {/* Upcoming Deliveries Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Deliveries (Next 7 Days)
                  </CardTitle>
                  <CardDescription>
                    {metrics.upcomingCount} deliveries scheduled, totaling {metrics.upcomingTons} tons
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
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {allocations.filter(a => 
                a.date >= new Date().toISOString().split('T')[0] && 
                a.date <= new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
              ).length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No upcoming deliveries in the next 7 days</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Allocated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations
                        .filter(a => 
                          a.date >= new Date().toISOString().split('T')[0] && 
                          a.date <= new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
                        )
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(allocation => {
                          const relatedOrder = getRelatedOrder(allocation);
                          
                          return (
                            <TableRow key={allocation.id}>
                              <TableCell className="font-medium">
                                {formatTableDate(allocation.date)}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{allocation.farmerName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {allocation.farmerCounty}
                                </div>
                              </TableCell>
                              <TableCell>
                                {allocation.farmerCrop || '-'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {allocation.quantity?.toFixed(1) || '0'} tons
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(allocation.status)}
                              </TableCell>
                              <TableCell>
                                {relatedOrder ? (
                                  getOrderStatusBadge(relatedOrder)
                                ) : (
                                  <Badge variant="outline" className="text-gray-600">
                                    No Order
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations" className="animate-fade-in space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    All Allocations Timeline
                  </CardTitle>
                  <CardDescription>
                    View all allocated farmers and their order status
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      className="text-sm border rounded-md px-3 py-1 bg-background"
                    >
                      <option value="all">All Dates</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
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
              {Object.keys(groupedAllocations).length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Allocations Found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {selectedDateFilter === 'all' 
                      ? 'No allocations have been created yet. Allocate farmers in the Farmers page first.'
                      : selectedDateFilter === 'upcoming'
                      ? 'No upcoming allocations found.'
                      : 'No past allocations found.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAllocations).map(([date, dateAllocations]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {formatDate(date)}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary">
                              {dateAllocations.length} farmer{dateAllocations.length !== 1 ? 's' : ''}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {dateAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0).toFixed(1)} tons
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(date) < new Date() ? 'Past' : 'Upcoming'}
                        </div>
                      </div>
                      
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Farmer</TableHead>
                              <TableHead>Crop</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Allocated</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Order Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateAllocations.map((allocation) => {
                              const relatedOrder = getRelatedOrder(allocation);
                              
                              return (
                                <TableRow key={allocation.id}>
                                  <TableCell className="font-medium">
                                    <div>
                                      <p>{allocation.farmerName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {allocation.farmerPhone || 'No phone'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {allocation.farmerCrop || '-'}
                                  </TableCell>
                                  <TableCell>
                                    {allocation.farmerCounty || '-'}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {allocation.quantity?.toFixed(1) || '0'} tons
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(allocation.status)}
                                  </TableCell>
                                  <TableCell>
                                    {relatedOrder ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                          {getOrderStatusBadge(relatedOrder)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Ordered: {relatedOrder.quantityOrdered?.toFixed(1) || '0'}t
                                          {relatedOrder.quantityAccepted && (
                                            <span className="text-green-600 ml-2">
                                              ✓ {relatedOrder.quantityAccepted.toFixed(1)}t accepted
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-600">
                                        No Order
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
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
                  Aggregator Network
                </CardTitle>
                <CardDescription>
                  Request additional supply from trusted aggregators
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
                      <Button variant="outline" onClick={() => {
                        // Navigate to aggregators page
                        window.location.href = '/aggregators';
                      }}>
                        Manage Aggregators
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {aggregators.slice(0, 3).map(aggregator => (
                          <div key={aggregator.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div>
                              <p className="font-medium">{aggregator.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {aggregator.county} • {aggregator.type}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {aggregator.historical_volume || 0} tons
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {aggregator.reliability_score || 0}% reliable
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAggregator(aggregator);
                                setIsSendRequestDialogOpen(true);
                              }}
                            >
                              Request
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {aggregators.length > 3 && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            +{aggregators.length - 3} more aggregators
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              window.location.href = '/aggregators';
                            }}
                          >
                            View all aggregators
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsSendRequestDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Request from Aggregator
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
                  FarmMall (External)
                </CardTitle>
                <CardDescription>
                  Access external marketplace for additional supply
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">About FarmMall</h4>
                    <p className="text-sm text-blue-700">
                      FarmMall is an external agricultural marketplace connecting buyers with verified suppliers across the region.
                    </p>
                    <ul className="text-sm text-blue-600 mt-3 space-y-1">
                      <li>• Verified suppliers with quality ratings</li>
                      <li>• Competitive market prices</li>
                      <li>• Multiple crop varieties available</li>
                      <li>• Escrow payment protection</li>
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
                      onClick={() => {
                        setIsSupplementDialogOpen(true);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Request Supplement
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
                  Deficit Analysis
                </CardTitle>
                <CardDescription>
                  Breakdown of current supply deficit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Total Deficit</p>
                      <p className="text-3xl font-bold text-red-600">{metrics.deficit} tons</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="text-2xl font-bold">
                        {((parseFloat(metrics.totalReceived) / parseFloat(metrics.totalAllocated) * 100) || 0).toFixed(1)}%
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
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Recommendation</h4>
                    <p className="text-sm text-amber-700">
                      Based on your deficit of {metrics.deficit} tons, we recommend:
                    </p>
                    <ul className="text-sm text-amber-600 mt-2 space-y-1">
                      <li>• Request {metrics.deficit} tons from aggregators for reliability</li>
                      <li>• Check FarmMall for competitive spot prices</li>
                      <li>• Review upcoming allocations for potential acceleration</li>
                    </ul>
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
              Send supplement request to aggregators or FarmMall
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Current deficit: <span className="font-bold">{metrics.deficit} tons</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity Required (tons) *</label>
              <input
                type="number"
                name="quantity"
                value={supplementForm.quantity}
                onChange={handleSupplementInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Based on your deficit of {metrics.deficit} tons
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency Level</label>
              <select
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
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                name="notes"
                value={supplementForm.notes}
                onChange={handleSupplementInputChange}
                placeholder="Special requirements, crop specifications, delivery instructions..."
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700 mb-1">Request will be sent to:</p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• All active aggregators in your network</li>
                <li>• FarmMall marketplace (external)</li>
                <li>• Email notifications to procurement team</li>
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

      {/* Send to Aggregator Dialog */}
      <Dialog open={isSendRequestDialogOpen} onOpenChange={setIsSendRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAggregator ? `Request from ${selectedAggregator.name}` : 'Request from Aggregator'}
            </DialogTitle>
            <DialogDescription>
              Send supply request to selected aggregator
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedAggregator ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Aggregator *</label>
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
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity Required (tons) *</label>
              <input
                type="number"
                name="quantity"
                value={supplementForm.quantity}
                onChange={handleSupplementInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency Level</label>
              <select
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
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                name="notes"
                value={supplementForm.notes}
                onChange={handleSupplementInputChange}
                placeholder="Special requirements, crop specifications, delivery instructions..."
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSendRequestDialogOpen(false);
              setSelectedAggregator(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendAggregatorRequest} 
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
