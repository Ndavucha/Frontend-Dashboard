import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/farmers" element={<Farmers />} />
        <Route path="/SupplyPlanning" element={<SupplyPlanning />} />
        <Route path="/procurement" element={<Procurement />} />
        <Route path="/FarmMall" element={<FarmMall />} />
        <Route path="/aggregators" element={<Aggregators />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/settings" element={<Settings />} />
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
    </BrowserRouter>
  );
}

export default App;
