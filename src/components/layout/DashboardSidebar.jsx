import { NavLink, useLocation } from 'react-router-dom';
import { AppLogo } from '@/components/layout/AppLogo';
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  Truck,
  ClipboardList,
  FileText,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Farmers', href: '/farmers', icon: Users },
  { name: 'Buyer Dashboard', href: '/buyer', icon: CalendarRange },
  { name: 'Procurement', href: '/procurement', icon: Truck },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Aggregators', href: '/aggregators', icon: ClipboardList },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo - Simple integration */}
      <div className={cn(
        "flex h-16 items-center justify-center border-b border-sidebar-border",
        collapsed ? "px-0" : "px-4"
      )}>
        {collapsed ? (
          // Collapsed: Show icon only from your logo
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-green">
            <span className="font-bold text-white text-sm">S</span>
          </div>
        ) : (
          // Expanded: Show your full logo
          <div className="w-full">
            <AppLogo.Compact />
          </div>
        )}
      </div>

      {/* Main Navigation - No changes */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
              {!collapsed && <span className="animate-fade-in">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation - No changes */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {bottomNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle - No changes */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  );
}