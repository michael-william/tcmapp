/**
 * QuestionNumberInput Component
 *
 * Number input question with validation, label, optional help tooltip.
 * Supports min/max constraints and onBlur validation.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionNumberInput = ({
  question,
  value = 1,
  onChange,
  onBlur,
  className,
  min = 1,
  max,
  error = false,
}) => {
  const handleChange = (e) => {
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue)) {
      onChange?.(numValue);
    } else if (e.target.value === '') {
      onChange?.(null);
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={question._id} className="text-base font-normal">
          {question.questionText}
        </Label>
        {question.metadata?.infoTooltip && (
          <InfoTooltip content={question.metadata.infoTooltip} />
        )}
      </div>
      <Input
        id={question._id}
        type="number"
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        placeholder="Enter number..."
        className={cn('max-w-xs', error && 'border-red-500')}
      />
      {error && (
        <p className="text-sm text-red-500">
          Please enter a valid number within the allowed range.
        </p>
      )}
    </div>
  );
};
