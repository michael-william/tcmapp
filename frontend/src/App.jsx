/**
 * Main App Component
 *
 * Root component with routing and authentication context.
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-primary">
              Tableau Cloud Migration Checklist
            </h1>
            <p className="mt-4 text-gray-600">
              Full-stack web application for managing migration projects
            </p>
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Status</h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Backend API running</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Frontend scaffolding complete</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Authentication system ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
