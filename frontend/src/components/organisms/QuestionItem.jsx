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

export const QuestionItem = ({ question, onChange }) => {
  if (!question) return null;

  const handleChange = (value) => {
    onChange?.(question._id, { answer: value, completed: !!value });
  };

  const handleCheckboxChange = (checked) => {
    onChange?.(question._id, {
      completed: checked,
      completedAt: checked ? new Date().toISOString() : null,
    });
  };

  const handleConditionalChange = (field, value) => {
    onChange?.(question._id, { [field]: value });
  };

  switch (question.questionType) {
    case 'checkbox':
      return (
        <QuestionCheckbox
          question={question}
          checked={question.completed || false}
          onCheckedChange={handleCheckboxChange}
          timestamp={question.completedAt}
        />
      );

    case 'textInput':
      return (
        <QuestionTextInput
          question={question}
          value={question.answer || ''}
          onChange={handleChange}
        />
      );

    case 'dateInput':
      return (
        <QuestionDateInput
          question={question}
          value={question.answer || ''}
          onChange={handleChange}
        />
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

    case 'yesNo':
      return (
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
        />
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown question type: {question.questionType}
        </div>
      );
  }
};
