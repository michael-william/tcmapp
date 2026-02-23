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
    refetch,
  } = useMigration(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [contacts, setContacts] = useState({ guest: [], interworks: [] });
  const [hasManagement, setHasManagement] = useState(false);
  const [enablingManagement, setEnablingManagement] = useState(false);

  // Enhance questions with dynamic options for site count based on SKU type
  const enhancedQuestions = useMemo(() => {
    if (!migration?.questions) return [];

    return migration.questions.map(q => {
      // Special handling for site count - dynamic options based on SKU type
      // Check for dependsOn and skuLimits instead of dynamicOptions flag
      if (q.questionKey === 'cloud_site_count' && q.metadata?.dependsOn === 'cloud_sku_type' && q.metadata?.skuLimits) {
        const skuQuestion = migration.questions.find(
          q2 => q2.questionKey === 'cloud_sku_type' || q2.id === 'q33'
        );
        const skuType = skuQuestion?.answer;

        if (!skuType || skuType === '') {
          return { ...q, options: [] };
        }

        const skuLimits = q.metadata.skuLimits;
        const maxSites = skuLimits[skuType] || 50;
        const dynamicOptions = Array.from({ length: maxSites }, (_, i) => (i + 1).toString());

        return { ...q, options: dynamicOptions };
      }

      return q;
    });
  }, [migration]);

  // Navigation blocking state
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

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
    if (!enhancedQuestions || enhancedQuestions.length === 0) return {};

    return enhancedQuestions.reduce((acc, question) => {
      const section = question.section || 'Uncategorized';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(question);
      return acc;
    }, {});
  }, [enhancedQuestions]);

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

  // Calculate progress (excluding optional questions like "Additional Notes")
  const { completed, total, percentage } = useMemo(() => {
    if (!migration?.questions) return { completed: 0, total: 0, percentage: 0 };

    // Filter out optional questions from progress tracking
    const nonOptionalQuestions = migration.questions.filter((q) => !q.metadata?.isOptional);
    const completedCount = nonOptionalQuestions.filter((q) => q.completed).length;
    const totalCount = nonOptionalQuestions.length;
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

  // Handle Bridge conditional logic
  const handleBridgeConditionalLogic = useCallback((bridgeAnswer, skipModal = false) => {
    if (!bridgeAnswer) return;

    // Define dependent question keys (all Bridge questions except the trigger)
    const dependentQuestionKeys = [
      'bridge_servers_built',
      'bridge_expected_date',
      'bridge_testing_done',
      'bridge_service_mode',
      'bridge_service_account',
      'bridge_windows_auth',
      'bridge_flatfile_unc',
      'bridge_notes'
    ];

    const dependentQuestions = migration?.questions?.filter(
      q => dependentQuestionKeys.includes(q.questionKey) ||
           ['q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q53', 'q64'].includes(q.id)
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
        const identifier = q.questionKey || q.id;
        updateQuestion(identifier, {
          answer: naValue,
          completed: false,
          metadata: { ...q.metadata, disabledBy: 'bridge_required' },
        });
      });
    } else if (bridgeAnswer === 'Yes') {
      // Re-enable questions (only if currently disabled by bridge_required)
      dependentQuestions.forEach(q => {
        if (q.metadata?.disabledBy === 'bridge_required' || q.metadata?.disabledBy === 'q46') {
          const identifier = q.questionKey || q.id;
          updateQuestion(identifier, {
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

    // Special handling for SKU type change
    if (question?.questionKey === 'cloud_sku_type' || question?.id === 'q33') {
      const siteCountQuestion = migration?.questions?.find(
        q => q.questionKey === 'cloud_site_count' || q.id === 'q34'
      );
      const newSkuType = updates.answer;
      const currentSites = siteCountQuestion?.answer;

      if (siteCountQuestion && currentSites && newSkuType) {
        const skuLimits = siteCountQuestion.metadata?.skuLimits || {
          'Standard': 5,
          'Enterprise': 10,
          'Tableau +': 50,
        };

        const maxSitesForNewSku = skuLimits[newSkuType];

        if (parseInt(currentSites) > maxSitesForNewSku) {
          const siteIdentifier = siteCountQuestion.questionKey || siteCountQuestion.id;
          updateQuestion(siteIdentifier, {
            answer: null,
            completed: false
          });
        }
      }
    }

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

    // Add tracking fields for answered questions (optimistic update)
    const enhancedUpdates = { ...updates };
    const isBeingCleared = updates.completed === false &&
                          (updates.answer === null || updates.answer === undefined || updates.answer === '');

    if (isBeingCleared) {
      // Clear tracking when un-answering
      enhancedUpdates.updatedAt = null;
      enhancedUpdates.updatedBy = null;
    } else if (updates.completed || updates.answer !== undefined) {
      // Set tracking when answering
      enhancedUpdates.updatedAt = new Date().toISOString();
      enhancedUpdates.updatedBy = user?.email || null;
    }

    updateQuestion(questionId, enhancedUpdates);
  };

  // Get bridge_required answer value for monitoring
  const bridgeRequiredAnswer = useMemo(() => {
    return migration?.questions?.find(
      q => q.questionKey === 'bridge_required' || q.id === 'q46'
    )?.answer;
  }, [migration?.questions]);

  // Monitor bridge_required changes and apply conditional logic
  useEffect(() => {
    if (bridgeRequiredAnswer) {
      handleBridgeConditionalLogic(bridgeRequiredAnswer);
    }
  }, [bridgeRequiredAnswer, handleBridgeConditionalLogic]);

  // Handle Bridge modal confirmation
  const handleBridgeModalConfirm = () => {
    const bridgeQuestion = migration?.questions?.find(
      q => q.questionKey === 'bridge_required' || q.id === 'q46'
    );

    // Update bridge_required answer
    const identifier = bridgeQuestion.questionKey || bridgeQuestion.id;
    updateQuestion(identifier, {
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
    try {
      const response = await api.post(`/migrations/${id}/questions`, {
        section: newQuestion.section,
        questionText: newQuestion.questionText,
        questionType: newQuestion.questionType,
        helpText: newQuestion.helpText,
      });

      toast.success('Question added successfully');
      await refetch(); // Refresh migration data to show new question
    } catch (error) {
      console.error('Failed to add question:', error);
      toast.error('Failed to add question', {
        description: error.response?.data?.message || 'An error occurred',
      });
    }
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

  return (
    <MigrationLayout
      completed={completed}
      total={total}
      percentage={percentage}
      clientName={migration.clientInfo?.clientName}
      guestContacts={contacts.guest}
      interworksContacts={contacts.interworks}
      onNavigate={handleNavigation}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      hasUnsavedChanges={hasUnsavedChanges}
      onRetry={retrySave}
      selectedSection={selectedSection}
      onSectionChange={setSelectedSection}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      sections={sections}
      isInterWorks={isInterWorks}
      hasManagement={hasManagement}
      enablingManagement={enablingManagement}
      migrationId={id}
      onSave={handleSave}
      onEnableManagement={handleEnableManagement}
      onViewManagement={handleViewManagement}
      onOpenManagementModal={() => setIsManagementModalOpen(true)}
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
