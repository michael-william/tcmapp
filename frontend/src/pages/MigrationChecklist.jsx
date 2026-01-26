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
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useMigration } from '@/hooks/useMigration';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Settings, ArrowLeft } from 'lucide-react';

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
    updateQuestion,
    updateClientInfo,
    saveMigration,
  } = useMigration(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Debounce changes and auto-save
  const debouncedChanges = useDebounce(hasChanges, 1000);

  useEffect(() => {
    if (debouncedChanges && hasChanges) {
      saveMigration();
      setHasChanges(false);
    }
  }, [debouncedChanges]);

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
    setHasChanges(true);
  };

  // Handle client info change
  const handleClientInfoChange = (field, value) => {
    updateClientInfo(field, value);
    setHasChanges(true);
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

  if (loading) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MigrationLayout>
    );
  }

  if (error) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0}>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  if (!migration) {
    return (
      <MigrationLayout completed={0} total={0} percentage={0}>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Migration not found</p>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  return (
    <MigrationLayout completed={completed} total={total} percentage={percentage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {migration.clientInfo?.clientName || 'Migration Checklist'}
              </h1>
              {saving && (
                <p className="text-xs text-muted-foreground mt-1">Saving changes...</p>
              )}
            </div>
          </div>
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

        {/* Client Information */}
        <ClientInfoSection
          clientInfo={migration.clientInfo || {}}
          onChange={handleClientInfoChange}
          readOnly={!isInterWorks}
        />

        {/* Search and Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sections={sections}
        />

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
    </MigrationLayout>
  );
};
