import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get API URL from environment variable with fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboard-3mgg.onrender.com';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔗 Connecting to:', API_BASE_URL); // Debug log
      
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`, 
        { username, password }
      );
      
      const { token, user } = res.data;
      login(token, user);
      
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/forecast');
          break;
        case 'procurement':
          navigate('/reconciliation');
          break;
        case 'agronomist':
          navigate('/farmers');
          break;
        case 'farmer':
          navigate('/my-plots');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to AgriManage
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={submit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="p-2 bg-gray-50 rounded">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>Procurement:</strong> procurement / proc123
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>Agronomist:</strong> agronomist / agro123
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>Farmer:</strong> farmer / farmer123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
