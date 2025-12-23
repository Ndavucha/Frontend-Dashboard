import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockContracts } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Plus, Eye } from 'lucide-react';

export default function Contracts() {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Contracts"
      description="Manage supplier contracts and agreements"
    >
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {mockContracts.filter((c) => c.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">152</p>
              <p className="text-sm text-muted-foreground">Total Contracted Qty (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">73%</p>
              <p className="text-sm text-muted-foreground">Avg. Fulfillment Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
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
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{contract.supplierName}</TableCell>
                    <TableCell>
                      <Badge variant={contract.supplierType === 'farmer' ? 'farmer' : 'aggregator'}>
                        {contract.supplierType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{contract.contractedQuantity}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        {' - '}
                        {new Date(contract.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{contract.pricingTerms}</TableCell>
                    <TableCell>
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{contract.fulfillmentPercentage}%</span>
                        </div>
                        <Progress value={contract.fulfillmentPercentage} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
