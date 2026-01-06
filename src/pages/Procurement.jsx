// src/pages/Procurement.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Truck, 
  Search, 
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  PackageCheck,
  PackageX,
  FileText,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Sprout,
  RefreshCw,
  Users,
  MapPin
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Procurement() {
  // State management
  const [activeTab, setActiveTab] = useState('step1');
  const [orders, setOrders] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [supplyAllocations, setSupplyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [isStep1DialogOpen, setIsStep1DialogOpen] = useState(false);
  const [isStep2DialogOpen, setIsStep2DialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  
  // Selected items
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState(null);
  
  // Form states
  const [step1Form, setStep1Form] = useState({
    supplierType: 'farmer',
    farmerId: '',
    aggregatorId: '',
    isContracted: 'yes',
    supplierName: '',
    supplierContact: '',
    supplierPhone: '',
    supplierEmail: '',
    cropName: '',
    quantityOrdered: '',
    pricePerUnit: '',
    lpoNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    notes: ''
  });

  const [step2Form, setStep2Form] = useState({
    orderId: '',
    quantityDelivered: '',
    quantityAccepted: '',
    quantityRejected: '',
    rejectionReason: '',
    actualDeliveryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    paymentStatus: 'pending',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    referenceNumber: '',
    notes: ''
  });

  const [notesForm, setNotesForm] = useState({
    orderId: '',
    notes: ''
  });

  // Fetch all data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersData, farmersData, aggregatorsData, allocationsData] = await Promise.all([
        apiService.procurement.getOrders(),
        apiService.farmers.getAll(),
        apiService.aggregators.getAll(),
        apiService.supply.getAllocations()
      ]);
      
      setOrders(ordersData || []);
      setFarmers(farmersData || []);
      setAggregators(aggregatorsData || []);
      setSupplyAllocations(allocationsData || []);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load procurement data');
      setOrders([]);
      setFarmers([]);
      setAggregators([]);
      setSupplyAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SIMPLE SOLUTION: Get farmers with scheduled allocations
  const getFarmersWithAllocations = () => {
    if (!supplyAllocations?.length || !farmers?.length) {
      return [];
    }

    // Get scheduled allocations
    const scheduledAllocations = supplyAllocations.filter(a => a?.status === 'scheduled');
    
    // Get unique farmer IDs from scheduled allocations
    const farmerIds = [...new Set(scheduledAllocations.map(a => a.farmerId))];
    
    // Get farmer objects with their allocations
    const farmersWithAllocs = farmers
      .filter(farmer => farmerIds.includes(farmer.id))
      .map(farmer => ({
        ...farmer,
        allocations: scheduledAllocations.filter(a => a.farmerId === farmer.id)
      }));
    
    return farmersWithAllocs;
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      order.supplierName?.toLowerCase().includes(searchLower) ||
      order.cropName?.toLowerCase().includes(searchLower) ||
      order.id?.toString().includes(search) ||
      order.lpoNumber?.toLowerCase().includes(searchLower) ||
      order.supplierContact?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary stats
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const pendingDelivery = orders.filter(order => 
      order.deliveryDate && order.deliveryDate >= today && !order.quantityDelivered
    ).length;
    
    const pendingPayment = orders.filter(order => 
      order.paymentStatus === 'pending'
    ).length;
    
    const todayDeliveries = orders.filter(order => 
      order.actualDeliveryDate === today
    );
    
    const totalDeliveredToday = todayDeliveries.reduce((sum, order) => 
      sum + (order.quantityDelivered || 0), 0
    );
    
    const totalValueToday = todayDeliveries.reduce((sum, order) => 
      sum + ((order.quantityAccepted || 0) * (order.pricePerUnit || 0)), 0
    );
    
    const rejectionRate = orders.filter(order => order.quantityRejected > 0).length / Math.max(orders.length, 1) * 100;
    
    return {
      pendingDelivery,
      pendingPayment,
      totalDeliveredToday: totalDeliveredToday.toFixed(1),
      totalValueToday: totalValueToday.toLocaleString(),
      rejectionRate: rejectionRate.toFixed(1)
    };
  };

  const stats = calculateStats();

  // Handle Step 1 form input changes
  const handleStep1InputChange = (e) => {
    const { name, value } = e.target;
    setStep1Form(prev => ({ ...prev, [name]: value }));
  };

  // Handle Step 1 select changes - SIMPLIFIED VERSION
  const handleStep1SelectChange = (field, value) => {
    setStep1Form(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Reset dependent fields when supplier type changes
    if (field === 'supplierType') {
      setStep1Form(prev => ({
        ...prev,
        farmerId: '',
        aggregatorId: '',
        supplierName: '',
        supplierContact: '',
        supplierPhone: '',
        supplierEmail: '',
        isContracted: 'yes',
        cropName: '',
        quantityOrdered: '',
        deliveryDate: ''
      }));
    }
    
    // When farmer is selected, auto-fill
    if (field === 'farmerId' && value) {
      const farmersWithAllocs = getFarmersWithAllocations();
      const selectedFarmer = farmersWithAllocs.find(f => f.id.toString() === value.toString());
      
      if (selectedFarmer) {
        const firstAllocation = selectedFarmer.allocations?.[0];
        
        setStep1Form(prev => ({
          ...prev,
          supplierName: selectedFarmer.name || '',
          supplierContact: selectedFarmer.contact || '',
          supplierPhone: selectedFarmer.phone || '',
          supplierEmail: selectedFarmer.email || '',
          isContracted: 'yes',
          cropName: selectedFarmer.crop || '',
          quantityOrdered: firstAllocation?.quantity?.toString() || '',
          deliveryDate: firstAllocation?.date ? new Date(firstAllocation.date).toISOString().split('T')[0] : '',
          pricePerUnit: '15000',
          lpoNumber: `LPO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`
        }));
      }
    }
    
    // When aggregator is selected
    if (field === 'aggregatorId' && value) {
      const aggregator = aggregators.find(a => a.id.toString() === value.toString());
      if (aggregator) {
        setStep1Form(prev => ({
          ...prev,
          supplierName: aggregator.name,
          supplierContact: aggregator.contact || '',
          supplierPhone: aggregator.phone || '',
          supplierEmail: aggregator.email || '',
          isContracted: aggregator.type === 'internal' ? 'yes' : 'no'
        }));
      }
    }
  };

  // Handle Step 2 form input changes
  const handleStep2InputChange = (e) => {
    const { name, value } = e.target;
    setStep2Form(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate rejected quantity
      if (name === 'quantityDelivered' || name === 'quantityAccepted') {
        const delivered = parseFloat(updated.quantityDelivered) || 0;
        const accepted = parseFloat(updated.quantityAccepted) || 0;
        updated.quantityRejected = Math.max(0, delivered - accepted).toFixed(1);
      }
      
      return updated;
    });
  };

  // Handle payment form changes
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle notes form changes
  const handleNotesInputChange = (e) => {
    const { name, value } = e.target;
    setNotesForm(prev => ({ ...prev, [name]: value }));
  };

  // Reset Step 1 form
  const resetStep1Form = () => {
    setStep1Form({
      supplierType: 'farmer',
      farmerId: '',
      aggregatorId: '',
      isContracted: 'yes',
      supplierName: '',
      supplierContact: '',
      supplierPhone: '',
      supplierEmail: '',
      cropName: '',
      quantityOrdered: '',
      pricePerUnit: '',
      lpoNumber: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: ''
    });
  };

  // Step 1: Create Procurement Order
  const handleCreateOrder = async () => {
    try {
      // Validate required fields
      if (!step1Form.supplierName || !step1Form.quantityOrdered || !step1Form.deliveryDate) {
        toast.error('Please fill all required fields (Supplier Name, Quantity, Delivery Date)');
        return;
      }

      // Auto-generate LPO number if not provided
      const lpoNumber = step1Form.lpoNumber || `LPO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

      // Prepare order data for backend
      const newOrder = {
        ...step1Form,
        quantityOrdered: parseFloat(step1Form.quantityOrdered) || 0,
        pricePerUnit: parseFloat(step1Form.pricePerUnit) || 0,
        isContracted: step1Form.isContracted === 'yes',
        lpoNumber,
        status: 'ordered',
        goodsReceived: false,
        paymentStatus: 'pending',
        quantityDelivered: 0,
        quantityAccepted: 0,
        quantityRejected: 0,
        actualDeliveryDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add farmer-specific data
      if (step1Form.supplierType === 'farmer' && step1Form.farmerId) {
        const selectedFarmer = farmers.find(f => f.id.toString() === step1Form.farmerId.toString());
        if (selectedFarmer) {
          newOrder.farmerId = selectedFarmer.id;
          newOrder.farmerContractNumber = selectedFarmer.contractNumber;
          newOrder.farmerCounty = selectedFarmer.county;
          
          // Update allocation status to in-progress
          const allocation = supplyAllocations.find(a => 
            a.farmerId === selectedFarmer.id && 
            a.status === 'scheduled'
          );
          if (allocation) {
            await apiService.supply.updateAllocation(allocation.id, {
              ...allocation,
              status: 'in-progress',
              orderId: orders.length + 1
            });
          }
        }
      }

      // Save to backend
      await apiService.procurement.createOrder(newOrder);
      
      toast.success('Order created successfully!');
      setIsStep1DialogOpen(false);
      resetStep1Form();
      
      // Refresh data
      await fetchData();
      setActiveTab('step1');
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  // Step 2: Record Goods Receipt
  const handleRecordGoodsReceipt = async () => {
    try {
      if (!step2Form.quantityDelivered) {
        toast.error('Please enter delivered quantity');
        return;
      }

      const order = orders.find(o => o.id.toString() === step2Form.orderId.toString());
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const quantityDelivered = parseFloat(step2Form.quantityDelivered) || 0;
      const quantityAccepted = parseFloat(step2Form.quantityAccepted) || 0;
      const quantityRejected = parseFloat(step2Form.quantityRejected) || 0;

      // Prepare updated order data
      const updatedOrder = {
        ...order,
        quantityDelivered,
        quantityAccepted,
        quantityRejected,
        rejectionReason: step2Form.rejectionReason,
        actualDeliveryDate: step2Form.actualDeliveryDate || new Date().toISOString().split('T')[0],
        goodsReceived: true,
        status: quantityAccepted > 0 ? 'delivered' : 'rejected',
        updatedAt: new Date().toISOString()
      };

      // Update order in backend
      await apiService.procurement.updateOrder(order.id, updatedOrder);
      
      toast.success('Goods receipt recorded successfully');
      setIsStep2DialogOpen(false);
      setStep2Form({
        orderId: '',
        quantityDelivered: '',
        quantityAccepted: '',
        quantityRejected: '',
        rejectionReason: '',
        actualDeliveryDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error recording goods receipt:', error);
      toast.error('Failed to record goods receipt');
    }
  };

  // Update Payment Status
  const handleUpdatePayment = async () => {
    try {
      const order = orders.find(o => o.id.toString() === paymentForm.orderId.toString());
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const updatedOrder = {
        ...order,
        paymentStatus: paymentForm.paymentStatus,
        amountPaid: parseFloat(paymentForm.amountPaid) || 0,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.referenceNumber,
        updatedAt: new Date().toISOString()
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Payment status updated successfully');
      setIsPaymentDialogOpen(false);
      setSelectedOrderForPayment(null);
      
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Update Notes
  const handleUpdateNotes = async () => {
    try {
      const order = orders.find(o => o.id.toString() === notesForm.orderId.toString());
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const updatedOrder = {
        ...order,
        notes: notesForm.notes,
        updatedAt: new Date().toISOString()
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Notes updated successfully');
      setIsNotesDialogOpen(false);
      setSelectedOrderForNotes(null);
      
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    try {
      await apiService.procurement.deleteOrder(selectedOrder.id);
      toast.success('Order deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // Status badge component
  const getStatusBadge = (order) => {
    if (!order.goodsReceived) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Ordered
      </Badge>;
    }
    
    if (order.quantityAccepted === 0) {
      return <Badge variant="destructive">
        <PackageX className="h-3 w-3 mr-1" />
        Rejected
      </Badge>;
    } else if (order.quantityAccepted < order.quantityDelivered) {
      return <Badge variant="warning">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Partial
      </Badge>;
    } else {
      return <Badge variant="success">
        <PackageCheck className="h-3 w-3 mr-1" />
        Received
      </Badge>;
    }
  };

  // Payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'partial':
        return <Badge variant="warning">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Partial
        </Badge>;
      default:
        return <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Procurement Management"
        description="Two-step procurement process: Order → Goods Receipt"
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

  const farmersWithAllocations = getFarmersWithAllocations();

  return (
    <DashboardLayout
      title="Procurement Management"
      description="Two-step procurement process: Order → Goods Receipt"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-2xl font-bold">{stats.pendingDelivery}</p>
              </div>
              <p className="text-sm text-muted-foreground">Pending Delivery</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-2xl font-bold">{stats.pendingPayment}</p>
              </div>
              <p className="text-sm text-muted-foreground">Pending Payment</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Truck className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-2xl font-bold">{stats.totalDeliveredToday}</p>
              </div>
              <p className="text-sm text-muted-foreground">Tons Delivered Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <p className="text-2xl font-bold">KES {stats.totalValueToday}</p>
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
                <p className="text-2xl font-bold">{stats.rejectionRate}%</p>
              </div>
              <p className="text-sm text-muted-foreground">Rejection Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Step 1 and Step 2 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="step1" className="gap-2">
            <Mail className="h-4 w-4" />
            Step 1: Send Order
          </TabsTrigger>
          <TabsTrigger value="step2" className="gap-2">
            <PackageCheck className="h-4 w-4" />
            Step 2: Goods Receipt
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Orders
          </TabsTrigger>
        </TabsList>

        {/* Step 1 Content: Send Order */}
        <TabsContent value="step1" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Send Procurement Orders
                  </CardTitle>
                  <CardDescription>
                    Step 1: Create and send orders to farmers/aggregators based on supply allocations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={fetchData}
                    title="Refresh data from backend"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Dialog open={isStep1DialogOpen} onOpenChange={setIsStep1DialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Step 1: Create Procurement Order</DialogTitle>
                        <DialogDescription>
                          Send order to farmer/aggregator before delivery date
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        {/* Supplier Type */}
                        <div className="space-y-2">
                          <Label htmlFor="supplierType">Supplier Type *</Label>
                          <select
                            id="supplierType"
                            name="supplierType"
                            value={step1Form.supplierType}
                            onChange={(e) => handleStep1SelectChange('supplierType', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                          >
                            <option value="farmer">Farmer (From Supply Planning)</option>
                            <option value="aggregator">Aggregator</option>
                            <option value="external">External Supplier</option>
                          </select>
                        </div>

                        {/* SIMPLE FARMER SELECTION - Using basic select */}
                        {step1Form.supplierType === 'farmer' && (
                          <div className="space-y-2">
                            <Label htmlFor="farmer">Select Farmer *</Label>
                            
                            {/* Info box */}
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded mb-2">
                              <p className="text-sm text-blue-700">
                                Available farmers from Supply Planning: {farmersWithAllocations.length}
                              </p>
                              {farmersWithAllocations.length === 0 && (
                                <p className="text-sm text-amber-600 mt-1">
                                  No farmers with scheduled allocations. Please add allocations in Supply Planning first.
                                </p>
                              )}
                            </div>
                            
                            {/* SIMPLE SELECT DROPDOWN */}
                            <select
                              id="farmer"
                              name="farmerId"
                              value={step1Form.farmerId}
                              onChange={(e) => handleStep1SelectChange('farmerId', e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                              required
                            >
                              <option value="">-- Choose a farmer with scheduled supply --</option>
                              {farmersWithAllocations.map(farmer => {
                                const firstAllocation = farmer.allocations?.[0];
                                return (
                                  <option key={farmer.id} value={farmer.id}>
                                    🌾 {farmer.name} 
                                    {farmer.crop ? ` | ${farmer.crop}` : ''}
                                    {farmer.county ? ` | ${farmer.county}` : ''}
                                    {firstAllocation ? ` | ${firstAllocation.quantity} tons on ${new Date(firstAllocation.date).toLocaleDateString()}` : ''}
                                  </option>
                                );
                              })}
                            </select>
                            
                            {/* Show allocation details when farmer is selected */}
                            {step1Form.farmerId && (
                              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-700 mb-2">
                                  Scheduled Supply Allocations:
                                </p>
                                {(() => {
                                  const selectedFarmer = farmersWithAllocations.find(f => f.id.toString() === step1Form.farmerId.toString());
                                  if (!selectedFarmer?.allocations?.length) {
                                    return <p className="text-sm text-yellow-600">No allocations found</p>;
                                  }
                                  
                                  return selectedFarmer.allocations.map(allocation => (
                                    <div key={allocation.id} className="text-sm text-green-600 mb-1">
                                      • {new Date(allocation.date).toLocaleDateString()}: {allocation.quantity} tons
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Aggregator Selection */}
                        {step1Form.supplierType === 'aggregator' && (
                          <div className="space-y-2">
                            <Label htmlFor="aggregator">Select Aggregator *</Label>
                            <select
                              id="aggregator"
                              name="aggregatorId"
                              value={step1Form.aggregatorId}
                              onChange={(e) => handleStep1SelectChange('aggregatorId', e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
                            >
                              <option value="">-- Choose an aggregator --</option>
                              {aggregators.map(aggregator => (
                                <option key={aggregator.id} value={aggregator.id}>
                                  👥 {aggregator.name} | {aggregator.type} | {aggregator.county || 'Location'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Supplier Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="supplierName">Supplier Name *</Label>
                            <Input
                              id="supplierName"
                              name="supplierName"
                              value={step1Form.supplierName}
                              onChange={handleStep1InputChange}
                              placeholder="Supplier name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supplierPhone">Phone *</Label>
                            <Input
                              id="supplierPhone"
                              name="supplierPhone"
                              value={step1Form.supplierPhone}
                              onChange={handleStep1InputChange}
                              placeholder="+254712345678"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="supplierEmail">Email</Label>
                            <Input
                              id="supplierEmail"
                              name="supplierEmail"
                              type="email"
                              value={step1Form.supplierEmail}
                              onChange={handleStep1InputChange}
                              placeholder="supplier@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cropName">Crop Name</Label>
                            <Input
                              id="cropName"
                              name="cropName"
                              value={step1Form.cropName}
                              onChange={handleStep1InputChange}
                              placeholder="e.g., Wheat, Corn..."
                            />
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quantityOrdered">Quantity (tons) *</Label>
                            <Input
                              id="quantityOrdered"
                              name="quantityOrdered"
                              type="number"
                              step="0.1"
                              value={step1Form.quantityOrdered}
                              onChange={handleStep1InputChange}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pricePerUnit">Price/ton (KES)</Label>
                            <Input
                              id="pricePerUnit"
                              name="pricePerUnit"
                              type="number"
                              value={step1Form.pricePerUnit}
                              onChange={handleStep1InputChange}
                              placeholder="15000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryDate">Delivery Date *</Label>
                            <Input
                              id="deliveryDate"
                              name="deliveryDate"
                              type="date"
                              value={step1Form.deliveryDate}
                              onChange={handleStep1InputChange}
                              required
                            />
                          </div>
                        </div>

                        {/* LPO and Order Date */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lpoNumber">LPO Number</Label>
                            <Input
                              id="lpoNumber"
                              name="lpoNumber"
                              value={step1Form.lpoNumber}
                              onChange={handleStep1InputChange}
                              placeholder="LPO-2024-001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orderDate">Order Date *</Label>
                            <Input
                              id="orderDate"
                              name="orderDate"
                              type="date"
                              value={step1Form.orderDate}
                              onChange={handleStep1InputChange}
                              required
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label htmlFor="notes">Order Notes</Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={step1Form.notes}
                            onChange={handleStep1InputChange}
                            placeholder="Additional information about this order..."
                            rows={3}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsStep1DialogOpen(false);
                          resetStep1Form();
                        }}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateOrder}
                          disabled={!step1Form.supplierName || !step1Form.quantityOrdered || !step1Form.deliveryDate}
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
              {/* Orders waiting for goods receipt */}
              <div className="space-y-4">
                <h3 className="font-medium">Orders Awaiting Goods Receipt (Step 2)</h3>
                {orders.filter(order => !order.goodsReceived).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders awaiting goods receipt
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Order Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>LPO</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders
                            .filter(order => !order.goodsReceived)
                            .map(order => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{order.supplierName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.farmerId ? 'Farmer' : 'Aggregator'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {order.supplierPhone && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <Phone className="h-3 w-3 text-blue-600" />
                                        <span className="text-blue-600">{order.supplierPhone}</span>
                                      </div>
                                    )}
                                    {order.supplierEmail && (
                                      <div className="flex items-center gap-1 text-sm">
                                        <Mail className="h-3 w-3 text-green-600" />
                                        <span className="text-green-600">{order.supplierEmail}</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Sprout className="h-3 w-3 text-green-600" />
                                    {order.cropName || '-'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{order.quantityOrdered}t</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {new Date(order.deliveryDate).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-sm">{order.lpoNumber || '-'}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setStep2Form({
                                          orderId: order.id.toString(),
                                          quantityDelivered: order.quantityOrdered?.toString() || '',
                                          quantityAccepted: '',
                                          quantityRejected: '',
                                          rejectionReason: '',
                                          actualDeliveryDate: new Date().toISOString().split('T')[0],
                                          notes: ''
                                        });
                                        setIsStep2DialogOpen(true);
                                      }}
                                    >
                                      Record Receipt
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2 Content: Goods Receipt */}
        <TabsContent value="step2" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-primary" />
                    Goods Receipt & Quality Check
                  </CardTitle>
                  <CardDescription>
                    Step 2: Record goods received at warehouse and quality assessment
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {orders.filter(order => !order.goodsReceived).length} orders pending receipt
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {orders.filter(order => !order.goodsReceived).length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    All Goods Received
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    All orders have been processed through goods receipt.
                    Create new orders in Step 1 when needed.
                  </p>
                  <Button onClick={() => setActiveTab('step1')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Go to Step 1
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Order Details</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Ordered Qty</TableHead>
                          <TableHead>Delivery Date</TableHead>
                          <TableHead>LPO</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders
                          .filter(order => !order.goodsReceived)
                          .map(order => (
                            <TableRow key={order.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">#{order.id} - {order.cropName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Ordered: {new Date(order.orderDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div>{order.supplierName}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.quantityOrdered}t</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  {new Date(order.deliveryDate).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>{order.lpoNumber || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setStep2Form({
                                        orderId: order.id.toString(),
                                        quantityDelivered: order.quantityOrdered?.toString() || '',
                                        quantityAccepted: '',
                                        quantityRejected: '',
                                        rejectionReason: '',
                                        actualDeliveryDate: new Date().toISOString().split('T')[0],
                                        notes: ''
                                      });
                                      setIsStep2DialogOpen(true);
                                    }}
                                  >
                                    Record Receipt
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Orders Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    All Procurement Orders
                  </CardTitle>
                  <CardDescription>
                    View and manage all procurement orders
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-64 pl-9"
                    />
                  </div>
                  <Button onClick={() => setActiveTab('step1')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Procurement Orders Yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start your procurement process by creating your first order in Step 1.
                  </p>
                  <Button onClick={() => setActiveTab('step1')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Order
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead className="text-center">Ordered</TableHead>
                          <TableHead className="text-center">Delivered</TableHead>
                          <TableHead className="text-center">Accepted</TableHead>
                          <TableHead>Delivery Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map(order => {
                          const rejectedPercentage = order.quantityDelivered > 0 
                            ? (order.quantityRejected / order.quantityDelivered * 100).toFixed(1)
                            : 0;
                          
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                <div>#{order.id}</div>
                                {order.lpoNumber && (
                                  <div className="text-xs text-muted-foreground">
                                    {order.lpoNumber}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.supplierName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.farmerId ? 'Farmer' : 'Aggregator'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.farmerId ? 'outline' : 'secondary'}>
                                  {order.farmerId ? 'Farmer' : 'Other'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Sprout className="h-3 w-3 text-green-600" />
                                  {order.cropName || '-'}
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                <div>{order.quantityOrdered}t</div>
                              </TableCell>
                              <TableCell className="text-center">
                                {order.quantityDelivered > 0 ? (
                                  <span className="font-medium">{order.quantityDelivered}t</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {order.quantityAccepted > 0 ? (
                                  <div>
                                    <span className="font-medium text-green-600">{order.quantityAccepted}t</span>
                                    {order.quantityRejected > 0 && (
                                      <div className="text-xs text-red-500">
                                        ({rejectedPercentage}% rejected)
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(order)}</TableCell>
                              <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {!order.goodsReceived && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setStep2Form({
                                          orderId: order.id.toString(),
                                          quantityDelivered: order.quantityOrdered?.toString() || '',
                                          quantityAccepted: '',
                                          quantityRejected: '',
                                          rejectionReason: '',
                                          actualDeliveryDate: new Date().toISOString().split('T')[0],
                                          notes: ''
                                        });
                                        setIsStep2DialogOpen(true);
                                      }}
                                      className="h-8 px-2"
                                    >
                                      Receipt
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrderForPayment(order);
                                      setPaymentForm({
                                        orderId: order.id.toString(),
                                        paymentStatus: order.paymentStatus || 'pending',
                                        amountPaid: order.amountPaid?.toString() || '',
                                        paymentDate: new Date().toISOString().split('T')[0],
                                        paymentMethod: order.paymentMethod || 'bank_transfer',
                                        referenceNumber: order.paymentReference || '',
                                        notes: ''
                                      });
                                      setIsPaymentDialogOpen(true);
                                    }}
                                    className="h-8 px-2"
                                  >
                                    Payment
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrderForNotes(order);
                                      setNotesForm({
                                        orderId: order.id.toString(),
                                        notes: ''
                                      });
                                      setIsNotesDialogOpen(true);
                                    }}
                                    className="h-8 px-2"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="h-8 px-2 text-red-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
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
        </TabsContent>
      </Tabs>

      {/* Step 2 Dialog: Goods Receipt */}
      <Dialog open={isStep2DialogOpen} onOpenChange={setIsStep2DialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Step 2: Record Goods Receipt</DialogTitle>
            <DialogDescription>
              Update when goods are delivered to warehouse
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantityDelivered">Delivered Quantity (tons) *</Label>
              <Input
                id="quantityDelivered"
                name="quantityDelivered"
                type="number"
                step="0.1"
                value={step2Form.quantityDelivered}
                onChange={handleStep2InputChange}
                placeholder="Enter delivered quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantityAccepted">Accepted Quantity (tons)</Label>
              <Input
                id="quantityAccepted"
                name="quantityAccepted"
                type="number"
                step="0.1"
                value={step2Form.quantityAccepted}
                onChange={handleStep2InputChange}
                placeholder="Enter accepted quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason (if any)</Label>
              <select
                id="rejectionReason"
                name="rejectionReason"
                value={step2Form.rejectionReason}
                onChange={(e) => setStep2Form(prev => ({ ...prev, rejectionReason: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">No rejection</option>
                <option value="poor_quality">Poor Quality</option>
                <option value="wrong_variety">Wrong Variety</option>
                <option value="contamination">Contamination</option>
                <option value="moisture_high">High Moisture</option>
                <option value="delayed_delivery">Delayed Delivery</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualDeliveryDate">Actual Delivery Date</Label>
              <Input
                id="actualDeliveryDate"
                name="actualDeliveryDate"
                type="date"
                value={step2Form.actualDeliveryDate}
                onChange={handleStep2InputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={step2Form.notes}
                onChange={handleStep2InputChange}
                placeholder="Additional notes about delivery..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStep2DialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordGoodsReceipt}>
              Record Goods Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment information for order
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={paymentForm.paymentStatus}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial Payment</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid (KES)</Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  value={paymentForm.amountPaid}
                  onChange={handlePaymentInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={handlePaymentInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
                value={paymentForm.referenceNumber}
                onChange={handlePaymentInputChange}
                placeholder="e.g., TRX123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayment}>
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Record notes or reasoning for decisions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notesForm.notes}
                onChange={handleNotesInputChange}
                placeholder="Record notes about delays, quality issues, decisions..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotes}>
              Save Notes
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
              Are you sure you want to delete order #{selectedOrder?.id}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
