// src/pages/SupplyDashboard.jsx
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
  X
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function SupplyDashboard() {
  const [activeTab, setActiveTab] = useState('supply');
  const [farmers, setFarmers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allocationForm, setAllocationForm] = useState({
    farmerId: '',
    quantity: '',
    notes: ''
  });

  // Fetch farmers (no mock allocations)
  const fetchData = async () => {
    try {
      setLoading(true);
      const farmersResponse = await apiService.farmers.getAll();
      setFarmers(farmersResponse || []);
      setAllocations([]); // Start with empty allocations
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers');
      setFarmers([]);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocationInputChange = (e) => {
    const { name, value } = e.target;
    setAllocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllocationSubmit = async () => {
    try {
      if (!allocationForm.farmerId) {
        toast.error('Please select a farmer');
        return;
      }

      const selectedFarmer = farmers.find(f => f.id === parseInt(allocationForm.farmerId));
      if (!selectedFarmer) {
        toast.error('Selected farmer not found');
        return;
      }

      const newAllocation = {
        id: Date.now(), // Simple ID generation
        farmerId: parseInt(allocationForm.farmerId),
        farmerName: selectedFarmer.name,
        farmerCounty: selectedFarmer.county,
        farmerCrop: selectedFarmer.crop || 'Not specified',
        date: selectedDate.toISOString(),
        quantity: parseFloat(allocationForm.quantity) || 0,
        notes: allocationForm.notes,
        status: 'scheduled'
      };

      // Add to local state
      setAllocations(prev => [...prev, newAllocation]);
      toast.success('Supply allocated successfully');
      
      // Reset form
      setAllocationForm({
        farmerId: '',
        quantity: '',
        notes: ''
      });
      setIsAllocationDialogOpen(false);
      
      // Refresh farmers list to update available farmers
      await fetchData();
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast.error('Failed to allocate supply');
    }
  };

  const handleStatusUpdate = (allocationId, newStatus) => {
    try {
      setAllocations(prev => 
        prev.map(allocation => 
          allocation.id === allocationId 
            ? { ...allocation, status: newStatus }
            : allocation
        )
      );
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteAllocation = (allocationId) => {
    try {
      setAllocations(prev => prev.filter(allocation => allocation.id !== allocationId));
      toast.success('Allocation deleted successfully');
      // Refresh farmers to make them available again
      fetchData();
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error('Failed to delete allocation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Check if a farmer is already allocated for the selected date
  const isFarmerAllocatedForDate = (farmerId) => {
    return allocations.some(allocation => 
      allocation.farmerId === farmerId && 
      new Date(allocation.date).toDateString() === selectedDate.toDateString()
    );
  };

  // Filter available farmers for the selected date
  const availableFarmers = farmers.filter(farmer => 
    !isFarmerAllocatedForDate(farmer.id)
  );

  // Group allocations by date
  const allocationsByDate = allocations.reduce((acc, allocation) => {
    const date = new Date(allocation.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(allocation);
    return acc;
  }, {});

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

  return (
    <DashboardLayout
      title="Supply Planning"
      description="Plan supply ahead of time and allocate farmers to dates"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="supply" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Supply Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="animate-fade-in space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Supply Calendar
                </CardTitle>
                <CardDescription>
                  Allocate farmers to specific dates for supply delivery
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
                      Select a date and assign a farmer for supply delivery.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="overflow-y-auto flex-1 p-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
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
                            {availableFarmers.length > 0 ? (
                              availableFarmers.map(farmer => (
                                <SelectItem key={farmer.id} value={farmer.id.toString()}>
                                  {farmer.name} ({farmer.county}) - {farmer.crop || 'No crop'}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-farmers" disabled className="text-gray-400">
                                {farmers.length === 0 ? 'No farmers available' : 'All farmers already allocated for this date'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity (tons)</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={allocationForm.quantity}
                          onChange={handleAllocationInputChange}
                          placeholder="Enter quantity"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          name="notes"
                          value={allocationForm.notes}
                          onChange={handleAllocationInputChange}
                          placeholder="Additional notes..."
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
                      disabled={!allocationForm.farmerId || availableFarmers.length === 0}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Allocate
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
                      : 'Start planning your supply by allocating farmers to specific dates.'}
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
                  {Object.entries(allocationsByDate).map(([date, dateAllocations]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <Badge variant="secondary">
                          {dateAllocations.length} allocation{dateAllocations.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Farmer</TableHead>
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
                                  {allocation.farmerName}
                                </TableCell>
                                <TableCell>
                                  {allocation.farmerCounty}
                                </TableCell>
                                <TableCell>
                                  {allocation.farmerCrop}
                                </TableCell>
                                <TableCell>
                                  {allocation.quantity}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(allocation.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {allocation.status === 'scheduled' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(allocation.id, 'in-progress')}
                                          className="h-8 px-2"
                                        >
                                          Start
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStatusUpdate(allocation.id, 'completed')}
                                          className="h-8 px-2"
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
                                        className="h-8 px-2"
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
    </DashboardLayout>
  );
}
