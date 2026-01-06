// src/pages/Aggregators.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList, 
  Plus, 
  Edit,
  Trash2,
  Loader2,
  Building,
  Users,
  Phone,
  Mail,
  User,
  MapPin
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiService } from '@/api/services';

// Form validation schema - Simplified without removed fields
const aggregatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  county: z.string().min(2, 'County must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  description: z.string().optional(),
});

export default function Aggregators() {
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_aggregators: 0,
    counties_covered: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAggregator, setEditingAggregator] = useState(null);
  const [aggregatorToDelete, setAggregatorToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(aggregatorSchema),
    defaultValues: {
      name: '',
      county: '',
      contact_person: '',
      phone: '',
      email: '',
      description: '',
    },
  });

  // Fetch aggregators and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [aggregatorsResponse, statsResponse] = await Promise.all([
        apiService.aggregators.getAll(),
        apiService.aggregators.getStats()
      ]);
      
      // Debug logging
      console.log('Aggregators API Response:', aggregatorsResponse);
      console.log('Type of aggregatorsResponse:', typeof aggregatorsResponse);
      console.log('Is Array?', Array.isArray(aggregatorsResponse));
      console.log('Stats API Response:', statsResponse);
      
      // Ensure aggregators is always an array
      const aggregatorsData = Array.isArray(aggregatorsResponse) 
        ? aggregatorsResponse 
        : [];
      
      // Calculate unique counties
      const uniqueCounties = [...new Set(aggregatorsData.map(agg => agg.county).filter(Boolean))];
      
      // Ensure stats has proper structure
      const statsData = statsResponse && typeof statsResponse === 'object'
        ? {
            total_aggregators: statsResponse.total_aggregators || aggregatorsData.length,
            counties_covered: statsResponse.counties_covered || uniqueCounties.length
          }
        : {
            total_aggregators: aggregatorsData.length,
            counties_covered: uniqueCounties.length
          };
      
      setAggregators(aggregatorsData);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load aggregators data');
      // Set to empty arrays/objects on error
      setAggregators([]);
      setStats({
        total_aggregators: 0,
        counties_covered: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      if (editingAggregator) {
        // Update existing aggregator
        await apiService.aggregators.update(editingAggregator.id, data);
        toast.success(`Aggregator "${data.name}" updated successfully`);
      } else {
        // Add new aggregator
        await apiService.aggregators.create(data);
        toast.success(`Aggregator "${data.name}" added successfully`);
      }
      
      // Refresh data
      await fetchData();
      
      // Reset form and close dialog
      form.reset();
      setEditingAggregator(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving aggregator:', error);
      toast.error('Failed to save aggregator');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (aggregator) => {
    setEditingAggregator(aggregator);
    form.reset({
      name: aggregator.name || '',
      county: aggregator.county || '',
      contact_person: aggregator.contact_person || '',
      phone: aggregator.phone || '',
      email: aggregator.email || '',
      description: aggregator.description || '',
    });
    setIsDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (id, name) => {
    setAggregatorToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!aggregatorToDelete) return;
    
    try {
      await apiService.aggregators.delete(aggregatorToDelete.id);
      toast.success(`Aggregator "${aggregatorToDelete.name}" deleted successfully`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting aggregator:', error);
      toast.error('Failed to delete aggregator');
    } finally {
      setIsDeleteDialogOpen(false);
      setAggregatorToDelete(null);
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <ClipboardList className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Aggregators Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Start building your aggregator network by adding your first aggregator partner.
      </p>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Aggregator
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Aggregators"
        description="Manage aggregator partnerships"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading aggregators...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Aggregators"
      description="Manage aggregator partnerships"
    >
      {/* Summary Cards - Simplified stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-2xl font-bold">{stats.total_aggregators || 0}</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Aggregators</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-2xl font-bold">{stats.counties_covered || 0}</p>
              </div>
              <p className="text-sm text-muted-foreground">Counties Covered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Aggregator Directory</h2>
          <p className="text-sm text-muted-foreground">
            {!Array.isArray(aggregators) || aggregators.length === 0 
              ? 'No aggregators yet' 
              : `${aggregators.length} aggregators in your network`
            }
          </p>
        </div>
        
        {/* Add Aggregator Button with Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              onClick={() => {
                setEditingAggregator(null);
                form.reset();
              }}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Aggregator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAggregator ? 'Edit Aggregator' : 'Add New Aggregator'}
              </DialogTitle>
              <DialogDescription>
                {editingAggregator 
                  ? `Update details for ${editingAggregator.name}` 
                  : 'Add a new aggregator to your network'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aggregator Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="KenAgri Aggregators" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County *</FormLabel>
                        <FormControl>
                          <Input placeholder="Narok" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+254 712 345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of services..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingAggregator ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingAggregator ? 'Update Aggregator' : 'Add Aggregator'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Render aggregators with proper array checking */}
      {!Array.isArray(aggregators) || aggregators.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aggregators.map((agg) => (
            <Card key={agg.id || agg.name} className="shadow-card hover:shadow-card-hover transition-all group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{agg.name || 'Unnamed Aggregator'}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline">
                          {agg.county || 'No county'}
                        </Badge>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(agg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(agg.id, agg.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{agg.contact_person || 'No contact person'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{agg.phone || 'No phone number'}</span>
                  </div>
                  
                  {agg.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{agg.email}</span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                {agg.description && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Description:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agg.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Aggregator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{aggregatorToDelete?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
