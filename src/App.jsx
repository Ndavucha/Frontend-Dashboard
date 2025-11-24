// src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import AdminForecast from './pages/admin/Forecast';
import ProcurementReconciliation from './pages/procurement/Reconciliation';
import AgronomistFarmers from './pages/agronomist/Farmers';
import FarmerMyFarm from './pages/farmer/MyFarm';

function App() {
  const { user } = useContext(AuthContext);

  // Helper function to get default route based on role
  const getDefaultRoute = (userRole) => {
    switch (userRole) {
      case 'admin': return '/forecast';
      case 'procurement': return '/reconciliation';
      case 'agronomist': return '/farmers';
      case 'farmer': return '/my-plots';
      default: return '/';
    }
  };

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default route - redirect based on role */}
        <Route path="/" element={
          user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <Dashboard />
        } />

        {/* Protected routes */}
        <Route path="/forecast" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminForecast />
          </ProtectedRoute>
        } />

        <Route path="/reconciliation" element={
          <ProtectedRoute allowedRoles={['procurement', 'admin']}>
            <ProcurementReconciliation />
          </ProtectedRoute>
        } />

        <Route path="/farmers" element={
          <ProtectedRoute allowedRoles={['agronomist', 'admin']}>
            <AgronomistFarmers />
          </ProtectedRoute>
        } />

        {/* MAKE SURE THIS FARMER ROUTE EXISTS */}
        <Route path="/my-plots" element={
          <ProtectedRoute allowedRoles={['farmer', 'admin']}>
            <FarmerMyFarm />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;