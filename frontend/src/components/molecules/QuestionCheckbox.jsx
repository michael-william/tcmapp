/**
 * QuestionCheckbox Component
 *
 * Checkbox question with label, optional help tooltip, and timestamp.
 */

import React from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionCheckbox = ({
  question,
  checked = false,
  onCheckedChange,
  timestamp,
  className,
}) => {
  const handleChange = (newChecked) => {
    onCheckedChange?.(newChecked);
  };

  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <Checkbox
        id={question._id}
        checked={checked}
        onCheckedChange={handleChange}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={question._id}
            className="text-base font-normal cursor-pointer"
          >
            {question.questionText}
          </Label>
          {question.helpText && <InfoTooltip content={question.helpText} />}
        </div>
        {checked && timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            Completed: {new Date(timestamp).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};
