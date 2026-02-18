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
  className,

  // NEW: Management header (for management view)
  managementHeader,

  // NEW: Action toolbar (for management view, placed outside main content)
  actionToolbar,

  // NEW: Add all the props needed by ProgressSection
  saving,
  lastSaved,
  saveError,
  hasUnsavedChanges,
  onRetry,
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  sections,
  isInterWorks,
  hasManagement,
  enablingManagement,
  migrationId,
  onSave,
  onEnableManagement,
  onViewManagement,
  onOpenManagementModal,
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

      {/* Management Header + Action Toolbar (Management view only) - Combined sticky container */}
      {managementHeader && (
        <div className="sticky top-[73px] z-30">
          {managementHeader}
          {actionToolbar && (
            <div className="mt-0">
              {actionToolbar}
            </div>
          )}
        </div>
      )}

      {/* Progress Section (Checklist view only) */}
      {!managementHeader && (
        <ProgressSection
          completed={completed}
          total={total}
          percentage={percentage}
          clientName={clientName}
          guestContacts={guestContacts}
          interworksContacts={interworksContacts}
          saving={saving}
          lastSaved={lastSaved}
          saveError={saveError}
          hasUnsavedChanges={hasUnsavedChanges}
          onRetry={onRetry}
          selectedSection={selectedSection}
          onSectionChange={onSectionChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          sections={sections}
          isInterWorks={isInterWorks}
          hasManagement={hasManagement}
          enablingManagement={enablingManagement}
          migrationId={migrationId}
          onSave={onSave}
          onNavigate={onNavigate}
          onEnableManagement={onEnableManagement}
          onViewManagement={onViewManagement}
          onOpenManagementModal={onOpenManagementModal}
        />
      )}

      <main className={cn('container mx-auto px-4 py-8', className)}>
        <div className="glass-container bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl max-w-[85%] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
