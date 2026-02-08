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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Package,
  PackageCheck,
  PackageX,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
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
  Sprout,
  DollarSign,
  FileText,
  Eye,
  CheckSquare,
  User,
  Globe,
  ShoppingBag,
  Leaf
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [allocations, setAllocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [farmMallFarmers, setFarmMallFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const [isAggregatorDialogOpen, setIsAggregatorDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isManualOrderDialogOpen, setIsManualOrderDialogOpen] = useState(false);
  const [isFarmMallOrderDialogOpen, setIsFarmMallOrderDialogOpen] = useState(false);
  const [selectedAggregator, setSelectedAggregator] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [farmersPerPage] = useState(6);
  
  const [supplementForm, setSupplementForm] = useState({
    quantity: '',
    urgency: 'medium',
    notes: ''
  });
  const [receiveForm, setReceiveForm] = useState({
    dateReceived: new Date().toISOString().split('T')[0],
    quantityDelivered: '',
    quantityAccepted: '',
    quantityRejected: '',
    rejectionReason: '',
    receiver: '',
    price: ''
  });
  const [manualOrderForm, setManualOrderForm] = useState({
    supplierName: '',
    supplierType: 'external',
    supplierContact: '',
    crop: '',
    quantity: '',
    price: '',
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [farmMallOrderForm, setFarmMallOrderForm] = useState({
    crop: '',
    quantity: '',
    price: '',
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Dummy FarmMall farmers data (simulating API response)
  const dummyFarmMallFarmers = [
    {
      id: 'fm001',
      name: 'Green Valley Farmers Co-op',
      type: 'Cooperative',
      county: 'Nakuru',
      crops: ['Maize', 'Wheat', 'Potatoes'],
      rating: 4.8,
      totalSales: 1250,
      priceRange: 'KES 45,000 - 52,000 per ton',
      availability: 'High',
      deliveryRadius: 'Countrywide',
      contact: '+254 712 345 678',
      verified: true,
      featured: true,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm002',
      name: 'John Kamau',
      type: 'Individual Farmer',
      county: 'Meru',
      crops: ['Coffee', 'Avocado', 'Bananas'],
      rating: 4.5,
      totalSales: 320,
      priceRange: 'KES 80,000 - 95,000 per ton',
      availability: 'Medium',
      deliveryRadius: 'Central Region',
      contact: '+254 723 456 789',
      verified: true,
      featured: false,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm003',
      name: 'Eldoret Grain Traders',
      type: 'Aggregator',
      county: 'Uasin Gishu',
      crops: ['Maize', 'Barley', 'Sorghum'],
      rating: 4.7,
      totalSales: 2850,
      priceRange: 'KES 42,000 - 48,000 per ton',
      availability: 'High',
      deliveryRadius: 'Countrywide',
      contact: '+254 734 567 890',
      verified: true,
      featured: true,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm004',
      name: 'Mama Shamba Fresh Produce',
      type: 'Smallholder Group',
      county: 'Kiambu',
      crops: ['Tomatoes', 'Onions', 'Cabbage'],
      rating: 4.3,
      totalSales: 540,
      priceRange: 'KES 35,000 - 42,000 per ton',
      availability: 'Medium',
      deliveryRadius: 'Nairobi & Central',
      contact: '+254 745 678 901',
      verified: false,
      featured: false,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm005',
      name: 'Rift Valley Horticulture',
      type: 'Commercial Farm',
      county: 'Naivasha',
      crops: ['Flowers', 'Vegetables', 'Herbs'],
      rating: 4.9,
      totalSales: 1820,
      priceRange: 'KES 65,000 - 85,000 per ton',
      availability: 'Low',
      deliveryRadius: 'International',
      contact: '+254 756 789 012',
      verified: true,
      featured: true,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm006',
      name: 'Coastal Farmers Alliance',
      type: 'Cooperative',
      county: 'Mombasa',
      crops: ['Coconuts', 'Cashews', 'Mangoes'],
      rating: 4.2,
      totalSales: 890,
      priceRange: 'KES 55,000 - 70,000 per ton',
      availability: 'High',
      deliveryRadius: 'Coastal Region',
      contact: '+254 767 890 123',
      verified: true,
      featured: false,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm007',
      name: 'Peter Omondi',
      type: 'Individual Farmer',
      county: 'Kisumu',
      crops: ['Rice', 'Fish', 'Vegetables'],
      rating: 4.4,
      totalSales: 210,
      priceRange: 'KES 38,000 - 45,000 per ton',
      availability: 'High',
      deliveryRadius: 'Lake Region',
      contact: '+254 778 901 234',
      verified: false,
      featured: false,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm008',
      name: 'Mount Kenya Tea Growers',
      type: 'Cooperative',
      county: 'Nyeri',
      crops: ['Tea', 'Coffee', 'Dairy'],
      rating: 4.6,
      totalSales: 1560,
      priceRange: 'KES 75,000 - 90,000 per ton',
      availability: 'Medium',
      deliveryRadius: 'Countrywide',
      contact: '+254 789 012 345',
      verified: true,
      featured: true,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm009',
      name: 'Maasai Mara Livestock',
      type: 'Group Ranch',
      county: 'Narok',
      crops: ['Livestock', 'Maize', 'Beans'],
      rating: 4.1,
      totalSales: 670,
      priceRange: 'KES 50,000 - 60,000 per ton',
      availability: 'Medium',
      deliveryRadius: 'Rift Valley',
      contact: '+254 790 123 456',
      verified: true,
      featured: false,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 'fm010',
      name: 'Western Kenya Cereals',
      type: 'Aggregator',
      county: 'Kakamega',
      crops: ['Maize', 'Beans', 'Sorghum'],
      rating: 4.7,
      totalSales: 1980,
      priceRange: 'KES 40,000 - 46,000 per ton',
      availability: 'High',
      deliveryRadius: 'Western Region',
      contact: '+254 701 234 567',
      verified: true,
      featured: true,
      image: 'https://via.placeholder.com/100'
    }
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [allocationsResponse, ordersResponse, aggregatorsResponse] = await Promise.all([
        apiService.supply.getAllocations(),
        apiService.procurement.getOrders(),
        apiService.aggregators.getAll()
      ]);
      
      setAllocations(Array.isArray(allocationsResponse) ? allocationsResponse : []);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setAggregators(Array.isArray(aggregatorsResponse) ? aggregatorsResponse : []);
      
      // Set dummy FarmMall farmers
      setFarmMallFarmers(dummyFarmMallFarmers);
      setFilteredFarmers(dummyFarmMallFarmers);
      
    } catch (error) {
      console.error('Error fetching procurement data:', error);
      toast.error('Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter farmers based on search and filters
  useEffect(() => {
    let filtered = farmMallFarmers;

    if (searchQuery) {
      filtered = filtered.filter(farmer =>
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.crops.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase())) ||
        farmer.county.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCrop !== 'all') {
      filtered = filtered.filter(farmer =>
        farmer.crops.some(crop => crop.toLowerCase() === selectedCrop.toLowerCase())
      );
    }

    if (selectedCounty !== 'all') {
      filtered = filtered.filter(farmer =>
        farmer.county.toLowerCase() === selectedCounty.toLowerCase()
      );
    }

    setFilteredFarmers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCrop, selectedCounty, farmMallFarmers]);

  // Get unique crops and counties for filters
  const uniqueCrops = Array.from(new Set(farmMallFarmers.flatMap(f => f.crops)));
  const uniqueCounties = Array.from(new Set(farmMallFarmers.map(f => f.county)));

  // Pagination logic
  const indexOfLastFarmer = currentPage * farmersPerPage;
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(filteredFarmers.length / farmersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate metrics
  const calculateMetrics = () => {
    const activeAllocations = allocations.filter(a => 
      a.status === 'scheduled' || a.status === 'in-progress'
    );
    
    const completedAllocations = allocations.filter(a => a.status === 'completed');
    const totalAllocated = activeAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const totalCompleted = completedAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'ordered');
    const receivedOrders = orders.filter(o => o.status === 'received');
    const totalOrdered = orders.reduce((sum, o) => sum + (o.quantityOrdered || 0), 0);
    const totalReceived = receivedOrders.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);
    const totalRejected = receivedOrders.reduce((sum, o) => sum + (o.quantityRejected || 0), 0);
    
    const deficit = Math.max(0, totalAllocated - totalReceived);
    const deficitPercentage = totalAllocated > 0 ? (deficit / totalAllocated) * 100 : 0;
    const acceptanceRate = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
    
    const totalPaid = orders.filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const totalPending = orders.filter(o => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    
    const upcomingAllocations = activeAllocations.filter(a => {
      if (!a.date) return false;
      const allocationDate = new Date(a.date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return allocationDate >= today && allocationDate <= nextWeek;
    });
    
    return {
      totalAllocated: totalAllocated.toFixed(1),
      totalOrdered: totalOrdered.toFixed(1),
      totalReceived: totalReceived.toFixed(1),
      totalRejected: totalRejected.toFixed(1),
      deficit: deficit.toFixed(1),
      deficitPercentage: deficitPercentage.toFixed(1),
      acceptanceRate: acceptanceRate.toFixed(1),
      pendingOrders: pendingOrders.length,
      receivedOrders: receivedOrders.length,
      totalPaid: totalPaid.toFixed(2),
      totalPending: totalPending.toFixed(2),
      totalUpcoming: upcomingAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0).toFixed(1),
      upcomingCount: upcomingAllocations.length
    };
  };

  // Handle receive goods
  const handleReceiveGoods = (order) => {
    setSelectedOrder(order);
    setReceiveForm({
      dateReceived: new Date().toISOString().split('T')[0],
      quantityDelivered: order.quantityOrdered?.toString() || '',
      quantityAccepted: order.quantityOrdered?.toString() || '',
      quantityRejected: '0',
      rejectionReason: '',
      receiver: localStorage.getItem('user_name') || '',
      price: order.price?.toString() || ''
    });
    setIsReceiveDialogOpen(true);
  };

  // Submit receive goods
  const handleSubmitReceiveGoods = async () => {
    try {
      if (!selectedOrder) return;
      
      const delivered = parseFloat(receiveForm.quantityDelivered);
      const accepted = parseFloat(receiveForm.quantityAccepted);
      const rejected = parseFloat(receiveForm.quantityRejected);
      
      if (delivered !== (accepted + rejected)) {
        toast.error('Delivered quantity must equal accepted + rejected');
        return;
      }

      const receiveData = {
        ...receiveForm,
        quantityDelivered: delivered,
        quantityAccepted: accepted,
        quantityRejected: rejected
      };

      // Update order status
      const updatedOrder = {
        ...selectedOrder,
        status: 'received',
        dateReceived: receiveForm.dateReceived,
        quantityDelivered: delivered,
        quantityAccepted: accepted,
        quantityRejected: rejected,
        rejectionReason: receiveForm.rejectionReason,
        receiver: receiveForm.receiver,
        price: parseFloat(receiveForm.price) || selectedOrder.price,
        updatedAt: new Date().toISOString()
      };

      await apiService.procurement.updateOrder(selectedOrder.id, updatedOrder);
      
      toast.success('Goods received successfully!');
      setIsReceiveDialogOpen(false);
      setSelectedOrder(null);
      setReceiveForm({
        dateReceived: '',
        quantityDelivered: '',
        quantityAccepted: '',
        quantityRejected: '',
        rejectionReason: '',
        receiver: '',
        price: ''
      });
      
      fetchData();
      
    } catch (error) {
      console.error('Error receiving goods:', error);
      toast.error('Failed to record goods receipt');
    }
  };

  // Create manual order
  const handleCreateManualOrder = async () => {
    try {
      const orderData = {
        ...manualOrderForm,
        quantity: parseFloat(manualOrderForm.quantity),
        price: parseFloat(manualOrderForm.price),
        status: 'pending',
        source: 'manual',
        createdAt: new Date().toISOString()
      };

      await apiService.procurement.createOrder(orderData);
      
      toast.success('Manual order created successfully!');
      setIsManualOrderDialogOpen(false);
      setManualOrderForm({
        supplierName: '',
        supplierType: 'external',
        supplierContact: '',
        crop: '',
        quantity: '',
        price: '',
        expectedDeliveryDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      fetchData();
      
    } catch (error) {
      console.error('Error creating manual order:', error);
      toast.error('Failed to create manual order');
    }
  };

  // Create FarmMall order
  const handleCreateFarmMallOrder = async () => {
    try {
      if (!selectedFarmer) return;
      
      const orderData = {
        supplierName: selectedFarmer.name,
        supplierType: selectedFarmer.type.toLowerCase().includes('aggregator') ? 'aggregator' : 'farmmall',
        supplierContact: selectedFarmer.contact,
        crop: farmMallOrderForm.crop || selectedFarmer.crops[0],
        quantity: parseFloat(farmMallOrderForm.quantity),
        price: parseFloat(farmMallOrderForm.price) || 0,
        status: 'pending',
        source: 'farmmall',
        expectedDeliveryDate: farmMallOrderForm.expectedDeliveryDate,
        notes: farmMallOrderForm.notes,
        farmerDetails: {
          id: selectedFarmer.id,
          county: selectedFarmer.county,
          rating: selectedFarmer.rating,
          deliveryRadius: selectedFarmer.deliveryRadius
        },
        createdAt: new Date().toISOString()
      };

      await apiService.procurement.createOrder(orderData);
      
      toast.success(`Order created with ${selectedFarmer.name}!`);
      setIsFarmMallOrderDialogOpen(false);
      setSelectedFarmer(null);
      setFarmMallOrderForm({
        crop: '',
        quantity: '',
        price: '',
        expectedDeliveryDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      fetchData();
      
    } catch (error) {
      console.error('Error creating FarmMall order:', error);
      toast.error('Failed to create order');
    }
  };

  // Handle FarmMall order dialog opening
  const openFarmMallOrderDialog = (farmer) => {
    setSelectedFarmer(farmer);
    const defaultCrop = farmer.crops[0];
    setFarmMallOrderForm({
      crop: defaultCrop,
      quantity: '',
      price: getCropPrice(farmer, defaultCrop),
      expectedDeliveryDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsFarmMallOrderDialogOpen(true);
  };

  // Helper function to get crop price
  const getCropPrice = (farmer, crop) => {
    // Extract price from price range string (simplified)
    const priceMatch = farmer.priceRange.match(/KES (\d+,\d+)/);
    if (priceMatch) {
      return priceMatch[1].replace(',', '');
    }
    return '45000'; // Default price
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Truck className="h-3 w-3" />
          Ordered
        </Badge>;
      case 'received':
        return <Badge variant="success" className="gap-1">
          <PackageCheck className="h-3 w-3" />
          Received
        </Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1">
          <PackageX className="h-3 w-3" />
          Cancelled
        </Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Get payment badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Get availability badge
  const getAvailabilityBadge = (availability) => {
    switch (availability.toLowerCase()) {
      case 'high':
        return <Badge variant="success" className="gap-1">
          High
        </Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          Medium
        </Badge>;
      case 'low':
        return <Badge variant="destructive" className="gap-1">
          Low
        </Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render star rating
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating}</span>
      </div>
    );
  };

  const metrics = calculateMetrics();

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
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="farmmall" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            FarmMall
          </TabsTrigger>
          <TabsTrigger value="supplement" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Supplement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-fade-in space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-2xl font-bold">{metrics.totalOrdered}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Ordered (tons)</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {orders.length} orders
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
                    {metrics.acceptanceRate}% acceptance
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-amber-600 mr-2" />
                    <p className="text-2xl font-bold">KES {metrics.totalPaid}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-xs text-amber-600 mt-1">
                    KES {metrics.totalPending} pending
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
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              className="w-full"
              onClick={() => setIsManualOrderDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Manual Order
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('farmmall')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse FarmMall
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={fetchData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
              <CardDescription>
                Latest procurement orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No orders yet. Create your first order!</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Supplier</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Expected Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{order.supplierName || order.farmerName}</p>
                              {order.source === 'manual' && (
                                <Badge variant="outline" className="text-xs">Manual</Badge>
                              )}
                              {order.source === 'farmmall' && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  FarmMall
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.crop || order.farmerCrop || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.quantityOrdered ? `${order.quantityOrdered.toFixed(1)}t` : '-'}
                            {order.quantityAccepted && (
                              <div className="text-xs text-green-600">
                                ✓ {order.quantityAccepted.toFixed(1)}t accepted
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(order.expectedDeliveryDate)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentBadge(order.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {order.status === 'ordered' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReceiveGoods(order)}
                                >
                                  <CheckSquare className="h-4 w-4 mr-1" />
                                  Receive
                                </Button>
                              )}
                              {order.status === 'received' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsReceiveDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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

        {/* Orders Tab */}
        <TabsContent value="orders" className="animate-fade-in space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    All Orders
                  </CardTitle>
                  <CardDescription>
                    Manage and track all procurement orders
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
                    onClick={() => setIsManualOrderDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manual Order
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
                    No Orders Yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first procurement order. You can create orders from allocated farmers or manually.
                  </p>
                  <Button onClick={() => setIsManualOrderDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manual Order
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Order ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Ordered (t)</TableHead>
                        <TableHead>Accepted (t)</TableHead>
                        <TableHead>Price (KES)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id?.toString().slice(-6)}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <p>{order.supplierName || order.farmerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.source === 'manual' ? 'External' : 
                                 order.source === 'farmmall' ? 'FarmMall' : 'Farmer'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{order.crop || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {order.quantityOrdered?.toFixed(1) || '-'}
                          </TableCell>
                          <TableCell>
                            {order.quantityAccepted ? (
                              <div className="text-green-600 font-medium">
                                {order.quantityAccepted.toFixed(1)}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {order.price ? (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {order.price.toFixed(2)}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {order.status === 'ordered' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReceiveGoods(order)}
                                  className="h-8 px-3"
                                >
                                  <CheckSquare className="h-4 w-4 mr-1" />
                                  Receive
                                </Button>
                              )}
                              {(order.status === 'received' || order.status === 'cancelled') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsReceiveDialogOpen(true);
                                  }}
                                  className="h-8 px-2"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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

        {/* FarmMall Tab */}
        <TabsContent value="farmmall" className="animate-fade-in space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    FarmMall Marketplace
                  </CardTitle>
                  <CardDescription>
                    Browse farmers and create orders from the FarmMall marketplace
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://farmmall.co.ke', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit FarmMall
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search farmers, crops, counties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Crops" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Crops</SelectItem>
                        {uniqueCrops.map(crop => (
                          <SelectItem key={crop} value={crop.toLowerCase()}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Counties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Counties</SelectItem>
                        {uniqueCounties.map(county => (
                          <SelectItem key={county} value={county.toLowerCase()}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedCrop === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCrop('all')}
                  >
                    All Crops
                  </Badge>
                  {uniqueCrops.slice(0, 8).map(crop => (
                    <Badge
                      key={crop}
                      variant={selectedCrop === crop.toLowerCase() ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCrop(crop.toLowerCase())}
                    >
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Results */}
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredFarmers.length} farmers
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCrop('all');
                      setSelectedCounty('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Farmers Grid */}
              {filteredFarmers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Farmers Found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or clear filters to see all available farmers.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCrop('all');
                    setSelectedCounty('all');
                  }}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    {currentFarmers.map(farmer => (
                      <Card key={farmer.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${farmer.featured ? 'border-primary' : ''}`}>
                        {farmer.featured && (
                          <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 text-center">
                            ⭐ Featured Supplier
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{farmer.name}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {farmer.type}
                                  </Badge>
                                  {farmer.verified && (
                                    <Badge variant="success" className="gap-1 text-xs">
                                      <CheckCircle className="h-3 w-3" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {renderRating(farmer.rating)}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {farmer.county}
                              <span className="mx-2">•</span>
                              <Globe className="h-4 w-4 mr-2 text-gray-400" />
                              {farmer.deliveryRadius}
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1">Available Crops:</p>
                              <div className="flex flex-wrap gap-1">
                                {farmer.crops.map((crop, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Leaf className="h-3 w-3 mr-1" />
                                    {crop}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Price Range</p>
                                <p className="font-medium">{farmer.priceRange}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Availability</p>
                                {getAvailabilityBadge(farmer.availability)}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t">
                              <div className="text-xs text-gray-500">
                                {farmer.totalSales} tons sold
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFarmMallOrderDialog(farmer)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => paginate(i + 1)}
                              isActive={currentPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
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
                      <Button variant="outline" onClick={() => window.location.href = '/aggregators'}>
                        Manage Aggregators
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Current deficit: <span className="font-bold">{metrics.deficit} tons</span>
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
                                  {aggregator.capacity || 0} tons capacity
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Request */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Quick Supplement Request
                </CardTitle>
                <CardDescription>
                  Send supplement request to all available sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Request Options</h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Connected aggregators</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>FarmMall marketplace</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Procurement team alerts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quick-quantity">Quantity Required (tons)</Label>
                    <Input
                      id="quick-quantity"
                      value={supplementForm.quantity}
                      onChange={(e) => setSupplementForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Enter quantity"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quick-urgency">Urgency Level</Label>
                    <Select
                      value={supplementForm.urgency}
                      onValueChange={(value) => setSupplementForm(prev => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Within 2 weeks</SelectItem>
                        <SelectItem value="medium">Medium - Within 1 week</SelectItem>
                        <SelectItem value="high">High - Within 3 days</SelectItem>
                        <SelectItem value="critical">Critical - Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => setIsSupplementDialogOpen(true)}
                    disabled={!supplementForm.quantity}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Request Supplement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Receive Goods Dialog - Made scrollable */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receive Goods</DialogTitle>
            <DialogDescription>
              Record delivery receipt for {selectedOrder?.supplierName || selectedOrder?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Order Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">Supplier:</span>
                      <p className="font-medium">{selectedOrder.supplierName || selectedOrder.farmerName}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Crop:</span>
                      <p>{selectedOrder.crop || selectedOrder.farmerCrop}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Ordered Quantity:</span>
                      <p className="font-medium">{selectedOrder.quantityOrdered?.toFixed(1) || 0} tons</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Order Date:</span>
                      <p>{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateReceived">Date Received *</Label>
                      <Input
                        id="dateReceived"
                        type="date"
                        value={receiveForm.dateReceived}
                        onChange={(e) => setReceiveForm(prev => ({ ...prev, dateReceived: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiver">Receiver *</Label>
                      <Input
                        id="receiver"
                        value={receiveForm.receiver}
                        onChange={(e) => setReceiveForm(prev => ({ ...prev, receiver: e.target.value }))}
                        placeholder="Enter receiver name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityDelivered">Quantity Delivered (tons) *</Label>
                    <Input
                      id="quantityDelivered"
                      type="number"
                      value={receiveForm.quantityDelivered}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReceiveForm(prev => ({ 
                          ...prev, 
                          quantityDelivered: value,
                          quantityAccepted: value,
                          quantityRejected: '0'
                        }));
                      }}
                      placeholder="Enter delivered quantity"
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantityAccepted">Quantity Accepted (tons) *</Label>
                      <Input
                        id="quantityAccepted"
                        type="number"
                        value={receiveForm.quantityAccepted}
                        onChange={(e) => {
                          const accepted = e.target.value;
                          const delivered = parseFloat(receiveForm.quantityDelivered);
                          const rejected = delivered - parseFloat(accepted);
                          setReceiveForm(prev => ({ 
                            ...prev, 
                            quantityAccepted: accepted,
                            quantityRejected: rejected.toFixed(1)
                          }));
                        }}
                        placeholder="Accepted quantity"
                        min="0"
                        max={receiveForm.quantityDelivered}
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantityRejected">Quantity Rejected (tons)</Label>
                      <Input
                        id="quantityRejected"
                        type="number"
                        value={receiveForm.quantityRejected}
                        onChange={(e) => {
                          const rejected = e.target.value;
                          const delivered = parseFloat(receiveForm.quantityDelivered);
                          const accepted = delivered - parseFloat(rejected);
                          setReceiveForm(prev => ({ 
                            ...prev, 
                            quantityRejected: rejected,
                            quantityAccepted: accepted.toFixed(1)
                          }));
                        }}
                        placeholder="Rejected quantity"
                        min="0"
                        max={receiveForm.quantityDelivered}
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                    <Textarea
                      id="rejectionReason"
                      value={receiveForm.rejectionReason}
                      onChange={(e) => setReceiveForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                      placeholder="Reason for rejection (if any)"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per ton (KES)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={receiveForm.price}
                      onChange={(e) => setReceiveForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {parseFloat(receiveForm.quantityRejected) > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-1">Rejection Notice</h4>
                    <p className="text-sm text-red-600">
                      {receiveForm.quantityRejected} tons will be marked as rejected. 
                      Make sure to document the rejection reason.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReceiveGoods} disabled={!receiveForm.quantityDelivered}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Record Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Order Dialog - Made scrollable */}
      <Dialog open={isManualOrderDialogOpen} onOpenChange={setIsManualOrderDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Manual Order</DialogTitle>
            <DialogDescription>
              Create a purchase order not tied to your farmer network
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={manualOrderForm.supplierName}
                  onChange={(e) => setManualOrderForm(prev => ({ ...prev, supplierName: e.target.value }))}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplierType">Supplier Type</Label>
                <Select
                  value={manualOrderForm.supplierType}
                  onValueChange={(value) => setManualOrderForm(prev => ({ ...prev, supplierType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External Supplier</SelectItem>
                    <SelectItem value="aggregator">Aggregator</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierContact">Supplier Contact</Label>
              <Input
                id="supplierContact"
                value={manualOrderForm.supplierContact}
                onChange={(e) => setManualOrderForm(prev => ({ ...prev, supplierContact: e.target.value }))}
                placeholder="Phone or email"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop *</Label>
                <Input
                  id="crop"
                  value={manualOrderForm.crop}
                  onChange={(e) => setManualOrderForm(prev => ({ ...prev, crop: e.target.value }))}
                  placeholder="Enter crop name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (tons) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={manualOrderForm.quantity}
                  onChange={(e) => setManualOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per ton (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={manualOrderForm.price}
                  onChange={(e) => setManualOrderForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery *</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={manualOrderForm.expectedDeliveryDate}
                  onChange={(e) => setManualOrderForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={manualOrderForm.notes}
                onChange={(e) => setManualOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsManualOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateManualOrder}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FarmMall Order Dialog */}
      <Dialog open={isFarmMallOrderDialogOpen} onOpenChange={setIsFarmMallOrderDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Order from FarmMall</DialogTitle>
            <DialogDescription>
              Create a purchase order from {selectedFarmer?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedFarmer && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedFarmer.name}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3" />
                        {selectedFarmer.county}
                        <span className="mx-1">•</span>
                        <span className="text-green-600">{renderRating(selectedFarmer.rating)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">Type:</span>
                      <p>{selectedFarmer.type}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Delivery:</span>
                      <p>{selectedFarmer.deliveryRadius}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Price Range:</span>
                      <p className="font-medium">{selectedFarmer.priceRange}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Availability:</span>
                      <p>{selectedFarmer.availability}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmmall-crop">Crop *</Label>
                    <Select
                      value={farmMallOrderForm.crop}
                      onValueChange={(value) => setFarmMallOrderForm(prev => ({ ...prev, crop: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFarmer.crops.map((crop, index) => (
                          <SelectItem key={index} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmmall-quantity">Quantity (tons) *</Label>
                      <Input
                        id="farmmall-quantity"
                        type="number"
                        value={farmMallOrderForm.quantity}
                        onChange={(e) => setFarmMallOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Enter quantity"
                        min="0.1"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="farmmall-price">Price per ton (KES)</Label>
                      <Input
                        id="farmmall-price"
                        type="number"
                        value={farmMallOrderForm.price}
                        onChange={(e) => setFarmMallOrderForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmmall-expectedDeliveryDate">Expected Delivery *</Label>
                    <Input
                      id="farmmall-expectedDeliveryDate"
                      type="date"
                      value={farmMallOrderForm.expectedDeliveryDate}
                      onChange={(e) => setFarmMallOrderForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmmall-notes">Order Notes</Label>
                    <Textarea
                      id="farmmall-notes"
                      value={farmMallOrderForm.notes}
                      onChange={(e) => setFarmMallOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Quality requirements, delivery instructions..."
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setIsFarmMallOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFarmMallOrder} disabled={!farmMallOrderForm.quantity}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplement Request Dialog - Added for consistency */}
      <Dialog open={isSupplementDialogOpen} onOpenChange={setIsSupplementDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                Total shortage: {metrics.deficit} tons
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
            <Button 
              onClick={() => {
                toast.success(`Supplement request for ${supplementForm.quantity} tons sent!`);
                setIsSupplementDialogOpen(false);
                setSupplementForm({
                  quantity: '',
                  urgency: 'medium',
                  notes: ''
                });
              }} 
              disabled={!supplementForm.quantity}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Request Supplement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
