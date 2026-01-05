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
  UserCheck,
  UserX,
  Receipt,
  ClipboardCheck,
  ClipboardX,
  Mail,
  Phone,
  MessageSquare,
  Send,
  User,
  Users,
  Copy
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
    contact: '',
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

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, farmersData, aggregatorsData] = await Promise.all([
        apiService.procurement.getOrders(),
        apiService.farmers.getAll(),
        apiService.aggregators.getAll()
      ]);
      
      setOrders(ordersData || []);
      setFarmers(farmersData || []);
      setAggregators(aggregatorsData?.data || aggregatorsData || []);
      
      const allocations = await apiService.supply.getAllocations?.() || 
                         JSON.parse(localStorage.getItem('supplyAllocations')) || [];
      setSupplyAllocations(allocations);
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

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    
    return (
      order.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      order.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toString().includes(search) ||
      order.lpoNumber?.toLowerCase().includes(search.toLowerCase())
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
    
    const rejectionRate = orders.filter(order => order.quantityRejected > 0).length / orders.length * 100 || 0;
    
    return {
      pendingDelivery,
      pendingPayment,
      totalDeliveredToday: totalDeliveredToday.toFixed(1),
      totalValueToday: totalValueToday.toLocaleString(),
      rejectionRate: rejectionRate.toFixed(1)
    };
  };

  const stats = calculateStats();

  // Get available supply allocations for farmers
  const getAvailableSupplyAllocations = () => {
    return supplyAllocations.filter(allocation => 
      allocation.status === 'scheduled' && 
      !orders.some(order => 
        order.farmerId === allocation.farmerId && 
        order.deliveryDate === allocation.date.split('T')[0]
      )
    );
  };

  // Handle Step 1 form input changes
  const handleStep1InputChange = (e) => {
    const { name, value } = e.target;
    setStep1Form(prev => ({ ...prev, [name]: value }));
    
    if (name === 'farmerId' && value) {
      const allocation = supplyAllocations.find(a => a.farmerId === parseInt(value));
      if (allocation) {
        setStep1Form(prev => ({
          ...prev,
          deliveryDate: new Date(allocation.date).toISOString().split('T')[0],
          quantityOrdered: allocation.quantity?.toString() || prev.quantityOrdered
        }));
      }
    }
  };

  // Handle Step 1 select changes
  const handleStep1SelectChange = (name, value) => {
    setStep1Form(prev => ({ ...prev, [name]: value }));
    
    if (name === 'supplierType') {
      setStep1Form(prev => ({
        ...prev,
        farmerId: '',
        aggregatorId: '',
        supplierName: '',
        contact: '',
        isContracted: 'yes'
      }));
    }
    
    if (name === 'farmerId' && value) {
      const farmer = farmers.find(f => f.id === parseInt(value));
      if (farmer) {
        setStep1Form(prev => ({
          ...prev,
          supplierName: farmer.name,
          contact: farmer.contact || farmer.phone || '',
          isContracted: 'yes',
          cropName: farmer.crop || '',
          ...(farmer.contractNumber && { lpoNumber: `CONTRACT-${farmer.contractNumber}` })
        }));
      }
    }
    
    if (name === 'aggregatorId' && value) {
      const aggregator = aggregators.find(a => a.id === parseInt(value));
      if (aggregator) {
        setStep1Form(prev => ({
          ...prev,
          supplierName: aggregator.name,
          contact: aggregator.contact || aggregator.phone || '',
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
      
      if (name === 'quantityDelivered' || name === 'quantityAccepted') {
        const delivered = parseFloat(updated.quantityDelivered) || 0;
        const accepted = parseFloat(updated.quantityAccepted) || 0;
        updated.quantityRejected = (delivered - accepted).toString();
      }
      
      return updated;
    });
  };

  // Handle Step 2 select changes
  const handleStep2SelectChange = (name, value) => {
    setStep2Form(prev => ({ ...prev, [name]: value }));
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
      contact: '',
      cropName: '',
      quantityOrdered: '',
      pricePerUnit: '',
      lpoNumber: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: ''
    });
  };

  // Reset Step 2 form
  const resetStep2Form = () => {
    setStep2Form({
      orderId: '',
      quantityDelivered: '',
      quantityAccepted: '',
      quantityRejected: '',
      rejectionReason: '',
      actualDeliveryDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Step 1: Create Procurement Order
  const handleCreateOrder = async () => {
    try {
      if (!step1Form.supplierName || !step1Form.quantityOrdered || !step1Form.deliveryDate) {
        toast.error('Please fill all required fields');
        return;
      }

      const lpoNumber = step1Form.lpoNumber || `LPO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

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

      if (step1Form.supplierType === 'farmer' && step1Form.farmerId) {
        const farmer = farmers.find(f => f.id === parseInt(step1Form.farmerId));
        if (farmer) {
          newOrder.farmerId = farmer.id;
          newOrder.farmerContractNumber = farmer.contractNumber;
          newOrder.farmerCounty = farmer.county;
        }
      }

      if (step1Form.supplierType === 'aggregator' && step1Form.aggregatorId) {
        newOrder.aggregatorId = parseInt(step1Form.aggregatorId);
      }

      await apiService.procurement.createOrder(newOrder);
      toast.success('Order created successfully');
      setIsStep1DialogOpen(false);
      resetStep1Form();
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  // Action buttons for sending order
  const handleSendOrder = (order, method) => {
    const message = `Hello ${order.supplierName},\n\nYour procurement order has been created:\n\n📋 **Order Details**\n• Order #${order.id}\n• Crop: ${order.cropName}\n• Quantity: ${order.quantityOrdered} tons\n• Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}\n• LPO: ${order.lpoNumber}\n\n✅ **Please confirm receipt**\n• Acknowledge receipt of this order\n• Confirm delivery timeline\n• Contact us for any questions\n\nBest regards,\nProcurement Team`;
    
    switch (method) {
      case 'email':
        if (order.contact && order.contact.includes('@')) {
          window.open(`mailto:${order.contact}?subject=Procurement Order #${order.id}&body=${encodeURIComponent(message)}`);
          toast.success('Email opened with order details');
        } else {
          toast.error('Supplier email not available');
        }
        break;
      case 'whatsapp':
        if (order.contact) {
          const phoneNumber = order.contact.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
            toast.success('Opening WhatsApp...');
          } else {
            toast.error('Invalid phone number');
          }
        } else {
          toast.error('Supplier phone number not available');
        }
        break;
      case 'call':
        if (order.contact) {
          const phoneNumber = order.contact.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            window.open(`tel:${phoneNumber}`);
            toast.success('Initiating call...');
          } else {
            toast.error('Invalid phone number');
          }
        } else {
          toast.error('Supplier phone number not available');
        }
        break;
      default:
        navigator.clipboard.writeText(message);
        toast.success('Order details copied to clipboard');
    }
  };

  // Step 2: Record Goods Receipt
  const handleRecordGoodsReceipt = async () => {
    try {
      if (!step2Form.quantityDelivered) {
        toast.error('Please enter delivered quantity');
        return;
      }

      const order = orders.find(o => o.id === parseInt(step2Form.orderId));
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const quantityDelivered = parseFloat(step2Form.quantityDelivered) || 0;
      const quantityAccepted = parseFloat(step2Form.quantityAccepted) || 0;
      const quantityRejected = parseFloat(step2Form.quantityRejected) || 0;

      const updatedOrder = {
        ...order,
        quantityDelivered,
        quantityAccepted,
        quantityRejected,
        rejectionReason: step2Form.rejectionReason,
        actualDeliveryDate: step2Form.actualDeliveryDate || new Date().toISOString().split('T')[0],
        goodsReceived: true,
        status: quantityAccepted > 0 ? 'delivered' : 'rejected',
        updatedAt: new Date().toISOString(),
        notes: order.notes ? `${order.notes}\n\nGoods Receipt: ${step2Form.notes}` : `Goods Receipt: ${step2Form.notes}`
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Goods receipt recorded successfully');
      setIsStep2DialogOpen(false);
      resetStep2Form();
      fetchData();
    } catch (error) {
      console.error('Error recording goods receipt:', error);
      toast.error('Failed to record goods receipt');
    }
  };

  // Update Payment Status
  const handleUpdatePayment = async () => {
    try {
      const order = orders.find(o => o.id === parseInt(paymentForm.orderId));
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
        updatedAt: new Date().toISOString(),
        notes: order.notes ? `${order.notes}\n\nPayment Update: ${paymentForm.notes}` : `Payment Update: ${paymentForm.notes}`
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Payment status updated successfully');
      setIsPaymentDialogOpen(false);
      setSelectedOrderForPayment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Update Notes
  const handleUpdateNotes = async () => {
    try {
      const order = orders.find(o => o.id === parseInt(notesForm.orderId));
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const updatedOrder = {
        ...order,
        notes: order.notes ? `${order.notes}\n\n${new Date().toLocaleString()}: ${notesForm.notes}` : `${new Date().toLocaleString()}: ${notesForm.notes}`,
        updatedAt: new Date().toISOString()
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Notes updated successfully');
      setIsNotesDialogOpen(false);
      setSelectedOrderForNotes(null);
      fetchData();
    } catch (error) {
      console.error('Error updating notes:', error);
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
      fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // Send Bulk Messages
  const handleSendBulkMessages = (method) => {
    const pendingOrders = orders.filter(order => !order.goodsReceived);
    if (pendingOrders.length === 0) {
      toast.error('No pending orders to send');
      return;
    }

    if (method === 'whatsapp') {
      const ordersSummary = pendingOrders.map(order => 
        `• Order #${order.id}: ${order.quantityOrdered}t of ${order.cropName} (Due: ${new Date(order.deliveryDate).toLocaleDateString()})`
      ).join('\n');
      
      const message = `📋 **Bulk Order Notification**\n\nPending Orders:\n${ordersSummary}\n\nPlease check your individual orders for details.\n\nBest regards,\nProcurement Team`;
      
      navigator.clipboard.writeText(message);
      toast.success(`Bulk WhatsApp message copied for ${pendingOrders.length} orders`);
    } else if (method === 'email') {
      const subject = `Procurement Orders Summary - ${new Date().toLocaleDateString()}`;
      const body = `Dear Suppliers,\n\nPlease find your pending procurement orders:\n\n${pendingOrders.map(order => 
        `• Order #${order.id}: ${order.quantityOrdered}t of ${order.cropName} (Due: ${new Date(order.deliveryDate).toLocaleDateString()})`
      ).join('\n')}\n\nPlease check your individual orders for complete details.\n\nBest regards,\nProcurement Team`;
      
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  // Open Step 2 Dialog
  const openStep2Dialog = (order) => {
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
  };

  // Open Payment Dialog
  const openPaymentDialog = (order) => {
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
  };

  // Open Notes Dialog
  const openNotesDialog = (order) => {
    setSelectedOrderForNotes(order);
    setNotesForm({
      orderId: order.id.toString(),
      notes: ''
    });
    setIsNotesDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Status badge component
  const getStatusBadge = (order) => {
    if (!order.goodsReceived) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Ordered</Badge>;
    }
    
    if (order.quantityAccepted === 0) {
      return <Badge variant="destructive" className="gap-1"><PackageX className="h-3 w-3" />Rejected</Badge>;
    } else if (order.quantityAccepted < order.quantityDelivered) {
      return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />Partial</Badge>;
    } else {
      return <Badge variant="success" className="gap-1"><PackageCheck className="h-3 w-3" />Received</Badge>;
    }
  };

  // Payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Paid</Badge>;
      case 'partial':
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />Partial</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  // Get farmers with scheduled supply allocations
  const getFarmersWithAllocations = () => {
    const allocations = getAvailableSupplyAllocations();
    const allocatedFarmerIds = allocations.map(a => a.farmerId);
    
    return farmers.filter(farmer => allocatedFarmerIds.includes(farmer.id)).map(farmer => {
      const farmerAllocations = allocations.filter(a => a.farmerId === farmer.id);
      return {
        ...farmer,
        allocations: farmerAllocations
      };
    });
  };

  // Empty state component
  const EmptyState = () => (
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
      <Button onClick={() => setIsStep1DialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Order
      </Button>
    </div>
  );

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
                <Dialog open={isStep1DialogOpen} onOpenChange={setIsStep1DialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
                      <DialogTitle>Step 1: Create Procurement Order</DialogTitle>
                      <DialogDescription>
                        Send order to farmer/aggregator before delivery date
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="overflow-y-auto flex-1 p-6">
                      <div className="grid gap-6">
                        {/* Supplier Type */}
                        <div className="space-y-2">
                          <Label htmlFor="supplierType">Supplier Type *</Label>
                          <Select
                            value={step1Form.supplierType}
                            onValueChange={(value) => handleStep1SelectChange('supplierType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="farmer">Farmer (Contracted)</SelectItem>
                              <SelectItem value="aggregator">Aggregator</SelectItem>
                              <SelectItem value="external">External Supplier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Farmer Selection */}
                        {step1Form.supplierType === 'farmer' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="farmer">Select Farmer *</Label>
                              <Select
                                value={step1Form.farmerId}
                                onValueChange={(value) => handleStep1SelectChange('farmerId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a farmer with scheduled supply" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getFarmersWithAllocations().length === 0 ? (
                                    <SelectItem value="none" disabled>
                                      No farmers with scheduled supply allocations
                                    </SelectItem>
                                  ) : (
                                    getFarmersWithAllocations().map(farmer => (
                                      <SelectItem key={farmer.id} value={farmer.id.toString()}>
                                        {farmer.name} - {farmer.county}
                                        {farmer.contractNumber && ` (Contract: ${farmer.contractNumber})`}
                                        {farmer.allocations?.length > 0 && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            {farmer.allocations.length} scheduled delivery{farmer.allocations.length > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {step1Form.farmerId && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-700 mb-2">
                                  Available Supply Allocations for this Farmer:
                                </p>
                                {getAvailableSupplyAllocations()
                                  .filter(a => a.farmerId === parseInt(step1Form.farmerId))
                                  .map(allocation => (
                                    <div key={allocation.id} className="text-sm text-blue-600 flex items-center justify-between mb-1">
                                      <span>
                                        • {new Date(allocation.date).toLocaleDateString()}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {allocation.quantity || 'N/A'} tons
                                      </Badge>
                                    </div>
                                  ))
                                }
                              </div>
                            )}
                          </>
                        )}

                        {/* Aggregator Selection */}
                        {step1Form.supplierType === 'aggregator' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="aggregator">Select Aggregator *</Label>
                              <Select
                                value={step1Form.aggregatorId}
                                onValueChange={(value) => handleStep1SelectChange('aggregatorId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an aggregator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {aggregators.length === 0 ? (
                                    <SelectItem value="none" disabled>No aggregators available</SelectItem>
                                  ) : (
                                    aggregators.map(aggregator => (
                                      <SelectItem key={aggregator.id} value={aggregator.id.toString()}>
                                        {aggregator.name} - {aggregator.type} ({aggregator.county})
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="isContracted">Contracted? *</Label>
                              <Select
                                value={step1Form.isContracted}
                                onValueChange={(value) => handleStep1SelectChange('isContracted', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Is supplier contracted?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes (Contracted)</SelectItem>
                                  <SelectItem value="no">No (Spot Purchase)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {/* External Supplier */}
                        {step1Form.supplierType === 'external' && (
                          <div className="space-y-2">
                            <Label htmlFor="isContracted">Supplier Type</Label>
                            <Select
                              value={step1Form.isContracted}
                              onValueChange={(value) => handleStep1SelectChange('isContracted', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select supplier type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Contracted Supplier</SelectItem>
                                <SelectItem value="no">Spot Purchase</SelectItem>
                              </SelectContent>
                            </Select>
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
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact">Contact</Label>
                            <Input
                              id="contact"
                              name="contact"
                              value={step1Form.contact}
                              onChange={handleStep1InputChange}
                              placeholder="Phone or email"
                            />
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-3 gap-4">
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
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* LPO and Dates */}
                        <div className="grid grid-cols-3 gap-4">
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
                    </div>

                    <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
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
                        Create & Send Order
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    {/* Quick Send Actions */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-blue-800">Quick Send Actions</h4>
                          <p className="text-sm text-blue-600">
                            Send order notifications to all suppliers awaiting confirmation
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendBulkMessages('whatsapp')}
                            className="gap-2 hover:bg-green-50"
                          >
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            Bulk WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendBulkMessages('email')}
                            className="gap-2 hover:bg-blue-50"
                          >
                            <Mail className="h-4 w-4 text-blue-600" />
                            Bulk Email
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Individual Orders Table */}
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Order Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>LPO</TableHead>
                            <TableHead className="text-right">Send Order</TableHead>
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
                                    {order.contact}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={order.supplierType === 'farmer' ? 'farmer' : 'outline'}>
                                    {order.supplierType}
                                  </Badge>
                                </TableCell>
                                <TableCell>{order.cropName || '-'}</TableCell>
                                <TableCell>{order.quantityOrdered}t</TableCell>
                                <TableCell>
                                  {new Date(order.deliveryDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {order.lpoNumber || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSendOrder(order, 'whatsapp')}
                                      title="Send via WhatsApp"
                                      className="h-8 w-8 p-0 hover:bg-green-50"
                                      disabled={!order.contact}
                                    >
                                      <MessageSquare className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSendOrder(order, 'email')}
                                      title="Send via Email"
                                      className="h-8 w-8 p-0 hover:bg-blue-50"
                                      disabled={!order.contact || !order.contact.includes('@')}
                                    >
                                      <Mail className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSendOrder(order, 'call')}
                                      title="Call Supplier"
                                      className="h-8 w-8 p-0 hover:bg-purple-50"
                                      disabled={!order.contact}
                                    >
                                      <Phone className="h-4 w-4 text-purple-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const message = `Hello ${order.supplierName},\n\nYour procurement order has been created:\n\n📋 **Order Details**\n• Order #${order.id}\n• Crop: ${order.cropName}\n• Quantity: ${order.quantityOrdered} tons\n• Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}\n• LPO: ${order.lpoNumber}\n\n✅ **Please confirm receipt**\n\nBest regards,\nProcurement Team`;
                                        navigator.clipboard.writeText(message);
                                        toast.success('Order details copied to clipboard');
                                      }}
                                      className="h-8"
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy Details
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openStep2Dialog(order)}
                                      className="ml-2"
                                    >
                                      <ClipboardCheck className="h-4 w-4 mr-2" />
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
                                {order.supplierName}
                                {order.isContracted && (
                                  <Badge variant="outline" className="ml-2 text-xs">Contracted</Badge>
                                )}
                              </TableCell>
                              <TableCell>{order.quantityOrdered}t</TableCell>
                              <TableCell>
                                {new Date(order.deliveryDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{order.lpoNumber || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openStep2Dialog(order)}
                                  >
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    Record Receipt
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openNotesDialog(order)}
                                  >
                                    <FileText className="h-4 w-4" />
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
                      disabled={orders.length === 0}
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
                <EmptyState />
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
                            <TableRow key={order.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                #{order.id}
                                {order.lpoNumber && (
                                  <div className="text-xs text-muted-foreground">
                                    {order.lpoNumber}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.supplierName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.sourceType === 'farmer' ? 'Farmer' : 'Aggregator'}
                                  {order.isContracted && ' • Contracted'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.sourceType === 'farmer' ? 'farmer' : 'outline'}>
                                  {order.sourceType}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.cropName}</TableCell>
                              <TableCell className="text-center font-medium">
                                {order.quantityOrdered}t
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
                                      onClick={() => openStep2Dialog(order)}
                                      className="h-8 px-2"
                                    >
                                      <ClipboardCheck className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPaymentDialog(order)}
                                    className="h-8 px-2"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openNotesDialog(order)}
                                    className="h-8 px-2"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(order)}
                                    className="h-8 px-2"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Step 2: Record Goods Receipt</DialogTitle>
            <DialogDescription>
              Update when goods are delivered to warehouse
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid gap-4">
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

              {step2Form.quantityRejected > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-700">
                      Rejected: {step2Form.quantityRejected}t
                    </span>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason (if any)</Label>
                <Select
                  value={step2Form.rejectionReason}
                  onValueChange={(value) => handleStep2SelectChange('rejectionReason', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No rejection</SelectItem>
                    <SelectItem value="poor_quality">Poor Quality</SelectItem>
                    <SelectItem value="wrong_variety">Wrong Variety</SelectItem>
                    <SelectItem value="contamination">Contamination</SelectItem>
                    <SelectItem value="moisture_high">High Moisture</SelectItem>
                    <SelectItem value="delayed_delivery">Delayed Delivery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsStep2DialogOpen(false);
              resetStep2Form();
            }}>
              Cancel
            </Button>
            <Button onClick={handleRecordGoodsReceipt}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Record Goods Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment information for order
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid gap-4">
              {selectedOrderForPayment && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    Order #{selectedOrderForPayment.id} - {selectedOrderForPayment.supplierName}
                  </p>
                  <p className="text-sm text-blue-600">
                    Amount Due: KES {(selectedOrderForPayment.quantityAccepted * selectedOrderForPayment.pricePerUnit).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={paymentForm.paymentStatus}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentStatus: value }))}
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
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Payment Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentInputChange}
                  placeholder="Additional payment notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Record notes or reasoning for decisions
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid gap-4">
              {selectedOrderForNotes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Order #{selectedOrderForNotes.id} - {selectedOrderForNotes.supplierName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {selectedOrderForNotes.goodsReceived ? 'Goods Received' : 'Ordered'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="orderNotes">Notes</Label>
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
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotes}>
              <CheckCircle className="h-4 w-4 mr-2" />
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
