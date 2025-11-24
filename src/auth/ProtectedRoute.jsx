import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// allowedRoles: string or array of strings
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useContext(AuthContext);
  
  console.log('🔐 ProtectedRoute Debug:', { 
    user, 
    allowedRoles, 
    userRole: user?.role 
  });

  if (!user) {
    console.log('❌ No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // FIX: Use user.role (singular) instead of user.roles (plural)
  const hasAccess = roles.includes(user.role);
  
  console.log(`🔐 Access check: ${user.role} in [${roles}] = ${hasAccess}`);

  if (!hasAccess) {
    console.log(`❌ Access denied for role: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted');
  return children;
}
