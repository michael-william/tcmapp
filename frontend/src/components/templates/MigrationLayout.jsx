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
  onNavigate,
  className,
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary-light/5">
      <Header
        userName={user?.name || 'User'}
        role={user?.role || 'client'}
        onLogout={logout}
        onNavigate={onNavigate}
      />

      <ProgressSection completed={completed} total={total} percentage={percentage} />

      <main className={cn('container mx-auto px-4 py-8', className)}>
        {children}
      </main>
    </div>
  );
};
