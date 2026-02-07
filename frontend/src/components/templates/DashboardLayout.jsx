/**
 * DashboardLayout Template
 *
 * Layout with header for dashboard and user management pages.
 */

import React from 'react';
import { Header } from '@/components/organisms/Header';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const DashboardLayout = ({ children, className }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Header
        userName={user?.name || 'User'}
        role={user?.role || 'client'}
        onLogout={logout}
      />

      <main className={cn('container mx-auto px-4 py-8', className)}>
        <div className="glass-container bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl">
          {children}
        </div>
      </main>
    </div>
  );
};
