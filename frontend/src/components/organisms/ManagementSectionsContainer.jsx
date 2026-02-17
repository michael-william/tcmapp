/**
 * ManagementSectionsContainer Component
 *
 * Orchestrates all 25 management sections with state management.
 * Handles question updates, delta operations, and collapse state.
 *
 * REDESIGNED: Delta items are now nested within deltaParent questions
 */

import React, { useMemo } from 'react';
import { ManagementSection } from './ManagementSection';
import { toast } from 'sonner';

export const ManagementSectionsContainer = ({
  questions = [],
  onQuestionChange,
  onAddDelta,
  onUpdateDelta,
  onRemoveDelta,
  collapsedSections = {},
  onToggleSection,
  isInterWorks = false,
  readOnly = false,
}) => {
  // Group questions by section
  const questionsBySection = useMemo(() => {
    const grouped = {};

    questions.forEach((question) => {
      const section = question.section;
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(question);
    });

    return grouped;
  }, [questions]);

  // Define section order (25 sections)
  const sectionOrder = [
    'Site Setup',
    'Users',
    'Groups',
    'Project Hierarchy',
    'Project Permissions',
    'Data Sources',
    'Workbooks',
    'Flows',
    'Virtual Connections',
    'Custom Views',
    'Data Driven Alerts',
    'Favorites',
    'Tags',
    'Accelerated Views',
    'Webhooks',
    'Collections',
    'Data Source Extract Refreshes',
    'Workbook Extract Refreshes',
    'Flow Run Tasks',
    'Subscriptions',
    'Bridge Connections',
    'Migration Issues Log',
    'Content Validation',
    'Content Testing',
    'Post Migration Tasks',
  ];

  // Handle section completion (mark all questions as complete)
  const handleCompleteSection = (sectionName) => {
    const sectionQuestions = questionsBySection[sectionName] || [];

    // Filter out delta parent questions
    const regularQuestions = sectionQuestions.filter(
      (q) => q.questionType !== 'deltaParent'
    );

    // Mark all regular questions as completed
    regularQuestions.forEach((question) => {
      if (!question.completed) {
        onQuestionChange(question.id, { completed: true });
      }
    });

    toast.success(`${sectionName} marked as complete`);
  };

  return (
    <div className="space-y-6">
      {sectionOrder.map((sectionName) => {
        const sectionQuestions = questionsBySection[sectionName] || [];

        if (sectionQuestions.length === 0) {
          return null; // Skip sections with no questions
        }

        return (
          <ManagementSection
            key={sectionName}
            section={sectionName}
            questions={sectionQuestions}
            onQuestionChange={onQuestionChange}
            onAddDelta={onAddDelta}
            onUpdateDelta={onUpdateDelta}
            onRemoveDelta={onRemoveDelta}
            onCompleteSection={handleCompleteSection}
            isCollapsed={collapsedSections[sectionName] || false}
            onToggle={() => onToggleSection(sectionName)}
            isInterWorks={isInterWorks}
            readOnly={readOnly}
          />
        );
      })}

      {/* If no questions loaded yet */}
      {questions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No management questions available.</p>
          <p className="text-sm mt-2">Enable the management module to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ManagementSectionsContainer;
