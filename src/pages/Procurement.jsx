import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockProcurementRecords } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Truck, Download, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Procurement() {
  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <Badge variant="success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getSourceBadge = (type) => {
    switch (type) {
      case 'farmer':
        return <Badge variant="farmer">Farmer</Badge>;
      case 'internal-aggregator':
        return <Badge variant="aggregator">Internal Agg.</Badge>;
      case 'external-aggregator':
        return <Badge variant="outline">External Agg.</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Procurement Dashboard"
      description="Record and track all procurement activities"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">27.5</p>
              <p className="text-sm text-muted-foreground">Tons Accepted Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">94.5%</p>
              <p className="text-sm text-muted-foreground">Acceptance Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">KES 727.5K</p>
              <p className="text-sm text-muted-foreground">Today's Value</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">2</p>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Procurement Intake Log
              </CardTitle>
              <CardDescription>Daily record of all supplier deliveries</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Planned</TableHead>
                  <TableHead className="text-center">Delivered</TableHead>
                  <TableHead className="text-center">Accepted</TableHead>
                  <TableHead className="text-center">Rejected</TableHead>
                  <TableHead>Price/ton</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProcurementRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{record.supplierName}</TableCell>
                    <TableCell>{getSourceBadge(record.sourceType)}</TableCell>
                    <TableCell className="text-muted-foreground">{record.location}</TableCell>
                    <TableCell className="text-center">{record.plannedQuantity}t</TableCell>
                    <TableCell className="text-center">{record.deliveredQuantity}t</TableCell>
                    <TableCell className="text-center text-success font-medium">
                      {record.acceptedQuantity}t
                    </TableCell>
                    <TableCell className="text-center">
                      {record.rejectedQuantity > 0 ? (
                        <span className="text-destructive font-medium">{record.rejectedQuantity}t</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>KES {record.pricePerUnit}</TableCell>
                    <TableCell className="font-medium">KES {record.totalValue.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(record.paymentStatus)}</TableCell>
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
