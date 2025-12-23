import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SupplyChart } from '@/components/dashboard/SupplyChart';
import { VarietyBreakdown } from '@/components/dashboard/VarietyBreakdown';
import { dashboardStats } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Users, MapPin, CircleDollarSign } from 'lucide-react';

const countyData = [
  { name: 'Narok', farmers: 45, volume: 180 },
  { name: 'Nakuru', farmers: 38, volume: 152 },
  { name: 'Nyandarua', farmers: 32, volume: 128 },
  { name: 'Meru', farmers: 25, volume: 100 },
  { name: 'Kiambu', farmers: 16, volume: 64 },
];

const ageData = Object.entries(dashboardStats.ageDistribution).map(([age, value]) => ({
  name: age,
  value,
}));

const genderData = [
  { name: 'Female', value: dashboardStats.genderSplit.female },
  { name: 'Male', value: dashboardStats.genderSplit.male },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Analytics() {
  return (
    <DashboardLayout
      title="Analytics & Insights"
      description="Deep dive into supply chain performance metrics"
    >
      <Tabs defaultValue="supply" className="space-y-6">
        <TabsList>
          <TabsTrigger value="supply">Supply Analytics</TabsTrigger>
          <TabsTrigger value="farmers">Farmer Insights</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Daily Capacity"
              value={`${dashboardStats.dailyProductionCapacity} tons`}
              icon={TrendingUp}
              variant="primary"
            />
            <StatCard
              title="Required Intake"
              value={`${dashboardStats.requiredDailyIntake} tons`}
              icon={TrendingUp}
            />
            <StatCard
              title="Avg. Actual Intake"
              value={`${dashboardStats.averageActualIntake} tons`}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Aggregator Dependency"
              value={`${dashboardStats.aggregatorDependency}%`}
              icon={Users}
              variant="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Supply vs Demand Trend</CardTitle>
                <CardDescription>14-day rolling view</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplyChart />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Supply by County</CardTitle>
                <CardDescription>Regional distribution of supply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Volume (tons)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farmers" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Farmers"
              value={dashboardStats.totalFarmersContracted}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Female Farmers"
              value={`${dashboardStats.genderSplit.female}%`}
              icon={Users}
              variant="success"
            />
            <StatCard
              title="Total Acreage"
              value={`${dashboardStats.totalAcreage} acres`}
              icon={MapPin}
            />
            <StatCard
              title="Paid to Farmers"
              value={`KES ${(dashboardStats.totalPaidToFarmers / 1000000).toFixed(1)}M`}
              icon={CircleDollarSign}
              variant="secondary"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Farmer demographic breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>Farmer age group breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value}%`, 'Percentage']}
                      />
                      <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Spend"
              value={`KES ${(dashboardStats.financials.totalProcurementSpend / 1000000).toFixed(1)}M`}
              icon={CircleDollarSign}
              variant="primary"
            />
            <StatCard
              title="Paid Supplies"
              value={`KES ${(dashboardStats.financials.paidSupplies / 1000000).toFixed(1)}M`}
              icon={CircleDollarSign}
              variant="success"
            />
            <StatCard
              title="Outstanding"
              value={`KES ${(dashboardStats.financials.unpaidSupplies / 1000000).toFixed(1)}M`}
              icon={CircleDollarSign}
              variant="warning"
            />
            <StatCard
              title="Avg. Price"
              value={`KES ${dashboardStats.financials.averageBuyingPrice}/kg`}
              icon={TrendingUp}
            />
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Variety-wise Acreage Distribution</CardTitle>
              <CardDescription>Contracted acreage by potato variety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <VarietyBreakdown />
                <div className="space-y-4">
                  {Object.entries(dashboardStats.acreageByVariety).map(([variety, acres], idx) => (
                    <div key={variety} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx] }}
                        />
                        <span className="font-medium">{variety}</span>
                      </div>
                      <span className="text-lg font-bold">{acres.toLocaleString()} acres</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
