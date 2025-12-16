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
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const [assignedFarmers, setAssignedFarmers] = useState([]);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    vulnerableCount: 0,
    averageHealth: 0,
    visitsThisMonth: 0,
    laggingCount: 0
  });

  useEffect(() => {
    fetchAgronomistData();
  }, []);

  const fetchAgronomistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Fetching agronomist data...');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/dashboard/agronomist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Agronomist API Response:', response.data);
      
      setData(response.data);
      
      // Update state from API response
      if (response.data.assignedFarmers) {
        setAssignedFarmers(response.data.assignedFarmers);
      }
      
      if (response.data.farmVisits) {
        setFarmVisits(response.data.farmVisits);
      }
      
      if (response.data.stats) {
        setStats(response.data.stats);
      }
      
    } catch (error) {
      console.error('Error fetching agronomist data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to access agronomist data.');
      } else if (error.response?.data?.error) {
        setError(`Server error: ${error.response.data.error}`);
      } else if (error.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to load agronomist data. Please try again.');
      }
      
      // Use comprehensive mock data as fallback
      setAssignedFarmers([
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
          healthScore: 92,
          email: 'peter@example.com',
          phone: '+254712345678',
          plotSize: '18 ha'
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
          healthScore: 68,
          email: 'sarah@example.com',
          phone: '+254723456789',
          plotSize: '12 ha'
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
          healthScore: 85,
          email: 'john@example.com',
          phone: '+254734567890',
          plotSize: '22 ha'
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
          healthScore: 55,
          email: 'mary@example.com',
          phone: '+254745678901',
          plotSize: '8 ha'
        },
        { 
          id: 5, 
          name: 'David Omondi', 
          location: 'Nakuru', 
          gps: '0.2900, 36.0800',
          variety: 'Shangi', 
          stage: 'Vegetative',
          stageProgress: 45,
          lastVisit: '2024-12-08',
          nextVisit: '2024-12-22',
          vulnerable: false,
          lagging: true,
          practices: ['Mulching', 'Drip Irrigation'],
          healthScore: 72,
          email: 'david@example.com',
          phone: '+254756789012',
          plotSize: '15 ha'
        }
      ]);
      
      setFarmVisits([
        {
          id: 1,
          farmer_id: 2,
          farmer_name: 'Sarah Muthoni',
          visit_date: '2024-12-10',
          observations: 'Farm visit completed. Dutch Robjin crop at Flowering stage. Pest infestation detected.',
          issues: 'Pest infestation detected',
          recommendations: 'Apply pesticide and monitor closely',
          created_at: '2024-12-10T10:30:00Z'
        },
        {
          id: 2,
          farmer_id: 3,
          farmer_name: 'John Kamau',
          visit_date: '2024-12-05',
          observations: 'Farm visit completed. Unica crop at Vegetative stage. Crop is healthy and on track.',
          issues: null,
          recommendations: 'Continue current practices',
          created_at: '2024-12-05T14:20:00Z'
        }
      ]);
      
      setStats({
        totalFarmers: 5,
        vulnerableCount: 2,
        averageHealth: 74,
        visitsThisMonth: 2,
        laggingCount: 3
      });
      
      setData({
        agronomist: {
          id: 1,
          name: `${user?.firstName || 'Demo'} ${user?.lastName || 'Agronomist'}`,
          email: user?.email || 'agronomist@example.com',
          region: 'Central Region'
        },
        riskZones: [
          { name: 'Nakuru North', risk: 'Critical', issue: 'Drought', farmersAffected: 12 },
          { name: 'Molo Central', risk: 'High', issue: 'Late Blight', farmersAffected: 8 },
          { name: 'Narok West', risk: 'Medium', issue: 'Aphids', farmersAffected: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchAgronomistData();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agronomist data...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching from server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button 
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                setError(null);
                // Continue with mock data already loaded
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Continue with Demo Data
            </button>
          </div>
        </div>
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
    const newVisit = {
      id: Date.now(),
      farmer_id: selectedFarmer?.id,
      farmer_name: selectedFarmer?.name,
      visit_date: new Date().toISOString().split('T')[0],
      observations: visitData.observations,
      issues: visitData.issues,
      recommendations: visitData.recommendations,
      created_at: new Date().toISOString()
    };
    
    setFarmVisits([newVisit, ...farmVisits]);
    setShowVisitForm(false);
    setSelectedFarmer(null);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      visitsThisMonth: prev.visitsThisMonth + 1
    }));
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

  // Debug info (remove in production)
  const showDebugInfo = process.env.NODE_ENV === 'development';

  return (
    <div className="p-6 space-y-6">
      {/* Debug Info */}
      {showDebugInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800">Debug Info:</p>
          <p>Data loaded: {data ? 'Yes' : 'No'}</p>
          <p>Assigned Farmers: {assignedFarmers.length}</p>
          <p>Farm Visits: {farmVisits.length}</p>
          <p>Filter: {filter}</p>
          <p>View Mode: {viewMode}</p>
        </div>
      )}

      {/* Header with stats and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Agronomy Team Dashboard</h1>
          <p className="text-gray-600">Manage assigned farmers and field operations</p>
          {data?.agronomist && (
            <p className="text-sm text-gray-500 mt-1">
              Agronomist: <span className="font-medium">{data.agronomist.name}</span> | 
              Region: <span className="font-medium">{data.agronomist.region}</span> | 
              Email: <span className="font-medium">{data.agronomist.email}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">View:</span>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'map' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Map
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Calendar
            </button>
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Farmers</option>
            <option value="vulnerable">Vulnerable Farmers</option>
            <option value="behind">Lagging Behind</option>
            <option value="healthy">Healthy Farms</option>
          </select>
          
          <button 
            onClick={fetchAgronomistData}
            className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 text-sm">Assigned Farmers</h3>
          <p className="text-2xl font-bold">{stats.totalFarmers || assignedFarmers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 text-sm">Vulnerable</h3>
          <p className="text-2xl font-bold text-red-600">{stats.vulnerableCount || assignedFarmers.filter(f => f.vulnerable).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 text-sm">Lagging Behind</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.laggingCount || assignedFarmers.filter(f => f.lagging).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 text-sm">Avg Health Score</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.averageHealth || Math.round(assignedFarmers.reduce((sum, f) => sum + (f.healthScore || 0), 0) / Math.max(assignedFarmers.length, 1))}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 text-sm">Visits This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.visitsThisMonth || farmVisits.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Farmers List/Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farmers Table */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Assigned Farmers ({filteredFarmers.length})</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing: <span className="font-semibold text-gray-800">
                    {filter === 'all' ? 'All' : 
                     filter === 'vulnerable' ? 'Vulnerable' : 
                     filter === 'behind' ? 'Lagging' : 'Healthy'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    if (assignedFarmers.length > 0) {
                      setSelectedFarmer(assignedFarmers[0]);
                      setShowVisitForm(true);
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  + Log Quick Visit
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop & Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Visit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{farmer.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{farmer.gps}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {farmer.vulnerable && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Vulnerable</span>
                          )}
                          {farmer.lagging && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Lagging</span>
                          )}
                          {farmer.healthScore >= 80 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Healthy</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{farmer.location}</div>
                        <div className="text-xs text-gray-500 mt-1">{farmer.plotSize || '18 ha'}</div>
                        <button className="text-xs text-blue-600 hover:underline mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View on Map
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{farmer.variety}</div>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(farmer.stage)}`}>
                            {farmer.stage}
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{width: `${farmer.stageProgress}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{farmer.stageProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-bold text-lg ${getHealthColor(farmer.healthScore)}`}>
                          {farmer.healthScore}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {farmer.practices?.slice(0, 2).join(', ') || 'No practices listed'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{farmer.nextVisit}</div>
                        <div className="text-xs text-gray-500">
                          Last: {farmer.lastVisit}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setShowVisitForm(true);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Log Visit
                          </button>
                          <button className="text-sm text-gray-600 hover:text-blue-600 hover:underline">
                            View Details
                          </button>
                          <button className="text-sm text-gray-600 hover:text-green-600 hover:underline">
                            Send Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredFarmers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-4">No farmers match the selected filter</p>
                  <button 
                    onClick={() => setFilter('all')}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Show all farmers
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Digital Farm Visit Logs */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Digital Farm Visit Logs</h2>
                <p className="text-gray-600 text-sm mt-1">Recent farm visits and observations</p>
              </div>
              <button 
                onClick={() => {
                  if (assignedFarmers.length > 0) {
                    setSelectedFarmer(assignedFarmers[0]);
                    setShowVisitForm(true);
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Visit Log
              </button>
            </div>
            
            <div className="space-y-4">
              {farmVisits.length > 0 ? farmVisits.map((visit) => (
                <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-lg">{visit.farmer_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          visit.issues ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {visit.issues ? 'Issues Reported' : 'No Issues'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(visit.visit_date || visit.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          GPS: {assignedFarmers.find(f => f.id === visit.farmer_id)?.gps || '1.2345, 35.6789'}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-1">Observations:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded">{visit.observations}</p>
                      </div>
                      {visit.issues && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="font-medium text-red-700 mb-1">Issues Found:</p>
                          <p className="text-red-600">{visit.issues}</p>
                        </div>
                      )}
                      {visit.recommendations && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-700 mb-1">Recommendations:</p>
                          <p className="text-blue-600">{visit.recommendations}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <div className="w-28 h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-2">Add Photo</span>
                      </div>
                      <button className="mt-2 text-xs text-blue-600 hover:underline w-full text-center">
                        Upload Geotagged Photo
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-lg">No farm visits logged yet</p>
                  <p className="text-sm mt-1">Log your first farm visit to see records here</p>
                  <button 
                    onClick={() => {
                      if (assignedFarmers.length > 0) {
                        setSelectedFarmer(assignedFarmers[0]);
                        setShowVisitForm(true);
                      }
                    }}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Log First Visit
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar - Risk & Tools */}
        <div className="space-y-6">
          {/* Risk & Vulnerability Dashboard */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Risk & Vulnerability</h2>
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                {data?.riskZones?.length || 3} Risk Zones
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Underperforming Regions */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="font-bold text-red-700 mb-3">⚠️ Underperforming Regions</h3>
                <ul className="space-y-3">
                  {(data?.riskZones || []).map((zone, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{zone.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        zone.risk === 'Critical' ? 'bg-red-500 text-white' :
                        zone.risk === 'High' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {zone.risk}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Weather Risk Zones */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h3 className="font-bold text-yellow-700 mb-3">🌦️ Weather Risk Zones</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Narok West</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-600 font-medium">Drought</span>
                    </div>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Kericho Highlands</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-blue-600 font-medium">Heavy Rain</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Pest/Disease Hotspots */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="font-bold text-orange-700 mb-3">🐛 Pest/Disease Hotspots</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Nakuru Central</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">Aphids</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Molo East</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Late Blight</span>
                  </li>
                </ul>
              </div>
              
              {/* Farmers Lagging Behind */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-bold text-purple-700 mb-3">📉 Farmers Lagging Behind</h3>
                <ul className="space-y-3">
                  {assignedFarmers.filter(f => f.lagging).slice(0, 3).map(farmer => (
                    <li key={farmer.id} className="flex justify-between items-center">
                      <span className="font-medium truncate mr-2">{farmer.name}</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold whitespace-nowrap">
                        -{100 - farmer.stageProgress}%
                      </span>
                    </li>
                  ))}
                </ul>
                {assignedFarmers.filter(f => f.lagging).length > 3 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    +{assignedFarmers.filter(f => f.lagging).length - 3} more farmers lagging
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Agronomy Tools & Actions */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Agronomy Tools</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                Quick Actions
              </span>
            </div>
            <div className="space-y-4">
              <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Farm Visits
              </button>
              <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Reports
              </button>
              <button className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center transition-colors shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 0.51c1.89 0.1 3.39 1.6 3.39 3.5v5.9c0 1.1 0.9 2 2 2h.5m8.5-10v8c0 1.1-0.9 2-2 2h-1.5" />
                </svg>
                Send Advisory Messages
              </button>
              <button className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 flex items-center justify-center transition-colors shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Flag Critical Issues
              </button>
              <button 
                onClick={fetchAgronomistData}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh All Data
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Farm Visit Form Modal */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold">
                  Log Farm Visit
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Logging visit for: <span className="font-medium text-blue-600">{selectedFarmer?.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowVisitForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-2">Farmer Details:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Location:</span> {selectedFarmer?.location}</div>
                <div><span className="font-medium">GPS:</span> {selectedFarmer?.gps}</div>
                <div><span className="font-medium">Crop Variety:</span> {selectedFarmer?.variety}</div>
                <div><span className="font-medium">Stage:</span> {selectedFarmer?.stage}</div>
                <div><span className="font-medium">Health Score:</span> {selectedFarmer?.healthScore}%</div>
                <div><span className="font-medium">Plot Size:</span> {selectedFarmer?.plotSize}</div>
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
            }} className="space-y-6">
              
              <div>
                <label className="block font-medium mb-2">Observations *</label>
                <textarea 
                  name="observations"
                  placeholder="Describe what you observed during the visit..."
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-2">Crop Health</label>
                  <select name="health" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Stage Progress</label>
                  <select name="stageProgress" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="ontrack">On Track</option>
                    <option value="slightly_behind">Slightly Behind</option>
                    <option value="behind">Behind</option>
                    <option value="significantly_behind">Significantly Behind</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Issues Found (if any)</label>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center">
                    <input type="checkbox" name="pest_issues" className="mr-2 h-4 w-4" />
                    <span>Pest Infestation</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" name="disease_issues" className="mr-2 h-4 w-4" />
                    <span>Disease Symptoms</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" name="nutrient_issues" className="mr-2 h-4 w-4" />
                    <span>Nutrient Deficiency</span>
                  </div>
                </div>
                <input 
                  name="issues"
                  type="text" 
                  placeholder="Other issues or additional details..."
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Recommendations</label>
                <textarea 
                  name="recommendations"
                  placeholder="Provide recommendations for the farmer..."
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Geotagged Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
                    <p className="mt-2 font-medium">Click to upload geotagged photos</p>
                    <p className="text-sm text-gray-500 mt-1">GPS data will be automatically captured</p>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button 
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
