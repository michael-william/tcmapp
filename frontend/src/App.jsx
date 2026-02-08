/**
 * Main App Component
 *
 * Root component with routing and authentication context.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ProtectedRoute } from './components/organisms/ProtectedRoute';
import { Toaster } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/Tooltip';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MigrationOverview } from './pages/MigrationOverview';
import { MigrationChecklist } from './pages/MigrationChecklist';
import { MigrationManagement } from './pages/MigrationManagement';
import { UserManagement } from './pages/UserManagement';
import { ClientManagement } from './pages/ClientManagement';

function App() {
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/migration/:id/overview"
              element={
                <ProtectedRoute>
                  <MigrationOverview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/migration/:id"
              element={
                <ProtectedRoute>
                  <MigrationChecklist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/migration/:id/management"
              element={
                <ProtectedRoute>
                  <MigrationManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute requireInterWorks>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedRoute requireInterWorks>
                  <ClientManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </TooltipProvider>
  );
}

export default App;
