import React, { useState } from 'react'


const alerts = [
{ id:1, title:'Heavy rainfall expected in Nyandarua', severity:'high', affected:12, action:'Move drying sheds' },
{ id:2, title:'Frost risk in Timau', severity:'medium', affected:5, action:'Cover seedlings' },
{ id:3, title:'Drought forecast in Kuresoi', severity:'low', affected:8, action:'Irrigation prioritization' },
]


export default function WeatherPanel(){
const [open, setOpen] = useState(true)


return (
<div className={`fixed transition-transform top-24 right-6 w-80 bg-white rounded-2xl p-4 shadow-lg overflow-y-auto h-[70vh] ${open? 'translate-x-0' : 'translate-x-36'}`}>
<div className="flex items-center justify-between mb-3">
<h4 className="font-semibold">Weather Alerts</h4>
<button className="text-sm text-gray-500" onClick={()=>setOpen(!open)}>{open? 'Collapse' : 'Open'}</button>
</div>


{alerts.map(a=> (
<div key={a.id} className={`mb-3 p-3 border-l-4 rounded bg-gray-50 ${a.severity==='high' ? 'border-red-500': a.severity==='medium'? 'border-yellow-500' : 'border-green-500'}`}>
<div className="text-sm font-semibold">{a.title}</div>
<div className="text-xs text-gray-500">{a.affected} farmers affected</div>
<div className="text-xs mt-1">Recommended: {a.action}</div>
<div className="mt-2 flex gap-2">
<button className="text-xs px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>alert('Notifying agronomists...')}>Notify Agronomists</button>
<button className="text-xs px-2 py-1 border rounded" onClick={()=>alert('View affected farmers (mock)')}>View</button>
</div>
</div>
))}
</div>
)
}