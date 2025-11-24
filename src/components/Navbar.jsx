// src/components/Navbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';

const roleLinks = {
  admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/forecast', label: 'Forecast' },
    { to: '/trends', label: 'Trends' },
    { to: '/supply-demand', label: 'Supply vs Demand' },
  ],
  procurement: [
    { to: '/', label: 'Dashboard' },
    { to: '/reconciliation', label: 'Reconciliation' },
    { to: '/outsourcing', label: 'Outsourcing' },
  ],
  agronomist: [
    { to: '/', label: 'Dashboard' },
    { to: '/farmers', label: 'Farmers' },
    { to: '/field-data', label: 'Field Data' },
  ],
  farmer: [
    { to: '/', label: 'My Farm' },
    { to: '/my-plots', label: 'My Plots' },
    { to: '/crop-progress', label: 'Crop Progress' },
  ]
};

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  let links = [{ to: '/', label: 'Home' }];
  if (user && user.roles) {
    const set = new Map();
    user.roles.forEach(r => {
      (roleLinks[r] || []).forEach(l => set.set(l.to, l));
    });
    links = Array.from(set.values());
  }

  return (
    <nav className="bg-gradient-to-r from-[#1E8A3E] to-[#2FA44F] text-white px-6 py-4 rounded-2xl shadow-md mb-6">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-semibold">Farm Mall</div>
            <div className="text-sm opacity-90">Farmer Contract Management</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="hover:underline">
              {l.label}
            </Link>
          ))}
          <div className="relative">
            <button className="bg-white/10 px-3 py-1 rounded-md">Coming Soon ▾</button>
          </div>
        </div>

        {/* Right: Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span>{user.username} ({user.roles ? user.roles.join(',') : ''})</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30">Login</Link>
              <Link to="/register" className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="flex flex-col mt-4 gap-2 md:hidden">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="hover:underline" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <span>{user.username} ({user.roles ? user.roles.join(',') : ''})</span>
                <button
                  onClick={() => { logout(); navigate('/login'); setMobileOpen(false); }}
                  className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30" onClick={() => setMobileOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
