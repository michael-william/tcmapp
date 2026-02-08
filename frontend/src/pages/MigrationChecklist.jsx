/**
 * MigrationChecklist Page
 *
 * Main checklist page with all questions, search, and export.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import { ClientInfoSection } from '@/components/organisms/ClientInfoSection';
import { QuestionSection } from '@/components/organisms/QuestionSection';
import { ExportSection } from '@/components/organisms/ExportSection';
import { SearchFilter } from '@/components/molecules/SearchFilter';
import { QuestionManagementModal } from '@/components/organisms/QuestionManagementModal';
import { SaveStatus } from '@/components/molecules/SaveStatus';
import { UnsavedChangesModal } from '@/components/molecules/UnsavedChangesModal';
import { SiteLimitWarningModal } from '@/components/organisms/SiteLimitWarningModal';
import { SkuRequiredModal } from '@/components/organisms/SkuRequiredModal';
import { BridgeConditionalModal } from '@/components/organisms/BridgeConditionalModal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useMigration } from '@/hooks/useMigration';
import { toast } from '@/components/ui/Toast';
import api from '@/lib/api';
import { generateMigrationPDF } from '@/lib/pdfExport';
import { Loader2, Settings, ArrowLeft, Save, Plus, BarChart3 } from 'lucide-react';

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
  const [hasManagement, setHasManagement] = useState(false);
  const [enablingManagement, setEnablingManagement] = useState(false);

  // Navigation blocking state
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Site limit validation state
  const [siteLimitWarning, setSiteLimitWarning] = useState({
    isOpen: false,
    skuType: '',
    maxSites: 0,
    enteredValue: 0,
    questionId: null,
  });
  const [skuRequiredModal, setSkuRequiredModal] = useState(false);

  // Bridge conditional logic state
  const [bridgeConditionalModal, setBridgeConditionalModal] = useState({
    isOpen: false,
    hasExistingAnswers: false,
    newValue: null,
  });

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

  // Check if management module is enabled
  useEffect(() => {
    if (migration) {
      setHasManagement(!!migration.hasManagement);
    }
  }, [migration]);

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

  // Helper function to get N/A value based on question type
  const getNAValue = (questionType) => {
    switch (questionType) {
      case 'yesNo':
      case 'textInput':
        return 'N/A';
      case 'dateInput':
      case 'checkbox':
      default:
        return null;
    }
  };

  // Validate site limits for Q34
  const validateSitesLimit = useCallback((questionId) => {
    const question = migration?.questions?.find((q) => q._id === questionId);
    if (!question || question.order !== 34) return; // Only validate Q34

    const q33 = migration?.questions?.find((q) => q.order === 33); // SKU type
    const skuType = q33?.answer;

    // Check if SKU is selected
    if (!skuType || skuType === '') {
      setSkuRequiredModal(true);
      // Clear the sites value
      updateQuestion(questionId, { answer: null, completed: false });
      return;
    }

    // Get limits from metadata
    const skuLimits = question.metadata?.skuLimits || {
      'Standard': 3,
      'Enterprise': 10,
      'Tableau +': 50,
    };

    const maxSites = skuLimits[skuType];
    const enteredValue = question.answer;

    // Validate against limit
    if (enteredValue && enteredValue > maxSites) {
      setSiteLimitWarning({
        isOpen: true,
        skuType,
        maxSites,
        enteredValue,
        questionId,
      });
      // Reset to max allowed
      updateQuestion(questionId, { answer: maxSites, completed: true });
    }
  }, [migration, updateQuestion]);

  // Handle Bridge conditional logic
  const handleBridgeConditionalLogic = useCallback((bridgeAnswer, skipModal = false) => {
    if (!bridgeAnswer) return;

    // Define dependent question IDs (works for all migrations)
    const dependentQuestionIds = ['q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q60'];

    const dependentQuestions = migration?.questions?.filter(
      q => dependentQuestionIds.includes(q.id)
    ) || [];

    if (bridgeAnswer === 'No') {
      // Check if any dependent questions have answers
      const hasExistingAnswers = dependentQuestions.some(
        q => q.answer !== null && q.answer !== '' && q.answer !== 'N/A'
      );

      if (hasExistingAnswers && !skipModal) {
        // Show confirmation modal
        setBridgeConditionalModal({
          isOpen: true,
          hasExistingAnswers: true,
          newValue: 'No',
        });
        return;
      }

      // Disable and set N/A
      dependentQuestions.forEach(q => {
        const naValue = getNAValue(q.questionType);
        updateQuestion(q._id, {
          answer: naValue,
          completed: false,
          metadata: { ...q.metadata, disabledBy: 'q45' },
        });
      });
    } else if (bridgeAnswer === 'Yes') {
      // Re-enable questions (only if currently disabled by q45)
      dependentQuestions.forEach(q => {
        if (q.metadata?.disabledBy === 'q45') {
          updateQuestion(q._id, {
            answer: null,
            completed: false,
            metadata: { ...q.metadata, disabledBy: null },
          });
        }
      });
    }
  }, [migration, updateQuestion]);

  // Handle question change
  const handleQuestionChange = (questionId, updates) => {
    const question = migration?.questions?.find(q => q._id === questionId);

    // Special handling for q45 (Bridge requirement)
    if (question?.id === 'q45' && updates.answer === 'No') {
      // Define dependent question IDs
      const dependentQuestionIds = ['q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q60'];

      const dependentQuestions = migration?.questions?.filter(
        q => dependentQuestionIds.includes(q.id)
      ) || [];

      const hasExistingAnswers = dependentQuestions.some(
        q => q.answer !== null && q.answer !== '' && q.answer !== 'N/A'
      );

      if (hasExistingAnswers) {
        // Show modal before updating
        setBridgeConditionalModal({
          isOpen: true,
          hasExistingAnswers: true,
          newValue: 'No',
        });
        return; // Don't update yet
      }
    }

    updateQuestion(questionId, updates);
  };

  // Handle question blur (for validation)
  const handleQuestionBlur = useCallback((questionId) => {
    validateSitesLimit(questionId);
  }, [validateSitesLimit]);

  // Get q45 answer value for monitoring
  const q45Answer = useMemo(() => {
    return migration?.questions?.find(q => q.id === 'q45')?.answer;
  }, [migration?.questions]);

  // Monitor q45 changes and apply conditional logic
  useEffect(() => {
    if (q45Answer) {
      handleBridgeConditionalLogic(q45Answer);
    }
  }, [q45Answer, handleBridgeConditionalLogic]);

  // Handle Bridge modal confirmation
  const handleBridgeModalConfirm = () => {
    const q45 = migration?.questions?.find(q => q.id === 'q45');

    // Update q45 answer
    updateQuestion(q45._id, {
      answer: bridgeConditionalModal.newValue,
      completed: true,
    });

    // Process conditional logic
    handleBridgeConditionalLogic(bridgeConditionalModal.newValue, true);

    // Close modal
    setBridgeConditionalModal({ isOpen: false, hasExistingAnswers: false, newValue: null });
  };

  const handleBridgeModalCancel = () => {
    setBridgeConditionalModal({ isOpen: false, hasExistingAnswers: false, newValue: null });
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
    try {
      await generateMigrationPDF(migration);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF', {
        description: error.message || 'An error occurred during export'
      });
    }
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

  // Enable management module
  const handleEnableManagement = async () => {
    try {
      setEnablingManagement(true);
      const response = await api.post(`/migrations/${id}/management/enable`);

      if (response.data.success) {
        toast.success(response.data.message);
        setHasManagement(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to enable management module';
      toast.error(errorMessage);
    } finally {
      setEnablingManagement(false);
    }
  };

  // Navigate to management view
  const handleViewManagement = () => {
    handleNavigation(`/migration/${id}/management`);
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
          <h1 className="text-2xl font-bold text-primary">
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
          size="sm"
        />
      </div>

      {/* Save button */}
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

        {isInterWorks && !hasManagement && (
          <Button
            variant="gradient"
            size="sm"
            onClick={handleEnableManagement}
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
            onClick={handleViewManagement}
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
            onClick={() => setIsManagementModalOpen(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Add Topics
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
                onQuestionBlur={handleQuestionBlur}
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

      {/* Site Limit Warning Modal */}
      <SiteLimitWarningModal
        isOpen={siteLimitWarning.isOpen}
        onClose={() => setSiteLimitWarning({ ...siteLimitWarning, isOpen: false })}
        skuType={siteLimitWarning.skuType}
        maxSites={siteLimitWarning.maxSites}
        enteredValue={siteLimitWarning.enteredValue}
      />

      {/* SKU Required Modal */}
      <SkuRequiredModal
        isOpen={skuRequiredModal}
        onClose={() => setSkuRequiredModal(false)}
      />

      {/* Bridge Conditional Modal */}
      <BridgeConditionalModal
        isOpen={bridgeConditionalModal.isOpen}
        onClose={handleBridgeModalCancel}
        onConfirm={handleBridgeModalConfirm}
        hasExistingAnswers={bridgeConditionalModal.hasExistingAnswers}
      />
    </MigrationLayout>
  );
};
