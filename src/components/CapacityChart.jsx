import React from 'react'


export default function CapacityChart({dailyCapacity,setDailyCapacity,projectedSupply,demandMetPct,outsourceNeeded}){
return (
<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold">Production Capacity Analysis</h3>
<div className="text-sm text-gray-500">Daily Production Capacity (kg)</div>
</div>


<div className="mb-6">
<input type="number" value={dailyCapacity} onChange={(e)=>setDailyCapacity(Number(e.target.value))} className="w-48 p-3 border rounded-lg shadow-sm" />
</div>


<div className="grid grid-cols-3 gap-4 mb-6">
<div className="bg-gray-50 rounded-xl p-4">
<div className="text-sm text-gray-500">Projected Supply</div>
<div className="text-2xl font-bold text-green-700 mt-2">{projectedSupply} kg/day</div>
</div>


<div className="bg-gray-50 rounded-xl p-4">
<div className="text-sm text-gray-500">Demand Met</div>
<div className="text-2xl font-bold text-green-600 mt-2">{demandMetPct}%</div>
</div>


<div className="bg-gray-50 rounded-xl p-4">
<div className="text-sm text-gray-500">Outsource Needed</div>
<div className="text-2xl font-bold text-orange-500 mt-2">{outsourceNeeded} kg/day</div>
</div>
</div>


<div className="mt-2">
<div className="text-sm text-gray-500 mb-2">Fulfillment Progress</div>
<div className="w-full bg-gray-100 rounded-full h-4">
<div className="h-4 rounded-full" style={{width:`${demandMetPct}%`, background:'linear-gradient(90deg,#1E8A3E,#61D28E)'}} />
</div>
</div>
</div>
)
}