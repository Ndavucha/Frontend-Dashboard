import React, { useState } from 'react';

export default function FarmerMyFarm() {
  const [farmData, setFarmData] = useState({
    plotSize: '18 ha',
    plantingDate: '2024-08-15',
    expectedHarvest: '2024-12-28',
    variety: 'Shangi',
    progress: 85
  });

  const [advisories, setAdvisories] = useState([
    { id: 1, type: 'weather', message: 'Heavy rain expected tomorrow', date: '2024-12-20' },
    { id: 2, type: 'task', message: 'Apply fertilizer this week', date: '2024-12-18' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Farm Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Farm Details */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Farm Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plot Size</label>
                <p className="mt-1">{farmData.plotSize}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Variety</label>
                <p className="mt-1">{farmData.variety}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                <p className="mt-1">{farmData.plantingDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Harvest</label>
                <p className="mt-1">{farmData.expectedHarvest}</p>
              </div>
            </div>
          </section>

          {/* Crop Progress */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Crop Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Growth Progress</span>
                  <span>{farmData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{width: `${farmData.progress}%`}}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="font-semibold">Planted</p>
                  <p>Aug 15</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="font-semibold">Germinated</p>
                  <p>Aug 25</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="font-semibold">Flowering</p>
                  <p>Oct 10</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <p className="font-semibold">Harvest</p>
                  <p>Dec 28</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Advisory Messages */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Advisory Messages</h2>
            <div className="space-y-3">
              {advisories.map((advisory) => (
                <div key={advisory.id} className={`p-3 rounded-lg border ${
                  advisory.type === 'weather' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 rounded text-xs ${
                      advisory.type === 'weather' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {advisory.type === 'weather' ? 'Weather' : 'Task'}
                    </span>
                    <span className="text-sm text-gray-500">{advisory.date}</span>
                  </div>
                  <p className="mt-2">{advisory.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-green-500 text-white py-2 rounded">
                Update Progress
              </button>
              <button className="w-full bg-blue-500 text-white py-2 rounded">
                Request Support
              </button>
              <button className="w-full bg-purple-500 text-white py-2 rounded">
                View Market Prices
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}