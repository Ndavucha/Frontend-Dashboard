// src/pages/Contracts.jsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  DollarSign,
  FileCheck,
  Loader2,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { apiService } from '@/api/services';

// Date formatting helper with validation
const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

// Form validation schema
const contractSchema = z.object({
  supplierName: z.string().min(2, 'Supplier name must be at least 2 characters'),
  supplierType: z.enum(['farmer', 'aggregator']),
  contractedQuantity: z.coerce.number().min(1, 'Quantity must be at least 1 ton'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  pricingTerms: z.string().min(5, 'Pricing terms are required'),
  paymentTerms: z.string().optional(),
  fulfillmentPercentage: z.coerce.number().min(0).max(100, 'Fulfillment must be between 0-100'),
  status: z.enum(['draft', 'active', 'completed', 'terminated']),
  notes: z.string().optional(),
});

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      supplierName: '',
      supplierType: 'farmer',
      contractedQuantity: 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricingTerms: '',
      paymentTerms: '',
      fulfillmentPercentage: 0,
      status: 'draft',
      notes: '',
    },
  });

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await apiService.contracts.getAll();
      console.log('API Response:', response); // Debug log
      if (response && Array.isArray(response.data)) {
        console.log('First contract dates:', response.data[0]?.startDate, response.data[0]?.endDate);
        setContracts(response.data || []);
      } else if (response && Array.isArray(response)) {
        console.log('First contract dates (array response):', response[0]?.startDate, response[0]?.endDate);
        setContracts(response || []);
      } else {
        console.log('Unexpected API response format:', response);
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Calculate summary stats
  const calculateStats = () => {
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const totalContractedQty = contracts.reduce((sum, contract) => sum + (contract.contractedQuantity || 0), 0);
    const avgFulfillment = contracts.length > 0 
      ? Math.round(contracts.reduce((sum, contract) => sum + (contract.fulfillmentPercentage || 0), 0) / contracts.length)
      : 0;
    
    return { activeContracts, totalContractedQty, avgFulfillment };
  };

  const stats = calculateStats();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // Ensure dates are valid
      const startDate = data.startDate ? new Date(data.startDate) : new Date();
      const endDate = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      
      if (editingContract) {
        // Update existing contract
        const updatedData = {
          ...data,
          id: editingContract.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
        
        await apiService.contracts.update(editingContract.id, updatedData);
        toast.success(`Contract with ${data.supplierName} updated successfully`);
      } else {
        // Add new contract
        const newContract = {
          ...data,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          createdAt: new Date().toISOString(),
        };
        
        await apiService.contracts.create(newContract);
        toast.success(`New contract with ${data.supplierName} created successfully`);
      }
      
      // Refresh data
      await fetchContracts();
      
      // Reset form and close dialog
      form.reset({
        supplierName: '',
        supplierType: 'farmer',
        contractedQuantity: 20,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pricingTerms: '',
        paymentTerms: '',
        fulfillmentPercentage: 0,
        status: 'draft',
        notes: '',
      });
      setEditingContract(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Failed to save contract');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (contract) => {
    setEditingContract(contract);
    form.reset({
      supplierName: contract.supplierName,
      supplierType: contract.supplierType,
      contractedQuantity: contract.contractedQuantity,
      startDate: contract.startDate ? formatDate(contract.startDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      endDate: contract.endDate ? formatDate(contract.endDate, 'yyyy-MM-dd') : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricingTerms: contract.pricingTerms,
      paymentTerms: contract.paymentTerms || '',
      fulfillmentPercentage: contract.fulfillmentPercentage,
      status: contract.status,
      notes: contract.notes || '',
    });
    setIsDialogOpen(true);
  };

  // Handle view
  const handleView = (contract) => {
    setViewingContract(contract);
    setIsViewDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (id, supplierName) => {
    setContractToDelete({ id, supplierName });
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    
    try {
      await apiService.contracts.delete(contractToDelete.id);
      toast.success(`Contract with ${contractToDelete.supplierName} deleted successfully`);
      await fetchContracts(); // Refresh data
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    } finally {
      setIsDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  // Update fulfillment
  const updateFulfillment = async (id, newPercentage) => {
    try {
      await apiService.contracts.updateFulfillment(id, newPercentage);
      toast.info('Fulfillment updated');
      await fetchContracts(); // Refresh data
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      toast.error('Failed to update fulfillment');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'terminated':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Terminated
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No Contracts Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Start managing your supplier relationships by creating your first contract.
        Track quantities, terms, and fulfillment progress.
      </p>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Contract
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Contracts"
        description="Manage supplier contracts and agreements"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading contracts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Contracts"
      description="Manage supplier contracts and agreements"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
              </div>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-2xl font-bold">{stats.totalContractedQty}</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Contracted Qty (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileCheck className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-2xl font-bold">{stats.avgFulfillment}%</p>
              </div>
              <p className="text-sm text-muted-foreground">Avg. Fulfillment Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Contract Table Card */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contract Management
              </CardTitle>
              <CardDescription>
                {contracts.length === 0 ? 'No contracts yet' : `${contracts.length} contracts in the system`}
              </CardDescription>
            </div>
            
            {/* Add Contract Button with Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setEditingContract(null);
                    form.reset({
                      supplierName: '',
                      supplierType: 'farmer',
                      contractedQuantity: 20,
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      pricingTerms: '',
                      paymentTerms: '',
                      fulfillmentPercentage: 0,
                      status: 'draft',
                      notes: '',
                    });
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  New Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingContract ? 'Edit Contract' : 'Create New Contract'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContract 
                      ? `Update contract with ${editingContract.supplierName}` 
                      : 'Create a new supplier contract'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="supplierName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Mary Wanjiku" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supplierType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="farmer">Farmer</SelectItem>
                                <SelectItem value="aggregator">Aggregator</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="contractedQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (tons) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pricingTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Terms *</FormLabel>
                          <FormControl>
                            <Input placeholder="KES 26/kg, weekly payments" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms</FormLabel>
                          <FormControl>
                            <Input placeholder="Net 30, bank transfer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fulfillmentPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fulfillment %</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    
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
                            {editingContract ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          editingContract ? 'Update Contract' : 'Create Contract'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Qty (tons)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Pricing Terms</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{contract.supplierName}</TableCell>
                      <TableCell>
                        <Badge variant={contract.supplierType === 'farmer' ? 'farmer' : 'aggregator'}>
                          {contract.supplierType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {contract.contractedQuantity}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(contract.startDate, 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            to {formatDate(contract.endDate, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        <div className="flex items-start gap-1">
                          <DollarSign className="h-3 w-3 mt-0.5 text-muted-foreground" />
                          <span className="line-clamp-2">{contract.pricingTerms}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-40 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contract.fulfillmentPercentage}%</span>
                              <div className="flex gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => updateFulfillment(contract.id, Math.max(0, contract.fulfillmentPercentage - 10))}
                                >
                                  -
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => updateFulfillment(contract.id, Math.min(100, contract.fulfillmentPercentage + 10))}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Progress value={contract.fulfillmentPercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(contract)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(contract)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Contract
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(contract.id, contract.supplierName)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Contract
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Contract Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {viewingContract && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Contract Details
                </DialogTitle>
                <DialogDescription>
                  Contract with {viewingContract.supplierName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Supplier</h4>
                    <p className="text-lg font-semibold">{viewingContract.supplierName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                    <Badge variant={viewingContract.supplierType === 'farmer' ? 'farmer' : 'aggregator'}>
                      {viewingContract.supplierType}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                    <p className="text-lg font-semibold">{viewingContract.contractedQuantity} tons</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    {getStatusBadge(viewingContract.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                    <p>{formatDate(viewingContract.startDate, 'PPP')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                    <p>{formatDate(viewingContract.endDate, 'PPP')}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Pricing Terms</h4>
                  <p className="text-sm">{viewingContract.pricingTerms}</p>
                </div>
                
                {viewingContract.paymentTerms && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Payment Terms</h4>
                    <p className="text-sm">{viewingContract.paymentTerms}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Fulfillment Progress</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{viewingContract.fulfillmentPercentage}%</span>
                    </div>
                    <Progress value={viewingContract.fulfillmentPercentage} className="h-2" />
                  </div>
                </div>
                
                {viewingContract.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                    <p className="text-sm text-muted-foreground">{viewingContract.notes}</p>
                  </div>
                )}
                
                {viewingContract.createdAt && (
                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    Created: {formatDate(viewingContract.createdAt, 'PPP pp')}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(viewingContract);
                }}>
                  Edit Contract
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the contract with "{contractToDelete?.supplierName}"? 
              This action cannot be undone and all associated data will be removed.
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

