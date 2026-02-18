/**
 * MigrationManagement Page
 *
 * Management view for tracking migration progress, weekly notes, and management sections.
 * InterWorks users can edit notes and questions, clients have read-only access.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import { ManagementHeader } from '@/components/organisms/ManagementHeader';
import { ActionToolbar } from '@/components/organisms/ActionToolbar';
// import { WeeklyNotesSection } from '@/components/organisms/WeeklyNotesSection';
import { ManagementSectionsContainer } from '@/components/organisms/ManagementSectionsContainer.jsx';
import { UnsavedChangesModal } from '@/components/molecules/UnsavedChangesModal';
import { SaveStatus } from '@/components/molecules/SaveStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useManagement } from '@/hooks/useManagement';
import { ArrowLeft, ClipboardList, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';

export const MigrationManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInterWorks = user?.role === 'interworks';

  const {
    management,
    loading,
    error,
    saving,
    saveError,
    lastSaved,
    hasUnsavedChanges,
    addNote,
    editNote,
    deleteNote,
    updateQuestion,
    addDelta,
    updateDelta,
    removeDelta,
    saveManagement,
    retrySave,
  } = useManagement(id);

  const [contacts, setContacts] = useState({ guest: [], interworks: [] });
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Initialize all sections as collapsed on first load
  useEffect(() => {
    if (management?.questions && Object.keys(collapsedSections).length === 0) {
      // Get unique section names
      const sections = [...new Set(management.questions.map(q => q.section))];
      const initialCollapsed = {};
      sections.forEach(section => {
        initialCollapsed[section] = true; // Start collapsed
      });
      setCollapsedSections(initialCollapsed);
    }
  }, [management?.questions]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch contacts when migration loads
  useEffect(() => {
    const fetchContacts = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/migrations/${id}`);
        const migration = response.data.migration;

        if (!migration?.clientId) return;

        const clientId = migration.clientId._id || migration.clientId;
        const usersResponse = await api.get(`/users?clientId=${clientId}`);
        const users = usersResponse.data.users || [];

        setContacts({
          guest: users.filter(u => u.role === 'guest'),
          interworks: users.filter(u => u.role === 'interworks'),
        });
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        // Fail silently - contacts are optional feature
      }
    };

    fetchContacts();
  }, [id]);

  // Handle navigation with unsaved changes check
  const handleNavigation = useCallback((path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  }, [hasUnsavedChanges, navigate]);

  // Unsaved modal handlers
  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSaveAndNavigate = async () => {
    const result = await saveManagement();
    if (result.success) {
      setShowUnsavedModal(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    }
    // If save fails, modal stays open and user sees error
  };

  // Save handler
  const handleSave = async () => {
    await saveManagement();
  };

  // Create management header content
  const managementHeaderContent = management ? (
    <ManagementHeader
      clientInfo={management.clientInfo || {}}
      progress={management.progress || { completed: 0, total: 0, percentage: 0 }}
      guestContacts={contacts.guest}
      interworksContacts={contacts.interworks}
    />
  ) : null;

  if (loading) {
    return (
      <MigrationLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MigrationLayout>
    );
  }

  if (error) {
    return (
      <MigrationLayout>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/migration/${id}`)}
              >
                View Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  if (!management) {
    return (
      <MigrationLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Management module not found
            </p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  // Create action toolbar content
  const actionToolbarContent = (
    <ActionToolbar>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation(`/migration/${id}/overview`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Overview
        </Button>

        <SaveStatus
          saving={saving}
          lastSaved={lastSaved}
          error={saveError}
          hasUnsavedChanges={hasUnsavedChanges}
          onRetry={retrySave}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigation(`/migration/${id}`)}
          className="gap-2"
        >
          <ClipboardList className="h-4 w-4" />
          View Checklist
        </Button>
      </div>
    </ActionToolbar>
  );

  // Handle question changes
  const handleQuestionChange = (questionId, updates) => {
    updateQuestion(questionId, updates);
  };

  // Handle delta operations
  const handleAddDelta = async (parentId, name) => {
    await addDelta(parentId, name);
  };

  const handleUpdateDelta = async (parentId, deltaId, updates) => {
    await updateDelta(parentId, deltaId, updates);
  };

  const handleRemoveDelta = async (parentId, deltaId) => {
    await removeDelta(parentId, deltaId);
  };

  // Handle section toggle
  const handleToggleSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <MigrationLayout
      managementHeader={managementHeaderContent}
      actionToolbar={actionToolbarContent}
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Weekly Notes Section - Commented out for now, may revisit later */}
        {/* <WeeklyNotesSection
          notes={management.weeklyNotes}
          onAddNote={addNote}
          onEditNote={editNote}
          onDeleteNote={deleteNote}
          isReadOnly={!isInterWorks}
          saving={saving}
        /> */}

        {/* Management Sections */}
        <ManagementSectionsContainer
          questions={management.questions || []}
          onQuestionChange={handleQuestionChange}
          onAddDelta={handleAddDelta}
          onUpdateDelta={handleUpdateDelta}
          onRemoveDelta={handleRemoveDelta}
          collapsedSections={collapsedSections}
          onToggleSection={handleToggleSection}
          isInterWorks={isInterWorks}
          readOnly={!isInterWorks}
        />
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onCancel={handleCancelNavigation}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveAndNavigate}
        saving={saving}
      />
    </MigrationLayout>
  );
};
