import { useState } from 'react';
import { generateDailySupply, mockAggregators } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SupplyPlanningTab() {
  const [dailySupply, setDailySupply] = useState(generateDailySupply());
  const [viewMode, setViewMode] = useState('daily');
  const [expandedDay, setExpandedDay] = useState(null);
  const [supplementDialog, setSupplementDialog] = useState({
    open: false,
    date: '',
  });
  const [selectedAggregator, setSelectedAggregator] = useState('');
  const [supplementQuantity, setSupplementQuantity] = useState('');

  const handleSupplement = () => {
    if (!selectedAggregator || !supplementQuantity) return;

    const aggregator = mockAggregators.find((a) => a.id === selectedAggregator);
    if (!aggregator) return;

    setDailySupply(
      dailySupply.map((day) => {
        if (day.date === supplementDialog.date) {
          const quantity = parseFloat(supplementQuantity);
          return {
            ...day,
            allocatedSupply: day.allocatedSupply + quantity,
            balance: day.balance - quantity,
            allocatedSuppliers: [
              ...day.allocatedSuppliers,
              {
                name: aggregator.name,
                quantity,
                type: aggregator.type === 'internal' ? 'internal-aggregator' : 'external-aggregator',
              },
            ],
          };
        }
        return day;
      })
    );

    toast({
      title: 'Supplement Added',
      description: `${supplementQuantity} tons from ${aggregator.name} added for ${supplementDialog.date}`,
    });

    setSupplementDialog({ open: false, date: '' });
    setSelectedAggregator('');
    setSupplementQuantity('');
  };

  const getBalanceStatus = (balance) => {
    if (balance <= 0) return { variant: 'success', icon: CheckCircle, label: 'Met' };
    if (balance <= 5) return { variant: 'warning', icon: AlertTriangle, label: 'Low' };
    return { variant: 'destructive', icon: AlertTriangle, label: 'Short' };
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Supply Planning
            </CardTitle>
            <CardDescription>
              View demand vs supply by date and manage shortfalls
            </CardDescription>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Demand</TableHead>
                <TableHead className="text-center">Allocated</TableHead>
                <TableHead className="text-center">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySupply.map((day) => {
                const status = getBalanceStatus(day.balance);
                const isExpanded = expandedDay === day.date;

                return (
                  <>
                    <TableRow
                      key={day.date}
                      className={cn(
                        'hover:bg-muted/30 transition-colors cursor-pointer',
                        isExpanded && 'bg-muted/20'
                      )}
                      onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{day.demand} tons</TableCell>
                      <TableCell className="text-center">
                        <span className="text-primary font-medium">{day.allocatedSupply} tons</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'font-medium',
                            day.balance <= 0 ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {day.balance <= 0 ? '0' : day.balance} tons
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {day.balance > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSupplementDialog({ open: true, date: day.date });
                            }}
                          >
                            Request Supplement
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/10 animate-fade-in">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Allocated Suppliers
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {day.allocatedSuppliers.map((supplier, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-lg bg-background border flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{supplier.name}</p>
                                    <Badge
                                      variant={supplier.type === 'farmer' ? 'farmer' : 'aggregator'}
                                      className="text-xs mt-1"
                                    >
                                      {supplier.type === 'farmer'
                                        ? 'Farmer'
                                        : supplier.type === 'internal-aggregator'
                                        ? 'Internal Agg.'
                                        : 'External Agg.'}
                                    </Badge>
                                  </div>
                                  <span className="text-lg font-semibold text-primary">
                                    {supplier.quantity}t
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={supplementDialog.open}
        onOpenChange={(open) => setSupplementDialog({ open, date: supplementDialog.date })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Supplement Supply</DialogTitle>
            <DialogDescription>
              Add supply from an aggregator to cover the shortfall on{' '}
              {new Date(supplementDialog.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Aggregator</Label>
              <Select value={selectedAggregator} onValueChange={setSelectedAggregator}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an aggregator" />
                </SelectTrigger>
                <SelectContent>
                  {mockAggregators.map((agg) => (
                    <SelectItem key={agg.id} value={agg.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={agg.type === 'internal' ? 'farmer' : 'aggregator'}
                          className="text-xs"
                        >
                          {agg.type}
                        </Badge>
                        <span>{agg.name}</span>
                        <span className="text-muted-foreground">
                          (Reliability: {agg.reliabilityScore}%)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplement-qty">Quantity (tons)</Label>
              <Input
                id="supplement-qty"
                type="number"
                placeholder="Enter quantity"
                value={supplementQuantity}
                onChange={(e) => setSupplementQuantity(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSupplementDialog({ open: false, date: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleSupplement}>Add Supplement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
