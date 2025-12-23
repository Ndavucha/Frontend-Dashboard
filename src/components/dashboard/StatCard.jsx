import { cn } from '@/lib/utils';

export function StatCard({ title, value, change, icon: Icon, variant = 'default' }) {
  const variants = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    secondary: 'bg-secondary/20 border-secondary/30',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
  };

  const iconVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/30 text-secondary-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <p className={cn(
              'text-sm font-medium',
              change.value >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3 transition-transform duration-300 group-hover:scale-110', iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
