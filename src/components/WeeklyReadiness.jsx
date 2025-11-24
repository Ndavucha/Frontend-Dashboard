import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'


const weeklyData = [
{ week: 'Week 1', projected: 420, capacity: 480 },
{ week: 'Week 2', projected: 470, capacity: 500 },
{ week: 'Week 3', projected: 490, capacity: 510 },
{ week: 'Week 4', projected: 450, capacity: 480 },
{ week: 'Week 5', projected: 470, capacity: 490 },
{ week: 'Week 6', projected: 520, capacity: 500 },
]


export default function WeeklyReadiness(){
return (
<div className="bg-white rounded-2xl p-6 shadow-sm">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold">Weekly Production Readiness</h3>
<div className="text-sm text-gray-500">kg/day</div>
</div>


<div style={{width:'100%', height:320}}>
<ResponsiveContainer>
<BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="week" />
<YAxis />
<Tooltip />
<Legend verticalAlign="bottom" />
<Bar dataKey="projected" name="Projected Supply" stackId="a" fill="#2FA44F" radius={[8,8,0,0]} />
<Bar dataKey="capacity" name="Daily Capacity" stackId="a" fill="#F6A623" radius={[8,8,0,0]} />
</BarChart>
</ResponsiveContainer>
</div>
</div>
)
}