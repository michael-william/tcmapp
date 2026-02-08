/**
 * QuestionDateInput Component
 *
 * Date input question with label and optional help tooltip.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionDateInput = ({
  question,
  value = '',
  onChange,
  disabled = false,
  className,
}) => {
  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.value);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={question._id} className="text-base font-normal">
          {question.questionText}
        </Label>
        {question.helpText && <InfoTooltip content={question.helpText} />}
      </div>
      <Input
        id={question._id}
        type="date"
        value={value}
        onChange={handleChange}
        className={cn('max-w-xs', disabled && 'cursor-not-allowed')}
        disabled={disabled}
      />
    </div>
  );
};
