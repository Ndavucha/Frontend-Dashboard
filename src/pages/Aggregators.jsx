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
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  Plus, 
  Star,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiService } from '@/api/services';

// Form validation schema
const aggregatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  county: z.string().min(2, 'County must be at least 2 characters'),
  type: z.enum(['internal', 'external']),
  historical_volume: z.coerce.number().min(0, 'Volume must be positive'),
  reliability_score: z.coerce.number().min(0).max(100, 'Score must be between 0-100'),
  average_quality: z.coerce.number().min(0).max(100, 'Quality must be between 0-100'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export default function Aggregators() {
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    internal_count: 0,
    external_count: 0,
    total_volume: 0,
    avg_reliability: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAggregator, setEditingAggregator] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(aggregatorSchema),
    defaultValues: {
      name: '',
      county: '',
      type: 'external',
      historical_volume: 0,
      reliability_score: 80,
      average_quality: 85,
      contact_person: '',
      phone: '',
      email: '',
    },
  });

  // Fetch aggregators and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [aggregatorsData, statsData] = await Promise.all([
        apiService.aggregators.getAll(),
        apiService.aggregators.getStats()
      ]);
      
      setAggregators(aggregatorsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load aggregators data');
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
      name: aggregator.name,
      county: aggregator.county,
      type: aggregator.type,
      historical_volume: aggregator.historical_volume,
      reliability_score: aggregator.reliability_score,
      average_quality: aggregator.average_quality,
      contact_person: aggregator.contact_person || '',
      phone: aggregator.phone || '',
      email: aggregator.email || '',
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await apiService.aggregators.delete(id);
      toast.success(`Aggregator "${name}" deleted successfully`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting aggregator:', error);
      toast.error('Failed to delete aggregator');
    }
  };

  if (loading && aggregators.length === 0) {
    return (
      <DashboardLayout
        title="Aggregators"
        description="Manage internal and external aggregator partnerships"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Aggregators"
      description="Manage internal and external aggregator partnerships"
    >
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.internal_count}</p>
              <p className="text-sm text-muted-foreground">Internal Aggregators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.external_count}</p>
              <p className="text-sm text-muted-foreground">External Aggregators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total_volume}</p>
              <p className="text-sm text-muted-foreground">Total Volume (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.avg_reliability}%</p>
              <p className="text-sm text-muted-foreground">Avg. Reliability</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Aggregator Directory</h2>
        
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
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aggregator Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="historical_volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (tons) *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reliability_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reliability % *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="average_quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality % *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                        <FormLabel>Contact Person</FormLabel>
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
                        <FormLabel>Phone Number</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} />
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

      <div className="grid gap-4 md:grid-cols-2">
        {aggregators.map((agg) => (
          <Card key={agg.id} className="shadow-card hover:shadow-card-hover transition-all group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{agg.name}</CardTitle>
                  <CardDescription>{agg.county}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={agg.type === 'internal' ? 'farmer' : 'aggregator'}>
                    {agg.type}
                  </Badge>
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
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDelete(agg.id, agg.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{agg.historical_volume}</p>
                  <p className="text-xs text-muted-foreground">Total Volume (t)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-success">{agg.reliability_score}%</p>
                  <p className="text-xs text-muted-foreground">Reliability</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{agg.average_quality}%</p>
                  <p className="text-xs text-muted-foreground">Quality Score</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(agg.reliability_score / 20)
                            ? 'fill-secondary text-secondary'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Progress value={agg.reliability_score} className="h-2" />
              </div>
              
              {(agg.contact_person || agg.phone || agg.email) && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  {agg.contact_person && <p>Contact: {agg.contact_person}</p>}
                  {agg.phone && <p>Phone: {agg.phone}</p>}
                  {agg.email && <p>Email: {agg.email}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
