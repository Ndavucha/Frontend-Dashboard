import React, { useState } from 'react';

export default function ProcurementReconciliation() {
  const [supplyItems, setSupplyItems] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Demand-Supply Reconciliation</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Supply Overview */}
        <div className="col-span-2 space-y-6">
          {/* Current Supply */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Current Supply Status</h2>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Refresh Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Farmer</th>
                    <th className="py-2 px-4 text-left">Location</th>
                    <th className="py-2 px-4 text-left">Ready Date</th>
                    <th className="py-2 px-4 text-left">Volume (kg)</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">Peter Ornondi</td>
                    <td className="py-2 px-4">Narok</td>
                    <td className="py-2 px-4">Dec 28, 2024</td>
                    <td className="py-2 px-4">18,000</td>
                    <td className="py-2 px-4"><span className="text-green-500">Ready</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Supply Planning CRUD */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Supply Planning</h2>
              <button 
                onClick={() => setShowOrderForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Create Order
              </button>
            </div>
            
            {/* Supply Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Order ID</th>
                    <th className="py-2 px-4 text-left">Supplier</th>
                    <th className="py-2 px-4 text-left">Volume</th>
                    <th className="py-2 px-4 text-left">Delivery Date</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supplyItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{item.orderId}</td>
                      <td className="py-2 px-4">{item.supplier}</td>
                      <td className="py-2 px-4">{item.volume} kg</td>
                      <td className="py-2 px-4">{item.deliveryDate}</td>
                      <td className="py-2 px-4">
                        <button className="text-blue-500 mr-2">Edit</button>
                        <button className="text-red-500">Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Production Capacity */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Production Capacity</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Current Capacity</span>
                  <span>420 kg/day</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '84%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Target Capacity</span>
                  <span>500 kg/day</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Alerts */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Procurement Risk Alerts</h2>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-semibold">Predicted Shortfall</p>
                <p className="text-sm">Nakuru region - 2,000 kg deficit</p>
              </div>
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-700 font-semibold">Weather Impact</p>
                <p className="text-sm">Heavy rains expected in Molo</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create Supply Order</h3>
            <form className="space-y-4">
              <select className="w-full p-2 border rounded">
                <option>Select Supplier</option>
                <option>Farm Mall Backup</option>
                <option>External Supplier</option>
              </select>
              <input type="number" placeholder="Volume (kg)" className="w-full p-2 border rounded" />
              <input type="date" className="w-full p-2 border rounded" />
              <textarea placeholder="Notes" className="w-full p-2 border rounded" rows="3"></textarea>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
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