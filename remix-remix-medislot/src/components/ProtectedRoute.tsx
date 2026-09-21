import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { PageSpinner } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSpinner text="Checking authentication status..." />;
  }

  // Not logged in -> send to login page with return url
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this route is restricted to a specific role (e.g. 'admin')
  if (allowedRole && role !== allowedRole) {
    // If patient tried to access admin route, send to patient dashboard
    if (allowedRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin tried to access patient-specific route
    if (allowedRole === 'patient') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
