/**
 * QuestionItem Component
 *
 * Dynamic component that renders the appropriate question type.
 */

import React, { useState } from 'react';
import { QuestionCheckbox } from '@/components/molecules/QuestionCheckbox';
import { QuestionTextInput } from '@/components/molecules/QuestionTextInput';
import { QuestionDateInput } from '@/components/molecules/QuestionDateInput';
import { QuestionDropdown } from '@/components/molecules/QuestionDropdown';
import { QuestionYesNo } from '@/components/molecules/QuestionYesNo';
import { QuestionNumberInput } from '@/components/molecules/QuestionNumberInput';
import { QuestionMultiSelect } from '@/components/molecules/QuestionMultiSelect';
import { AnswerChangeWarningModal } from '@/components/organisms/AnswerChangeWarningModal';
import { cn } from '@/lib/utils';

export const QuestionItem = ({ question, onChange }) => {
  if (!question) return null;

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);

  const isDisabled = !!question.metadata?.disabledBy;

  // Check if question was previously answered (excluding textInput)
  const isPreviouslyAnswered = () => {
    if (question.questionType === 'textInput') return false;

    // For checkboxes, check if completed field is true
    if (question.questionType === 'checkbox') {
      const hasBeenCompleted = question.completed === true;
      const hasTrackingInfo = question.updatedAt || question.completedAt;
      return hasBeenCompleted && hasTrackingInfo;
    }

    // For other question types, check if answer exists and is not empty
    let hasAnswer;
    if (Array.isArray(question.answer)) {
      // For multiSelect, check if array has items
      hasAnswer = question.answer.length > 0;
    } else {
      hasAnswer = question.answer !== null &&
                  question.answer !== undefined &&
                  question.answer !== '';
    }

    // Check for ANY indicator that question was previously answered
    const hasBeenAnswered = question.updatedAt ||
                           question.completed === true ||
                           question.completedAt;

    return hasAnswer && hasBeenAnswered;
  };

  // Execute the pending change after user confirmation
  const executePendingChange = () => {
    if (pendingChange) {
      onChange?.(question.id, pendingChange.updates);
    }
    setShowWarningModal(false);
    setPendingChange(null);
  };

  const handleChange = (value) => {
    if (isDisabled) return; // Prevent changes

    const updates = { answer: value, completed: !!value };

    // Check if previously answered and value is different
    // For arrays (multiSelect), compare by content
    const isAnswerChanged = Array.isArray(value) && Array.isArray(question.answer)
      ? JSON.stringify([...value].sort()) !== JSON.stringify([...question.answer].sort())
      : value !== question.answer;

    if (isPreviouslyAnswered() && isAnswerChanged) {
      setPendingChange({ updates });
      setShowWarningModal(true);
    } else {
      onChange?.(question.id, updates);
    }
  };

  const handleCheckboxChange = (checked) => {
    if (isDisabled) return; // Prevent changes

    const updates = {
      completed: checked,
      completedAt: checked ? new Date().toISOString() : null,
    };

    // Check if previously answered and value is different
    if (isPreviouslyAnswered() && checked !== question.completed) {
      setPendingChange({ updates });
      setShowWarningModal(true);
    } else {
      onChange?.(question.id, updates);
    }
  };

  const handleConditionalChange = (field, value) => {
    if (isDisabled) return; // Prevent changes
    onChange?.(question.id, { [field]: value });
  };

  let questionContent;

  switch (question.questionType) {
    case 'checkbox':
      questionContent = (
        <div className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}>
          <QuestionCheckbox
            question={question}
            checked={question.completed || false}
            onCheckedChange={handleCheckboxChange}
            timestamp={question.completedAt}
            disabled={isDisabled}
          />
          {isDisabled && (
            <p className="text-xs text-muted-foreground mt-1 ml-9">
              Not applicable - Bridge is not required
            </p>
          )}
        </div>
      );
      break;

    case 'textInput':
      questionContent = (
        <div className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}>
          <QuestionTextInput
            question={question}
            value={question.answer || ''}
            onChange={handleChange}
            disabled={isDisabled}
          />
          {isDisabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Not applicable - Bridge is not required
            </p>
          )}
        </div>
      );
      break;

    case 'dateInput':
      questionContent = (
        <div className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}>
          <QuestionDateInput
            question={question}
            value={question.answer || ''}
            onChange={handleChange}
            disabled={isDisabled}
          />
          {isDisabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Not applicable - Bridge is not required
            </p>
          )}
        </div>
      );
      break;

    case 'dropdown':
      const hasEmptyOptions = !question.options || question.options.length === 0;
      const isDynamicDropdown = question.metadata?.dependsOn && question.metadata?.skuLimits;

      if (isDynamicDropdown && hasEmptyOptions) {
        // Show disabled state with message
        questionContent = (
          <div className="space-y-1">
            <QuestionDropdown
              key={`${question.id}-${question.options?.length || 0}`}
              question={question}
              options={[]}
              value=""
              onChange={() => {}} // No-op
              disabled={true}
            />
            <p className="text-xs text-muted-foreground">
              Please select SKU type first (Q33)
            </p>
          </div>
        );
      } else {
        questionContent = (
          <QuestionDropdown
            key={`${question.id}-${question.options?.length || 0}`}
            question={question}
            options={question.options || []}
            value={question.answer || ''}
            onChange={handleChange}
          />
        );
      }
      break;

    case 'numberInput':
      questionContent = (
        <QuestionNumberInput
          question={question}
          value={question.answer || 1}
          onChange={handleChange}
          min={question.metadata?.min || 1}
          max={question.metadata?.max}
        />
      );
      break;

    case 'yesNo':
      questionContent = (
        <div className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}>
          <QuestionYesNo
            question={question}
            value={question.answer || ''}
            onChange={handleChange}
            options={question.options || ['Yes', 'No']}
            showConditionalDate={question.showConditionalDate}
            showConditionalInput={question.showConditionalInput}
            conditionalDateValue={question.conditionalDate || ''}
            conditionalInputValue={question.conditionalInput || ''}
            onConditionalDateChange={(value) => handleConditionalChange('conditionalDate', value)}
            onConditionalInputChange={(value) => handleConditionalChange('conditionalInput', value)}
            disabled={isDisabled}
          />
          {isDisabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Not applicable - Bridge is not required
            </p>
          )}
        </div>
      );
      break;

    case 'multiSelect':
      questionContent = (
        <div className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}>
          <QuestionMultiSelect
            question={question}
            options={question.options || []}
            value={question.answer || []}
            onChange={handleChange}
            disabled={isDisabled}
          />
          {isDisabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Not applicable - Bridge is not required
            </p>
          )}
        </div>
      );
      break;

    default:
      questionContent = (
        <div className="text-sm text-muted-foreground">
          Unknown question type: {question.questionType}
        </div>
      );
      break;
  }

  return (
    <>
      {questionContent}
      <AnswerChangeWarningModal
        isOpen={showWarningModal}
        onCancel={() => {
          setShowWarningModal(false);
          setPendingChange(null);
        }}
        onConfirm={executePendingChange}
        questionText={question.questionText}
        updatedAt={question.updatedAt}
        updatedBy={question.updatedBy}
      />
    </>
  );
};
