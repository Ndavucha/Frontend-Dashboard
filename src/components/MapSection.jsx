import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Rectangle, Popup } from 'react-leaflet'


const farmers = [
{ id:1, name:'John K', lat:-0.42, lng:36.95, acres:2.5, region:'Nyeri' },
{ id:2, name:'Aisha M', lat:-0.25, lng:37.1, acres:1.2, region:'Timau' },
{ id:3, name:'Peter O', lat:-0.3, lng:36.9, acres:3.0, region:'Kuresoi' },
]


// sample agronomist zone rectangle (bbox)
const zone = [[-0.5,36.8],[-0.1,37.2]]


export default function MapSection(){
return (
<div className="bg-white rounded-2xl p-4 shadow-sm h-80">
<h4 className="font-semibold mb-3">Geospatial Map</h4>
<div className="h-64 rounded overflow-hidden">
<MapContainer center={[-0.3,37.0]} zoom={9} scrollWheelZoom={false} style={{height:'100%', width:'100%'}}>
<TileLayer
attribution='&copy; OpenStreetMap contributors'
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>


{/* Agronomist zone */}
<Rectangle bounds={zone} pathOptions={{color:'#2FA44F', weight:1, fillOpacity:0.05}}>
<Popup>Agronomist Zone A</Popup>
</Rectangle>


{/* Farmer markers as circle markers to avoid icon packaging issues */}
{farmers.map(f=> (
<CircleMarker key={f.id} center={[f.lat,f.lng]} radius={10} pathOptions={{color:'#FF7A59', fillColor:'#FFB199', fillOpacity:0.9}}>
<Tooltip direction="top" offset={[0,-10]} opacity={1}>
<div className="text-sm">
<div className="font-semibold">{f.name}</div>
<div>{f.acres} acres — {f.region}</div>
</div>
</Tooltip>
</CircleMarker>
))}
</MapContainer>
</div>


<div className="mt-3 text-xs text-gray-500">Layers: Farmers • Acreage heatmap (future) • Weather risk overlay • Agronomist zones</div>
</div>
)
}