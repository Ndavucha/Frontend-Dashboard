import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAggregators } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, Plus, Star } from 'lucide-react';

export default function Aggregators() {
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
              <p className="text-2xl font-bold text-primary">
                {mockAggregators.filter((a) => a.type === 'internal').length}
              </p>
              <p className="text-sm text-muted-foreground">Internal Aggregators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">
                {mockAggregators.filter((a) => a.type === 'external').length}
              </p>
              <p className="text-sm text-muted-foreground">External Aggregators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">1,360</p>
              <p className="text-sm text-muted-foreground">Total Volume (tons)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">85%</p>
              <p className="text-sm text-muted-foreground">Avg. Reliability</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Aggregator Directory</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Aggregator
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockAggregators.map((agg) => (
          <Card key={agg.id} className="shadow-card hover:shadow-card-hover transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{agg.name}</CardTitle>
                  <CardDescription>{agg.county}</CardDescription>
                </div>
                <Badge variant={agg.type === 'internal' ? 'farmer' : 'aggregator'}>
                  {agg.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{agg.historicalVolume}</p>
                  <p className="text-xs text-muted-foreground">Total Volume (t)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-success">{agg.reliabilityScore}%</p>
                  <p className="text-xs text-muted-foreground">Reliability</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{agg.averageQuality}%</p>
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
                          i < Math.round(agg.reliabilityScore / 20)
                            ? 'fill-secondary text-secondary'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Progress value={agg.reliabilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
