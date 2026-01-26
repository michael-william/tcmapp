/**
 * ProtectedRoute Component
 *
 * Route guard that redirects to login if not authenticated.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children, requireInterWorks = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireInterWorks && user?.role !== 'interworks') {
    return <Navigate to="/" replace />;
  }

  return children;
};
