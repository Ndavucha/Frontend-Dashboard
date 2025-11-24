import React, { useState } from 'react';

export default function AdminDashboard() {
  const [farmers, setFarmers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header with KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Farmers</h3>
          <p className="text-2xl">156 <span className="text-green-500 text-sm">+12%</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Land Area</h3>
          <p className="text-2xl">2,847 ha <span className="text-green-500 text-sm">+8%</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Active Plantings</h3>
          <p className="text-2xl">89 <span className="text-green-500 text-sm">+23 this week</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Production Ready</h3>
          <p className="text-2xl">67% <span className="text-green-500 text-sm">On track</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Demand-Supply Balance */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Demand vs Supply Balance</h2>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">Generate Report</button>
            </div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              Chart: Deficit/Surplus periods
            </div>
          </section>

          {/* Production Trends */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Production Trends</h2>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              Chart: Pipeline planning & multi-region comparisons
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Harvest Readiness */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Harvest Readiness</h2>
              <button className="text-blue-500">View All</button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-green-50 rounded">
                <span>Narok</span>
                <span>3 farmers, 58 acres</span>
                <span className="text-green-600">Ready in 30 days</span>
              </div>
              <div className="flex justify-between p-2 bg-yellow-50 rounded">
                <span>Nakuru</span>
                <span>2 farmers, 42 acres</span>
                <span className="text-yellow-600">Ready in 30 days</span>
              </div>
            </div>
          </section>

          {/* Financial Exposure */}
          <section className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Financial Exposure Indicators</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Emergency Procurement Costs</span>
                <span className="text-red-500">$45,000</span>
              </div>
              <div className="flex justify-between">
                <span>Waste/Shortage Exposure</span>
                <span className="text-orange-500">$12,000</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Cost Savings</span>
                <span className="text-green-500">$28,000</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Farmers CRUD Section */}
      <section className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contracted Farmers</h2>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Farmer
          </button>
        </div>
        
        {/* Farmers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Farmer Name</th>
                <th className="py-2 px-4 text-left">Location</th>
                <th className="py-2 px-4 text-left">Variety</th>
                <th className="py-2 px-4 text-left">Land Size</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{farmer.name}</td>
                  <td className="py-2 px-4">{farmer.location}</td>
                  <td className="py-2 px-4">{farmer.variety}</td>
                  <td className="py-2 px-4">{farmer.landSize} ha</td>
                  <td className="py-2 px-4">
                    <button 
                      onClick={() => setEditingFarmer(farmer)}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setFarmers(farmers.filter((_, i) => i !== index))}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add/Edit Farmer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
            </h3>
            <form className="space-y-4">
              <input type="text" placeholder="Farmer Name" className="w-full p-2 border rounded" />
              <input type="text" placeholder="Location" className="w-full p-2 border rounded" />
              <input type="text" placeholder="Crop Variety" className="w-full p-2 border rounded" />
              <input type="number" placeholder="Land Size (ha)" className="w-full p-2 border rounded" />
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFarmer(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {editingFarmer ? 'Update' : 'Add'} Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}