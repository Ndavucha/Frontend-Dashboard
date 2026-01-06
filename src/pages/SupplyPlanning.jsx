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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Mail,
  Phone,
  PackageCheck,
  XCircle,
  RefreshCw,
  Send,
  Truck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function SupplyPlanning() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [orderForm, setOrderForm] = useState({
    orderQuantity: '',
    orderNotes: ''
  });

  // Fetch allocations from backend
  const fetchAllocations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching allocations...');
      
      const allocationsResponse = await apiService.supply.getAllocations();
      console.log('📊 Allocations response:', allocationsResponse);
      
      // Ensure we have an array
      const allocationsArray = Array.isArray(allocationsResponse) ? allocationsResponse : [];
      
      // Filter to only show scheduled allocations (not completed or cancelled)
      const activeAllocations = allocationsArray.filter(
        allocation => allocation.status === 'scheduled' || allocation.status === 'in-progress'
      );
      
      setAllocations(activeAllocations);
      
      console.log('✅ Allocations loaded:', activeAllocations.length);
      
    } catch (error) {
      console.error('❌ Error fetching allocations:', error);
      toast.error('Failed to load supply allocations');
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // Handle order form input changes
  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open order dialog
  const openOrderDialog = (allocation) => {
    setSelectedAllocation(allocation);
    setOrderForm({
      orderQuantity: allocation.quantity.toString(),
      orderNotes: ''
    });
    setIsOrderDialogOpen(true);
  };

  // Send order to farmer
  const handleSendOrder = async () => {
    try {
      if (!selectedAllocation) {
        toast.error('No allocation selected');
        return;
      }

      if (!orderForm.orderQuantity || parseFloat(orderForm.orderQuantity) <= 0) {
        toast.error('Please enter a valid order quantity');
        return;
      }

      const orderQuantity = parseFloat(orderForm.orderQuantity);
      
      // Check if order quantity exceeds allocated quantity
      if (orderQuantity > selectedAllocation.quantity) {
        toast.error(`Order quantity (${orderQuantity}) cannot exceed allocated quantity (${selectedAllocation.quantity})`);
        return;
      }

      // Prepare order data
      const orderData = {
        allocationId: selectedAllocation.id,
        farmerId: selectedAllocation.farmerId,
        farmerName: selectedAllocation.farmerName,
        farmerEmail: selectedAllocation.farmerEmail,
        farmerPhone: selectedAllocation.farmerPhone,
        farmerCounty: selectedAllocation.farmerCounty,
        farmerCrop: selectedAllocation.farmerCrop,
        allocatedQuantity: selectedAllocation.quantity,
        orderQuantity: orderQuantity,
        orderNotes: orderForm.orderNotes,
        orderDate: new Date().toISOString(),
        status: 'order-sent',
        expectedDeliveryDate: selectedAllocation.date
      };

      console.log('📤 Sending order:', orderData);

      // In a real app, this would send email/SMS to farmer
      // For now, we'll update the allocation status and show success message
      
      // Update allocation status to in-progress if it's scheduled
      if (selectedAllocation.status === 'scheduled') {
        const updatedAllocation = {
          ...selectedAllocation,
          status: 'in-progress',
          orderQuantity: orderQuantity,
          orderNotes: orderForm.orderNotes,
          orderSentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await apiService.supply.updateAllocation(selectedAllocation.id, updatedAllocation);
        
        // Update local state
        setAllocations(prev => 
          prev.map(a => 
            a.id === selectedAllocation.id 
              ? updatedAllocation
              : a
          )
        );
      }

      // Simulate sending email/SMS
      await simulateSendNotification(orderData);
      
      toast.success(`Order sent to ${selectedAllocation.farmerName}!`);
      
      // Close dialog and reset form
      setIsOrderDialogOpen(false);
      setOrderForm({
        orderQuantity: '',
        orderNotes: ''
      });
      
      // Refresh data
      await fetchAllocations();
      
    } catch (error) {
      console.error('❌ Error sending order:', error);
      toast.error('Failed to send order');
    }
  };

  // Simulate sending notification to farmer
  const simulateSendNotification = async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📧 Email sent to:', orderData.farmerEmail);
        console.log('📱 SMS sent to:', orderData.farmerPhone);
        console.log('📋 Order details:', {
          farmer: orderData.farmerName,
          crop: orderData.farmerCrop,
          quantity: orderData.orderQuantity,
          expectedDate: new Date(orderData.expectedDeliveryDate).toLocaleDateString()
        });
        resolve(true);
      }, 1000);
    });
  };

  // Update allocation status
  const handleStatusUpdate = async (allocationId, newStatus) => {
    try {
      const allocation = allocations.find(a => a.id === allocationId);
      if (!allocation) {
        toast.error('Allocation not found');
        return;
      }

      const updatedAllocation = {
        ...allocation,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      await apiService.supply.updateAllocation(allocationId, updatedAllocation);
      
      // Update local state
      setAllocations(prev => 
        prev.map(a => 
          a.id === allocationId 
            ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
            : a
        )
      );
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Refresh data
      await fetchAllocations();
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Complete delivery
  const handleCompleteDelivery = async (allocationId) => {
    try {
      const allocation = allocations.find(a => a.id === allocationId);
      if (!allocation) {
        toast.error('Allocation not found');
        return;
      }

      const updatedAllocation = {
        ...allocation,
        status: 'completed',
        deliveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await apiService.supply.updateAllocation(allocationId, updatedAllocation);
      
      // Update local state
      setAllocations(prev => 
        prev.map(a => 
          a.id === allocationId 
            ? { ...a, status: 'completed', deliveredAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : a
        )
      );
      
      toast.success('Delivery marked as completed!');
      
      // Refresh data
      await fetchAllocations();
      
    } catch (error) {
      console.error('❌ Error completing delivery:', error);
      toast.error('Failed to mark delivery as completed');
    }
  };

  // Get status badge with icon
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <CalendarIcon className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Truck className="h-3 w-3" />
            Order Sent
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <PackageCheck className="h-3 w-3" />
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Group allocations by date for display
  const getGroupedAllocations = () => {
    const grouped = {};
    
    allocations.forEach(allocation => {
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
        acc[date] = allocations.sort((a, b) => a.farmerName.localeCompare(b.farmerName));
        return acc;
      }, {});
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate total allocated quantity
  const calculateTotalAllocated = () => {
    return allocations.reduce((total, allocation) => total + (allocation.quantity || 0), 0);
  };

  // Calculate total orders sent
  const calculateTotalOrders = () => {
    return allocations.filter(a => a.status === 'in-progress' || a.status === 'completed').length;
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Supply Orders"
        description="Send orders to allocated farmers and track deliveries"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading supply orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedAllocations = getGroupedAllocations();
  const totalOrders = calculateTotalOrders();
  const totalAllocated = calculateTotalAllocated();

  return (
    <DashboardLayout
      title="Supply Orders"
      description="Send orders to allocated farmers and track deliveries. Farmers are allocated in the Farmers page."
    >
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="orders" className="gap-2">
            <Truck className="h-4 w-4" />
            Orders & Deliveries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="animate-fade-in space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-2xl font-bold">{allocations.length}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Allocations</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Send className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Orders Sent</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <PackageCheck className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-2xl font-bold">{totalAllocated.toFixed(1)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Planned (tons)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Orders & Deliveries
                </CardTitle>
                <CardDescription>
                  Send orders to allocated farmers and track delivery status.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={fetchAllocations}
                  title="Refresh data"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {allocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Active Allocations
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Allocate farmers in the Farmers page first. Once allocated, they will appear here for order processing.
                  </p>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    <p className="text-sm text-gray-600">Steps:</p>
                    <ol className="text-sm text-gray-500 text-left space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">1</span>
                        <span>Go to Farmers page</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">2</span>
                        <span>Click "Allocate" on a farmer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">3</span>
                        <span>Allocated farmers appear here for orders</span>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAllocations).map(([date, dateAllocations]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {formatDate(date)}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {dateAllocations.length} farmer{dateAllocations.length !== 1 ? 's' : ''}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {dateAllocations.reduce((sum, a) => sum + a.quantity, 0).toFixed(1)} tons
                          </span>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Farmer</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Crop</TableHead>
                              <TableHead>Allocated (tons)</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateAllocations.map((allocation) => (
                              <TableRow key={allocation.id} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  <div>
                                    <p>{allocation.farmerName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ID: {allocation.farmerId}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {allocation.farmerPhone ? (
                                      <div className="flex items-center gap-1 text-sm text-blue-600">
                                        <Phone className="h-3 w-3" />
                                        {allocation.farmerPhone}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No phone</p>
                                    )}
                                    {allocation.farmerEmail && (
                                      <div className="flex items-center gap-1 text-xs text-green-600">
                                        <Mail className="h-3 w-3" />
                                        {allocation.farmerEmail}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {allocation.farmerCounty}
                                </TableCell>
                                <TableCell>
                                  {allocation.farmerCrop}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {allocation.quantity.toFixed(1)} tons
                                  {allocation.orderQuantity && (
                                    <p className="text-xs text-muted-foreground">
                                      Ordered: {allocation.orderQuantity.toFixed(1)} tons
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(allocation.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {allocation.status === 'scheduled' && (
                                      <Button
                                        size="sm"
                                        onClick={() => openOrderDialog(allocation)}
                                        className="h-8 px-3"
                                      >
                                        <Send className="h-4 w-4 mr-1" />
                                        Send Order
                                      </Button>
                                    )}
                                    
                                    {allocation.status === 'in-progress' && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openOrderDialog(allocation)}
                                          className="h-8 px-2 text-blue-600"
                                        >
                                          <Send className="h-3 w-3 mr-1" />
                                          Resend
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleCompleteDelivery(allocation.id)}
                                          className="h-8 px-3"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Deliver
                                        </Button>
                                      </>
                                    )}
                                    
                                    {allocation.status === 'completed' && (
                                      <Badge variant="outline" className="text-green-600 bg-green-50">
                                        Delivered
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
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
      </Tabs>

      {/* Send Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Send Order to Farmer</DialogTitle>
            <DialogDescription>
              Send order details to {selectedAllocation?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            {selectedAllocation && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Farmer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Name:</span>
                      <p className="font-medium">{selectedAllocation.farmerName}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Crop:</span>
                      <p>{selectedAllocation.farmerCrop}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Email:</span>
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedAllocation.farmerEmail || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Phone:</span>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedAllocation.farmerPhone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Location:</span>
                      <p>{selectedAllocation.farmerCounty}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Delivery Date:</span>
                      <p>{formatDate(selectedAllocation.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="orderQuantity">Order Quantity (tons) *</Label>
                      <span className="text-sm text-muted-foreground">
                        Allocated: {selectedAllocation.quantity.toFixed(1)} tons
                      </span>
                    </div>
                    <Input
                      id="orderQuantity"
                      name="orderQuantity"
                      type="number"
                      value={orderForm.orderQuantity}
                      onChange={handleOrderInputChange}
                      placeholder="Enter order quantity"
                      min="0.1"
                      max={selectedAllocation.quantity}
                      step="0.1"
                      required
                    />
                    {parseFloat(orderForm.orderQuantity) > selectedAllocation.quantity && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        Order quantity cannot exceed allocated quantity
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                    <Input
                      id="orderNotes"
                      name="orderNotes"
                      value={orderForm.orderNotes}
                      onChange={handleOrderInputChange}
                      placeholder="Special instructions or notes for the farmer..."
                    />
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Order Will Be Sent To:
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Email: {selectedAllocation.farmerEmail || 'Not available'}</li>
                      <li>✓ SMS: {selectedAllocation.farmerPhone || 'Not available'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendOrder}
              disabled={!orderForm.orderQuantity || parseFloat(orderForm.orderQuantity) > selectedAllocation?.quantity}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
