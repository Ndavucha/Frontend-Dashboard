import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

export default function ProcurementReconciliation() {
  const [supplyItems, setSupplyItems] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [timeFrame, setTimeFrame] = useState('30days'); // 7days, 14days, 30days
  const [activeTab, setActiveTab] = useState('supply'); // supply, readiness, risks, costs
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProcurementData();
  }, []);

  const fetchProcurementData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/dashboard/procurement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching procurement data:', error);
      // Fallback to mock data if API fails
      setData({
        demandSupply: {
          totalDemand: 25000,
          contractedSupply: 18000,
          deficit: 7000,
          surplus: 0,
          backupFarmersAvailable: 8,
          farmMallCapacity: 5000,
        },
        harvestReadiness: {
          ready7days: [
            { farmer: 'Peter Ornondi', location: 'Narok', volume: 18000, distance: '45km', status: 'ready' },
            { farmer: 'John Kamau', location: 'Nakuru', volume: 12000, distance: '85km', status: 'ready' },
          ],
          ready14days: [
            { farmer: 'Sarah Muthoni', location: 'Molo', volume: 15000, distance: '120km', status: 'pending' },
            { farmer: 'James Omondi', location: 'Kericho', volume: 8000, distance: '95km', status: 'pending' },
          ],
          ready30days: [
            { farmer: 'Mary Wanjiku', location: 'Narok', volume: 22000, distance: '50km', status: 'on-track' },
            { farmer: 'David Kipchoge', location: 'Nakuru', volume: 16000, distance: '80km', status: 'on-track' },
          ]
        },
        costIndicators: {
          costPerTon: 350,
          trend: -5.2,
          emergencyProcurement: 45000,
          potentialSavings: 28000,
          budgetUtilization: 78
        },
        riskAlerts: [
          { type: 'shortfall', region: 'Nakuru', severity: 'high', message: '2,000 kg deficit predicted', impact: 'Medium' },
          { type: 'weather', region: 'Molo', severity: 'medium', message: 'Heavy rains may delay harvest', impact: 'High' },
          { type: 'progress', region: 'Narok West', severity: 'low', message: '3 farmers behind schedule', impact: 'Low' },
        ],
        supplyPlan: [
          { week: 'Week 51', demand: 12000, supply: 10500, deficit: 1500, status: 'critical' },
          { week: 'Week 52', demand: 13000, supply: 12000, deficit: 1000, status: 'warning' },
          { week: 'Week 1', demand: 14000, supply: 15000, surplus: 1000, status: 'good' },
          { week: 'Week 2', demand: 13500, supply: 16000, surplus: 2500, status: 'good' },
        ],
        backupFarmers: [
          { name: 'Farm Mall Reserve A', location: 'Nakuru', capacity: 2000, cost: 380, leadTime: '3 days' },
          { name: 'Farm Mall Reserve B', location: 'Narok', capacity: 1500, cost: 370, leadTime: '2 days' },
          { name: 'Farm Mall Reserve C', location: 'Molo', capacity: 1800, cost: 390, leadTime: '4 days' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading procurement data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load procurement data</p>
        <button 
          onClick={fetchProcurementData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate totals using data from API
  const totalReadyFarmers = [
    ...data.harvestReadiness.ready7days,
    ...data.harvestReadiness.ready14days,
    ...data.harvestReadiness.ready30days
  ].length;

  const totalReadyVolume = [
    ...data.harvestReadiness.ready7days,
    ...data.harvestReadiness.ready14days,
    ...data.harvestReadiness.ready30days
  ].reduce((sum, farmer) => sum + farmer.volume, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Procurement Reconciliation Dashboard</h1>
          <p className="text-gray-600">Demand-supply planning and risk management</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select 
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="7days">Next 7 Days</option>
            <option value="14days">Next 14 Days</option>
            <option value="30days">Next 30 Days</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Generate Procurement Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('supply')}
          className={`px-4 py-2 font-medium ${activeTab === 'supply' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Demand-Supply
        </button>
        <button 
          onClick={() => setActiveTab('readiness')}
          className={`px-4 py-2 font-medium ${activeTab === 'readiness' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Harvest Readiness
        </button>
        <button 
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2 font-medium ${activeTab === 'risks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Risk Alerts
        </button>
        <button 
          onClick={() => setActiveTab('costs')}
          className={`px-4 py-2 font-medium ${activeTab === 'costs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Cost Indicators
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Total Demand</h3>
          <p className="text-2xl">{data.demandSupply.totalDemand.toLocaleString()} kg</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Contracted Supply</h3>
          <p className="text-2xl text-green-600">{data.demandSupply.contractedSupply.toLocaleString()} kg</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Current Deficit</h3>
          <p className="text-2xl text-red-600">{data.demandSupply.deficit.toLocaleString()} kg</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Backup Farmers</h3>
          <p className="text-2xl text-blue-600">{data.demandSupply.backupFarmersAvailable}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demand-Supply Reconciliation Panel */}
          {activeTab === 'supply' && (
            <section className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Demand-Supply Reconciliation</h2>
                <button className="text-blue-600 hover:underline">View Full Report</button>
              </div>
              
              {/* Supply-Demand Balance */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Supply vs Demand Balance</span>
                  <span className={`font-bold ${data.demandSupply.deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {data.demandSupply.deficit > 0 ? 'DEFICIT' : 'SURPLUS'}
                  </span>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div 
                    className="bg-green-500" 
                    style={{width: `${(data.demandSupply.contractedSupply / data.demandSupply.totalDemand) * 100}%`}}
                    title={`Contracted Supply: ${data.demandSupply.contractedSupply}kg`}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{width: `${(data.demandSupply.deficit / data.demandSupply.totalDemand) * 100}%`}}
                    title={`Deficit: ${data.demandSupply.deficit}kg`}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Supply: {data.demandSupply.contractedSupply.toLocaleString()}kg</span>
                  <span>Deficit: {data.demandSupply.deficit.toLocaleString()}kg</span>
                </div>
              </div>
              
              {/* Recommended Outsourcing */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Recommended Outsourcing Volumes</h3>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Farm Mall Backup Capacity</p>
                      <p className="text-sm text-gray-600">{data.demandSupply.farmMallCapacity.toLocaleString()} kg available</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                      Allocate Now
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Supply Planning Table */}
              <div>
                <h3 className="font-bold mb-3">Weekly Supply Planning</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left">Week</th>
                        <th className="py-3 px-4 text-left">Demand</th>
                        <th className="py-3 px-4 text-left">Supply</th>
                        <th className="py-3 px-4 text-left">Balance</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.supplyPlan.map((week, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{week.week}</td>
                          <td className="py-3 px-4">{week.demand.toLocaleString()} kg</td>
                          <td className="py-3 px-4">{week.supply.toLocaleString()} kg</td>
                          <td className="py-3 px-4">
                            {week.deficit ? (
                              <span className="text-red-600">-{week.deficit.toLocaleString()} kg</span>
                            ) : (
                              <span className="text-green-600">+{week.surplus.toLocaleString()} kg</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              week.status === 'critical' ? 'bg-red-100 text-red-800' :
                              week.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {week.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-blue-600 text-sm hover:underline">
                              Plan Supply
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Harvest Readiness & Intake Planning */}
          {activeTab === 'readiness' && (
            <section className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Harvest Readiness & Intake Planning</h2>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {totalReadyFarmers} Farmers Ready
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {totalReadyVolume.toLocaleString()} kg Total
                  </span>
                </div>
              </div>
              
              {/* Timeframe Tabs */}
              <div className="flex mb-6">
                <button 
                  className={`px-4 py-2 ${timeFrame === '7days' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setTimeFrame('7days')}
                >
                  Next 7 Days
                </button>
                <button 
                  className={`px-4 py-2 ${timeFrame === '14days' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setTimeFrame('14days')}
                >
                  Next 14 Days
                </button>
                <button 
                  className={`px-4 py-2 ${timeFrame === '30days' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setTimeFrame('30days')}
                >
                  Next 30 Days
                </button>
              </div>
              
              {/* Farmers Ready Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left">Farmer Name</th>
                      <th className="py-3 px-4 text-left">Location</th>
                      <th className="py-3 px-4 text-left">Volume</th>
                      <th className="py-3 px-4 text-left">Distance</th>
                      <th className="py-3 px-4 text-left">Readiness</th>
                      <th className="py-3 px-4 text-left">Schedule Pickup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.harvestReadiness[`ready${timeFrame}`].map((farmer, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{farmer.farmer}</td>
                        <td className="py-3 px-4">
                          <div>{farmer.location}</div>
                          <div className="text-xs text-gray-500">GPS: 1.2345, 35.6789</div>
                        </td>
                        <td className="py-3 px-4">{farmer.volume.toLocaleString()} kg</td>
                        <td className="py-3 px-4">{farmer.distance}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            farmer.status === 'ready' ? 'bg-green-100 text-green-800' :
                            farmer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {farmer.status === 'ready' ? 'Ready Now' : 
                             farmer.status === 'pending' ? 'Pending' : 'On Track'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Schedule
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Delivery Planning */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Delivery Timelines & Logistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded">
                    <p className="font-medium">Nearest Collection Point</p>
                    <p className="text-sm text-gray-600">Nakuru Depot - 35km</p>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <p className="font-medium">Estimated Transport Cost</p>
                    <p className="text-sm text-gray-600">KES 45,000</p>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <p className="font-medium">Recommended Schedule</p>
                    <p className="text-sm text-gray-600">Dec 28-30, 2024</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Procurement Risk Alerts */}
          {activeTab === 'risks' && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Procurement Risk Alerts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Cards */}
                <div className="space-y-4">
                  {data.riskAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}></div>
                          <span className="font-bold">{alert.type.toUpperCase()}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {alert.region}
                        </span>
                      </div>
                      <p className="mb-2">{alert.message}</p>
                      <div className="flex justify-between text-sm">
                        <span>Impact: <strong>{alert.impact}</strong></span>
                        <button className="text-blue-600 hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Risk & Vulnerability Dashboard */}
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-bold text-red-700 mb-2">Underperforming Regions</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>Nakuru North</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">-15% below target</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Molo Central</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">-12% below target</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-bold text-yellow-700 mb-2">Weather Risk Zones</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>Narok West</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Drought Alert</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Molo Highlands</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Flood Risk</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-bold text-orange-700 mb-2">Pest/Disease Hotspots</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>Nakuru Central</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Aphid Outbreak</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Kericho</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Late Blight</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Farmers Lagging Behind */}
              <div className="mt-6 p-4 bg-purple-50 rounded">
                <h3 className="font-bold text-purple-700 mb-2">Farmers Lagging Behind Key Crop Stages</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="py-2 px-4 text-left">Farmer</th>
                        <th className="py-2 px-4 text-left">Region</th>
                        <th className="py-2 px-4 text-left">Crop</th>
                        <th className="py-2 px-4 text-left">Stage Delay</th>
                        <th className="py-2 px-4 text-left">Expected Impact</th>
                        <th className="py-2 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">John Kamau</td>
                        <td className="py-2 px-4">Nakuru</td>
                        <td className="py-2 px-4">Maize</td>
                        <td className="py-2 px-4">-14 days</td>
                        <td className="py-2 px-4">-800 kg</td>
                        <td className="py-2 px-4">
                          <button className="text-blue-600 text-sm hover:underline">
                            Arrange Support
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Sarah Muthoni</td>
                        <td className="py-2 px-4">Molo</td>
                        <td className="py-2 px-4">Potatoes</td>
                        <td className="py-2 px-4">-7 days</td>
                        <td className="py-2 px-4">-500 kg</td>
                        <td className="py-2 px-4">
                          <button className="text-blue-600 text-sm hover:underline">
                            Monitor
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Cost & Price Indicators */}
          {activeTab === 'costs' && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Cost & Price Indicators</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Cost Indicators */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-blue-700">Cost per Ton</h3>
                      <span className={`text-lg font-bold ${data.costIndicators.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        KES {data.costIndicators.costPerTon}
                      </span>
                    </div>
                    <p className="text-sm">
                      Trend: <span className={data.costIndicators.trend < 0 ? 'text-green-600' : 'text-red-600'}>
                        {data.costIndicators.trend}% from last month
                      </span>
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{width: `${data.costIndicators.budgetUtilization}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Budget utilization: {data.costIndicators.budgetUtilization}%</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-red-700">Emergency Procurement Exposure</h3>
                      <span className="text-lg font-bold">KES {data.costIndicators.emergencyProcurement.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Potential cost for urgent supply gaps</p>
                  </div>
                </div>
                
                {/* Savings Potential */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-2">Savings Potential</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>From Improved Forecasting</span>
                        <span className="font-bold">KES {data.costIndicators.potentialSavings.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>From Bulk Purchasing</span>
                        <span className="font-bold">KES 15,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>From Direct Farmer Contracts</span>
                        <span className="font-bold">KES 8,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Market Price Trends */}
              <div>
                <h3 className="font-bold mb-3">Market Price Trends</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Commodity</th>
                        <th className="py-2 px-4 text-left">Current Price</th>
                        <th className="py-2 px-4 text-left">Weekly Change</th>
                        <th className="py-2 px-4 text-left">Market Trend</th>
                        <th className="py-2 px-4 text-left">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium">Potatoes (Shangi)</td>
                        <td className="py-2 px-4">KES 45/kg</td>
                        <td className="py-2 px-4 text-green-600">+3.2%</td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Rising</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-green-600">Buy Now</span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium">Maize</td>
                        <td className="py-2 px-4">KES 38/kg</td>
                        <td className="py-2 px-4 text-red-600">-1.5%</td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Stable</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-yellow-600">Monitor</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Backup Farmers from Farm Mall */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Available Backup Farmers</h2>
            <div className="space-y-4">
              {data.backupFarmers.map((farmer, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{farmer.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {farmer.capacity} kg
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{farmer.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per kg:</span>
                      <span className="font-medium">KES {farmer.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lead Time:</span>
                      <span>{farmer.leadTime}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Reserve Capacity
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowOrderForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Supply Order
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approve Harvest Schedule
              </button>
              <button className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generate Procurement Report
              </button>
              <button className="w-full bg-yellow-600 text-white py-3 rounded hover:bg-yellow-700 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Update Delivery Timelines
              </button>
            </div>
          </section>

          {/* Production Capacity */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Production & Processing Capacity</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Current Daily Capacity</span>
                  <span>420 kg/day</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '84%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Target Capacity</span>
                  <span>500 kg/day</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="font-medium">Capacity Utilization</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="font-bold">84%</p>
                    <p className="text-xs">This Week</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="font-bold">92%</p>
                    <p className="text-xs">Peak</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <p className="font-bold">68%</p>
                    <p className="text-xs">Average</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activities */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Procurement Activities</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Order PO-1234 Approved</p>
                <p className="text-sm text-gray-600">2,000 kg maize from Farm Mall</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Harvest Schedule Updated</p>
                <p className="text-sm text-gray-600">Narok region collection rescheduled</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">New Supplier Onboarded</p>
                <p className="text-sm text-gray-600">Green Valley Farms added</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Supply Order</h3>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Supplier Type</label>
                  <select className="w-full p-3 border rounded" required>
                    <option value="">Select Supplier Type</option>
                    <option value="farm_mall">Farm Mall Backup</option>
                    <option value="external">External Supplier</option>
                    <option value="contracted">Contracted Farmer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Select Supplier</label>
                  <select className="w-full p-3 border rounded" required>
                    <option value="">Select Supplier</option>
                    <option value="farm_mall_a">Farm Mall Reserve A</option>
                    <option value="farm_mall_b">Farm Mall Reserve B</option>
                    <option value="farm_mall_c">Farm Mall Reserve C</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Volume (kg)</label>
                  <input 
                    type="number" 
                    placeholder="Enter volume" 
                    className="w-full p-3 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Delivery Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Urgency Level</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="urgency" value="normal" className="mr-2" />
                    Normal (5-7 days)
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="urgency" value="urgent" className="mr-2" />
                    Urgent (2-3 days)
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="urgency" value="emergency" className="mr-2" />
                    Emergency (24 hours)
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Delivery Location</label>
                <select className="w-full p-3 border rounded" required>
                  <option value="">Select Delivery Point</option>
                  <option value="nakuru">Nakuru Main Depot</option>
                  <option value="narok">Narok Collection Center</option>
                  <option value="molo">Molo Processing Plant</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Special Instructions</label>
                <textarea 
                  placeholder="Any special requirements or notes..." 
                  className="w-full p-3 border rounded"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
