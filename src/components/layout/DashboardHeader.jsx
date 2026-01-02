import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DashboardHeader({ title, description, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            className="w-64 pl-9"
          />
        </div>
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-medium text-gray-900">
            3
          </span>
        </Button>
        
        {/* User profile */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-white font-bold text-sm">JD</span>
          </div>
        </Button>
      </div>
    </header>
  );
}
