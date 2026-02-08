/**
 * QuestionItem Component
 *
 * Dynamic component that renders the appropriate question type.
 */

import React from 'react';
import { QuestionCheckbox } from '@/components/molecules/QuestionCheckbox';
import { QuestionTextInput } from '@/components/molecules/QuestionTextInput';
import { QuestionDateInput } from '@/components/molecules/QuestionDateInput';
import { QuestionDropdown } from '@/components/molecules/QuestionDropdown';
import { QuestionYesNo } from '@/components/molecules/QuestionYesNo';
import { QuestionNumberInput } from '@/components/molecules/QuestionNumberInput';
import { cn } from '@/lib/utils';

export const QuestionItem = ({ question, onChange, onBlur }) => {
  if (!question) return null;

  const isDisabled = !!question.metadata?.disabledBy;

  const handleChange = (value) => {
    if (isDisabled) return; // Prevent changes
    onChange?.(question._id, { answer: value, completed: !!value });
  };

  const handleCheckboxChange = (checked) => {
    if (isDisabled) return; // Prevent changes
    onChange?.(question._id, {
      completed: checked,
      completedAt: checked ? new Date().toISOString() : null,
    });
  };

  const handleConditionalChange = (field, value) => {
    if (isDisabled) return; // Prevent changes
    onChange?.(question._id, { [field]: value });
  };

  switch (question.questionType) {
    case 'checkbox':
      return (
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

    case 'textInput':
      return (
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

    case 'dateInput':
      return (
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

    case 'dropdown':
      return (
        <QuestionDropdown
          question={question}
          options={question.options || []}
          value={question.answer || ''}
          onChange={handleChange}
        />
      );

    case 'numberInput':
      return (
        <QuestionNumberInput
          question={question}
          value={question.answer || 1}
          onChange={handleChange}
          onBlur={() => onBlur?.(question._id)}
          min={question.metadata?.min || 1}
          max={question.metadata?.max}
        />
      );

    case 'yesNo':
      return (
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

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown question type: {question.questionType}
        </div>
      );
  }
};
