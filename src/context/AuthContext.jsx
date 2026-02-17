// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Demo credentials check
      if (email === 'admin@example.com' && password === 'admin123') {
        const userData = {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          initials: 'AU'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Login successful!');
        return { success: true };
      }

      if (email === 'demo@example.com' && password === 'demo123') {
        const userData = {
          id: 2,
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin',
          initials: 'DU'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Login successful!');
        return { success: true };
      }

      // Check for registered users in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: 'admin',
          initials: foundUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Login successful!');
        return { success: true };
      }

      toast.error('Invalid email or password');
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return { success: false };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        toast.error('User with this email already exists');
        return { success: false };
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login after registration
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'admin',
        initials: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};