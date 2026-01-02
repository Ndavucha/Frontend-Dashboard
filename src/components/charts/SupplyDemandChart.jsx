// src/components/charts/SupplyDemandChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function SupplyDemandChart({ data = [] }) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">Supply vs demand chart will appear when you create orders</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create First Order
          </button>
        </div>
      </div>
    );
  }

  // Transform data if needed
  const chartData = data.map(item => ({
    day: item.week || item.date || 'Unknown',
    supply: item.supply || 0,
    demand: item.demand || 0,
    deficit: item.deficit || (item.supply - item.demand) || 0,
  }));

  return (
    <div className="h-[350px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Supply vs Demand</h3>
        <p className="text-sm text-muted-foreground">Real-time tracking of supply allocation against demand</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#888888" fontSize={12} />
          <YAxis stroke="#888888" fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="supply" stroke="#217A2D" strokeWidth={2} name="Supply" />
          <Line type="monotone" dataKey="demand" stroke="#FFD700" strokeWidth={2} name="Demand" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}