import React, { useState } from 'react';

export default function AgronomistFarmers() {
  const [farmVisits, setFarmVisits] = useState([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const assignedFarmers = [
    { id: 1, name: 'Peter Ornondi', location: 'Narok', variety: 'Shangi', stage: 'Harvest Ready' },
    { id: 2, name: 'Sarah Muthoni', location: 'Nakuru', variety: 'Dutch Robjin', stage: 'Flowering' },
  ];

  const logFarmVisit = (visitData) => {
    setFarmVisits([...farmVisits, { ...visitData, id: Date.now(), date: new Date().toLocaleDateString() }]);
    setShowVisitForm(false);
    setSelectedFarmer(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assigned Farmers Management</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Farmers List */}
        <div className="col-span-2 space-y-6">
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">My Farmers</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Farmer Name</th>
                    <th className="py-2 px-4 text-left">Location</th>
                    <th className="py-2 px-4 text-left">Variety</th>
                    <th className="py-2 px-4 text-left">Crop Stage</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b">
                      <td className="py-2 px-4">{farmer.name}</td>
                      <td className="py-2 px-4">{farmer.location}</td>
                      <td className="py-2 px-4">{farmer.variety}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          farmer.stage === 'Harvest Ready' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {farmer.stage}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button 
                          onClick={() => {
                            setSelectedFarmer(farmer);
                            setShowVisitForm(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Log Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Farm Visits History */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Farm Visit History</h2>
            <div className="space-y-3">
              {farmVisits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{visit.farmerName}</h4>
                      <p className="text-sm text-gray-600">{visit.date}</p>
                      <p className="mt-2">{visit.observations}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      visit.issues ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {visit.issues ? 'Issues Found' : 'Healthy'}
                    </span>
                  </div>
                  {visit.recommendations && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded">
                      <strong>Recommendations:</strong> {visit.recommendations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 text-white py-2 rounded">
                Schedule Farm Visits
              </button>
              <button className="w-full bg-green-500 text-white py-2 rounded">
                Generate Reports
              </button>
              <button className="w-full bg-purple-500 text-white py-2 rounded">
                Send Advisory Messages
              </button>
            </div>
          </section>

          {/* Risk Alerts */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Risk & Vulnerability</h2>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="font-semibold">Pest Alert</p>
                <p className="text-sm">Narok region - Monitor for aphids</p>
              </div>
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold">Weather Warning</p>
                <p className="text-sm">Heavy rain expected this week</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Farm Visit Form Modal */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Log Farm Visit - {selectedFarmer?.name}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              logFarmVisit({
                farmerName: selectedFarmer.name,
                observations: formData.get('observations'),
                issues: formData.get('issues'),
                recommendations: formData.get('recommendations')
              });
            }} className="space-y-4">
              <textarea 
                name="observations"
                placeholder="Observations"
                className="w-full p-2 border rounded"
                rows="3"
                required
              ></textarea>
              <input 
                name="issues"
                type="text" 
                placeholder="Issues Found (if any)"
                className="w-full p-2 border rounded"
              />
              <textarea 
                name="recommendations"
                placeholder="Recommendations"
                className="w-full p-2 border rounded"
                rows="2"
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}