import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockFarmers } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Search, Plus, MapPin, Download } from 'lucide-react';
import { useState } from 'react';

export default function Farmers() {
  const [search, setSearch] = useState('');

  const filteredFarmers = mockFarmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(search.toLowerCase()) ||
      farmer.county.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Farmer Management"
      description="View and manage contracted farmers"
    >
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contracted Farmers
              </CardTitle>
              <CardDescription>
                {filteredFarmers.length} farmers currently contracted
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Farmer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Farmer</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead className="text-center">Acreage</TableHead>
                  <TableHead className="text-center">Est. Yield</TableHead>
                  <TableHead>Harvest Window</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <p className="font-medium">{farmer.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {farmer.gender}
                        </Badge>
                        <Badge variant="secondary">{farmer.ageGroup}</Badge>
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
                    <TableCell className="text-center font-medium">{farmer.acreage} acres</TableCell>
                    <TableCell className="text-center font-medium">{farmer.estimatedYield} tons</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(farmer.harvestWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(farmer.harvestWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
