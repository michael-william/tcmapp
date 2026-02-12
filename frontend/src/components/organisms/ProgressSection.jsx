/**
 * ProgressSection Component
 *
 * Displays overall progress with stats and progress bar.
 */

import React from 'react';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { ContactsList } from '@/components/molecules/ContactsList';
import { Button } from '@/components/ui/Button';
import { SaveStatus } from '@/components/molecules/SaveStatus';
import { SearchFilter } from '@/components/molecules/SearchFilter';
import { ArrowLeft, Loader2, Save, Plus, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProgressSection = ({
  // Existing props
  completed = 0,
  total = 0,
  percentage = 0,
  clientName,
  guestContacts,
  interworksContacts,
  className,

  // NEW: Save status props
  saving,
  lastSaved,
  saveError,
  hasUnsavedChanges,
  onRetry,

  // NEW: Filter props
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  sections,

  // NEW: Action props
  isInterWorks,
  hasManagement,
  enablingManagement,
  migrationId,

  // NEW: Handler props
  onSave,
  onNavigate,
  onEnableManagement,
  onViewManagement,
  onOpenManagementModal,
}) => {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-lg border-b px-4 py-4 sticky top-[73px] z-30',
        className
      )}
    >
      <div className="container mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          {/* Left: Client name and progress stats */}
          <div className="flex-1 min-w-[250px]">
            {clientName && (
              <h1 className="text-2xl font-bold text-primary mb-1">
                {clientName}
              </h1>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              Pre-requisite Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              {completed} of {total} questions completed
            </p>
          </div>

          {/* Right: Contacts */}
          {clientName && (
            <ContactsList
              clientName={clientName}
              guestContacts={guestContacts}
              interworksContacts={interworksContacts}
            />
          )}
        </div>

        {/* Full width progress bar */}
        <ProgressBar value={percentage} showPercentage={true} />

        {/* Row 4: Action toolbar */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-white/20">
          {/* Left: Navigation and save status */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate(`/migration/${migrationId}/overview`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <SaveStatus
              saving={saving}
              lastSaved={lastSaved}
              error={saveError}
              hasUnsavedChanges={hasUnsavedChanges}
              onRetry={onRetry}
            />
          </div>

          {/* Middle: Search filters */}
          <div className="flex flex-row">
            <SearchFilter
              selectedSection={selectedSection}
              onSectionChange={onSectionChange}
              selectedStatus={selectedStatus}
              onStatusChange={onStatusChange}
              sections={sections}
              size="sm"
            />
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onSave}
              disabled={saving || !hasUnsavedChanges}
              size="sm"
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </>
              )}
            </Button>

            {isInterWorks && !hasManagement && (
              <Button
                variant="gradient"
                size="sm"
                onClick={onEnableManagement}
                disabled={enablingManagement}
                className="gap-2"
              >
                {enablingManagement ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Management
                  </>
                )}
              </Button>
            )}

            {isInterWorks && hasManagement && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewManagement}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Management
              </Button>
            )}

            {isInterWorks && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenManagementModal}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Add Topics
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
