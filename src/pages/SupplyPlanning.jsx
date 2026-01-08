// src/pages/SupplyPlanning.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon, 
  Mail,
  Phone,
  PackageCheck,
  XCircle,
  RefreshCw,
  Send,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Users,
  ShoppingCart,
  DollarSign,
  Info,
  Scale // Changed from lowercase 'scale' to capitalized 'Scale'
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SupplyPlanning() {
  const [allocations, setAllocations] = useState([]);
  const [demandForecast, setDemandForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [orderForm, setOrderForm] = useState({
    orderQuantity: '',
    orderNotes: ''
  });
  const [supplementForm, setSupplementForm] = useState({
    quantity: '',
    urgency: 'medium',
    notes: ''
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [allocationsResponse, demandResponse] = await Promise.all([
        apiService.supply.getAllocations(),
        apiService.procurement.getDemandForecast(30) // 30-day forecast
      ]);
      
      const allocationsArray = Array.isArray(allocationsResponse) ? allocationsResponse : [];
      const demandArray = Array.isArray(demandResponse) ? demandResponse : [];
      
      setAllocations(allocationsArray);
      setDemandForecast(demandArray);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load supply planning data');
      setAllocations([]);
      setDemandForecast([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update the calculateSupplyDemandBalance function
const calculateSupplyDemandBalance = () => {
  const balanceData = [];
  
  // If no demand forecast but we have allocations, show allocations with 0 demand
  if (demandForecast.length === 0 && allocations.length > 0) {
    // Group allocations by date
    const allocationsByDate = {};
    allocations.forEach(allocation => {
      if (!allocation.date) return;
      const dateKey = new Date(allocation.date).toISOString().split('T')[0];
      if (!allocationsByDate[dateKey]) {
        allocationsByDate[dateKey] = [];
      }
      allocationsByDate[dateKey].push(allocation);
    });

    // Show allocations with 0 demand for next 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const dailyAllocations = allocationsByDate[dateKey] || [];
      
      const totalSupply = dailyAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
      const totalDemand = 0; // No demand forecast
      const balance = totalSupply - totalDemand;
      
      balanceData.push({
        date: date.toISOString(),
        dateKey,
        demand: totalDemand,
        supply: totalSupply,
        balance,
        status: balance === 0 ? 'met' : balance < 0 ? 'shortage' : 'oversupply',
        allocations: dailyAllocations,
        color: balance === 0 ? 'green' : balance < 0 ? 'red' : 'blue'
      });
    }
  } else if (demandForecast.length > 0) {
    // Original logic with demand forecast
    const allocationsByDate = {};
    allocations.forEach(allocation => {
      if (!allocation.date) return;
      const dateKey = new Date(allocation.date).toISOString().split('T')[0];
      if (!allocationsByDate[dateKey]) {
        allocationsByDate[dateKey] = [];
      }
      allocationsByDate[dateKey].push(allocation);
    });

    demandForecast.forEach(demand => {
      const dateKey = new Date(demand.date).toISOString().split('T')[0];
      const dailyAllocations = allocationsByDate[dateKey] || [];
      
      const totalSupply = dailyAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
      const totalDemand = demand.quantity || 0;
      const balance = totalSupply - totalDemand;
      
      balanceData.push({
        date: demand.date,
        dateKey,
        demand: totalDemand,
        supply: totalSupply,
        balance,
        status: balance === 0 ? 'met' : balance < 0 ? 'shortage' : 'oversupply',
        allocations: dailyAllocations,
        color: balance === 0 ? 'green' : balance < 0 ? 'red' : 'blue'
      });
    });
  }

  // Sort by date
  return balanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
};
  // Toggle row expansion
  const toggleRowExpansion = (dateKey) => {
    setExpandedRow(expandedRow === dateKey ? null : dateKey);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'met':
        return <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Demand Met
        </Badge>;
      case 'shortage':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Shortage
        </Badge>;
      case 'oversupply':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Info className="h-3 w-3" />
          Oversupply
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get balance display
  const getBalanceDisplay = (balance) => {
    const formatted = balance.toFixed(1);
    if (balance === 0) {
      return <span className="text-green-600 font-medium">0 tons</span>;
    } else if (balance < 0) {
      return <span className="text-red-600 font-medium">{formatted} tons</span>;
    } else {
      return <span className="text-blue-600 font-medium">+{formatted} tons</span>;
    }
  };

  // Handle supplement request
  const handleRequestSupplement = async () => {
    try {
      if (!supplementForm.quantity || parseFloat(supplementForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      console.log('Requesting supplement:', supplementForm);
      
      await apiService.procurement.requestSupplement(supplementForm);
      
      toast.success(`Supplement request for ${supplementForm.quantity} tons sent!`);
      setIsSupplementDialogOpen(false);
      setSupplementForm({
        quantity: '',
        urgency: 'medium',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error requesting supplement:', error);
      toast.error('Failed to send supplement request');
    }
  };

  // Handle send order
  const handleSendOrder = async () => {
    try {
      if (!selectedAllocation) return;
      
      const orderData = {
        farmerId: selectedAllocation.farmerId,
        farmerName: selectedAllocation.farmerName,
        crop: selectedAllocation.farmerCrop,
        quantity: parseFloat(orderForm.orderQuantity),
        notes: orderForm.orderNotes,
        expectedDeliveryDate: selectedAllocation.date
      };
      
      await apiService.procurement.createOrder(orderData);
      
      toast.success(`Order sent to ${selectedAllocation.farmerName}!`);
      setIsOrderDialogOpen(false);
      setOrderForm({ orderQuantity: '', orderNotes: '' });
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error sending order:', error);
      toast.error('Failed to send order');
    }
  };

  // Calculate totals
  const balanceData = calculateSupplyDemandBalance();
  const totalDemand = balanceData.reduce((sum, d) => sum + d.demand, 0);
  const totalSupply = balanceData.reduce((sum, d) => sum + d.supply, 0);
  const totalBalance = totalSupply - totalDemand;
  const shortageDays = balanceData.filter(d => d.status === 'shortage').length;
  const metDays = balanceData.filter(d => d.status === 'met').length;

  if (loading) {
    return (
      <DashboardLayout
        title="Supply Planning"
        description="Plan and manage supply against company demand"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading supply data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Supply Planning"
      description="Plan and manage supply against company demand"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-2xl font-bold">{totalDemand.toFixed(1)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Total Demand (tons)</p>
                <p className="text-xs text-blue-600 mt-1">
                  Next 30 days
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <PackageCheck className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-2xl font-bold">{totalSupply.toFixed(1)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Total Supply (tons)</p>
                <p className="text-xs text-green-600 mt-1">
                  Planned supply
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600 mr-2" />
                  <p className="text-2xl font-bold">{totalBalance.toFixed(1)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Overall Balance</p>
                <p className={`text-xs mt-1 ${totalBalance === 0 ? 'text-green-600' : totalBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {totalBalance === 0 ? 'Balanced' : totalBalance < 0 ? 'Shortage' : 'Oversupply'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <p className="text-2xl font-bold">{shortageDays}</p>
                </div>
                <p className="text-sm text-muted-foreground">Shortage Days</p>
                <p className="text-xs text-purple-600 mt-1">
                  {metDays} days demand met
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supply-Demand Balance Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Supply vs Demand Balance
                </CardTitle>
                <CardDescription>
                  Daily comparison of supply against company demand
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
                  onClick={() => setIsSupplementDialogOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Request Supplement
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
           {balanceData.length === 0 ? (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <CalendarIcon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      No Supply-Demand Data
    </h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      {allocations.length === 0 
        ? 'Add farmer allocations first. Allocate farmers in the Farmers page.' 
        : 'Add demand forecasts to see supply-demand balance.'}
    </p>
    {allocations.length === 0 && (
      <Button onClick={() => window.location.href = '/farmers'}>
        <Users className="h-4 w-4 mr-2" />
        Go to Farmers
      </Button>
    )}
  </div>
      ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Demand (tons)</TableHead>
                      <TableHead>Supply (tons)</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceData.map((item) => (
                      <>
                        <TableRow key={item.dateKey} className="hover:bg-muted/30">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRowExpansion(item.dateKey)}
                              className="h-8 w-8"
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                expandedRow === item.dateKey ? 'rotate-180' : ''
                              }`} />
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{item.demand.toFixed(1)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{item.supply.toFixed(1)}</span>
                          </TableCell>
                          <TableCell>
                            {getBalanceDisplay(item.balance)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {item.status === 'shortage' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSupplementForm(prev => ({
                                      ...prev,
                                      quantity: Math.abs(item.balance).toString()
                                    }));
                                    setIsSupplementDialogOpen(true);
                                  }}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Fill Gap
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row - Farmer Details */}
                        {expandedRow === item.dateKey && (
                          <TableRow className="bg-blue-50">
                            <TableCell colSpan={7}>
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Farmer Contributions for {formatDate(item.date)}
                                </h4>
                                
                                {item.allocations.length === 0 ? (
                                  <p className="text-gray-500 text-sm">No farmers allocated for this date</p>
                                ) : (
                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {item.allocations.map((allocation, index) => (
                                      <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                          <div>
                                            <p className="font-medium text-gray-800">{allocation.farmerName}</p>
                                            <p className="text-sm text-gray-600">{allocation.farmerCounty}</p>
                                          </div>
                                          <Badge variant="outline">
                                            {allocation.quantity.toFixed(1)} tons
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-gray-400" />
                                            <span>{allocation.farmerPhone || 'No phone'}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-gray-400" />
                                            <span>{allocation.farmerEmail || 'No email'}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Crop:</span>
                                            <span className="font-medium">{allocation.farmerCrop}</span>
                                          </div>
                                          
                                          <div className="mt-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() => {
                                                setSelectedAllocation(allocation);
                                                setOrderForm({
                                                  orderQuantity: allocation.quantity.toString(),
                                                  orderNotes: ''
                                                });
                                                setIsOrderDialogOpen(true);
                                              }}
                                            >
                                              <Send className="h-3 w-3 mr-1" />
                                              Send Order
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Gap Analysis Summary
              </CardTitle>
              <CardDescription>Supply-demand gap insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">Total Shortage</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {balanceData.filter(d => d.status === 'shortage')
                        .reduce((sum, d) => sum + Math.abs(d.balance), 0).toFixed(1)} tons
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Total Oversupply</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {balanceData.filter(d => d.status === 'oversupply')
                        .reduce((sum, d) => sum + d.balance, 0).toFixed(1)} tons
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Status Distribution</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-600">Shortage Days</span>
                        <span>{shortageDays} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(shortageDays / balanceData.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Demand Met</span>
                        <span>{metDays} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(metDays / balanceData.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage supply and orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => setIsSupplementDialogOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Request Supplement
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/farmers?action=allocate'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Allocate More Farmers
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={fetchData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How to Read the Balance
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <span className="font-medium">0 tons</span>: Demand fully met</li>
                  <li>• <span className="font-medium">-5 tons</span>: 5 tons shortage</li>
                  <li>• <span className="font-medium">+5 tons</span>: 5 tons oversupply</li>
                  <li>• Click <ChevronDown className="h-3 w-3 inline" /> to see farmer details</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Order Dialog - Made scrollable */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Order to Farmer</DialogTitle>
            <DialogDescription>
              Send procurement order to {selectedAllocation?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedAllocation && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">{selectedAllocation.farmerName}</p>
                  <p className="text-sm text-blue-600">
                    {selectedAllocation.farmerCounty} • {selectedAllocation.farmerCrop}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orderQuantity">Order Quantity (tons) *</Label>
                  <Input
                    id="orderQuantity"
                    name="orderQuantity"
                    type="number"
                    value={orderForm.orderQuantity}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, orderQuantity: e.target.value }))}
                    placeholder="Enter order quantity"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                  <Textarea
                    id="orderNotes"
                    name="orderNotes"
                    value={orderForm.orderNotes}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, orderNotes: e.target.value }))}
                    placeholder="Special instructions for the farmer..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOrder} disabled={!orderForm.orderQuantity}>
              <Send className="h-4 w-4 mr-2" />
              Send Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplement Request Dialog - Made scrollable */}
      <Dialog open={isSupplementDialogOpen} onOpenChange={setIsSupplementDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Supply Supplement</DialogTitle>
            <DialogDescription>
              Fill supply gaps from aggregators or marketplace
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-1">Current Supply Gap</h4>
              <p className="text-sm text-red-600">
                Total shortage: {balanceData.filter(d => d.status === 'shortage')
                  .reduce((sum, d) => sum + Math.abs(d.balance), 0).toFixed(1)} tons
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Required (tons) *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={supplementForm.quantity}
                onChange={(e) => setSupplementForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={supplementForm.urgency}
                onValueChange={(value) => setSupplementForm(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Within 2 weeks</SelectItem>
                  <SelectItem value="medium">Medium - Within 1 week</SelectItem>
                  <SelectItem value="high">High - Within 3 days</SelectItem>
                  <SelectItem value="critical">Critical - Within 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={supplementForm.notes}
                onChange={(e) => setSupplementForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Crop specifications, quality requirements..."
                rows={3}
              />
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Request Options</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Send to connected aggregators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Post to FarmMall marketplace</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Email procurement team</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSupplementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSupplement} disabled={!supplementForm.quantity}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Request Supplement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
