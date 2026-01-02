import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StatCard({ title, value, change, icon }) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}% vs last month
              </span>
            </div>
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-muted">
              <span className="text-2xl">{icon}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewStats() {
  const stats = [
    {
      title: 'Active Farmers',
      value: '156',
      change: 12,
      icon: '👨‍🌾'
    },
    {
      title: 'Contracted Acreage',
      value: '485 acres',
      change: 8,
      icon: '🌱'
    },
    {
      title: 'Expected Supply',
      value: '1940 tons',
      change: 0,
      icon: '📦'
    },
    {
      title: 'Deficit Rate',
      value: '18%',
      change: -3,
      icon: '⚠️'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard 
          key={index} 
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}