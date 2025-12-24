import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockContracts as initialMockContracts } from '@/data/mockData';
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
  Form,
  FormControl,
  FormDescription,
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
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const [contracts, setContracts] = useState(initialMockContracts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      supplierName: '',
      supplierType: 'farmer',
      contractedQuantity: 20,
      startDate: '',
      endDate: '',
      pricingTerms: '',
      paymentTerms: '',
      fulfillmentPercentage: 0,
      status: 'draft',
      notes: '',
    },
  });

  // Calculate summary stats
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalContractedQty = contracts.reduce((sum, contract) => sum + contract.contractedQuantity, 0);
  const avgFulfillment = contracts.length > 0 
    ? Math.round(contracts.reduce((sum, contract) => sum + contract.fulfillmentPercentage, 0) / contracts.length)
    : 0;

  // Handle form submission
  const onSubmit = (data) => {
    if (editingContract) {
      // Update existing contract
      setContracts(prev => prev.map(contract => 
        contract.id === editingContract.id 
          ? { 
              ...contract, 
              ...data,
              id: contract.id,
              startDate: new Date(data.startDate).toISOString(),
              endDate: new Date(data.endDate).toISOString(),
            }
          : contract
      ));
      toast.success(`Contract with ${data.supplierName} updated successfully`);
    } else {
      // Add new contract
      const newContract = {
        id: Date.now().toString(),
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        createdAt: new Date().toISOString(),
      };
      setContracts(prev => [newContract, ...prev]);
      toast.success(`New contract with ${data.supplierName} created successfully`);
    }
    
    form.reset();
    setEditingContract(null);
    setIsDialogOpen(false);
  };

  // Handle edit
  const handleEdit = (contract) => {
    setEditingContract(contract);
    form.reset({
      supplierName: contract.supplierName,
      supplierType: contract.supplierType,
      contractedQuantity: contract.contractedQuantity,
      startDate: format(new Date(contract.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(contract.endDate), 'yyyy-MM-dd'),
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

  // Handle delete
  const handleDelete = (id, supplierName) => {
    if (window.confirm(`Are you sure you want to delete the contract with ${supplierName}?`)) {
      setContracts(prev => prev.filter(contract => contract.id !== id));
      toast.success(`Contract with ${supplierName} deleted successfully`);
    }
  };

  // Update fulfillment
  const updateFulfillment = (id, newPercentage) => {
    setContracts(prev => prev.map(contract => 
      contract.id === id 
        ? { ...contract, fulfillmentPercentage: Math.min(100, Math.max(0, newPercentage)) }
        : contract
    ));
    toast.info('Fulfillment updated');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Contracts"
      description="Manage supplier contracts and agreements"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{activeContracts}</p>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{totalContractedQty}</p>
              <p className="text-sm text-muted-foreground">Total Contracted Qty (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{avgFulfillment}%</p>
              <p className="text-sm text-muted-foreground">Avg. Fulfillment Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Contract Table Card */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contract Management
              </CardTitle>
              <CardDescription>View and manage all supplier contracts</CardDescription>
            </div>
            
            {/* Add Contract Button with Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => {
                  setEditingContract(null);
                  form.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
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
                              <Input type="number" {...field} />
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
                              <Input type="number" {...field} />
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
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional contract details, special conditions, etc."
                              className="min-h-[80px]"
                              {...field} 
                            />
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
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingContract ? 'Update Contract' : 'Create Contract'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
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
                          {format(new Date(contract.startDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          to {format(new Date(contract.endDate), 'MMM dd, yyyy')}
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
                                onClick={() => updateFulfillment(contract.id, contract.fulfillmentPercentage - 10)}
                              >
                                -
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => updateFulfillment(contract.id, contract.fulfillmentPercentage + 10)}
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
                            onClick={() => handleDelete(contract.id, contract.supplierName)}
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
                    <p>{format(new Date(viewingContract.startDate), 'PPP')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                    <p>{format(new Date(viewingContract.endDate), 'PPP')}</p>
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
                    Created: {format(new Date(viewingContract.createdAt), 'PPP pp')}
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
    </DashboardLayout>
  );
}
