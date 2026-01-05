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
  Copy,
  MapPin,
  Sprout,
  RefreshCw
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
      console.log('🔄 Fetching procurement data...');
      
      // Fetch all data in parallel
      const [ordersData, farmersData, aggregatorsData, allocationsData] = await Promise.all([
        apiService.procurement.getOrders(),
        apiService.farmers.getAll(),
        apiService.aggregators.getAll(),
        apiService.supply.getAllocations() // CRITICAL: Get allocations from backend
      ]);
      
      console.log('📊 Data fetched:', {
        orders: ordersData?.length || 0,
        farmers: farmersData?.length || 0,
        aggregators: aggregatorsData?.length || 0,
        allocations: allocationsData?.length || 0
      });
      
      setOrders(ordersData || []);
      setFarmers(farmersData || []);
      setAggregators(aggregatorsData || []);
      setSupplyAllocations(allocationsData || []);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load procurement data');
      // Initialize empty arrays on error
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

  // Debug data status
  useEffect(() => {
    if (!loading) {
      console.log('📊 Procurement Data Status:', {
        orders: orders.length,
        farmers: farmers.length,
        aggregators: aggregators.length,
        supplyAllocations: supplyAllocations.length,
        farmersWithAllocations: getFarmersWithAllocations().length
      });
      
      if (supplyAllocations.length > 0) {
        console.log('📋 Sample supply allocation:', supplyAllocations[0]);
      }
    }
  }, [loading, orders, farmers, aggregators, supplyAllocations]);

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

  // Get farmers with scheduled supply allocations (for dropdown)
  const getFarmersWithAllocations = () => {
    console.log('🔄 Getting farmers with allocations:', {
      farmers: farmers.length,
      allocations: supplyAllocations.length,
      scheduledAllocations: supplyAllocations.filter(a => a.status === 'scheduled').length
    });
    
    if (!supplyAllocations.length || !farmers.length) {
      console.log('⚠️ No allocations or farmers available');
      return [];
    }
    
    // Get allocations that are scheduled and not yet converted to orders
    const availableAllocations = supplyAllocations.filter(allocation => 
      allocation.status === 'scheduled'
    );
    
    console.log('📅 Available allocations:', availableAllocations.length);
    
    // Get farmer IDs from allocations
    const allocatedFarmerIds = availableAllocations.map(a => a.farmerId);
    console.log('👨‍🌾 Farmer IDs with allocations:', allocatedFarmerIds);
    
    // Filter farmers who have allocations
    const farmersWithAllocations = farmers
      .filter(farmer => allocatedFarmerIds.includes(farmer.id))
      .map(farmer => {
        const farmerAllocations = availableAllocations.filter(a => 
          a.farmerId.toString() === farmer.id.toString()
        );
        console.log(`Farmer ${farmer.name} has ${farmerAllocations.length} allocations`);
        
        return {
          ...farmer,
          allocations: farmerAllocations
        };
      });
    
    console.log('✅ Farmers with allocations:', farmersWithAllocations.length);
    return farmersWithAllocations;
  };

  // Handle Step 1 form input changes
  const handleStep1InputChange = (e) => {
    const { name, value } = e.target;
    setStep1Form(prev => ({ ...prev, [name]: value }));
  };

  // Handle Step 1 select changes
  const handleStep1SelectChange = (name, value) => {
    console.log('📝 Select change:', name, value);
    setStep1Form(prev => ({ ...prev, [name]: value }));
    
    if (name === 'supplierType') {
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
    
    // When farmer is selected, auto-fill their details
    if (name === 'farmerId' && value) {
      console.log('👨‍🌾 Farmer selected:', value);
      
      const farmer = farmers.find(f => f.id.toString() === value.toString());
      console.log('Found farmer:', farmer);
      
      if (farmer) {
        // Find allocation for this farmer
        const allocation = supplyAllocations.find(a => 
          a.farmerId.toString() === farmer.id.toString() && 
          a.status === 'scheduled'
        );
        
        console.log('Found allocation:', allocation);
        
        setStep1Form(prev => ({
          ...prev,
          supplierName: farmer.name || '',
          supplierContact: farmer.contact || '',
          supplierPhone: farmer.phone || '',
          supplierEmail: farmer.email || '',
          isContracted: 'yes',
          cropName: farmer.crop || '',
          quantityOrdered: allocation?.quantity?.toString() || '',
          deliveryDate: allocation?.date ? new Date(allocation.date).toISOString().split('T')[0] : '',
          pricePerUnit: '15000', // Default price
          lpoNumber: `LPO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`
        }));
      }
    }
    
    // When aggregator is selected, auto-fill their details
    if (name === 'aggregatorId' && value) {
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
        const farmer = farmers.find(f => f.id.toString() === step1Form.farmerId.toString());
        if (farmer) {
          newOrder.farmerId = farmer.id;
          newOrder.farmerContractNumber = farmer.contractNumber;
          newOrder.farmerCounty = farmer.county;
          newOrder.supplierPhone = farmer.phone || '';
          newOrder.supplierEmail = farmer.email || '';
          
          // Mark the allocation as used (convert to in-progress)
          const allocation = supplyAllocations.find(a => 
            a.farmerId.toString() === farmer.id.toString() && 
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

      // Add aggregator-specific data
      if (step1Form.supplierType === 'aggregator' && step1Form.aggregatorId) {
        newOrder.aggregatorId = parseInt(step1Form.aggregatorId);
      }

      // Save to backend
      const createdOrder = await apiService.procurement.createOrder(newOrder);
      
      toast.success('Order created successfully! You can now send notifications to the supplier.');
      setIsStep1DialogOpen(false);
      resetStep1Form();
      
      // Refresh data
      await fetchData();
      
      // Switch to Step 1 tab to see the new order
      setActiveTab('step1');
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  // Action buttons for sending order notifications
  const handleSendOrder = (order, method) => {
    if (!order.supplierPhone && !order.supplierEmail) {
      toast.error('Supplier contact information not available');
      return;
    }
    
    const orderDetails = `
Order Details:
• Order #${order.id}
• Crop: ${order.cropName}
• Quantity: ${order.quantityOrdered} tons
• Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}
• LPO: ${order.lpoNumber}
• Price per ton: KES ${order.pricePerUnit?.toLocaleString()}
• Total Value: KES ${(order.quantityOrdered * order.pricePerUnit).toLocaleString()}`;

    const message = `Hello ${order.supplierName},

Your procurement order has been created:

${orderDetails}

✅ **Please confirm receipt**:
• Acknowledge receipt of this order
• Confirm delivery timeline
• Contact us for any questions

Best regards,
Procurement Team`;
    
    switch (method) {
      case 'email':
        if (order.supplierEmail) {
          const subject = `Procurement Order #${order.id} - ${order.cropName}`;
          window.open(`mailto:${order.supplierEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`);
          toast.success(`Email opened for ${order.supplierName}`);
        } else {
          toast.error('Supplier email not available');
        }
        break;
      case 'whatsapp':
        if (order.supplierPhone) {
          const phoneNumber = order.supplierPhone.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            const whatsappMessage = `Hello ${order.supplierName},\n\nYour procurement order #${order.id} has been created.\n\n${orderDetails}\n\nPlease confirm receipt.\n\nBest regards,\nProcurement Team`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`);
            toast.success(`Opening WhatsApp for ${order.supplierName}`);
          } else {
            toast.error('Invalid phone number format');
          }
        } else {
          toast.error('Supplier phone number not available');
        }
        break;
      case 'call':
        if (order.supplierPhone) {
          const phoneNumber = order.supplierPhone.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            window.open(`tel:${phoneNumber}`);
            toast.success(`Initiating call to ${order.supplierName}`);
          } else {
            toast.error('Invalid phone number format');
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
        updatedAt: new Date().toISOString(),
        notes: order.notes ? `${order.notes}\n\nGoods Receipt: ${step2Form.notes}` : `Goods Receipt: ${step2Form.notes}`
      };

      // If this is a farmer order, update the allocation status
      if (order.farmerId) {
        const allocation = supplyAllocations.find(a => 
          a.farmerId.toString() === order.farmerId.toString() && 
          (a.status === 'in-progress' || a.status === 'scheduled')
        );
        if (allocation) {
          await apiService.supply.updateAllocation(allocation.id, {
            ...allocation,
            status: 'completed',
            deliveredQuantity: quantityAccepted,
            rejectedQuantity: quantityRejected
          });
        }
      }

      // Update order in backend
      await apiService.procurement.updateOrder(order.id, updatedOrder);
      
      toast.success('Goods receipt recorded successfully');
      setIsStep2DialogOpen(false);
      resetStep2Form();
      
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
        updatedAt: new Date().toISOString(),
        notes: order.notes ? `${order.notes}\n\nPayment Update: ${paymentForm.notes}` : `Payment Update: ${paymentForm.notes}`
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Payment status updated successfully');
      setIsPaymentDialogOpen(false);
      setSelectedOrderForPayment(null);
      
      // Refresh data
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
        notes: order.notes ? `${order.notes}\n\n${new Date().toLocaleString()}: ${notesForm.notes}` : `${new Date().toLocaleString()}: ${notesForm.notes}`,
        updatedAt: new Date().toISOString()
      };

      await apiService.procurement.updateOrder(order.id, updatedOrder);
      toast.success('Notes updated successfully');
      setIsNotesDialogOpen(false);
      setSelectedOrderForNotes(null);
      
      // Refresh data
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
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error deleting order:', error);
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
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
        <Clock className="h-3 w-3" />
        Ordered
      </Badge>;
    }
    
    if (order.quantityAccepted === 0) {
      return <Badge variant="destructive" className="gap-1">
        <PackageX className="h-3 w-3" />
        Rejected
      </Badge>;
    } else if (order.quantityAccepted < order.quantityDelivered) {
      return <Badge variant="warning" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Partial
      </Badge>;
    } else {
      return <Badge variant="success" className="gap-1">
        <PackageCheck className="h-3 w-3" />
        Received
      </Badge>;
    }
  };

  // Payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>;
      case 'partial':
        return <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial
        </Badge>;
      default:
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
    }
  };

  // Get contact info for display
  const getContactInfo = (order) => {
    const info = [];
    if (order.supplierPhone) info.push({ type: 'phone', value: order.supplierPhone });
    if (order.supplierEmail) info.push({ type: 'email', value: order.supplierEmail });
    return info;
  };

  // Empty state component
  const EmptyState = ({ message, action }) => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Procurement Orders Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>
      <Button onClick={action}>
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
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={fetchData}
                    title="Refresh data from backend"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Dialog open={isStep1DialogOpen} onOpenChange={(open) => {
                    setIsStep1DialogOpen(open);
                    if (open) {
                      fetchData();
                    }
                  }}>
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
                            <select
                              id="supplierType"
                              name="supplierType"
                              value={step1Form.supplierType}
                              onChange={(e) => handleStep1SelectChange('supplierType', e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="farmer">Farmer (From Supply Planning)</option>
                              <option value="aggregator">Aggregator</option>
                              <option value="external">External Supplier</option>
                            </select>
                            {step1Form.supplierType === 'farmer' && (
                              <p className="text-xs text-green-600">
                                ✓ Farmers with scheduled supply allocations will appear here
                              </p>
                            )}
                          </div>

                          {/* Farmer Selection - Only show if supplier type is farmer */}
                          {step1Form.supplierType === 'farmer' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="farmer">Select Farmer *</Label>
                                
                                {/* Debug info */}
                                <div className="text-xs bg-blue-50 p-2 rounded mb-2">
                                  <span className="font-medium">Available:</span> {getFarmersWithAllocations().length} farmers with scheduled allocations
                                </div>
                                
                                <select
                                  id="farmer"
                                  name="farmerId"
                                  value={step1Form.farmerId}
                                  onChange={(e) => {
                                    console.log('Selected farmer ID:', e.target.value);
                                    handleStep1SelectChange('farmerId', e.target.value);
                                  }}
                                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  required={step1Form.supplierType === 'farmer'}
                                >
                                  <option value="">-- Choose a farmer with scheduled supply --</option>
                                  {getFarmersWithAllocations().length === 0 ? (
                                    <option value="" disabled>
                                      {farmers.length === 0 
                                        ? 'No farmers available. Add farmers first.' 
                                        : 'No farmers with scheduled supply allocations. Go to Supply Planning to allocate farmers.'}
                                    </option>
                                  ) : (
                                    getFarmersWithAllocations().map(farmer => (
                                      <option key={farmer.id} value={farmer.id}>
                                        🌾 {farmer.name} | {farmer.crop || 'Crop'} | {farmer.county || 'Location'} 
                                        {farmer.allocations?.length > 0 && ` (${farmer.allocations.length} scheduled)`}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              
                              {step1Form.farmerId && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Available Supply Allocations:
                                  </p>
                                  {getFarmersWithAllocations()
                                    .find(f => f.id.toString() === step1Form.farmerId.toString())
                                    ?.allocations?.map(allocation => (
                                      <div key={allocation.id} className="text-sm text-green-600 mb-1 pl-2">
                                        <div className="flex items-center justify-between">
                                          <span>
                                            • {new Date(allocation.date).toLocaleDateString('en-US', { 
                                              weekday: 'short', 
                                              month: 'short', 
                                              day: 'numeric' 
                                            })}
                                          </span>
                                          <span className="font-medium bg-green-100 px-2 py-0.5 rounded text-xs">
                                            {allocation.quantity || 'N/A'} tons
                                          </span>
                                        </div>
                                        {allocation.notes && (
                                          <p className="text-xs text-green-500 pl-2">Note: {allocation.notes}</p>
                                        )}
                                      </div>
                                    ))
                                  }
                                  <p className="text-xs text-green-600 mt-2">
                                    This information is pre-filled from Supply Planning
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Aggregator Selection */}
                          {step1Form.supplierType === 'aggregator' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="aggregator">Select Aggregator *</Label>
                                <select
                                  id="aggregator"
                                  name="aggregatorId"
                                  value={step1Form.aggregatorId}
                                  onChange={(e) => handleStep1SelectChange('aggregatorId', e.target.value)}
                                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">-- Choose an aggregator --</option>
                                  {aggregators.length === 0 ? (
                                    <option value="" disabled>No aggregators available</option>
                                  ) : (
                                    aggregators.map(aggregator => (
                                      <option key={aggregator.id} value={aggregator.id}>
                                        👥 {aggregator.name} | {aggregator.type} | {aggregator.county || 'Location'}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="isContracted">Contracted? *</Label>
                                <select
                                  id="isContracted"
                                  name="isContracted"
                                  value={step1Form.isContracted}
                                  onChange={(e) => handleStep1SelectChange('isContracted', e.target.value)}
                                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="yes">Yes (Contracted)</option>
                                  <option value="no">No (Spot Purchase)</option>
                                </select>
                              </div>
                            </>
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
                              <Label htmlFor="supplierPhone" className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                Phone *
                              </Label>
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
                              <Label htmlFor="supplierEmail" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email
                              </Label>
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
                            <TableHead>Contact</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>LPO</TableHead>
                            <TableHead className="text-center">Send Order</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders
                            .filter(order => !order.goodsReceived)
                            .map(order => {
                              const contactInfo = getContactInfo(order);
                              return (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{order.supplierName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.supplierType === 'farmer' ? 'Farmer' : 'Aggregator'}
                                      {order.isContracted && ' • Contracted'}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {contactInfo.length > 0 ? (
                                        contactInfo.map((info, index) => (
                                          <div key={index} className="flex items-center gap-1 text-sm">
                                            {info.type === 'phone' ? (
                                              <Phone className="h-3 w-3 text-blue-600" />
                                            ) : (
                                              <Mail className="h-3 w-3 text-green-600" />
                                            )}
                                            <span className={info.type === 'phone' ? 'text-blue-600' : 'text-green-600'}>
                                              {info.value}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-sm text-muted-foreground">No contact</span>
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
                                    <div className="text-xs text-muted-foreground">
                                      KES {(order.quantityOrdered * order.pricePerUnit).toLocaleString()}
                                    </div>
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
                                  <TableCell>
                                    <div className="flex justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSendOrder(order, 'whatsapp')}
                                        title="Send via WhatsApp"
                                        className="h-8 w-8 p-0 hover:bg-green-50"
                                        disabled={!order.supplierPhone}
                                      >
                                        <MessageSquare className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSendOrder(order, 'email')}
                                        title="Send via Email"
                                        className="h-8 w-8 p-0 hover:bg-blue-50"
                                        disabled={!order.supplierEmail}
                                      >
                                        <Mail className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSendOrder(order, 'call')}
                                        title="Call Supplier"
                                        className="h-8 w-8 p-0 hover:bg-purple-50"
                                        disabled={!order.supplierPhone}
                                      >
                                        <Phone className="h-4 w-4 text-purple-600" />
                                      </Button>
                                    </div>
                                    <div className="text-xs text-center mt-1 text-muted-foreground">
                                      {order.supplierPhone || order.supplierEmail ? 'Click to send' : 'No contact'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const message = `Order #${order.id}\nSupplier: ${order.supplierName}\nCrop: ${order.cropName}\nQuantity: ${order.quantityOrdered}t\nDelivery: ${new Date(order.deliveryDate).toLocaleDateString()}\nLPO: ${order.lpoNumber}`;
                                          navigator.clipboard.writeText(message);
                                          toast.success('Order details copied');
                                        }}
                                        className="h-8"
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openStep2Dialog(order)}
                                      >
                                        <ClipboardCheck className="h-4 w-4 mr-2" />
                                        Receipt
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
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
                                {order.isContracted && (
                                  <Badge variant="outline" className="mt-1 text-xs">Contracted</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.quantityOrdered}t</div>
                                <div className="text-xs text-muted-foreground">
                                  KES {(order.quantityOrdered * order.pricePerUnit).toLocaleString()}
                                </div>
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
                <EmptyState 
                  message="Start your procurement process by creating your first order in Step 1."
                  action={() => setActiveTab('step1')}
                />
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
                                  {order.farmerId ? 'Farmer' : order.aggregatorId ? 'Aggregator' : 'External'}
                                  {order.isContracted && ' • Contracted'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.farmerId ? 'farmer' : 'outline'}>
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
                                <div className="text-xs text-muted-foreground">
                                  KES {(order.quantityOrdered * order.pricePerUnit).toLocaleString()}
                                </div>
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
                                      title="Record Goods Receipt"
                                    >
                                      <ClipboardCheck className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPaymentDialog(order)}
                                    className="h-8 px-2"
                                    title="Update Payment"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openNotesDialog(order)}
                                    className="h-8 px-2"
                                    title="Add Notes"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(order)}
                                    className="h-8 px-2"
                                    title="Delete Order"
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
              {step2Form.orderId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    Recording receipt for Order #{step2Form.orderId}
                  </p>
                </div>
              )}

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
                <select
                  id="rejectionReason"
                  name="rejectionReason"
                  value={step2Form.rejectionReason}
                  onChange={(e) => handleStep2SelectChange('rejectionReason', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={paymentForm.paymentStatus}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              This action cannot be undone and will remove:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Order record</li>
                <li>Payment information</li>
                <li>Delivery records</li>
                <li>Associated notes</li>
              </ul>
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
