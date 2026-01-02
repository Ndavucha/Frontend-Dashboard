// src/components/charts/VarietyDistributionChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VarietyDistributionChart({ data = [] }) {
  // Handle empty data - show onboarding state
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
          </div>
          
          {/* Text */}
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Crop Data Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Variety distribution chart will appear when you add crops to the system.
            Track different crop varieties and their acreage.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/crops/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add First Crop
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/farmers">
                Add Farmer First
              </Link>
            </Button>
          </div>
          
          {/* Helper Text */}
          <p className="text-xs text-gray-400 mt-4">
            Tip: Add farmers first, then assign crops to them
          </p>
        </div>
      </div>
    );
  }

  // If we have data, transform it for the chart
  const chartData = data.map(item => ({
    variety: item.name || item.variety || 'Unknown',
    acres: item.value || item.acres || 0,
    color: item.color || getColorForVariety(item.name || item.variety)
  }));

  // Function to generate consistent colors
  function getColorForVariety(variety) {
    const colorMap = {
      'DK 8031': '#217A2D',
      'H6213': '#FFD700',
      'WH505': '#6E3B1E',
      'SC Duma': '#4CAF50',
      'KH600': '#FF9800',
      'Wheat': '#4CAF50',
      'Rice': '#2196F3',
      'Corn': '#FF9800',
      'Soybean': '#9C27B0',
      'default': '#795548'
    };
    
    // Check for exact match
    if (colorMap[variety]) {
      return colorMap[variety];
    }
    
    // Check for partial match
    for (const [key, color] of Object.entries(colorMap)) {
      if (variety.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Generate a consistent color based on string hash
    let hash = 0;
    for (let i = 0; i < variety.length; i++) {
      hash = variety.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#217A2D', '#FFD700', '#6E3B1E', '#4CAF50', '#FF9800',
      '#2196F3', '#9C27B0', '#795548', '#E91E63', '#00BCD4'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Sort data by acres (descending)
  const sortedData = [...chartData].sort((a, b) => b.acres - a.acres);

  return (
    <div className="h-[350px]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Crop Variety Distribution</h3>
            <p className="text-sm text-muted-foreground">
              {sortedData.length} varieties • {sortedData.reduce((sum, item) => sum + item.acres, 0).toLocaleString()} total acres
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/crops">
              View All
            </Link>
          </Button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="variety" 
            stroke="#888888"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            stroke="#888888"
            fontSize={12}
            label={{ 
              value: 'Acres', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              offset: 10
            }}
            width={60}
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()} acres`, '']}
            labelFormatter={(label) => `Variety: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px 12px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="acres" 
            name="Contracted Acres" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                strokeWidth={0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend at bottom */}
      <div className="flex flex-wrap gap-2 mt-4">
        {sortedData.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-1.5" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">
              {item.variety}: {item.acres.toLocaleString()} acres
            </span>
          </div>
        ))}
        {sortedData.length > 6 && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              +{sortedData.length - 6} more varieties
            </span>
          </div>
        )}
      </div>
    </div>
  );
}