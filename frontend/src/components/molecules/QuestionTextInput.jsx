/**
 * QuestionTextInput Component
 *
 * Text input question with label, optional help tooltip, and auto-save.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionTextInput = ({
  question,
  value = '',
  onChange,
  onBlur,
  className,
}) => {
  const handleChange = (e) => {
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
      <Textarea
        id={question._id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="Enter your answer..."
        rows={3}
        className="resize-none"
      />
    </div>
  );
};
