import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Your account does not have the required role to view this page. 
                Please contact your administrator if you believe this is an error.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
              
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Return to Dashboard
              </Link>

              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Sign in with different account
              </Link>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Roles & Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-green-600">Farmer</h4>
              <p className="text-gray-600">View farm records, crop progress, receive advisories</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-purple-600">Agronomist</h4>
              <p className="text-gray-600">Manage assigned farmers, log field visits, track crop health</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-blue-600">Procurement</h4>
              <p className="text-gray-600">Demand-supply reconciliation, harvest planning, outsourcing</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold text-red-600">Administrator</h4>
              <p className="text-gray-600">Full system access, forecasting, financial analytics, user management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}