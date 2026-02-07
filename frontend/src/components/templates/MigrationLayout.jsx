/**
 * MigrationLayout Template
 *
 * Full-width layout with header and sticky progress bar for checklist.
 */

import React from 'react';
import { Header } from '@/components/organisms/Header';
import { ProgressSection } from '@/components/organisms/ProgressSection';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const MigrationLayout = ({
  children,
  completed = 0,
  total = 0,
  percentage = 0,
  clientName,
  guestContacts,
  interworksContacts,
  onNavigate,
  pageHeader,
  className,
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Header
        userName={user?.name || 'User'}
        role={user?.role || 'client'}
        onLogout={logout}
        onNavigate={onNavigate}
      />

      <ProgressSection
        completed={completed}
        total={total}
        percentage={percentage}
        clientName={clientName}
        guestContacts={guestContacts}
        interworksContacts={interworksContacts}
      />

      {pageHeader && (
        <div className="bg-white/80 backdrop-blur-lg border-b px-4 py-4 sticky top-[200px] z-30">
          <div className="container mx-auto">
            {pageHeader}
          </div>
        </div>
      )}

      <main className={cn('container mx-auto px-4 py-8', className)}>
        <div className="glass-container bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl">
          {children}
        </div>
      </main>
    </div>
  );
};
