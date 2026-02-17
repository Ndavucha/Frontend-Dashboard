// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import Procurement from './pages/Procurement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { Toaster } from 'sonner';
import Aggregators from './pages/Aggregators';
import SupplyPlanning from './pages/SupplyPlanning';
import Contracts from './pages/Contracts';
import FarmMall from './pages/Farmmall';
import Onboarding from './pages/Onboarding';
import { useDialogFix } from '@/hooks/useDialogFix';

function App() {
  useDialogFix(); 
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/farmers" element={
            <ProtectedRoute>
              <Farmers />
            </ProtectedRoute>
          } />
          <Route path="/SupplyPlanning" element={
            <ProtectedRoute>
              <SupplyPlanning />
            </ProtectedRoute>
          } />
          <Route path="/procurement" element={
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          } />
          <Route path="/aggregators" element={
            <ProtectedRoute>
              <Aggregators />
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          } />
          <Route path="/FarmMall" element={
            <ProtectedRoute>
              <FarmMall />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              style: {
                background: '#217A2D',
                color: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
