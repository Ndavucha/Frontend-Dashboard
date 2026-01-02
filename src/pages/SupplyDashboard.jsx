import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupplyPlanningTab } from '@/components/buyer/SupplyPlanningTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';

export default function SupplyDashboard() {
  const [activeTab, setActiveTab] = useState('supply');

  return (
    <DashboardLayout
      title="Supply Planning"
      description="Plan supply ahead of time and allocate farmers to dates"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="supply" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Supply Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="animate-fade-in">
          <SupplyPlanningTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}