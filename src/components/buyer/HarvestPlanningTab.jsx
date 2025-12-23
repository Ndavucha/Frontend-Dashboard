import { useState } from 'react';
import { mockFarmers } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Search, CalendarPlus, MapPin, Wheat } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function HarvestPlanningTab() {
  const [farmers, setFarmers] = useState(mockFarmers);
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [allocationQuantity, setAllocationQuantity] = useState('');
  const [allocationDate, setAllocationDate] = useState('');

  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(search.toLowerCase()) ||
      farmer.county.toLowerCase().includes(search.toLowerCase()) ||
      farmer.crop.toLowerCase().includes(search.toLowerCase())
  );

  const handleAllocate = () => {
    if (!selectedFarmer || !allocationQuantity || !allocationDate) return;

    const quantity = parseFloat(allocationQuantity);
    
    if (quantity > selectedFarmer.unallocatedQuantity) {
      toast({
        title: 'Allocation Error',
        description: `Cannot allocate more than available capacity (${selectedFarmer.unallocatedQuantity} tons)`,
        variant: 'destructive',
      });
      return;
    }

    const allocDate = new Date(allocationDate);
    const windowStart = new Date(selectedFarmer.harvestWindowStart);
    const windowEnd = new Date(selectedFarmer.harvestWindowEnd);

    if (allocDate < windowStart || allocDate > windowEnd) {
      toast({
        title: 'Date Out of Range',
        description: `Selected date is outside the harvest window (${selectedFarmer.harvestWindowStart} to ${selectedFarmer.harvestWindowEnd})`,
        variant: 'destructive',
      });
      return;
    }

    setFarmers(
      farmers.map((f) =>
        f.id === selectedFarmer.id
          ? {
              ...f,
              allocatedQuantity: f.allocatedQuantity + quantity,
              unallocatedQuantity: f.unallocatedQuantity - quantity,
            }
          : f
      )
    );

    toast({
      title: 'Supply Allocated',
      description: `Successfully allocated ${quantity} tons from ${selectedFarmer.name} for ${allocationDate}`,
    });

    setSelectedFarmer(null);
    setAllocationQuantity('');
    setAllocationDate('');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-primary" />
              Harvest & Intake Planning
            </CardTitle>
            <CardDescription>
              View farmer supply profiles and allocate supply to specific dates
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search farmers, crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Farmer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Crop & Variety</TableHead>
                <TableHead className="text-center">Acreage</TableHead>
                <TableHead>Harvest Window</TableHead>
                <TableHead className="text-center">Est. Yield</TableHead>
                <TableHead className="text-center">Allocated</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-medium">{farmer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{farmer.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{farmer.county}, {farmer.ward}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="farmer">{farmer.crop} - {farmer.variety}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{farmer.acreage}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(farmer.harvestWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(farmer.harvestWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">{farmer.estimatedYield} tons</TableCell>
                  <TableCell className="text-center">
                    <span className="text-primary font-medium">{farmer.allocatedQuantity} tons</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={farmer.unallocatedQuantity > 0 ? 'text-success font-medium' : 'text-muted-foreground'}>
                      {farmer.unallocatedQuantity} tons
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedFarmer(farmer)}
                      disabled={farmer.unallocatedQuantity === 0}
                    >
                      <CalendarPlus className="h-4 w-4 mr-1" />
                      Allocate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!selectedFarmer} onOpenChange={() => setSelectedFarmer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Supply</DialogTitle>
            <DialogDescription>
              Allocate supply from {selectedFarmer?.name} to a specific date
            </DialogDescription>
          </DialogHeader>

          {selectedFarmer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Farmer</span>
                  <span className="font-medium">{selectedFarmer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Quantity</span>
                  <span className="font-medium text-success">{selectedFarmer.unallocatedQuantity} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harvest Window</span>
                  <span className="font-medium">
                    {new Date(selectedFarmer.harvestWindowStart).toLocaleDateString()} - {new Date(selectedFarmer.harvestWindowEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Allocation Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={allocationDate}
                  onChange={(e) => setAllocationDate(e.target.value)}
                  min={selectedFarmer.harvestWindowStart}
                  max={selectedFarmer.harvestWindowEnd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (tons)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={allocationQuantity}
                  onChange={(e) => setAllocationQuantity(e.target.value)}
                  max={selectedFarmer.unallocatedQuantity}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFarmer(null)}>
              Cancel
            </Button>
            <Button onClick={handleAllocate}>
              Confirm Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
