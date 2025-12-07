import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching farmer data with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/dashboard/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response received:', response.data);
      
      setData(response.data);
      setError(null);
      
      // Update farmData from API response
      if (response.data.farmData) {
        console.log('Setting farm data from API:', response.data.farmData);
        setFarmData({
          plotSize: response.data.farmData.plotSize || '18 ha',
          plantingDate: response.data.farmData.plantingDate || '2024-08-15',
          expectedHarvest: response.data.farmData.expectedHarvest || '2024-12-28',
          variety: response.data.farmData.variety || 'Shangi',
          progress: response.data.farmData.progress || 85
        });
      }
      
      // Update advisories from API response
      if (response.data.advisories && Array.isArray(response.data.advisories)) {
        console.log('Setting advisories from API:', response.data.advisories.length);
        setAdvisories(response.data.advisories.map(adv => ({
          id: adv.id || Date.now() + Math.random(),
          type: adv.type || 'general',
          message: adv.message || 'No message',
          date: adv.date || '2024-12-20'
        })));
      }
      
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      console.error('Error response:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to access farmer data.');
      } else if (error.response?.status === 404) {
        setError('Farmer data not found.');
      } else if (error.response?.data?.error) {
        setError(`Server error: ${error.response.data.error}`);
      } else if (error.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to load farm data. Please try again.');
      }
      
      // Use existing mock data as fallback (already set as default)
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchFarmerData();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farm data...</p>
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
                setData({}); // Use mock data
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Use Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Farm Dashboard</h1>
        <div className="flex space-x-3">
          <button 
            onClick={fetchFarmerData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {data && process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800">Debug Info:</p>
          <p>Data loaded: {data ? 'Yes' : 'No'}</p>
          <p>Advisories: {advisories.length}</p>
          <p>Farm Progress: {farmData.progress}%</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Farm Details */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Farm Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot Size</label>
                <p className="text-lg font-semibold">{farmData.plotSize}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Variety</label>
                <p className="text-lg font-semibold">{farmData.variety}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date</label>
                <p className="text-lg font-semibold">{farmData.plantingDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Harvest</label>
                <p className="text-lg font-semibold">{farmData.expectedHarvest}</p>
              </div>
            </div>
          </section>

          {/* Crop Progress */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Crop Progress</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Growth Progress</span>
                  <span className="font-bold text-green-600">{farmData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                    style={{width: `${farmData.progress}%`}}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="font-semibold text-blue-700 mb-1">Planted</p>
                  <p className="text-sm">{farmData.plantingDate || 'Aug 15'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="font-semibold text-green-700 mb-1">Germinated</p>
                  <p className="text-sm">Aug 25</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="font-semibold text-yellow-700 mb-1">Flowering</p>
                  <p className="text-sm">Oct 10</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="font-semibold text-purple-700 mb-1">Harvest</p>
                  <p className="text-sm">{farmData.expectedHarvest || 'Dec 28'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Advisory Messages */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Advisory Messages</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                {advisories.length} messages
              </span>
            </div>
            <div className="space-y-4">
              {advisories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No advisories available</p>
                </div>
              ) : (
                advisories.map((advisory) => (
                  <div key={advisory.id} className={`p-4 rounded-lg border ${
                    advisory.type === 'weather' ? 'bg-blue-50 border-blue-200' : 
                    advisory.type === 'task' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        advisory.type === 'weather' ? 'bg-blue-100 text-blue-800' : 
                        advisory.type === 'task' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {advisory.type === 'weather' ? '🌧️ Weather' : 
                         advisory.type === 'task' ? '📋 Task' : 'ℹ️ General'}
                      </span>
                      <span className="text-sm text-gray-500">{advisory.date}</span>
                    </div>
                    <p className="text-gray-700">{advisory.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Progress
              </button>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Request Support
              </button>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Market Prices
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
