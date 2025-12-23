import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HarvestPlanningTab } from '@/components/buyer/HarvestPlanningTab';
import { SupplyPlanningTab } from '@/components/buyer/SupplyPlanningTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, TrendingUp } from 'lucide-react';

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('harvest');

  return (
    <DashboardLayout
      title="Buyer Dashboard"
      description="Plan supply ahead of time and allocate farmers to dates"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="harvest" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Harvest & Intake Planning
          </TabsTrigger>
          <TabsTrigger value="supply" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Supply Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="harvest" className="animate-fade-in">
          <HarvestPlanningTab />
        </TabsContent>

        <TabsContent value="supply" className="animate-fade-in">
          <SupplyPlanningTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
