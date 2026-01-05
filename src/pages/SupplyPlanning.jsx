// src/pages/SupplyPlanning.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Plus,
  CheckCircle,
  X,
  Clock,
  PackageCheck,
  XCircle,
  Users, 
  Edit,
  Truck,          
  Package,        
  MapPin,         
  Sprout 
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function SupplyPlanning() {
  const [activeTab, setActiveTab] = useState('supply');
  const [farmers, setFarmers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allocationForm, setAllocationForm] = useState({
    farmerId: '',
    quantity: '',
    notes: ''
  });
  const [editForm, setEditForm] = useState({
    id: '',
    quantity: '',
    notes: '',
    status: 'scheduled'
  });
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both farmers and allocations from backend
      const [farmersResponse, allocationsResponse] = await Promise.all([
        apiService.farmers.getAll(),
        apiService.supply.getAllocations()
      ]);
      
      setFarmers(farmersResponse || []);
      setAllocations(allocationsResponse || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load supply planning data');
      setFarmers([]);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle allocation form input changes
  const handleAllocationInputChange = (e) => {
    const { name, value } = e.target;
    setAllocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // SIMPLER VERSION: Get all farmers for dropdown (no filtering by date)
  const getAvailableFarmers = () => {
    // Return ALL farmers for simplicity
    return farmers;
  };

  // Submit new allocation to backend
  const handleAllocationSubmit = async () => {
    try {
      // Validate form
      if (!allocationForm.farmerId) {
        toast.error('Please select a farmer');
        return;
      }

      if (!allocationForm.quantity || parseFloat(allocationForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      // Find selected farmer
      const selectedFarmer = farmers.find(f => f.id === parseInt(allocationForm.farmerId));
      if (!selectedFarmer) {
        toast.error('Selected farmer not found');
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

      // Prepare allocation data for backend
      const newAllocation = {
        farmerId: parseInt(allocationForm.farmerId),
        farmerName: selectedFarmer.name,
        farmerCounty: selectedFarmer.county,
        farmerCrop: selectedFarmer.crop || 'Not specified',
        farmerContact: selectedFarmer.contact || '',
        farmerPhone: selectedFarmer.phone || '',
        farmerEmail: selectedFarmer.email || '',
        date: selectedDate.toISOString(),
        quantity: parseFloat(allocationForm.quantity),
        notes: allocationForm.notes,
        status: 'scheduled'
      };

      // Send to backend API
      const savedAllocation = await apiService.supply.createAllocation(newAllocation);
      
      // Update local state
      setAllocations(prev => [...prev, savedAllocation]);
      toast.success('Supply allocated successfully! This farmer can now be selected in Procurement.');
      
      // Reset form and close dialog
      setAllocationForm({
        farmerId: '',
        quantity: '',
        notes: ''
      });
      setIsAllocationDialogOpen(false);
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast.error(error.response?.data?.error || 'Failed to allocate supply');
    }
  };

  // Update allocation status
  const handleStatusUpdate = async (allocationId, newStatus) => {
    try {
      const allocation = allocations.find(a => a.id === allocationId);
      if (!allocation) {
        toast.error('Allocation not found');
        return;
      }

      // Update in backend
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
      await fetchData();
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Open edit dialog
  const openEditDialog = (allocation) => {
    setSelectedAllocation(allocation);
    setEditForm({
      id: allocation.id,
      quantity: allocation.quantity.toString(),
      notes: allocation.notes || '',
      status: allocation.status
    });
    setIsEditDialogOpen(true);
  };

  // Save edited allocation
  const handleEditAllocation = async () => {
    try {
      if (!editForm.quantity || parseFloat(editForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      const allocation = allocations.find(a => a.id === editForm.id);
      if (!allocation) {
        toast.error('Allocation not found');
        return;
      }

      const updatedAllocation = {
        ...allocation,
        quantity: parseFloat(editForm.quantity),
        notes: editForm.notes,
        status: editForm.status,
        updatedAt: new Date().toISOString()
      };

      // Update in backend
      await apiService.supply.updateAllocation(editForm.id, updatedAllocation);
      
      // Update local state
      setAllocations(prev => 
        prev.map(a => 
          a.id === editForm.id 
            ? updatedAllocation
            : a
        )
      );
      
      toast.success('Allocation updated successfully');
      setIsEditDialogOpen(false);
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast.error('Failed to update allocation');
    }
  };

  // Delete allocation
  const handleDeleteAllocation = async (allocationId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this allocation?')) {
        return;
      }

      // Delete from backend
      await apiService.supply.deleteAllocation(allocationId);
      
      // Update local state
      setAllocations(prev => prev.filter(allocation => allocation.id !== allocationId));
      toast.success('Allocation deleted successfully');
      
      // Refresh data to sync with backend
      await fetchData();
      
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error('Failed to delete allocation');
    }
  };

  // Get status badge with icon
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <PackageCheck className="h-3 w-3" />
            Completed
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

  if (loading) {
    return (
      <DashboardLayout
        title="Supply Planning"
        description="Plan supply ahead of time and allocate farmers to dates"
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

  const groupedAllocations = getGroupedAllocations();
  const availableFarmers = getAvailableFarmers();

  return (
    <DashboardLayout
      title="Supply Planning"
      description="Plan supply ahead of time and allocate farmers to dates. These allocations will be available in Procurement."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="supply" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Supply Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="animate-fade-in space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-2xl font-bold">{allocations.length}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Allocations</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <PackageCheck className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-2xl font-bold">{calculateTotalAllocated().toFixed(1)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Planned Quantity (tons)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-2xl font-bold">{farmers.length}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Available Farmers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Supply Calendar
                </CardTitle>
                <CardDescription>
                  Allocate farmers to specific dates for supply delivery. These will appear in Procurement.
                </CardDescription>
              </div>
              <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    disabled={farmers.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Allocate Supply
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
                    <DialogTitle>Allocate Supply Date</DialogTitle>
                    <DialogDescription>
                      Select a date and assign a farmer for supply delivery. This farmer will appear in Procurement.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="overflow-y-auto flex-1 p-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label>Select Date *</Label>
                        <Calendar
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
                        <Label htmlFor="farmer">Select Farmer *</Label>
                        <Select
                          value={allocationForm.farmerId}
                          onValueChange={(value) => setAllocationForm(prev => ({ ...prev, farmerId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a farmer" />
                          </SelectTrigger>
                          <SelectContent>
                            {farmers.length > 0 ? (
                              farmers.map(farmer => (
                                <SelectItem key={farmer.id} value={farmer.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{farmer.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {farmer.county} • {farmer.crop || 'No crop'} • {farmer.phone || 'No phone'}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center">
                                <p className="text-sm text-muted-foreground">
                                  No farmers available. Add farmers first.
                                </p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        {allocationForm.farmerId && (
                          <p className="text-xs text-green-600">
                            ✓ This farmer will be available in Procurement for order creation
                          </p>
                        )}
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
                          This will pre-fill the quantity in Procurement orders
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
                  </div>

                  <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
                    <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAllocationSubmit}
                      disabled={!allocationForm.farmerId || !allocationForm.quantity}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Allocation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              {allocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Supply Allocations Yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {farmers.length === 0 
                      ? 'Add farmers first before creating supply allocations.' 
                      : 'Start planning your supply by allocating farmers to specific dates. These allocations will appear in Procurement for order creation.'}
                  </p>
                  <Button 
                    onClick={() => setIsAllocationDialogOpen(true)}
                    disabled={farmers.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {farmers.length === 0 ? 'Add Farmers First' : 'Create First Allocation'}
                  </Button>
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
                            {dateAllocations.length} allocation{dateAllocations.length !== 1 ? 's' : ''}
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
                              <TableHead>Quantity (tons)</TableHead>
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
                                  <div className="text-sm">
                                    {allocation.farmerPhone ? (
                                      <p className="text-blue-600">{allocation.farmerPhone}</p>
                                    ) : (
                                      <p className="text-muted-foreground">No phone</p>
                                    )}
                                    {allocation.farmerEmail && (
                                      <p className="text-green-600 text-xs">{allocation.farmerEmail}</p>
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
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(allocation.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(allocation)}
                                      className="h-8 px-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {allocation.status === 'scheduled' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(allocation.id, 'in-progress')}
                                          className="h-8 px-2 text-blue-600"
                                        >
                                          Start
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(allocation.id, 'completed')}
                                          className="h-8 px-2 text-green-600"
                                        >
                                          Complete
                                        </Button>
                                      </>
                                    )}
                                    {allocation.status === 'in-progress' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(allocation.id, 'completed')}
                                        className="h-8 px-2 text-green-600"
                                      >
                                        Complete
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteAllocation(allocation.id)}
                                      className="h-8 px-2 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
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

      {/* Edit Allocation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle>Edit Allocation</DialogTitle>
            <DialogDescription>
              Update allocation details for {selectedAllocation?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid gap-6">
              {selectedAllocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    {selectedAllocation.farmerName} - {selectedAllocation.farmerCounty}
                  </p>
                  <p className="text-sm text-blue-600">
                    Scheduled for: {formatDate(selectedAllocation.date)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity (tons) *</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  value={editForm.quantity}
                  onChange={handleEditInputChange}
                  placeholder="Enter quantity"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditInputChange}
                  placeholder="Update notes..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAllocation}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
