// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // import BrowserRouter
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './auth/AuthContext'; // import AuthProvider

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
