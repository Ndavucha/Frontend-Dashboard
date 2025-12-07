import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

export default function AgronomistFarmers() {
  const [farmVisits, setFarmVisits] = useState([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map', 'calendar'
  const [filter, setFilter] = useState('all'); // 'all', 'vulnerable', 'behind', 'healthy'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAgronomistData();
  }, []);

  const fetchAgronomistData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/dashboard/agronomist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      // Update assignedFarmers and farmVisits from API response
      if (response.data.assignedFarmers) {
        // This would update your assignedFarmers array
      }
      if (response.data.farmVisits) {
        setFarmVisits(response.data.farmVisits);
      }
    } catch (error) {
      console.error('Error fetching agronomist data:', error);
      // Use existing mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  // Enhanced farmer data with GPS coordinates and more details
  const assignedFarmers = [
    { 
      id: 1, 
      name: 'Peter Ornondi', 
      location: 'Narok', 
      gps: '1.1234, 35.5678',
      variety: 'Shangi', 
      stage: 'Harvest Ready',
      stageProgress: 95,
      lastVisit: '2024-12-15',
      nextVisit: '2024-12-28',
      vulnerable: false,
      lagging: false,
      practices: ['Mulching', 'IPM', 'Drip Irrigation'],
      healthScore: 92
    },
    { 
      id: 2, 
      name: 'Sarah Muthoni', 
      location: 'Nakuru', 
      gps: '0.3031, 36.0800',
      variety: 'Dutch Robjin', 
      stage: 'Flowering',
      stageProgress: 65,
      lastVisit: '2024-12-10',
      nextVisit: '2024-12-25',
      vulnerable: true,
      lagging: true,
      practices: ['Mulching', 'Organic Fertilizer'],
      healthScore: 68
    },
    { 
      id: 3, 
      name: 'John Kamau', 
      location: 'Molo', 
      gps: '0.2470, 35.7356',
      variety: 'Unica', 
      stage: 'Vegetative',
      stageProgress: 40,
      lastVisit: '2024-12-05',
      nextVisit: '2024-12-20',
      vulnerable: false,
      lagging: false,
      practices: ['Conservation Tillage', 'Crop Rotation'],
      healthScore: 85
    },
    { 
      id: 4, 
      name: 'Mary Wanjiku', 
      location: 'Kericho', 
      gps: '0.3671, 35.2837',
      variety: 'Asante', 
      stage: 'Germination',
      stageProgress: 20,
      lastVisit: '2024-12-01',
      nextVisit: '2024-12-15',
      vulnerable: true,
      lagging: true,
      practices: ['Mulching'],
      healthScore: 55
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agronomist data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load agronomist data</p>
        <button 
          onClick={fetchAgronomistData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter farmers based on selection
  const filteredFarmers = assignedFarmers.filter(farmer => {
    if (filter === 'vulnerable') return farmer.vulnerable;
    if (filter === 'behind') return farmer.lagging;
    if (filter === 'healthy') return farmer.healthScore >= 80;
    return true;
  });

  const logFarmVisit = (visitData) => {
    setFarmVisits([...farmVisits, { 
      ...visitData, 
      id: Date.now(), 
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString()
    }]);
    setShowVisitForm(false);
    setSelectedFarmer(null);
  };

  // Crop stage colors
  const getStageColor = (stage) => {
    const colors = {
      'Germination': 'bg-blue-100 text-blue-800',
      'Vegetative': 'bg-green-100 text-green-800',
      'Flowering': 'bg-yellow-100 text-yellow-800',
      'Harvest Ready': 'bg-purple-100 text-purple-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  // Health score colors
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with stats and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Agronomy Team Dashboard</h1>
          <p className="text-gray-600">Manage assigned farmers and field operations</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">View:</span>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'map' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              Map
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              Calendar
            </button>
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Farmers</option>
            <option value="vulnerable">Vulnerable Farmers</option>
            <option value="behind">Lagging Behind</option>
            <option value="healthy">Healthy Farms</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Assigned Farmers</h3>
          <p className="text-2xl">{assignedFarmers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Vulnerable</h3>
          <p className="text-2xl text-red-600">{assignedFarmers.filter(f => f.vulnerable).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Avg Health Score</h3>
          <p className="text-2xl text-green-600">
            {Math.round(assignedFarmers.reduce((sum, f) => sum + f.healthScore, 0) / assignedFarmers.length)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Visits This Month</h3>
          <p className="text-2xl text-blue-600">{farmVisits.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Farmers List/Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farmers Table */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assigned Farmers ({filteredFarmers.length})</h2>
              <div className="text-sm">
                Showing: <span className="font-semibold">{filter === 'all' ? 'All' : filter}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Farmer Name</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Crop & Stage</th>
                    <th className="py-3 px-4 text-left">Health</th>
                    <th className="py-3 px-4 text-left">Next Visit</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{farmer.name}</div>
                        <div className="text-xs text-gray-500">{farmer.gps}</div>
                        <div className="flex space-x-1 mt-1">
                          {farmer.vulnerable && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">Vulnerable</span>
                          )}
                          {farmer.lagging && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Lagging</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{farmer.location}</div>
                        <button className="text-xs text-blue-600 hover:underline mt-1">
                          View on Map
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{farmer.variety}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${getStageColor(farmer.stage)}`}>
                            {farmer.stage}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${farmer.stageProgress}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-bold ${getHealthColor(farmer.healthScore)}`}>
                          {farmer.healthScore}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {farmer.practices.slice(0, 2).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{farmer.nextVisit}</div>
                        <div className="text-xs text-gray-500">
                          Last: {farmer.lastVisit}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setShowVisitForm(true);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Log Visit
                          </button>
                          <button className="text-xs text-gray-600 hover:text-blue-600">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Digital Farm Visit Logs */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Digital Farm Visit Logs</h2>
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                + New Visit Log
              </button>
            </div>
            
            <div className="space-y-4">
              {farmVisits.length > 0 ? farmVisits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{visit.farmerName}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          visit.issues ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {visit.issues ? 'Issues Reported' : 'No Issues'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{visit.date}</span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          GPS: 1.2345, 35.6789
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="font-medium text-gray-700">Observations:</p>
                        <p className="text-gray-600">{visit.observations}</p>
                      </div>
                      {visit.issues && (
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="font-medium text-red-700">Issues Found:</p>
                          <p className="text-red-600">{visit.issues}</p>
                        </div>
                      )}
                      {visit.recommendations && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="font-medium text-blue-700">Recommendations:</p>
                          <p className="text-blue-600">{visit.recommendations}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {/* Placeholder for geotagged photo */}
                      <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Photo</span>
                      </div>
                      <button className="mt-2 text-xs text-blue-600">Add Photo</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No farm visits logged yet.</p>
                  <p className="text-sm mt-1">Log your first farm visit to see records here.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar - Risk & Tools */}
        <div className="space-y-6">
          {/* Risk & Vulnerability Dashboard */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Risk & Vulnerability</h2>
            
            <div className="space-y-4">
              {/* Underperforming Regions */}
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-bold text-red-700 mb-2">Underperforming Regions</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Nakuru North</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Critical</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Molo Central</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">High</span>
                  </li>
                </ul>
              </div>
              
              {/* Weather Risk Zones */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-bold text-yellow-700 mb-2">Weather Risk Zones</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Narok West</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-600">Drought</span>
                    </div>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Kericho Highlands</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-blue-600">Heavy Rain</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Pest/Disease Hotspots */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-orange-700 mb-2">Pest/Disease Hotspots</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Nakuru Central</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Aphids</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Molo East</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Late Blight</span>
                  </li>
                </ul>
              </div>
              
              {/* Farmers Lagging Behind */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-purple-700 mb-2">Farmers Lagging Behind Stages</h3>
                <ul className="space-y-2">
                  {assignedFarmers.filter(f => f.lagging).map(farmer => (
                    <li key={farmer.id} className="flex justify-between items-center">
                      <span>{farmer.name}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        -{100 - farmer.stageProgress}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Agronomy Tools & Actions */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Agronomy Tools</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Farm Visits
              </button>
              <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Reports
              </button>
              <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 0.51c1.89 0.1 3.39 1.6 3.39 3.5v5.9c0 1.1 0.9 2 2 2h.5m8.5-10v8c0 1.1-0.9 2-2 2h-1.5" />
                </svg>
                Send Advisory Messages
              </button>
              <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Flag Critical Issues
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Farm Visit Form Modal */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Log Farm Visit - {selectedFarmer?.name}
              </h3>
              <button 
                onClick={() => setShowVisitForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="font-medium text-blue-700">Farmer Details:</p>
              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                <div><span className="font-medium">Location:</span> {selectedFarmer?.location}</div>
                <div><span className="font-medium">GPS:</span> {selectedFarmer?.gps}</div>
                <div><span className="font-medium">Crop:</span> {selectedFarmer?.variety}</div>
                <div><span className="font-medium">Stage:</span> {selectedFarmer?.stage}</div>
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              logFarmVisit({
                farmerName: selectedFarmer?.name,
                observations: formData.get('observations'),
                issues: formData.get('issues'),
                recommendations: formData.get('recommendations'),
                photos: formData.get('photos') ? 'Yes' : 'No'
              });
            }} className="space-y-4">
              
              <div>
                <label className="block font-medium mb-1">Observations *</label>
                <textarea 
                  name="observations"
                  placeholder="Describe what you observed during the visit..."
                  className="w-full p-3 border rounded"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Crop Health</label>
                  <select name="health" className="w-full p-3 border rounded">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Stage Progress</label>
                  <select name="stageProgress" className="w-full p-3 border rounded">
                    <option value="ontrack">On Track</option>
                    <option value="slightly_behind">Slightly Behind</option>
                    <option value="behind">Behind</option>
                    <option value="significantly_behind">Significantly Behind</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Issues Found (if any)</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" name="pest_issues" className="mr-2" />
                    <span>Pest Infestation</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" name="disease_issues" className="mr-2" />
                    <span>Disease Symptoms</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" name="nutrient_issues" className="mr-2" />
                    <span>Nutrient Deficiency</span>
                  </div>
                </div>
                <input 
                  name="issues"
                  type="text" 
                  placeholder="Other issues..."
                  className="w-full p-3 border rounded mt-2"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Recommendations</label>
                <textarea 
                  name="recommendations"
                  placeholder="Provide recommendations for the farmer..."
                  className="w-full p-3 border rounded"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Geotagged Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                  <input 
                    type="file" 
                    name="photos"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2">Click to upload geotagged photos</p>
                    <p className="text-sm text-gray-500">GPS data will be automatically captured</p>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
