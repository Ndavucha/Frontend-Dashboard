// src/pages/Procurement.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Truck, 
  Download, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  FileText,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Procurement() {
  const [orders, setOrders] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    farmerId: '',
    cropName: '', // Simple text input instead of select
    quantity: '', // Planned quantity
    lpoNumber: '',
    quantityDelivered: '',
    quantityAccepted: '',
    pricePerUnit: '',
    deliveryDate: '',
    paymentStatus: 'pending'
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, farmersData] = await Promise.all([
        apiService.procurement.getOrders(),
        apiService.farmers.getAll()
      ]);
      
      setOrders(ordersData || []);
      setFarmers(farmersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    
    const farmer = farmers.find(f => f.id === order.farmerId);
    
    return (
      farmer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toString().includes(search) ||
      order.lpoNumber?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate summary stats
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayOrders = orders.filter(order => 
      order.deliveryDate?.split('T')[0] === today
    );
    
    const acceptedToday = todayOrders.reduce((sum, order) => sum + (order.quantityAccepted || 0), 0);
    const deliveredToday = todayOrders.reduce((sum, order) => sum + (order.quantityDelivered || 0), 0);
    const acceptanceRate = deliveredToday > 0 ? (acceptedToday / deliveredToday) * 100 : 0;
    const todaysValue = todayOrders.reduce((sum, order) => sum + (order.totalValue || 0), 0);
    const pendingPayments = orders.filter(order => order.paymentStatus === 'pending').length;
    
    return {
      acceptedToday: acceptedToday.toFixed(1),
      deliveredToday: deliveredToday.toFixed(1),
      acceptanceRate: acceptanceRate.toFixed(1),
      todaysValue: todaysValue.toLocaleString(),
      pendingPayments
    };
  };

  const stats = calculateStats();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate quantity accepted if delivered quantity is entered
    if (name === 'quantityDelivered') {
      const delivered = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        quantityAccepted: delivered.toString() // Initially accepted equals delivered
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate rejected quantity
  const calculateRejectedQuantity = (delivered, accepted) => {
    const deliveredNum = parseFloat(delivered) || 0;
    const acceptedNum = parseFloat(accepted) || 0;
    return deliveredNum - acceptedNum;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      farmerId: '',
      cropName: '',
      quantity: '',
      lpoNumber: '',
      quantityDelivered: '',
      quantityAccepted: '',
      pricePerUnit: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending'
    });
    setSelectedOrder(null);
  };

  // Add new order
  const handleAddOrder = async () => {
    try {
      if (!formData.farmerId || !formData.cropName || !formData.quantity) {
        toast.error('Please fill all required fields');
        return;
      }

      const selectedFarmer = farmers.find(f => f.id === parseInt(formData.farmerId));
      
      const quantity = parseFloat(formData.quantity) || 0;
      const quantityDelivered = parseFloat(formData.quantityDelivered) || 0;
      const quantityAccepted = parseFloat(formData.quantityAccepted) || 0;
      const price = parseFloat(formData.pricePerUnit) || 0;
      const totalValue = quantityAccepted * price;
      
      const newOrder = {
        ...formData,
        farmerId: parseInt(formData.farmerId),
        quantity,
        quantityDelivered,
        quantityAccepted,
        rejectedQuantity: calculateRejectedQuantity(quantityDelivered, quantityAccepted),
        pricePerUnit: price,
        totalValue,
        supplierName: selectedFarmer?.name || 'Unknown',
        location: selectedFarmer?.county || 'Unknown',
        sourceType: 'farmer',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await apiService.procurement.createOrder(newOrder);
      toast.success('Order created successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  // Edit order
  const handleEditOrder = async () => {
    try {
      if (!formData.farmerId || !formData.cropName || !formData.quantity) {
        toast.error('Please fill all required fields');
        return;
      }

      const selectedFarmer = farmers.find(f => f.id === parseInt(formData.farmerId));
      
      const quantity = parseFloat(formData.quantity) || 0;
      const quantityDelivered = parseFloat(formData.quantityDelivered) || 0;
      const quantityAccepted = parseFloat(formData.quantityAccepted) || 0;
      const price = parseFloat(formData.pricePerUnit) || 0;
      const totalValue = quantityAccepted * price;
      
      const updatedOrder = {
        ...formData,
        farmerId: parseInt(formData.farmerId),
        quantity,
        quantityDelivered,
        quantityAccepted,
        rejectedQuantity: calculateRejectedQuantity(quantityDelivered, quantityAccepted),
        pricePerUnit: price,
        totalValue,
        supplierName: selectedFarmer?.name || 'Unknown',
        location: selectedFarmer?.county || 'Unknown',
        id: selectedOrder.id
      };

      await apiService.procurement.updateOrder(selectedOrder.id, updatedOrder);
      toast.success('Order updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    try {
      await apiService.procurement.deleteOrder(selectedOrder.id);
      toast.success('Order deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // Open edit dialog
  const openEditDialog = (order) => {
    setSelectedOrder(order);
    setFormData({
      farmerId: order.farmerId?.toString() || '',
      cropName: order.cropName || '',
      quantity: order.quantity?.toString() || '',
      lpoNumber: order.lpoNumber || '',
      quantityDelivered: order.quantityDelivered?.toString() || '',
      quantityAccepted: order.quantityAccepted?.toString() || '',
      pricePerUnit: order.pricePerUnit?.toString() || '',
      deliveryDate: order.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      paymentStatus: order.paymentStatus || 'pending'
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Status badge component
  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  // Delivery status badge
  const getDeliveryStatusBadge = (delivered, accepted) => {
    const deliveredNum = parseFloat(delivered) || 0;
    const acceptedNum = parseFloat(accepted) || 0;
    
    if (deliveredNum === 0) {
      return <Badge variant="outline">Not Delivered</Badge>;
    } else if (acceptedNum === deliveredNum) {
      return (
        <Badge variant="success" className="gap-1">
          <PackageCheck className="h-3 w-3" />
          Fully Accepted
        </Badge>
      );
    } else if (acceptedNum > 0 && acceptedNum < deliveredNum) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partially Accepted
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1">
          <PackageX className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Orders Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Start your procurement process by creating your first order.
        Track deliveries, quantities, and payments all in one place.
      </p>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Order
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Procurement Dashboard"
        description="Record and track all procurement activities"
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
      description="Record and track all procurement activities"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-2xl font-bold">{stats.acceptedToday}</p>
              </div>
              <p className="text-sm text-muted-foreground">Tons Accepted Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-2xl font-bold">{stats.deliveredToday}</p>
              </div>
              <p className="text-sm text-muted-foreground">Tons Delivered Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-2xl font-bold">{stats.acceptanceRate}%</p>
              </div>
              <p className="text-sm text-muted-foreground">Acceptance Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <p className="text-2xl font-bold">KES {stats.todaysValue}</p>
              </div>
              <p className="text-sm text-muted-foreground">Today's Value</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Procurement Orders
              </CardTitle>
              <CardDescription>
                {orders.length === 0 ? 'No orders yet' : `${filteredOrders.length} orders in the system`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {orders.length > 0 && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders or LPO..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-64 pl-9"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Procurement Order</DialogTitle>
                    <DialogDescription>
                      Enter order details below. All fields with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LPO Number (Optional)</label>
                      <Input
                        name="lpoNumber"
                        value={formData.lpoNumber}
                        onChange={handleInputChange}
                        placeholder="LPO-2024-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Farmer *</label>
                      <Select
                        value={formData.farmerId}
                        onValueChange={(value) => handleSelectChange('farmerId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a farmer" />
                        </SelectTrigger>
                        <SelectContent>
                          {farmers.length === 0 ? (
                            <SelectItem value="none" disabled>No farmers available</SelectItem>
                          ) : (
                            farmers.map(farmer => (
                              <SelectItem key={farmer.id} value={farmer.id.toString()}>
                                {farmer.name} - {farmer.county}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {farmers.length === 0 && (
                        <p className="text-xs text-red-500">
                          Add farmers first in the Farmers section
                        </p>
                      )}
                    </div>


                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Planned Qty (tons) *</label>
                        <Input
                          name="quantity"
                          type="number"
                          step="0.1"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivered Qty (tons)</label>
                        <Input
                          name="quantityDelivered"
                          type="number"
                          step="0.1"
                          value={formData.quantityDelivered}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Accepted Qty (tons)</label>
                        <Input
                          name="quantityAccepted"
                          type="number"
                          step="0.1"
                          value={formData.quantityAccepted}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price per kg (KES)</label>
                        <Input
                          name="pricePerUnit"
                          type="number"
                          value={formData.pricePerUnit}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Date</label>
                        <Input
                          name="deliveryDate"
                          type="date"
                          value={formData.deliveryDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Status</label>
                      <Select
                        value={formData.paymentStatus}
                        onValueChange={(value) => handleSelectChange('paymentStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial Payment</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddOrder}
                      disabled={!formData.farmerId || !formData.cropName || !formData.quantity}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Order
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>LPO</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead className="text-center">Planned</TableHead>
                      <TableHead className="text-center">Delivered</TableHead>
                      <TableHead className="text-center">Accepted</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>Price/kg</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const farmer = farmers.find(f => f.id === order.farmerId);
                      const rejectedQuantity = calculateRejectedQuantity(order.quantityDelivered, order.quantityAccepted);
                      
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            {order.deliveryDate ? (
                              new Date(order.deliveryDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.lpoNumber ? (
                              <Badge variant="outline" className="font-mono">
                                {order.lpoNumber}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No LPO</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.supplierName || farmer?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {order.cropName || 'Not specified'}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {order.quantity || 0}t
                          </TableCell>
                          <TableCell className="text-center">
                            {order.quantityDelivered || order.quantityDelivered === 0 ? (
                              <span className="font-medium">{order.quantityDelivered}t</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {order.quantityAccepted || order.quantityAccepted === 0 ? (
                              <div>
                                <span className="font-medium text-green-600">{order.quantityAccepted}t</span>
                                {rejectedQuantity > 0 && (
                                  <div className="text-xs text-red-500">
                                    (-{rejectedQuantity}t)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getDeliveryStatusBadge(order.quantityDelivered, order.quantityAccepted)}
                          </TableCell>
                          <TableCell>
                            KES {order.pricePerUnit?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="font-medium">
                            KES {((order.quantityAccepted || 0) * (order.pricePerUnit || 0)).toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(order)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(order)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {filteredOrders.length === 0 && search && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found matching "{search}"</p>
                  <Button
                    variant="link"
                    onClick={() => setSearch('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Procurement Order</DialogTitle>
            <DialogDescription>
              Update order details below. You can adjust delivery and acceptance quantities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LPO Number (Optional)</label>
              <Input
                name="lpoNumber"
                value={formData.lpoNumber}
                onChange={handleInputChange}
                placeholder="LPO-2024-001"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Farmer *</label>
              <Select
                value={formData.farmerId}
                onValueChange={(value) => handleSelectChange('farmerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map(farmer => (
                    <SelectItem key={farmer.id} value={farmer.id.toString()}>
                      {farmer.name} - {farmer.county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Name *</label>
              <Input
                name="cropName"
                value={formData.cropName}
                onChange={handleInputChange}
                placeholder="e.g., Wheat, Corn, Rice..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Planned Qty (tons) *</label>
                <Input
                  name="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivered Qty (tons)</label>
                <Input
                  name="quantityDelivered"
                  type="number"
                  step="0.1"
                  value={formData.quantityDelivered}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Accepted Qty (tons)</label>
                <Input
                  name="quantityAccepted"
                  type="number"
                  step="0.1"
                  value={formData.quantityAccepted}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            {formData.quantityDelivered && formData.quantityAccepted && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Planned</p>
                    <p className="font-medium">{formData.quantity || 0}t</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="font-medium">{formData.quantityDelivered || 0}t</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="font-medium text-red-600">
                      {calculateRejectedQuantity(formData.quantityDelivered, formData.quantityAccepted)}t
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per kg (KES)</label>
                <Input
                  name="pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Date</label>
                <Input
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => handleSelectChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditOrder}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}