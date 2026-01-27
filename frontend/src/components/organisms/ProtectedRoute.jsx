/**
 * ProtectedRoute Component
 *
 * Route guard that redirects to login if not authenticated.
 * Waits for auth to load from localStorage before checking authentication.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children, requireInterWorks = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // STEP 1: Wait for auth to load (CRITICAL - prevents false redirects)
  if (loading) {
    console.log('[ProtectedRoute] Loading auth...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // STEP 2: Check authentication (AFTER loading completes)
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated → redirect to /login');
    return <Navigate to="/login" replace />;
  }

  // STEP 3: Check role requirements
  if (requireInterWorks && user?.role !== 'interworks') {
    console.log('[ProtectedRoute] Missing InterWorks role → redirect to /');
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access granted:', {
    path: window.location.pathname,
    user: user?.email,
    role: user?.role
  });

  return children;
};
