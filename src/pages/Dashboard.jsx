import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">AgriManage Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-3">Admin View</h2>
            <p className="text-gray-600 mb-4">Organization-wide forecasting, financial exposure, and performance analytics.</p>
            <Link to="/forecast" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Access Admin Panel
            </Link>
          </div>

          {/* Procurement Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-3">Procurement View</h2>
            <p className="text-gray-600 mb-4">Demand-supply reconciliation, outsourcing, and harvest readiness planning.</p>
            <Link to="/reconciliation" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Access Procurement
            </Link>
          </div>

          {/* Agronomist Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-3">Agronomist View</h2>
            <p className="text-gray-600 mb-4">Farmer management, field visits, and crop progress monitoring.</p>
            <Link to="/farmers" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Access Agronomist Panel
            </Link>
          </div>

          {/* Farmer Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-3">Farmer View</h2>
            <p className="text-gray-600 mb-4">Farm records, crop progress, and advisory messages.</p>
            <Link to="/my-plots" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              Access My Farm
            </Link>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Total Farmers</h3>
            <p className="text-2xl">156</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Land Area</h3>
            <p className="text-2xl">2,847 ha</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Active Plantings</h3>
            <p className="text-2xl">89</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Production Ready</h3>
            <p className="text-2xl">67%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;