// src/pages/Procurement.jsx - FIXED VERSION
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
  RefreshCw,
  Bug
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
  const [debugData, setDebugData] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  
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
        apiService.supply.getAllocations()
      ]);
      
      // Log the data
      console.log('📊 Farmers loaded:', farmersData?.length);
      console.log('📊 Allocations loaded:', allocationsData?.length);
      console.log('📊 Farmers sample:', farmersData?.[0]);
      console.log('📊 Allocations sample:', allocationsData?.[0]);
      
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

  // SIMPLIFIED: Get farmers with scheduled supply allocations
  const getFarmersWithAllocations = () => {
    console.log('=== getFarmersWithAllocations() called ===');
    console.log('Farmers count:', farmers.length);
    console.log('Allocations count:', supplyAllocations.length);
    
    if (!supplyAllocations?.length || !farmers?.length) {
      console.log('No data available');
      return [];
    }

    // Filter allocations with status 'scheduled'
    const scheduledAllocations = supplyAllocations.filter(a => a?.status === 'scheduled');
    console.log('Scheduled allocations:', scheduledAllocations.length);
    
    // Get unique farmer IDs from scheduled allocations
    const farmerIds = [...new Set(scheduledAllocations.map(a => a?.farmerId))];
    console.log('Farmer IDs with scheduled allocations:', farmerIds);
    
    // Filter farmers who have scheduled allocations
    const result = farmers.filter(farmer => 
      farmerIds.includes(farmer?.id)
    ).map(farmer => {
      const allocations = scheduledAllocations.filter(a => a?.farmerId === farmer?.id);
      return {
        ...farmer,
        allocations: allocations
      };
    });
    
    console.log('Result farmers with allocations:', result.length);
    console.log('Result details:', result);
    console.log('===========================================');
    
    return result;
  };

  // Handle Step 1 form input changes
  const handleStep1InputChange = (e) => {
    const { name, value } = e.target;
    setStep1Form(prev => ({ ...prev, [name]: value }));
  };

  // Handle Step 1 select changes - SIMPLIFIED AND FIXED
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
      
      // Find the selected farmer
      const farmer = farmers.find(f => f.id?.toString() === value?.toString());
      console.log('Found farmer:', farmer);
      
      if (farmer) {
        // Find scheduled allocation for this farmer
        const allocation = supplyAllocations.find(a => 
          a?.farmerId?.toString() === farmer?.id?.toString() && 
          a?.status === 'scheduled'
        );
        
        console.log('Found allocation:', allocation);
        
        // Auto-fill the form with farmer and allocation data
        setStep1Form(prev => ({
          ...prev,
          supplierName: farmer.name || '',
          supplierContact: farmer.contact || '', // Contact person name
          supplierPhone: farmer.phone || '', // Phone number
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
      const aggregator = aggregators.find(a => a?.id?.toString() === value?.toString());
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
        const farmer = farmers.find(f => f?.id?.toString() === step1Form.farmerId?.toString());
        if (farmer) {
          newOrder.farmerId = farmer.id;
          newOrder.farmerContractNumber = farmer.contractNumber;
          newOrder.farmerCounty = farmer.county;
          newOrder.supplierPhone = farmer.phone || '';
          newOrder.supplierEmail = farmer.email || '';
          
          // Mark the allocation as used (convert to in-progress)
          const allocation = supplyAllocations.find(a => 
            a?.farmerId?.toString() === farmer?.id?.toString() && 
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
      case 'sms':
        if (order.supplierPhone) {
          const phoneNumber = order.supplierPhone.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            const smsMessage = `Hello ${order.supplierName}, your procurement order #${order.id} has been created. ${orderDetails}`;
            window.open(`sms:${phoneNumber}?body=${encodeURIComponent(smsMessage)}`);
            toast.success(`Opening SMS for ${order.supplierName}`);
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

      const order = orders.find(o => o?.id?.toString() === step2Form.orderId?.toString());
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
          a?.farmerId?.toString() === order.farmerId?.toString() && 
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
      const order = orders.find(o => o?.id?.toString() === paymentForm.orderId?.toString());
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
      const order = orders.find(o => o?.id?.toString() === notesForm.orderId?.toString());
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
    
