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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Farmers', href: '/farmers', icon: Users },
  { name: 'Procurement', href: '/procurement', icon: Truck },
  { name: 'Contracts', href: '/contracts', icon: FileText }, // Using FileText for Contracts
  { name: 'Aggregators', href: '/aggregators', icon: CalendarRange },// New procurement page
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Main DashboardSidebar component
export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-sidebar transition-all duration-300',
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

      {/* Main Navigation */}
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

      {/* Bottom Navigation */}
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

      {/* Collapse Toggle */}
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

// Mobile DashboardSidebar component
export function MobileDashboardSidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Logo Section */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-4">
          <AppLogo.Compact />
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full border-t border-sidebar-border px-3 py-4">
          {bottomNav.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
