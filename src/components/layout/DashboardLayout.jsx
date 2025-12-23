import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

export function DashboardLayout({ children, title, description }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader title={title} description={description} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
