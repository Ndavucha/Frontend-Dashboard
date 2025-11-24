import React from 'react'


export default function StatsCards({items}){
return (
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
{items.map(s=> (
<div key={s.title} className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition">
<div className="flex items-center justify-between">
<div>
<div className="text-sm text-gray-500">{s.title}</div>
<div className="text-2xl font-semibold mt-2">{s.value}</div>
<div className="text-sm text-green-600 mt-1">{s.sub}</div>
</div>
<div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
</svg>
</div>
</div>
</div>
))}
</div>
)
}