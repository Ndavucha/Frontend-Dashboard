import { Bell, Search, User, Menu } from 'lucide-react';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DashboardHeader({ 
  title, 
  description,
  showLogo = false,
  onMenuClick 
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Logo (optional) */}
        {showLogo && (
          <div className="hidden md:block">
            <AppLogo.Compact />
          </div>
        )}
        
        {/* Title and description */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      
      {/* Right side - Search and actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search farmers, crops, orders..."
            className="w-64 pl-9 bg-background border-border focus:border-brand-green focus:ring-brand-green/20"
          />
        </div>
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-medium text-gray-900">
            3
          </span>
        </Button>
        
        {/* Quick Action Button */}
        <Button
          variant="default"
          className="hidden sm:flex items-center gap-2 bg-brand-green hover:bg-green-800 text-white"
        >
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">+</span>
        </Button>
        
        {/* User profile */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border hover:border-brand-green"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Alternative simplified version for mobile
export function MobileDashboardHeader({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <AppLogo.Compact />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-medium text-gray-900">
            2
          </span>
        </Button>
        
        <Button
          variant="default"
          size="icon"
          className="bg-brand-green hover:bg-green-800 text-white"
        >
          +
        </Button>
      </div>
    </header>
  );
}

// Header with breadcrumbs
export function DashboardHeaderWithBreadcrumbs({ 
  title, 
  breadcrumbs = [],
  actions 
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-1">/</span>}
                  <a 
                    href={crumb.href} 
                    className={`hover:text-brand-green transition-colors ${
                      index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''
                    }`}
                  >
                    {crumb.label}
                  </a>
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Action buttons */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
        
        {/* Search - compact version */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-48 pl-9 bg-background border-border"
          />
        </div>
        
        {/* User profile */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-green flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </Button>
      </div>
    </header>
  );
}

// Header for specific sections with your brand colors
export function SectionHeader({ 
  title, 
  icon: Icon,
  description,
  action 
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-brand-green/10">
              <Icon className="h-5 w-5 text-brand-green" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
      
      {/* Accent line with your brand color */}
      <div className="mt-4 h-0.5 w-12 bg-gradient-to-r from-brand-green to-brand-yellow rounded-full"></div>
    </div>
  );
}