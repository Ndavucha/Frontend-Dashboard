import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SupplyChart } from '@/components/dashboard/SupplyChart';
import { VarietyBreakdown } from '@/components/dashboard/VarietyBreakdown';
import { dashboardStats, mockFarmers } from '@/data/mockData';
import {
  Users,
  Tractor,
  TrendingUp,
  Package,
  Warehouse,
  CircleDollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Index() {
  return (
    <DashboardLayout
      title="Supply Chain Overview"
      description="Monitor your agricultural supply chain at a glance"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Contracted Farmers"
          value={dashboardStats.totalFarmersContracted}
          change={{ value: 12, label: 'vs last month' }}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Acreage"
          value={`${dashboardStats.totalAcreage} acres`}
          change={{ value: 8, label: 'vs last month' }}
          icon={Tractor}
          variant="success"
        />
        <StatCard
          title="Expected Supply"
          value={`${dashboardStats.totalExpectedSupply} tons`}
          icon={Package}
          variant="secondary"
        />
        <StatCard
          title="Aggregator Dependency"
          value={`${dashboardStats.aggregatorDependency}%`}
          change={{ value: -3, label: 'vs last month' }}
          icon={Warehouse}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Supply vs Demand</CardTitle>
            <CardDescription>14-day forecast of supply allocation against demand</CardDescription>
          </CardHeader>
          <CardContent>
            <SupplyChart />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Acreage by Variety</CardTitle>
            <CardDescription>Distribution of contracted acreage</CardDescription>
          </CardHeader>
          <CardContent>
            <VarietyBreakdown />
            <div className="mt-4 space-y-2">
              {Object.entries(dashboardStats.acreageByVariety).map(([variety, acres]) => (
                <div key={variety} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{variety}</span>
                  <span className="font-medium">{acres} acres</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Financial Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleDollarSign className="h-5 w-5 text-secondary" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Procurement Spend</span>
                <span className="font-semibold">KES {(dashboardStats.financials.totalProcurementSpend / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid Supplies</span>
                <span className="font-medium text-success">KES {(dashboardStats.financials.paidSupplies / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding Payables</span>
                <span className="font-medium text-warning">KES {(dashboardStats.financials.unpaidSupplies / 1000000).toFixed(1)}M</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Farmer Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">KES {(dashboardStats.totalPaidToFarmers / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Paid to Farmers</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xl font-semibold">{dashboardStats.genderSplit.female}%</p>
                <p className="text-xs text-muted-foreground">Female Farmers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">{dashboardStats.genderSplit.male}%</p>
                <p className="text-xs text-muted-foreground">Male Farmers</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Farmer Supply Share</span>
              <Badge variant="success">{dashboardStats.farmerVsAggregatorSupply.farmers}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Supply Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" />
              <div>
                <p className="text-sm font-medium">Supply Shortfall</p>
                <p className="text-xs text-muted-foreground">5 tons deficit expected on Jan 25</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
              <div>
                <p className="text-sm font-medium">Quality Issue</p>
                <p className="text-xs text-muted-foreground">High rejection rate from Narok region</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent border border-border">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium">New Farmers</p>
                <p className="text-xs text-muted-foreground">12 farmers pending contract approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
