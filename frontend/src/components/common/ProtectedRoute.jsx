import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle registration status redirections
  // If user needs to fill details and isn't already on that page
  if (user?.registrationStatus === 'PENDING_DETAILS' && location.pathname !== '/register/details') {
    return <Navigate to="/register/details" replace />;
  }

  // If user is waiting for approval and isn't already on that page
  if (user?.registrationStatus === 'PENDING_APPROVAL' && location.pathname !== '/register/pending') {
    return <Navigate to="/register/pending" replace />;
  }

  // If user is rejected and isn't already on the rejected page
  if (user?.registrationStatus === 'REJECTED' && location.pathname !== '/register/rejected') {
    return <Navigate to="/register/rejected" replace />;
  }

  // Check for roles if they are provided
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
