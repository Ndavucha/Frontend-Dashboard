// src/pages/SupplyPlanning.jsx - FIXED WITH LOCALSTORAGE PERSISTENCE (Demand Forecast Tab Removed)
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
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Mail,
  Phone,
  PackageCheck,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Users,
  ShoppingCart,
  DollarSign,
  Info,
  Scale,
  Plus,
  Edit,
  Trash2,
  Target,
  Database
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Storage keys
const STORAGE_KEYS = {
  DEMANDS: 'supply_planning_demands',
  ALLOCATIONS: 'supply_planning_allocations'
};

export default function SupplyPlanning() {
  const [allocations, setAllocations] = useState([]);
  const [demandForecast, setDemandForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const [isAddDemandDialogOpen, setIsAddDemandDialogOpen] = useState(false);
  const [isEditDemandDialogOpen, setIsEditDemandDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [orderForm, setOrderForm] = useState({
    orderQuantity: '',
    orderNotes: ''
  });
  
  const [supplementForm, setSupplementForm] = useState({
    quantity: '',
    urgency: 'medium',
    notes: ''
  });

  const [demandForm, setDemandForm] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    cropType: 'Potatoes',
    variety: '',
    specifications: '',
    notes: ''
  });

  // Crop options
  const cropOptions = [
    'Potatoes',
    'Irish Potatoes',
    'Sweet Potatoes',
    'Other'
  ];

  // ==================== LOCALSTORAGE HELPERS ====================
  
  // Save demands to localStorage
  const saveDemandsToLocalStorage = (demands) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(demands));
      console.log('💾 Saved demands to localStorage:', demands.length);
    } catch (error) {
      console.error('Error saving demands to localStorage:', error);
    }
  };

  // Load demands from localStorage
  const loadDemandsFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMANDS);
      const demands = saved ? JSON.parse(saved) : [];
      console.log('📂 Loaded demands from localStorage:', demands.length);
      return demands;
    } catch (error) {
      console.error('Error loading demands from localStorage:', error);
      return [];
    }
  };

  // Save allocations to localStorage
  const saveAllocationsToLocalStorage = (allocationsData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(allocationsData));
      console.log('💾 Saved allocations to localStorage:', allocationsData.length);
    } catch (error) {
      console.error('Error saving allocations to localStorage:', error);
    }
  };

  // Load allocations from localStorage
  const loadAllocationsFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS);
      const allocationsData = saved ? JSON.parse(saved) : [];
      console.log('📂 Loaded allocations from localStorage:', allocationsData.length);
      return allocationsData;
    } catch (error) {
      console.error('Error loading allocations from localStorage:', error);
      return [];
    }
  };

  // Clear all localStorage data (for testing)
  const clearLocalStorageData = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.DEMANDS);
      localStorage.removeItem(STORAGE_KEYS.ALLOCATIONS);
      setDemandForecast([]);
      setAllocations([]);
      toast.success('Local storage cleared! Refresh the page to see changes.');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // ==================== API HELPERS ====================
  
  // Try to sync with API (optional - for when backend is available)
  const syncWithBackend = async () => {
    try {
      const localDemands = loadDemandsFromLocalStorage();
      
      if (localDemands.length > 0) {
        // Try to sync local demands to backend
        for (const demand of localDemands) {
          try {
            // Check if demand exists in backend
            const existingDemand = await apiService.procurement.getDemandById?.(demand.id);
            if (!existingDemand) {
              await apiService.procurement.createDemand(demand);
              console.log('🔄 Synced demand to backend:', demand.id);
            }
          } catch (err) {
            console.log('Backend sync failed for demand:', demand.id);
          }
        }
      }
      
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success('Data synced with localStorage');
    } catch (error) {
      console.log('Backend sync not available - using localStorage only');
    }
  };

  // ==================== DATA FETCHING ====================
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // First, load from localStorage for immediate display
      const localDemands = loadDemandsFromLocalStorage();
      const localAllocations = loadAllocationsFromLocalStorage();
      
      setDemandForecast(localDemands);
      setAllocations(localAllocations);
      
      // Try to fetch from API and merge (optional - enhances data but doesn't replace)
      try {
        const [allocationsResponse, demandResponse] = await Promise.all([
          apiService.supply.getAllocations(),
          apiService.procurement.getDemandForecast(30)
        ]);
        
        const apiAllocations = Array.isArray(allocationsResponse) ? allocationsResponse : [];
        const apiDemands = Array.isArray(demandResponse) ? demandResponse : [];
        
        // Merge API data with localStorage (localStorage takes priority for demands)
        if (apiDemands.length > 0 && localDemands.length === 0) {
          // If localStorage is empty but API has data, use API data
          setDemandForecast(apiDemands);
          saveDemandsToLocalStorage(apiDemands);
        }
        
        if (apiAllocations.length > 0) {
          setAllocations(apiAllocations);
          saveAllocationsToLocalStorage(apiAllocations);
        }
        
        console.log('✅ Data loaded from API and localStorage');
      } catch (apiError) {
        console.log('⚠️ API fetch failed, using localStorage only');
        // We already have localStorage data, so continue
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Fallback to localStorage
      const savedDemands = loadDemandsFromLocalStorage();
      const savedAllocations = loadAllocationsFromLocalStorage();
      
      if (savedDemands.length > 0 || savedAllocations.length > 0) {
        setDemandForecast(savedDemands);
        setAllocations(savedAllocations);
        toast.info('Loaded saved data from browser storage');
      } else {
        toast.error('Failed to load supply planning data');
        setDemandForecast([]);
        setAllocations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==================== DEMAND MANAGEMENT ====================
  
  // Calculate supply-demand balance based on actual data
  const calculateSupplyDemandBalance = () => {
    const balanceData = [];
    
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

    // Use actual demand forecasts
    if (demandForecast.length > 0) {
      demandForecast.forEach(demand => {
        const dateKey = new Date(demand.date).toISOString().split('T')[0];
        const dailyAllocations = allocationsByDate[dateKey] || [];
        
        const totalSupply = dailyAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
        const totalDemand = demand.quantity || 0;
        const balance = totalSupply - totalDemand;
        
        balanceData.push({
          id: demand.id,
          date: demand.date,
          dateKey,
          demand: totalDemand,
          supply: totalSupply,
          balance,
          status: balance === 0 ? 'met' : balance < 0 ? 'shortage' : 'oversupply',
          allocations: dailyAllocations,
          cropType: demand.cropType || 'Potatoes',
          variety: demand.variety || '',
          specifications: demand.specifications || '',
          notes: demand.notes
        });
      });
    }

    // Sort by date
    return balanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Handle demand form input changes
  const handleDemandInputChange = (e) => {
    const { name, value } = e.target;
    setDemandForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset demand form
  const resetDemandForm = () => {
    setDemandForm({
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      cropType: 'Potatoes',
      variety: '',
      specifications: '',
      notes: ''
    });
  };

  // Add new demand - WITH LOCALSTORAGE PERSISTENCE
  const handleAddDemand = async () => {
    try {
      if (!demandForm.date) {
        toast.error('Please select a date');
        return;
      }

      if (!demandForm.quantity || parseFloat(demandForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      // Check if demand already exists for this specific date
      const existingDemand = demandForecast.find(d => {
        const demandDate = new Date(d.date).toISOString().split('T')[0];
        const formDate = demandForm.date;
        return demandDate === formDate;
      });

      if (existingDemand) {
        toast.error(`Demand already exists for ${demandForm.date}. Please edit the existing demand instead.`);
        return;
      }

      const newDemand = {
        id: Date.now(), // Create local ID
        date: demandForm.date,
        quantity: parseFloat(demandForm.quantity),
        cropType: demandForm.cropType,
        variety: demandForm.variety,
        specifications: demandForm.specifications,
        notes: demandForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try API if available (optional)
      let createdDemand = newDemand;
      try {
        createdDemand = await apiService.procurement.createDemand(newDemand);
        console.log('✅ Saved to API:', createdDemand);
      } catch (apiError) {
        console.log('⚠️ API save failed, saving locally only');
        toast.warning('Saved locally only (API unavailable)');
      }
      
      // Always update local state and localStorage
      const updatedDemands = [...demandForecast, createdDemand];
      setDemandForecast(updatedDemands);
      saveDemandsToLocalStorage(updatedDemands);
      
      toast.success(`Demand added for ${demandForm.date}!`);
      setIsAddDemandDialogOpen(false);
      resetDemandForm();
      
    } catch (error) {
      console.error('Error adding demand:', error);
      toast.error('Failed to add demand');
    }
  };

  // Open edit demand dialog
  const openEditDemandDialog = (demand) => {
    setSelectedDemand(demand);
    setDemandForm({
      date: new Date(demand.date).toISOString().split('T')[0],
      quantity: demand.quantity.toString(),
      cropType: demand.cropType || 'Potatoes',
      variety: demand.variety || '',
      specifications: demand.specifications || '',
      notes: demand.notes || ''
    });
    setIsEditDemandDialogOpen(true);
  };

  // Update demand - WITH LOCALSTORAGE PERSISTENCE
  const handleUpdateDemand = async () => {
    try {
      if (!selectedDemand) return;

      if (!demandForm.date) {
        toast.error('Please select a date');
        return;
      }

      if (!demandForm.quantity || parseFloat(demandForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      // Check if changing date and new date already has demand (excluding current)
      if (demandForm.date !== selectedDemand.date) {
        const existingDemand = demandForecast.find(d => 
          d.id !== selectedDemand.id && 
          new Date(d.date).toISOString().split('T')[0] === demandForm.date
        );

        if (existingDemand) {
          toast.error(`Demand already exists for ${demandForm.date}`);
          return;
        }
      }

      const updatedDemand = {
        ...selectedDemand,
        date: demandForm.date,
        quantity: parseFloat(demandForm.quantity),
        cropType: demandForm.cropType,
        variety: demandForm.variety,
        specifications: demandForm.specifications,
        notes: demandForm.notes,
        updatedAt: new Date().toISOString()
      };

      // Try API if available (optional)
      try {
        await apiService.procurement.updateDemand(selectedDemand.id, updatedDemand);
        console.log('✅ Updated in API:', updatedDemand.id);
      } catch (apiError) {
        console.log('⚠️ API update failed, updating locally only');
        toast.warning('Updated locally only (API unavailable)');
      }
      
      // Always update local state and localStorage
      const updatedDemands = demandForecast.map(d => 
        d.id === selectedDemand.id ? updatedDemand : d
      );
      setDemandForecast(updatedDemands);
      saveDemandsToLocalStorage(updatedDemands);
      
      toast.success('Demand updated successfully!');
      setIsEditDemandDialogOpen(false);
      resetDemandForm();
      
    } catch (error) {
      console.error('Error updating demand:', error);
      toast.error('Failed to update demand');
    }
  };

  // Delete demand - WITH LOCALSTORAGE PERSISTENCE
  const handleDeleteDemand = async (demandId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this demand?')) {
        return;
      }

      // Try API if available (optional)
      try {
        await apiService.procurement.deleteDemand(demandId);
        console.log('✅ Deleted from API:', demandId);
      } catch (apiError) {
        console.log('⚠️ API delete failed, deleting locally only');
        toast.warning('Deleted locally only (API unavailable)');
      }
      
      // Always update local state and localStorage
      const updatedDemands = demandForecast.filter(d => d.id !== demandId);
      setDemandForecast(updatedDemands);
      saveDemandsToLocalStorage(updatedDemands);
      
      toast.success('Demand deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting demand:', error);
      toast.error('Failed to delete demand');
    }
  };

  // ==================== UI HELPERS ====================
  
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
        return <Badge variant="success" className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
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

      try {
        await apiService.procurement.requestSupplement(supplementForm);
      } catch (apiError) {
        console.log('API supplement request failed, saving locally');
      }
      
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
      
      try {
        await apiService.procurement.createOrder(orderData);
      } catch (apiError) {
        console.log('API order creation failed');
      }
      
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
        {/* Data Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>
              {demandForecast.length} demand entries saved • 
              {lastSyncTime ? ` Last sync: ${lastSyncTime}` : ' Local storage active'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const saved = localStorage.getItem(STORAGE_KEYS.DEMANDS);
                const demands = saved ? JSON.parse(saved) : [];
                toast.info(`Found ${demands.length} saved demands in browser storage`);
                console.log('Saved demands:', demands);
              }}
            >
              <Info className="h-4 w-4 mr-2" />
              Check Storage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearLocalStorageData}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Demand Input Section */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Demand Input</CardTitle>
              </div>
              <Button 
                size="sm"
                onClick={() => setIsAddDemandDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Daily Demand
              </Button>
            </div>
            <CardDescription>
              Input daily demand forecasts to plan supply requirements
            </CardDescription>
          </CardHeader>
          
          {demandForecast.length > 0 ? (
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Specifications</TableHead>
                      <TableHead>Quantity (tons)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demandForecast.map((demand) => (
                      <TableRow key={demand.id} className="hover:bg-green-50/50">
                        <TableCell className="font-medium">
                          {formatDate(demand.date)}
                        </TableCell>
                        <TableCell>{demand.cropType || 'Potatoes'}</TableCell>
                        <TableCell>{demand.variety || '-'}</TableCell>
                        <TableCell>
                          {demand.specifications ? (
                            <Badge variant="outline" className="bg-green-50">
                              {demand.specifications}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="font-bold">
                          {demand.quantity} tons
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {demand.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDemandDialog(demand)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDemand(demand.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No demand entries yet</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => setIsAddDemandDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Demand
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views - Demand Forecast Tab Removed */}
        <Tabs defaultValue="balance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balance">Supply-Demand Balance</TabsTrigger>
            <TabsTrigger value="supply">Demand/Supply Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="balance">
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
                      Add demand forecasts to see supply-demand balance.
                    </p>
                    <Button onClick={() => setIsAddDemandDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Demand
                    </Button>
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
                          <React.Fragment key={item.dateKey}>
                            <TableRow className="hover:bg-muted/30">
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
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Farmer Contributions for {formatDate(item.date)}
                                      </h4>
                                      {item.id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditDemandDialog({
                                            id: item.id,
                                            date: item.date,
                                            quantity: item.demand,
                                            cropType: item.cropType,
                                            variety: item.variety,
                                            specifications: item.specifications,
                                            notes: item.notes
                                          })}
                                          className="h-8 text-xs"
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit Demand
                                        </Button>
                                      )}
                                    </div>
                                    
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
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supply">
            <Card>
              <CardHeader>
                <CardTitle>Supply Schedule</CardTitle>
                <CardDescription>
                  View all planned farmer allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allocations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No supply allocations yet</p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.href = '/farmers'}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Go to Farmers
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Farmer</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead>Quantity (tons)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocations.map((allocation, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(allocation.date)}</TableCell>
                            <TableCell className="font-medium">{allocation.farmerName}</TableCell>
                            <TableCell>{allocation.farmerCounty}</TableCell>
                            <TableCell>{allocation.farmerCrop}</TableCell>
                            <TableCell>{allocation.quantity} tons</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Scheduled
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAllocation(allocation);
                                  setOrderForm({
                                    orderQuantity: allocation.quantity.toString(),
                                    orderNotes: ''
                                  });
                                  setIsOrderDialogOpen(true);
                                }}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Order
                              </Button>
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
        </Tabs>

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
                          style={{ width: `${balanceData.length > 0 ? (shortageDays / balanceData.length) * 100 : 0}%` }}
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
                          style={{ width: `${balanceData.length > 0 ? (metDays / balanceData.length) * 100 : 0}%` }}
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
                  onClick={() => setIsAddDemandDialogOpen(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add Demand Forecast
                </Button>
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
                  onClick={() => window.location.href = '/farmers'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Go to Farmers
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
                  Data Persistence Info
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Data is saved automatically in your browser</li>
                  <li>✓ Data persists even after closing the browser</li>
                  <li>✓ Data is not lost when navigating between pages</li>
                  <li>✓ Clear data button removes all saved entries</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Demand Dialog */}
      <Dialog open={isAddDemandDialogOpen} onOpenChange={setIsAddDemandDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Daily Demand</DialogTitle>
            <DialogDescription>
              Input demand forecast for a specific date
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={demandForm.date}
                onChange={handleDemandInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (tons) *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={demandForm.quantity}
                onChange={handleDemandInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type</Label>
              <Select
                value={demandForm.cropType}
                onValueChange={(value) => setDemandForm(prev => ({ ...prev, cropType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                name="variety"
                value={demandForm.variety}
                onChange={handleDemandInputChange}
                placeholder="e.g., Shangi, Unica, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Size/Specifications</Label>
              <Input
                id="specifications"
                name="specifications"
                value={demandForm.specifications}
                onChange={handleDemandInputChange}
                placeholder="e.g., 60mm and above, Grade A, etc."
              />
              <p className="text-xs text-muted-foreground">
                Enter size requirements or quality specifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={demandForm.notes}
                onChange={handleDemandInputChange}
                placeholder="Additional notes about this demand..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsAddDemandDialogOpen(false);
              resetDemandForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddDemand} disabled={!demandForm.quantity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Demand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Demand Dialog */}
      <Dialog open={isEditDemandDialogOpen} onOpenChange={setIsEditDemandDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Demand</DialogTitle>
            <DialogDescription>
              Update demand forecast
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={demandForm.date}
                onChange={handleDemandInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity (tons) *</Label>
              <Input
                id="edit-quantity"
                name="quantity"
                type="number"
                value={demandForm.quantity}
                onChange={handleDemandInputChange}
                placeholder="Enter quantity"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cropType">Crop Type</Label>
              <Select
                value={demandForm.cropType}
                onValueChange={(value) => setDemandForm(prev => ({ ...prev, cropType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-variety">Variety</Label>
              <Input
                id="edit-variety"
                name="variety"
                value={demandForm.variety}
                onChange={handleDemandInputChange}
                placeholder="e.g., Shangi, Unica, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specifications">Size/Specifications</Label>
              <Input
                id="edit-specifications"
                name="specifications"
                value={demandForm.specifications}
                onChange={handleDemandInputChange}
                placeholder="e.g., 60mm and above, Grade A, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={demandForm.notes}
                onChange={handleDemandInputChange}
                placeholder="Additional notes about this demand..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditDemandDialogOpen(false);
              resetDemandForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDemand} disabled={!demandForm.quantity}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Demand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Order Dialog */}
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

      {/* Supplement Request Dialog */}
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
