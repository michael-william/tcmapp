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
import { UpdateInfo } from '@/components/atoms/UpdateInfo';
import { cn } from '@/lib/utils';

export const QuestionDropdown = ({
  question,
  options = [],
  value = '',
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor={question._id} className="text-base font-normal">
            {question.questionText}
          </Label>
          {question.helpText && <InfoTooltip content={question.helpText} />}
        </div>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger variant="primary" id={question._id} className="w-auto shrink-0 min-w-[200px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((option) => option !== '') // Filter out empty strings
              .map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <UpdateInfo updatedAt={question.updatedAt} updatedBy={question.updatedBy} />
    </div>
  );
};
