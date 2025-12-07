import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';

export const useDashboardData = (role) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/dashboard/${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${role} dashboard data:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchData();
    }
  }, [role]);

  const refreshData = () => {
    fetchData();
  };

  return { data, loading, error, refreshData };
};