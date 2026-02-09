// src/pages/Farmers.jsx - UPDATED WITH PROMINENT ADD FARMER BUTTON
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Phone,
  Mail,
  MapPin,
  Sprout,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  CalendarDays,
  Truck,
  Clock,
  PackageCheck,
  XCircle as XCircleIcon,
  Filter,
  Download
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [allocationFilter, setAllocationFilter] = useState('all');
  
  // Crop options with their growing periods
  const cropOptions = [
    { value: 'Shangi', label: 'Shangi', days: 90 },
    { value: 'Annet', label: 'Annet', days: 90 },
    { value: 'Arizona', label: 'Arizona', days: 90 },
    { value: 'Arnova', label: 'Arnova', days: 90 },
    { value: 'Unica', label: 'Unica', days: 90 },
    { value: 'Asante', label: 'Asante', days: 100 },
    { value: 'Tigoni', label: 'Tigoni', days: 100 },
    { value: 'Nyota', label: 'Nyota', days: 100 },
    { value: 'Sherekea', label: 'Sherekea', days: 100 },
    { value: 'Challenger', label: 'Challenger', days: 120 },
    { value: 'Jelly', label: 'Jelly', days: 120 },
    { value: 'Manitou', label: 'Manitou', days: 120 },
    { value: 'Voyager', label: 'Voyager', days: 120 }
  ];

  const [farmerForm, setFarmerForm] = useState({
    name: '',
    gender: 'male',
    age: '',
    location: '',
    county: '',
    crop: '',
    acreage: '',
    estYield: '',
    plantingDate: '',
    harvestingDateEst: '',
    phone: '',
    email: '',
    status: 'active',
    notes: ''
  });

  const [allocationForm, setAllocationForm] = useState({
    quantity: '',
    notes: ''
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching farmers and allocations...');
      
      // Fetch both farmers and allocations
      const [farmersResponse, allocationsResponse] = await Promise.all([
        apiService.farmers.getAll(),
        apiService.supply.getAllocations ? apiService.supply.getAllocations() : Promise.resolve([])
      ]);
      
      console.log('Farmers response:', farmersResponse);
      console.log('Allocations response:', allocationsResponse);
      
      setFarmers(farmersResponse || []);
      setAllocations(allocationsResponse || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setFarmers([]);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate harvesting date based on planting date and crop
  const calculateHarvestingDate = (plantingDate, cropValue) => {
    if (!plantingDate || !cropValue) return '';
    
    const selectedCrop = cropOptions.find(crop => crop.value === cropValue);
    if (!selectedCrop) return '';
    
    const planting = new Date(plantingDate);
    const harvesting = new Date(planting);
    harvesting.setDate(harvesting.getDate() + selectedCrop.days);
    
    return harvesting.toISOString().split('T')[0];
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...farmerForm, [name]: value };
    
    // If planting date or crop changes, recalculate harvesting date
    if (name === 'plantingDate' || name === 'crop') {
      const harvestingDate = calculateHarvestingDate(
        name === 'plantingDate' ? value : farmerForm.plantingDate,
        name === 'crop' ? value : farmerForm.crop
      );
      updatedForm.harvestingDateEst = harvestingDate;
    }
    
    setFarmerForm(updatedForm);
  };

  // Handle allocation form input changes
  const handleAllocationInputChange = (e) => {
    const { name, value } = e.target;
    setAllocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset forms
  const resetForm = () => {
    setFarmerForm({
      name: '',
      gender: 'male',
      age: '',
      location: '',
      county: '',
      crop: '',
      acreage: '',
      estYield: '',
      plantingDate: '',
      harvestingDateEst: '',
      phone: '',
      email: '',
      status: 'active',
      notes: ''
    });
  };

  const resetAllocationForm = () => {
    setAllocationForm({
      quantity: '',
      notes: ''
    });
  };

  // Open allocation dialog for a specific farmer
  const openAllocationDialog = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedDate(new Date());
    resetAllocationForm();
    
    // Pre-fill quantity with estimated yield if available
    if (farmer.estYield) {
      setAllocationForm(prev => ({
        ...prev,
        quantity: farmer.estYield.toString()
      }));
    }
    
    setIsAllocationDialogOpen(true);
  };

  // Submit allocation for the selected farmer
  const handleAllocationSubmit = async () => {
    try {
      if (!selectedFarmer) {
        toast.error('No farmer selected');
        return;
      }

      if (!allocationForm.quantity || parseFloat(allocationForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      // Check if farmer is already allocated for this date
      const isAlreadyAllocated = allocations.some(allocation => 
        allocation.farmerId === selectedFarmer.id && 
        new Date(allocation.date).toDateString() === selectedDate.toDateString()
      );

      if (isAlreadyAllocated) {
        toast.error('This farmer is already allocated for the selected date');
        return;
      }

      // Prepare allocation data
      const newAllocation = {
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name || 'Unknown Farmer',
        farmerCounty: selectedFarmer.county || '',
        farmerCrop: selectedFarmer.crop || 'Not specified',
        farmerPhone: selectedFarmer.phone || '',
        farmerEmail: selectedFarmer.email || '',
        date: selectedDate.toISOString(),
        quantity: parseFloat(allocationForm.quantity),
        notes: allocationForm.notes,
        status: 'scheduled'
      };

      console.log('Creating allocation:', newAllocation);

      // Update farmer's allocation status
      const updatedFarmer = {
        ...selectedFarmer,
        allocationStatus: 'allocated',
        updatedAt: new Date().toISOString()
      };

      // Send allocation to backend
      await Promise.all([
        apiService.supply.createAllocation(newAllocation),
        apiService.farmers.update(selectedFarmer.id, updatedFarmer)
      ]);
      
      toast.success('Farmer allocated successfully! This farmer can now be selected in Procurement.');
      
      // Reset and close dialog
      setIsAllocationDialogOpen(false);
      resetAllocationForm();
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast.error(error.response?.data?.error || 'Failed to allocate farmer');
    }
  };

  // Update farmer allocation status (e.g., mark as harvested)
  const updateAllocationStatus = async (farmerId, newStatus) => {
    try {
      const farmer = farmers.find(f => f.id === farmerId);
      if (!farmer) {
        toast.error('Farmer not found');
        return;
      }

      const updatedFarmer = {
        ...farmer,
        allocationStatus: newStatus,
        updatedAt: new Date().toISOString()
      };

      await apiService.farmers.update(farmerId, updatedFarmer);
      
      // Update local state
      setFarmers(prev => 
        prev.map(f => 
          f.id === farmerId 
            ? { ...f, allocationStatus: newStatus, updatedAt: new Date().toISOString() }
            : f
        )
      );
      
      toast.success(`Allocation status updated to ${newStatus}`);
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Error updating allocation status:', error);
      toast.error('Failed to update allocation status');
    }
  };

  // Add new farmer
  const handleAddFarmer = async () => {
    try {
      // Validate required fields
      if (!farmerForm.name || !farmerForm.location || !farmerForm.crop) {
        toast.error('Please fill in all required fields (Name, Location, Crop)');
        return;
      }

      const farmerData = {
        ...farmerForm,
        age: farmerForm.age ? parseInt(farmerForm.age) : null,
        acreage: farmerForm.acreage ? parseFloat(farmerForm.acreage) : null,
        estYield: farmerForm.estYield ? parseFloat(farmerForm.estYield) : null,
        harvestWindow: farmerForm.plantingDate && farmerForm.harvestingDateEst 
          ? `${farmerForm.plantingDate} to ${farmerForm.harvestingDateEst}`
          : '',
        allocationStatus: 'not-allocated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await apiService.farmers.create(farmerData);
      toast.success('Farmer added successfully!');
      
      await fetchData();
      resetForm();
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error('Error adding farmer:', error);
      toast.error(error.response?.data?.error || 'Failed to add farmer');
    }
  };

  // Open edit dialog
  const openEditDialog = (farmer) => {
    setSelectedFarmer(farmer);
    
    let plantingDate = '';
    let harvestingDateEst = '';
    
    if (farmer.harvestWindow && farmer.harvestWindow.includes('to')) {
      const [start, end] = farmer.harvestWindow.split(' to ');
      plantingDate = start.trim();
      harvestingDateEst = end.trim();
    }
    
    setFarmerForm({
      name: farmer.name || '',
      gender: farmer.gender || 'male',
      age: farmer.age?.toString() || '',
      location: farmer.location || '',
      county: farmer.county || '',
      crop: farmer.crop || '',
      acreage: farmer.acreage?.toString() || '',
      estYield: farmer.estYield?.toString() || '',
      plantingDate,
      harvestingDateEst,
      phone: farmer.phone || '',
      email: farmer.email || '',
      status: farmer.status || 'active',
      notes: farmer.notes || ''
    });
    
    setIsEditDialogOpen(true);
  };

  // Update farmer
  const handleUpdateFarmer = async () => {
    try {
      if (!selectedFarmer) return;

      const updatedData = {
        ...farmerForm,
        age: farmerForm.age ? parseInt(farmerForm.age) : null,
        acreage: farmerForm.acreage ? parseFloat(farmerForm.acreage) : null,
        estYield: farmerForm.estYield ? parseFloat(farmerForm.estYield) : null,
        harvestWindow: farmerForm.plantingDate && farmerForm.harvestingDateEst 
          ? `${farmerForm.plantingDate} to ${farmerForm.harvestingDateEst}`
          : '',
        allocationStatus: selectedFarmer.allocationStatus || 'not-allocated',
        updatedAt: new Date().toISOString()
      };

      await apiService.farmers.update(selectedFarmer.id, updatedData);
      toast.success('Farmer updated successfully!');
      
      await fetchData();
      setIsEditDialogOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Error updating farmer:', error);
      toast.error('Failed to update farmer');
    }
  };

  // Delete farmer
  const handleDeleteFarmer = async (farmerId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this farmer?')) {
        return;
      }

      await apiService.farmers.delete(farmerId);
      toast.success('Farmer deleted successfully!');
      await fetchData();
      
    } catch (error) {
      console.error('Error deleting farmer:', error);
      toast.error('Failed to delete farmer');
    }
  };

  // Filter farmers based on search and filters
  const filteredFarmers = farmers.filter(farmer => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        farmer.name?.toLowerCase().includes(searchLower) ||
        farmer.location?.toLowerCase().includes(searchLower) ||
        farmer.crop?.toLowerCase().includes(searchLower) ||
        farmer.phone?.toLowerCase().includes(searchLower) ||
        farmer.email?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && farmer.status !== statusFilter) {
      return false;
    }
    
    // Allocation filter
    if (allocationFilter !== 'all' && farmer.allocationStatus !== allocationFilter) {
      return false;
    }
    
    return true;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>;
      case 'inactive':
        return <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get allocation status badge with action button
  const getAllocationBadge = (farmer) => {
    const allocationStatus = farmer.allocationStatus || 'not-allocated';
    
    switch (allocationStatus) {
      case 'not-allocated':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600 bg-gray-100">
              Not Allocated
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAllocationDialog(farmer)}
              className="h-7 px-2 text-xs"
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              Allocate
            </Button>
          </div>
        );
      case 'allocated':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 bg-blue-100 gap-1">
              <Clock className="h-3 w-3" />
              Allocated
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateAllocationStatus(farmer.id, 'harvested')}
              className="h-7 px-2 text-xs text-green-600"
            >
              <PackageCheck className="h-3 w-3 mr-1" />
              Mark Harvested
            </Button>
          </div>
        );
      case 'harvested':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 bg-green-100 gap-1">
              <PackageCheck className="h-3 w-3" />
              Harvested
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateAllocationStatus(farmer.id, 'not-allocated')}
              className="h-7 px-2 text-xs text-gray-600"
            >
              <Clock className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Not Allocated</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAllocationDialog(farmer)}
              className="h-7 px-2 text-xs"
            >
              Allocate
            </Button>
          </div>
        );
    }
  };

  // Export farmers data
  const handleExportFarmers = () => {
    try {
      const data = farmers.map(farmer => ({
        'Farmer Name': farmer.name || '',
        'Gender': farmer.gender || '',
        'Age': farmer.age || '',
        'Location': farmer.location || '',
        'County': farmer.county || '',
        'Phone': farmer.phone || '',
        'Email': farmer.email || '',
        'Crop': farmer.crop || '',
        'Acreage': farmer.acreage || '',
        'Estimated Yield': farmer.estYield || '',
        'Harvest Window': farmer.harvestWindow || '',
        'Status': farmer.status || '',
        'Allocation Status': farmer.allocationStatus || 'not-allocated',
        'Notes': farmer.notes || ''
      }));

      // Create CSV content
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(','));
      const csvContent = [headers, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `farmers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Farmers data exported successfully!');
    } catch (error) {
      console.error('Error exporting farmers:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Farmer Management"
        description="View and manage contracted farmers"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading farmers data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Farmer Management"
      description="View and manage contracted farmers. These farmers will be available for supply planning."
    >
      {/* FLOATING ADD BUTTON - Always visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add New Farmer</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contracted Farmers
              </CardTitle>
              <CardDescription>
                {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''} available for supply planning
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search farmers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 pl-9"
                  />
                </div>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Farmer
                </Button>
              </div>
              
              {/* Quick Stats */}
              {farmers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportFarmers}
                    className="h-8 px-2 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                    {farmers.filter(f => f.status === 'active').length} Active
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {farmers.filter(f => f.allocationStatus === 'allocated').length} Allocated
                  </span>
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                    {farmers.filter(f => f.allocationStatus === 'harvested').length} Harvested
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Filter Section */}
          {farmers.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={allocationFilter}
                  onChange={(e) => setAllocationFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Allocation Status</option>
                  <option value="not-allocated">Not Allocated</option>
                  <option value="allocated">Allocated</option>
                  <option value="harvested">Harvested</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setAllocationFilter('all');
                    setSearch('');
                  }}
                  className="h-9 px-3"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {filteredFarmers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {search || statusFilter !== 'all' || allocationFilter !== 'all' 
                  ? 'No matching farmers' 
                  : 'No farmers yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {search || statusFilter !== 'all' || allocationFilter !== 'all' 
                  ? 'No farmers match your current filters or search. Try adjusting your criteria.'
                  : 'Start by adding your first farmer. Farmers you add will appear here and be available for supply planning.'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Farmer
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Farmer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Gender/Age</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Acreage</TableHead>
                    <TableHead>Est. Yield</TableHead>
                    <TableHead>Planting/Harvest</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.map((farmer) => (
                    <TableRow key={farmer.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium">{farmer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {farmer.phone && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Phone className="h-3 w-3" />
                              {farmer.phone}
                            </div>
                          )}
                          {farmer.email && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Mail className="h-3 w-3" />
                              {farmer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="capitalize">{farmer.gender || 'N/A'}</span>
                          {farmer.age && <span> • {farmer.age} yrs</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{farmer.location}</div>
                            {farmer.county && (
                              <div className="text-xs text-muted-foreground">{farmer.county}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Sprout className="h-3 w-3 text-green-600" />
                          {farmer.crop || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {farmer.acreage ? `${farmer.acreage} acres` : '-'}
                      </TableCell>
                      <TableCell>
                        {farmer.estYield ? `${farmer.estYield}t` : '-'}
                      </TableCell>
                      <TableCell>
                        {farmer.harvestWindow ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {farmer.harvestWindow}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {getAllocationBadge(farmer)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(farmer.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(farmer)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFarmer(farmer.id)}
                            className="h-8 px-2 text-red-500 hover:text-red-700"
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
          )}
        </CardContent>
      </Card>

      {/* Add Farmer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Add a new farmer to the system. They will be available for supply planning.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={farmerForm.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={farmerForm.gender}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={farmerForm.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={farmerForm.location}
                  onChange={handleInputChange}
                  placeholder="Town/Village"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  name="county"
                  value={farmerForm.county}
                  onChange={handleInputChange}
                  placeholder="County"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={farmerForm.phone}
                  onChange={handleInputChange}
                  placeholder="+254712345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={farmerForm.email}
                  onChange={handleInputChange}
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop">Primary Crop *</Label>
              <select
                id="crop"
                name="crop"
                value={farmerForm.crop}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a crop</option>
                <optgroup label="90 days growing period">
                  <option value="Shangi">Shangi</option>
                  <option value="Annet">Annet</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Arnova">Arnova</option>
                  <option value="Unica">Unica</option>
                </optgroup>
                <optgroup label="100 days growing period">
                  <option value="Asante">Asante</option>
                  <option value="Tigoni">Tigoni</option>
                  <option value="Nyota">Nyota</option>
                  <option value="Sherekea">Sherekea</option>
                </optgroup>
                <optgroup label="120 days growing period">
                  <option value="Challenger">Challenger</option>
                  <option value="Jelly">Jelly</option>
                  <option value="Manitou">Manitou</option>
                  <option value="Voyager">Voyager</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acreage">Acreage (acres)</Label>
                <Input
                  id="acreage"
                  name="acreage"
                  type="number"
                  step="0.1"
                  value={farmerForm.acreage}
                  onChange={handleInputChange}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estYield">Estimated Yield (tons)</Label>
                <Input
                  id="estYield"
                  name="estYield"
                  type="number"
                  step="0.1"
                  value={farmerForm.estYield}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={farmerForm.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  name="plantingDate"
                  type="date"
                  value={farmerForm.plantingDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harvestingDateEst">Harvesting Date (Estimated)</Label>
                <Input
                  id="harvestingDateEst"
                  name="harvestingDateEst"
                  type="date"
                  value={farmerForm.harvestingDateEst}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Calculated based on planting date and crop growing period
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={farmerForm.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this farmer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddFarmer}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Farmer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update farmer information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={farmerForm.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <select
                  id="edit-gender"
                  name="gender"
                  value={farmerForm.gender}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  name="age"
                  type="number"
                  value={farmerForm.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={farmerForm.location}
                  onChange={handleInputChange}
                  placeholder="Town/Village"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-county">County</Label>
                <Input
                  id="edit-county"
                  name="county"
                  value={farmerForm.county}
                  onChange={handleInputChange}
                  placeholder="County"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={farmerForm.phone}
                  onChange={handleInputChange}
                  placeholder="+254712345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={farmerForm.email}
                  onChange={handleInputChange}
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-crop">Primary Crop *</Label>
              <select
                id="edit-crop"
                name="crop"
                value={farmerForm.crop}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a crop</option>
                <optgroup label="90 days growing period">
                  <option value="Shangi">Shangi</option>
                  <option value="Annet">Annet</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Arnova">Arnova</option>
                  <option value="Unica">Unica</option>
                </optgroup>
                <optgroup label="100 days growing period">
                  <option value="Asante">Asante</option>
                  <option value="Tigoni">Tigoni</option>
                  <option value="Nyota">Nyota</option>
                  <option value="Sherekea">Sherekea</option>
                </optgroup>
                <optgroup label="120 days growing period">
                  <option value="Challenger">Challenger</option>
                  <option value="Jelly">Jelly</option>
                  <option value="Manitou">Manitou</option>
                  <option value="Voyager">Voyager</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-acreage">Acreage (acres)</Label>
                <Input
                  id="edit-acreage"
                  name="acreage"
                  type="number"
                  step="0.1"
                  value={farmerForm.acreage}
                  onChange={handleInputChange}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-estYield">Estimated Yield (tons)</Label>
                <Input
                  id="edit-estYield"
                  name="estYield"
                  type="number"
                  step="0.1"
                  value={farmerForm.estYield}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  name="status"
                  value={farmerForm.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plantingDate">Planting Date</Label>
                <Input
                  id="edit-plantingDate"
                  name="plantingDate"
                  type="date"
                  value={farmerForm.plantingDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-harvestingDateEst">Harvesting Date (Estimated)</Label>
                <Input
                  id="edit-harvestingDateEst"
                  name="harvestingDateEst"
                  type="date"
                  value={farmerForm.harvestingDateEst}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Calculated based on planting date and crop growing period
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={farmerForm.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this farmer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFarmer}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Farmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={(open) => {
        setIsAllocationDialogOpen(open);
        if (!open) {
          resetAllocationForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Allocate Farmer for Supply</DialogTitle>
            <DialogDescription>
              Allocate {selectedFarmer?.name} for supply delivery on a specific date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            {selectedFarmer && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Farmer Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Name:</span>
                      <p>{selectedFarmer.name}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Crop:</span>
                      <p>{selectedFarmer.crop || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Location:</span>
                      <p>{selectedFarmer.location}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Estimated Yield:</span>
                      <p>{selectedFarmer.estYield ? `${selectedFarmer.estYield}t` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Delivery Date *</Label>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (tons) *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={allocationForm.quantity}
                    onChange={handleAllocationInputChange}
                    placeholder="Enter quantity"
                    min="0.1"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This allocation will appear in Procurement for order creation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={allocationForm.notes}
                    onChange={handleAllocationInputChange}
                    placeholder="Additional notes for procurement team..."
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAllocationSubmit}
              disabled={!allocationForm.quantity}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
