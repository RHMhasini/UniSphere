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

  // If user is authenticated but registrationStatus not yet loaded, wait
  if (!user?.registrationStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  // Handle registration status redirections
  if (user?.registrationStatus === 'PENDING_DETAILS' && location.pathname !== '/register/details') {
    return <Navigate to="/register/details" replace />;
  }

  if (user?.registrationStatus === 'PENDING_APPROVAL' && location.pathname !== '/register/pending') {
    return <Navigate to="/register/pending" replace />;
  }

  if (user?.registrationStatus === 'REJECTED' && location.pathname !== '/register/rejected') {
    return <Navigate to="/register/rejected" replace />;
  }

  // If approved but inactive → show inactive dashboard
  if (
    user?.registrationStatus === 'APPROVED' &&
    user?.isActive === false &&
    location.pathname !== '/dashboard/inactive'
  ) {
    return <Navigate to="/dashboard/inactive" replace />;
  }

  // Check for roles if they are provided
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
