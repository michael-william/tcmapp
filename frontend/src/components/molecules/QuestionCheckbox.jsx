/**
 * QuestionCheckbox Component
 *
 * Checkbox question with label, optional help tooltip, and update tracking.
 */

import React from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { UpdateInfo } from '@/components/atoms/UpdateInfo';
import { cn } from '@/lib/utils';

export const QuestionCheckbox = ({
  question,
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}) => {
  const handleChange = (newChecked) => {
    if (disabled) return;
    onCheckedChange?.(newChecked);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label
            htmlFor={question._id}
            className={cn(
              'text-base font-normal',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            {question.questionText}
          </Label>
          {question.helpText && <InfoTooltip content={question.helpText} />}
        </div>
        <Checkbox
          id={question._id}
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          className={cn('shrink-0', disabled && 'cursor-not-allowed')}
        />
      </div>
      {!disabled && <UpdateInfo updatedAt={question.updatedAt} updatedBy={question.updatedBy} />}
    </div>
  );
};
