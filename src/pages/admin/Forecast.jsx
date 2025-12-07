import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

export default function Forecast() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecastData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      setForecastData({
        harvestVolumes: {
          weekly: { maize: 1500, beans: 800, potatoes: 1200 },
          monthly: { maize: 6000, beans: 3200, potatoes: 4800 }
        },
        regions: [
          { name: 'Narok', farmers: 45, landArea: 850, production: 3200, risk: 'low' },
          { name: 'Nakuru', farmers: 38, landArea: 720, production: 2800, risk: 'medium' },
          { name: 'Molo', farmers: 28, landArea: 580, production: 2100, risk: 'high' },
          { name: 'Kericho', farmers: 32, landArea: 620, production: 2400, risk: 'low' }
        ],
        financialExposure: {
          emergencyProcurement: 45000,
          wasteExposure: 12000,
          potentialSavings: 28000,
          costPerTon: 350
        },
        kpis: {
          totalFarmers: 156,
          landArea: 2847,
          activePlantings: 89,
          productionReady: 67,
          traceabilityCoverage: 78,
          yieldPerAcre: 2.8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load dashboard data</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organization-wide Forecast Dashboard</h1>
        <div className="flex space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
          </select>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Regions</option>
            <option value="narok">Narok</option>
            <option value="nakuru">Nakuru</option>
            <option value="molo">Molo</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Generate Report
          </button>
        </div>
      </div>

      {/* SECTION 1: Strategic KPIs */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Strategic KPIs Achievement</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold">Total Farmers</h3>
            <p className="text-2xl">{forecastData.kpis.totalFarmers} <span className="text-green-600 text-sm">+12%</span></p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold">Land Area</h3>
            <p className="text-2xl">{forecastData.kpis.landArea} ha <span className="text-green-600 text-sm">+8%</span></p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold">Production Ready</h3>
            <p className="text-2xl">{forecastData.kpis.productionReady}% <span className="text-green-600 text-sm">On track</span></p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold">Yield per Acre</h3>
            <p className="text-2xl">{forecastData.kpis.yieldPerAcre} tons <span className="text-green-600 text-sm">+0.3</span></p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* SECTION 2: Harvest Volumes */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Expected Harvest Volumes ({timeRange})</h2>
            <div className="space-y-3">
              {Object.entries(forecastData.harvestVolumes[timeRange]).map(([crop, volume]) => (
                <div key={crop} className="flex justify-between items-center">
                  <span className="font-medium capitalize">{crop}</span>
                  <div className="w-2/3">
                    <div className="flex justify-between mb-1">
                      <span>{volume} tons</span>
                      <span>{Math.round((volume / 10000) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.round((volume / 10000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: Demand vs Supply Balance */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Demand vs Supply Balance</h2>
              <button className="text-blue-600">View Details</button>
            </div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              {/* Placeholder for chart - would be Chart.js or similar */}
              <div className="text-center">
                <p className="text-gray-500">Supply-Demand Chart</p>
                <div className="flex justify-center space-x-8 mt-4">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-red-600 font-bold">-15%</span>
                    </div>
                    <p className="mt-2">Current Deficit</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-green-600 font-bold">+22%</span>
                    </div>
                    <p className="mt-2">Next Month Surplus</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded">
                <p className="font-semibold text-red-700">Deficit Periods</p>
                <p className="text-sm">Week 45-46: -800 tons</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="font-semibold text-green-700">Surplus Periods</p>
                <p className="text-sm">Week 48-49: +1200 tons</p>
              </div>
            </div>
          </section>

          {/* SECTION 4: Production Trends */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Production Trends & Pipeline Planning</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Q3 Production</span>
                  <span>85% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Q4 Pipeline</span>
                  <span>Planning in progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SECTION 5: Multi-region Comparisons */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Multi-region Comparisons</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Region</th>
                    <th className="py-2 px-4 text-left">Farmers</th>
                    <th className="py-2 px-4 text-left">Land (ha)</th>
                    <th className="py-2 px-4 text-left">Production</th>
                    <th className="py-2 px-4 text-left">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.regions.map((region, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{region.name}</td>
                      <td className="py-2 px-4">{region.farmers}</td>
                      <td className="py-2 px-4">{region.landArea}</td>
                      <td className="py-2 px-4">{region.production} tons</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          region.risk === 'low' ? 'bg-green-100 text-green-800' :
                          region.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {region.risk.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 6: Financial Exposure Indicators */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Financial Exposure Indicators</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span>Projected Emergency Procurement</span>
                  <span className="text-red-600 font-bold">${forecastData.financialExposure.emergencyProcurement.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">For supply gaps in next 30 days</div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span>Waste/Shortage Exposure</span>
                  <span className="text-orange-600 font-bold">${forecastData.financialExposure.wasteExposure.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">Based on current inventory levels</div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span>Expected Cost Savings</span>
                  <span className="text-green-600 font-bold">${forecastData.financialExposure.potentialSavings.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">From improved forecasting accuracy</div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span>Average Cost per Ton</span>
                  <span className="font-bold">${forecastData.financialExposure.costPerTon}</span>
                </div>
                <div className="text-sm text-gray-500">Trend: -5% from last month</div>
              </div>
            </div>
          </section>

          {/* SECTION 7: ESG & Sustainability */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">ESG, Sustainability & Compliance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Traceability Coverage</span>
                <span className="font-bold">{forecastData.kpis.traceabilityCoverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${forecastData.kpis.traceabilityCoverage}%`}}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-green-50 rounded">
                  <p className="font-semibold">Environmental</p>
                  <p className="text-sm">Water usage: -12%</p>
                  <p className="text-sm">Carbon footprint: -8%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="font-semibold">Compliance</p>
                  <p className="text-sm">GAP Certified: 92%</p>
                  <p className="text-sm">Audits passed: 100%</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* SECTION 8: Risk & Vulnerability */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Risk & Vulnerability Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-bold text-red-700 mb-2">Underperforming Regions</h3>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Molo</span>
                <span className="text-red-600">-18% below target</span>
              </li>
              <li className="flex justify-between">
                <span>Nakuru North</span>
                <span className="text-red-600">-12% below target</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-bold text-yellow-700 mb-2">Weather Risk Zones</h3>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Narok West</span>
                <span className="text-yellow-600">Drought warning</span>
              </li>
              <li className="flex justify-between">
                <span>Molo Highlands</span>
                <span className="text-yellow-600">Heavy rain alert</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-bold text-orange-700 mb-2">Pest/Disease Hotspots</h3>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Nakuru Central</span>
                <span className="text-orange-600">Aphid outbreak</span>
              </li>
              <li className="flex justify-between">
                <span>Kericho</span>
                <span className="text-orange-600">Late blight detected</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Farmers Lagging Behind Key Crop Stages</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Farmer</th>
                  <th className="py-2 px-4 text-left">Region</th>
                  <th className="py-2 px-4 text-left">Crop</th>
                  <th className="py-2 px-4 text-left">Stage Delay</th>
                  <th className="py-2 px-4 text-left">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">John Kamau</td>
                  <td className="py-2 px-4">Nakuru</td>
                  <td className="py-2 px-4">Maize</td>
                  <td className="py-2 px-4">-14 days</td>
                  <td className="py-2 px-4"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">HIGH</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Sarah Muthoni</td>
                  <td className="py-2 px-4">Molo</td>
                  <td className="py-2 px-4">Potatoes</td>
                  <td className="py-2 px-4">-7 days</td>
                  <td className="py-2 px-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">MEDIUM</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Report Generation Footer */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Data refresh: Every 4 hours</p>
          </div>
          <div className="space-x-3">
            <button className="px-4 py-2 border rounded">Export PDF</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded">Share Report</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Schedule Delivery</button>
          </div>
        </div>
      </div>
    </div>
  );
}
