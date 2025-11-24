import React from 'react'


const mock = [
{ name: 'John K.', startOffset: 1, length: 6, acres: 2.5, variety: 'Maize', region: 'Nyeri' },
{ name: 'Aisha M.', startOffset: 3, length: 4, acres: 1.2, variety: 'Beans', region: 'Timau' },
{ name: 'Peter O.', startOffset: 7, length: 5, acres: 3.0, variety: 'Potato', region: 'Kuresoi' },
{ name: 'Farmer D', startOffset: 9, length: 3, acres: 0.8, variety: 'Maize', region: 'Nyandarua' },
]


export default function HarvestTimeline(){
// timeline scale: next 14 days
const days = Array.from({length:14}, (_,i)=>i+1)


return (
<div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-semibold">Harvest Timeline (Next 14 days)</h3>
<div className="text-sm text-gray-500">Filters: Variety • Region • Timeline • Agronomist</div>
</div>


<div className="w-full overflow-auto">
<div className="grid grid-cols-14 gap-2 items-center mt-2">
{/* header days */}
<div className="flex gap-2 text-xs text-gray-500 mb-2">
{days.map(d=> (
<div key={d} className="w-12 text-center">Day {d}</div>
))}
</div>


{/* rows */}
<div className="space-y-3 mt-3">
{mock.map((m, idx)=> (
<div key={idx} className="flex items-center gap-3">
<div className="w-36 text-sm">{m.name} · {m.variety} · {m.acres}ac</div>
<div className="flex-1 bg-gray-100 rounded px-2 py-1">
<div className="relative h-8">
<div
className="absolute top-0 h-8 rounded bg-green-300 hover:brightness-95 cursor-pointer"
style={{left:`${(m.startOffset/14)*100}%`, width:`${(m.length/14)*100}%`}}
title={`${m.name} — ${m.variety} — ${m.acres} acres — region: ${m.region}`}
onClick={()=>alert(`${m.name}\n${m.variety} — ${m.acres} acres\nRegion: ${m.region}`)}
/>
</div>
</div>
</div>
))}
</div>
</div>
</div>


</div>
)
}