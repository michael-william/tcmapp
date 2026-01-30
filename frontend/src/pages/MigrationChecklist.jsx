/**
 * MigrationChecklist Page
 *
 * Main checklist page with all questions, search, and export.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import { ClientInfoSection } from '@/components/organisms/ClientInfoSection';
import { QuestionSection } from '@/components/organisms/QuestionSection';
import { ExportSection } from '@/components/organisms/ExportSection';
import { SearchFilter } from '@/components/molecules/SearchFilter';
import { QuestionManagementModal } from '@/components/organisms/QuestionManagementModal';
import { SaveStatus } from '@/components/molecules/SaveStatus';
import { UnsavedChangesModal } from '@/components/molecules/UnsavedChangesModal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useMigration } from '@/hooks/useMigration';
import { toast } from '@/components/ui/Toast';
import api from '@/lib/api';
import { Loader2, Settings, ArrowLeft, Save } from 'lucide-react';

export const MigrationChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInterWorks = user?.role === 'interworks';

  const {
    migration,
    loading,
    error,
    saving,
    saveError,
    lastSaved,
    hasUnsavedChanges,
    updateQuestion,
    updateClientInfo,
    saveMigration,
    retrySave,
  } = useMigration(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [contacts, setContacts] = useState({ guest: [], interworks: [] });

  // Navigation blocking state
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Show error toast when save fails
  useEffect(() => {
    if (saveError) {
      toast.error('Failed to save changes', {
        description: saveError,
        action: {
          label: 'Retry',
          onClick: retrySave,
        },
      });
    }
  }, [saveError, retrySave]);

  // Browser beforeunload warning
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Fetch contacts when migration loads
  useEffect(() => {
    const fetchContacts = async () => {
      if (!migration?.clientId) return;

      try {
        const clientId = migration.clientId._id || migration.clientId;
        const response = await api.get(`/users?clientId=${clientId}`);
        const users = response.data.users || [];

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
  }, [migration?.clientId]);

  // Group questions by section
  const questionsBySection = useMemo(() => {
    if (!migration?.questions) return {};

    return migration.questions.reduce((acc, question) => {
      const section = question.section || 'Uncategorized';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(question);
      return acc;
    }, {});
  }, [migration]);

  // Get unique sections
  const sections = useMemo(() => Object.keys(questionsBySection), [questionsBySection]);

  // Filter questions
  const filteredSections = useMemo(() => {
    let filtered = { ...questionsBySection };

    // Section filter
    if (selectedSection !== 'all') {
      filtered = { [selectedSection]: questionsBySection[selectedSection] || [] };
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [section, questions]) => {
        const matchingQuestions = questions.filter((q) =>
          q.questionText?.toLowerCase().includes(searchLower)
        );
        if (matchingQuestions.length > 0) {
          acc[section] = matchingQuestions;
        }
        return acc;
      }, {});
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = Object.entries(filtered).reduce((acc, [section, questions]) => {
        const matchingQuestions = questions.filter((q) =>
          selectedStatus === 'completed' ? q.completed : !q.completed
        );
        if (matchingQuestions.length > 0) {
          acc[section] = matchingQuestions;
        }
        return acc;
      }, {});
    }

    return filtered;
  }, [questionsBySection, searchTerm, selectedSection, selectedStatus]);

  // Calculate progress
  const { completed, total, percentage } = useMemo(() => {
    if (!migration?.questions) return { completed: 0, total: 0, percentage: 0 };

    const completedCount = migration.questions.filter((q) => q.completed).length;
    const totalCount = migration.questions.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return { completed: completedCount, total: totalCount, percentage: pct };
  }, [migration]);

  // Handle question change
  const handleQuestionChange = (questionId, updates) => {
    updateQuestion(questionId, updates);
  };

  // Handle client info change
  const handleClientInfoChange = (field, value) => {
    updateClientInfo(field, value);
  };

  // Toggle section collapse
  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Export to PDF
  const handleExport = async () => {
    // TODO: Implement PDF export with jsPDF
    console.log('Exporting migration:', migration);
    alert('PDF export will be implemented with jsPDF');
  };

  // Add new question
  const handleAddQuestion = async (newQuestion) => {
    // TODO: Implement add question API call
    console.log('Adding question:', newQuestion);
  };

  // Manual save handler
  const handleSave = async () => {
    const result = await saveMigration();
    if (result.success) {
      toast.success('Changes saved successfully');
    }
  };

  // Navigation handler
  const handleNavigation = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  };

  // Modal action handlers
  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleSaveAndNavigate = async () => {
    setIsNavigating(true);
    const result = await saveMigration();
    setIsNavigating(false);

    if (result.success) {
      setShowUnsavedModal(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
      }
    } else {
      toast.error('Failed to save changes. Please try again.');
    }
  };

  if (loading) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0} onNavigate={handleNavigation}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MigrationLayout>
    );
  }

  if (error) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0} onNavigate={handleNavigation}>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => handleNavigation('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  if (!migration) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0} onNavigate={handleNavigation}>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Migration not found</p>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  // Page header with navigation and actions
  const pageHeader = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => handleNavigation('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {migration.clientInfo?.clientName || 'Migration Checklist'}
          </h1>
          <SaveStatus
            saving={saving}
            lastSaved={lastSaved}
            error={saveError}
            hasUnsavedChanges={hasUnsavedChanges}
            onRetry={retrySave}
          />
        </div>
      </div>
      <div className="flex flex-row">
        <SearchFilter
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sections={sections}
        />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
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

        {isInterWorks && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManagementModalOpen(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Questions
          </Button>
        )}
      </div>
      
    </div>
  );

  return (
    <MigrationLayout
      completed={completed}
      total={total}
      percentage={percentage}
      clientName={migration.clientInfo?.clientName}
      guestContacts={contacts.guest}
      interworksContacts={contacts.interworks}
      onNavigate={handleNavigation}
      pageHeader={pageHeader}
    >
      <div className="space-y-6">

        {/* Client Information */}
        <ClientInfoSection
          clientInfo={migration.clientInfo || {}}
          onChange={handleClientInfoChange}
          readOnly={!isInterWorks}
        />

        {/* Search and Filter
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sections={sections}
        /> */}

        {/* Question Sections */}
        {Object.keys(filteredSections).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No questions match your search criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredSections).map(([section, questions]) => (
              <QuestionSection
                key={section}
                section={section}
                questions={questions}
                onQuestionChange={handleQuestionChange}
                isCollapsed={collapsedSections[section]}
                onToggle={() => toggleSection(section)}
              />
            ))}
          </div>
        )}

        {/* Export Section */}
        <ExportSection migration={migration} onExport={handleExport} />
      </div>

      {/* Question Management Modal (InterWorks only) */}
      {isInterWorks && (
        <QuestionManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => setIsManagementModalOpen(false)}
          migration={migration}
          onSave={handleAddQuestion}
        />
      )}

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onCancel={handleCancelNavigation}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveAndNavigate}
        saving={isNavigating}
      />
    </MigrationLayout>
  );
};
