import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthContext';

export default function FarmerMyFarm() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  
  // Mock data structure based on PDF
  const [farmMetrics, setFarmMetrics] = useState({
    farmers: {
      perVariety: {
        market: 0,
        challenger: 0
      },
      perLocation: {
        jan: 0,
        feb: 0,
        march: 0
      }
    },
    acreage: {
      perVariety: {
        market: 0,
        challenger: 0
      },
      perLocationPerformance: {
        market: 0,
        challenger: 0
      }
    },
    supply: {
      readiness: 0,
      supplyDemandMatching: {
        contracts: 0,
        value: 0,
        forecasts: [],
        qualityReports: [],
        supplierRanking: []
      }
    },
    financial: {
      projectedExpenses: 0,
      contractValue: 0,
      marketPrices: {},
      paymentStatus: {}
    },
    sourcingLog: [],
    contracts: [],
    supplyPlans: []
  });

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/dashboard/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data);
      setError(null);
      
      // Update farm metrics from API response
      if (response.data.farmMetrics) {
        setFarmMetrics(prev => ({
          ...prev,
          ...response.data.farmMetrics
        }));
      }
      
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load farm data. Please try again.');
      }
      
      // Use enhanced mock data as fallback
      setFarmMetrics({
        farmers: {
          perVariety: {
            market: 150,
            challenger: 85
          },
          perLocation: {
            jan: 45,
            feb: 52,
            march: 58
          }
        },
        acreage: {
          perVariety: {
            market: 1200,
            challenger: 850
          },
          perLocationPerformance: {
            market: 92,
            challenger: 88
          }
        },
        supply: {
          readiness: 85,
          supplyDemandMatching: {
            contracts: 24,
            value: 185000,
            forecasts: ['Q1: +15%', 'Q2: +8%'],
            qualityReports: ['Report 1', 'Report 2'],
            supplierRanking: ['Supplier A: 95%', 'Supplier B: 88%']
          }
        },
        financial: {
          projectedExpenses: 45000,
          contractValue: 185000,
          marketPrices: {
            shangi: 120,
            challenger: 110
          },
          paymentStatus: {
            paid: 125000,
            pending: 60000
          }
        },
        sourcingLog: [
          { date: '2024-12-15', name: 'John Doe', variety: 'Shangi', quantityDelivered: 500, qtyAccepted: 490, qtyRejected: 10, reason: 'Quality', price: 120, source: 'Contracted', score: 95 },
          { date: '2024-12-10', name: 'Jane Smith', variety: 'Challenger', quantityDelivered: 300, qtyAccepted: 295, qtyRejected: 5, reason: 'Size', price: 110, source: 'FM', score: 92 }
        ],
        contracts: [
          { farmer: 'John Doe', fulfilled: true, qtyFulfilled: 490, paymentStatus: 'Paid' },
          { farmer: 'Jane Smith', fulfilled: false, qtyFulfilled: 0, paymentStatus: 'Pending' }
        ],
        supplyPlans: [
          { farmer: 'John Doe', readiness: 'High', week: 'Week 1' },
          { farmer: 'Jane Smith', readiness: 'Medium', week: 'Week 2' }
        ]
      });
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Farm Management Dashboard</h1>
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

      {/* Farmers Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Farmers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Per Variety */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Per Variety</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Market</p>
                <p className="text-2xl font-bold">{farmMetrics.farmers.perVariety.market}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Challenger</p>
                <p className="text-2xl font-bold">{farmMetrics.farmers.perVariety.challenger}</p>
              </div>
            </div>
          </div>
          
          {/* Per Location */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Per Location</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Jan</p>
                <p className="text-xl font-bold">{farmMetrics.farmers.perLocation.jan}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Feb</p>
                <p className="text-xl font-bold">{farmMetrics.farmers.perLocation.feb}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">March</p>
                <p className="text-xl font-bold">{farmMetrics.farmers.perLocation.march}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acreage Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Acreage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Per Variety</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Market (acres)</p>
                <p className="text-2xl font-bold">{farmMetrics.acreage.perVariety.market}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Challenger (acres)</p>
                <p className="text-2xl font-bold">{farmMetrics.acreage.perVariety.challenger}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Per Location Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Market (%)</p>
                <p className="text-2xl font-bold">{farmMetrics.acreage.perLocationPerformance.market}%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Challenger (%)</p>
                <p className="text-2xl font-bold">{farmMetrics.acreage.perLocationPerformance.challenger}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supply Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Supply</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Readiness</h3>
            <div className="p-6 bg-purple-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Supply Readiness</p>
                <p className="font-bold text-purple-600">{farmMetrics.supply.readiness}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-purple-500 h-4 rounded-full" 
                  style={{width: `${farmMetrics.supply.readiness}%`}}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Supply Demand Matching</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">No. of Contracts</p>
                <p className="text-xl font-bold">{farmMetrics.supply.supplyDemandMatching.contracts}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Contract Value</p>
                <p className="text-xl font-bold">${farmMetrics.supply.supplyDemandMatching.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Financial</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Projected Expenses</p>
            <p className="text-2xl font-bold">${farmMetrics.financial.projectedExpenses.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Contract Value</p>
            <p className="text-2xl font-bold">${farmMetrics.financial.contractValue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Market Prices</p>
            <div className="flex justify-between mt-2">
              <span>Shangi: ${farmMetrics.financial.marketPrices.shangi}</span>
              <span>Challenger: ${farmMetrics.financial.marketPrices.challenger}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Log */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Sourcing Log</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Delivered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Accepted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason for Rejection</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {farmMetrics.sourcingLog.map((log, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm">{log.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{log.name}</td>
                  <td className="px-4 py-3 text-sm">{log.variety}</td>
                  <td className="px-4 py-3 text-sm">{log.quantityDelivered}</td>
                  <td className="px-4 py-3 text-sm">{log.qtyAccepted}</td>
                  <td className="px-4 py-3 text-sm">{log.reason || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">${log.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contracts and Supply Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contracts */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Contracts</h2>
          <div className="space-y-4">
            {farmMetrics.contracts.map((contract, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{contract.farmer}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contract.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contract.paymentStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Quantity Fulfilled: {contract.qtyFulfilled}
                  {contract.fulfilled && (
                    <span className="ml-2 text-green-600">✓ Fulfilled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supply Plans */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Supply Plans</h2>
          <div className="space-y-4">
            {farmMetrics.supplyPlans.map((plan, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{plan.farmer}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.readiness === 'High' 
                      ? 'bg-green-100 text-green-800' 
                      : plan.readiness === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.readiness} Readiness
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Scheduled: {plan.week}
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Drag and drop farmers to adjust supply schedule based on readiness.
                System will recommend optimal scheduling.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Update Readiness
          </button>
          <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Generate Reports
          </button>
          <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Forecasts
          </button>
        </div>
      </section>
    </div>
  );
}
