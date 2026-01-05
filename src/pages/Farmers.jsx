// src/pages/Farmers.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Edit, 
  Trash2,
  CheckCircle,
  Calendar,
  Sprout
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    ageGroup: '31-45',
    county: '',
    ward: '',
    crop: '',
    variety: '',
    acreage: '',
    estimatedYield: '',
    plantingDate: '',
    harvestEstimation: '',
    contact: ''
  });

  // Fetch farmers
  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await apiService.farmers.getAll();
      setFarmers(response || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers');
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Filter farmers based on search
  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.name?.toLowerCase().includes(search.toLowerCase()) ||
      farmer.county?.toLowerCase().includes(search.toLowerCase()) ||
      farmer.contact?.includes(search)
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'male',
      ageGroup: '31-45',
      county: '',
      ward: '',
      crop: '',
      variety: '',
      acreage: '',
      estimatedYield: '',
      plantingDate: '',
      harvestEstimation: '',
      contact: ''
    });
    setSelectedFarmer(null);
  };

  // Calculate harvest window from planting date
  const calculateHarvestWindow = (plantingDate) => {
    if (!plantingDate) return { start: null, end: null };
    
    const plantDate = new Date(plantingDate);
    const harvestStart = new Date(plantDate);
    const harvestEnd = new Date(plantDate);
    
    // Assuming 90-120 days for most crops (adjust as needed)
    harvestStart.setDate(plantDate.getDate() + 90);
    harvestEnd.setDate(plantDate.getDate() + 120);
    
    return {
      start: harvestStart.toISOString(),
      end: harvestEnd.toISOString()
    };
  };

  // Add new farmer
  const handleAddFarmer = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Farmer name is required');
        return;
      }

      if (!formData.county.trim()) {
        toast.error('County is required');
        return;
      }

      // Calculate harvest window if planting date is provided
      const harvestWindow = formData.plantingDate 
        ? calculateHarvestWindow(formData.plantingDate)
        : { 
            start: new Date().toISOString(), 
            end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() 
          };

      const newFarmer = {
        name: formData.name.trim(),
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        county: formData.county.trim(),
        ward: formData.ward.trim(),
        crop: formData.crop.trim(),
        variety: formData.variety.trim(),
        acreage: parseFloat(formData.acreage) || 0,
        estimatedYield: parseFloat(formData.estimatedYield) || 0,
        plantingDate: formData.plantingDate || null,
        harvestEstimation: formData.harvestEstimation.trim(),
        contact: formData.contact.trim(),
        harvestWindowStart: harvestWindow.start,
        harvestWindowEnd: harvestWindow.end,
        status: 'active'
      };

      // Call API to create farmer
      const createdFarmer = await apiService.farmers.create(newFarmer);
      
      if (createdFarmer) {
        toast.success('Farmer added successfully');
        setIsAddDialogOpen(false);
        resetForm();
        fetchFarmers(); // Refresh list
      } else {
        throw new Error('Failed to create farmer');
      }
    } catch (error) {
      console.error('Error adding farmer:', error);
      toast.error(error.message || 'Failed to add farmer');
    }
  };

  // Edit farmer
  const handleEditFarmer = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Farmer name is required');
        return;
      }

      if (!formData.county.trim()) {
        toast.error('County is required');
        return;
      }

      const updatedFarmer = {
        name: formData.name.trim(),
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        county: formData.county.trim(),
        ward: formData.ward.trim(),
        crop: formData.crop.trim(),
        variety: formData.variety.trim(),
        acreage: parseFloat(formData.acreage) || 0,
        estimatedYield: parseFloat(formData.estimatedYield) || 0,
        plantingDate: formData.plantingDate || null,
        harvestEstimation: formData.harvestEstimation.trim(),
        contact: formData.contact.trim(),
        id: selectedFarmer.id
      };

      // Update harvest window if planting date changed
      if (formData.plantingDate && formData.plantingDate !== selectedFarmer.plantingDate) {
        const harvestWindow = calculateHarvestWindow(formData.plantingDate);
        updatedFarmer.harvestWindowStart = harvestWindow.start;
        updatedFarmer.harvestWindowEnd = harvestWindow.end;
      }

      await apiService.farmers.update(selectedFarmer.id, updatedFarmer);
      toast.success('Farmer updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchFarmers(); // Refresh list
    } catch (error) {
      console.error('Error updating farmer:', error);
      toast.error('Failed to update farmer');
    }
  };

  // Delete farmer
  const handleDeleteFarmer = async () => {
    try {
      await apiService.farmers.delete(selectedFarmer.id);
      toast.success('Farmer deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedFarmer(null);
      fetchFarmers(); // Refresh list
    } catch (error) {
      console.error('Error deleting farmer:', error);
      toast.error('Failed to delete farmer');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Open edit dialog
  const openEditDialog = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name || '',
      gender: farmer.gender || 'male',
      ageGroup: farmer.ageGroup || '31-45',
      county: farmer.county || '',
      ward: farmer.ward || '',
      crop: farmer.crop || '',
      variety: farmer.variety || '',
      acreage: farmer.acreage?.toString() || '',
      estimatedYield: farmer.estimatedYield?.toString() || '',
      plantingDate: farmer.plantingDate ? farmer.plantingDate.split('T')[0] : '',
      harvestEstimation: farmer.harvestEstimation || '',
      contact: farmer.contact || ''
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (farmer) => {
    setSelectedFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Farmers Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Start building your supply chain by adding your first contracted farmer.
        Track their details, crops, and harvest information.
      </p>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Farmer
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Farmer Management"
        description="View and manage contracted farmers"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading farmers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Farmer Management"
      description="View and manage contracted farmers"
    >
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contracted Farmers
              </CardTitle>
              <CardDescription>
                {farmers.length === 0 ? 'No farmers yet' : `${filteredFarmers.length} farmers currently contracted`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9"
                  disabled={farmers.length === 0}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Farmer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Add New Farmer</DialogTitle>
                    <DialogDescription>
                      Enter the farmer's details below. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="px-6 py-4">
                    <div className="grid gap-4">
                      {/* Full Name and Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleSelectChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>

                      {/* Age Group */}
                      <div className="space-y-2">
                        <Label htmlFor="ageGroup">Age Group</Label>
                        <select
                          id="ageGroup"
                          name="ageGroup"
                          value={formData.ageGroup}
                          onChange={handleSelectChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="18-30">18-30</option>
                          <option value="31-45">31-45</option>
                          <option value="46-60">46-60</option>
                          <option value="60+">60+</option>
                        </select>
                      </div>

                      {/* County and Ward */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="county">County *</Label>
                          <Input
                            id="county"
                            name="county"
                            value={formData.county}
                            onChange={handleInputChange}
                            placeholder="e.g., Nakuru"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ward">Ward/Sub-County</Label>
                          <Input
                            id="ward"
                            name="ward"
                            value={formData.ward}
                            onChange={handleInputChange}
                            placeholder="e.g., Njoro"
                          />
                        </div>
                      </div>

                      {/* Crop and Variety */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="crop">Crop Type</Label>
                          <Input
                            id="crop"
                            name="crop"
                            value={formData.crop}
                            onChange={handleInputChange}
                            placeholder="e.g., Wheat"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variety">Variety</Label>
                          <Input
                            id="variety"
                            name="variety"
                            value={formData.variety}
                            onChange={handleInputChange}
                            placeholder="e.g., DK 8031"
                          />
                        </div>
                      </div>

                      {/* Acreage and Estimated Yield */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="acreage">Acreage (acres)</Label>
                          <Input
                            id="acreage"
                            name="acreage"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.acreage}
                            onChange={handleInputChange}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedYield">Est. Yield (tons)</Label>
                          <Input
                            id="estimatedYield"
                            name="estimatedYield"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.estimatedYield}
                            onChange={handleInputChange}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Planting Date and Harvest Estimation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plantingDate">Planting Date</Label>
                          <Input
                            id="plantingDate"
                            name="plantingDate"
                            type="date"
                            value={formData.plantingDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="harvestEstimation">Harvest Estimation</Label>
                          <Input
                            id="harvestEstimation"
                            name="harvestEstimation"
                            value={formData.harvestEstimation}
                            onChange={handleInputChange}
                            placeholder="e.g., Early April, Late May"
                          />
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact</Label>
                        <Input
                          id="contact"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          placeholder="Phone or email"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t">
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {farmers.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Farmer</TableHead>
                      <TableHead>Gender/Age</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead className="text-center">Acreage</TableHead>
                      <TableHead className="text-center">Est. Yield</TableHead>
                      <TableHead>Planting Date</TableHead>
                      <TableHead>Harvest Est.</TableHead>
                      <TableHead>Harvest Window</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            {farmer.contact && (
                              <p className="text-xs text-muted-foreground">{farmer.contact}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="capitalize w-fit">
                              {farmer.gender}
                            </Badge>
                            <span className="text-sm">{farmer.ageGroup}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {farmer.county}
                              {farmer.ward && `, ${farmer.ward}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {farmer.crop ? (
                            <Badge variant="farmer">
                              {farmer.crop}
                              {farmer.variety && ` - ${farmer.variety}`}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {farmer.acreage || 0} acres
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {farmer.estimatedYield || 0} tons
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(farmer.plantingDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {farmer.harvestEstimation || 'Not specified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {farmer.harvestWindowStart ? (
                            <span className="text-sm">
                              {new Date(farmer.harvestWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' - '}
                              {new Date(farmer.harvestWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(farmer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(farmer)}
                              className="text-red-500 hover:text-red-700"
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
              
              {filteredFarmers.length === 0 && search && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No farmers found matching "{search}"</p>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update the farmer's details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4">
            <div className="grid gap-4">
              {/* Full Name and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <select
                    id="edit-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Age Group */}
              <div className="space-y-2">
                <Label htmlFor="edit-ageGroup">Age Group</Label>
                <select
                  id="edit-ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleSelectChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="18-30">18-30</option>
                  <option value="31-45">31-45</option>
                  <option value="46-60">46-60</option>
                  <option value="60+">60+</option>
                </select>
              </div>

              {/* County and Ward */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-county">County *</Label>
                  <Input
                    id="edit-county"
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    placeholder="e.g., Nakuru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ward">Ward/Sub-County</Label>
                  <Input
                    id="edit-ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    placeholder="e.g., Njoro"
                  />
                </div>
              </div>

              {/* Crop and Variety */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-crop">Crop Type</Label>
                  <Input
                    id="edit-crop"
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    placeholder="e.g., Wheat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-variety">Variety</Label>
                  <Input
                    id="edit-variety"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="e.g., DK 8031"
                  />
                </div>
              </div>

              {/* Acreage and Estimated Yield */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-acreage">Acreage (acres)</Label>
                  <Input
                    id="edit-acreage"
                    name="acreage"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.acreage}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estimatedYield">Est. Yield (tons)</Label>
                  <Input
                    id="edit-estimatedYield"
                    name="estimatedYield"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.estimatedYield}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Planting Date and Harvest Estimation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plantingDate">Planting Date</Label>
                  <Input
                    id="edit-plantingDate"
                    name="plantingDate"
                    type="date"
                    value={formData.plantingDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-harvestEstimation">Harvest Estimation</Label>
                  <Input
                    id="edit-harvestEstimation"
                    name="harvestEstimation"
                    value={formData.harvestEstimation}
                    onChange={handleInputChange}
                    placeholder="e.g., Early April, Late May"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact</Label>
                <Input
                  id="edit-contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Phone or email"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditFarmer}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Farmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedFarmer?.name}? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFarmer}
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
