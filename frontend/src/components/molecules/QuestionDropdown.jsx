/**
 * QuestionDropdown Component
 *
 * Dropdown select question with label and optional help tooltip.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionDropdown = ({
  question,
  options = [],
  value = '',
  onChange,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={question._id} className="text-base font-normal">
          {question.questionText}
        </Label>
        {question.helpText && <InfoTooltip content={question.helpText} />}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={question._id} className="max-w-xs">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
