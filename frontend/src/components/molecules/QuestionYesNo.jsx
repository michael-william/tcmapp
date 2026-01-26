/**
 * QuestionYesNo Component
 *
 * Yes/No radio button question with optional conditional inputs.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Input } from '@/components/ui/Input';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { cn } from '@/lib/utils';

export const QuestionYesNo = ({
  question,
  value = '',
  onChange,
  options = ['Yes', 'No'],
  showConditionalDate = false,
  showConditionalInput = false,
  conditionalDateValue = '',
  conditionalInputValue = '',
  onConditionalDateChange,
  onConditionalInputChange,
  className,
}) => {
  const handleValueChange = (newValue) => {
    onChange?.(newValue);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Label className="text-base font-normal">{question.questionText}</Label>
        {question.helpText && <InfoTooltip content={question.helpText} />}
      </div>

      <RadioGroup value={value} onValueChange={handleValueChange} className="flex gap-4">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${question._id}-${option}`} />
            <Label
              htmlFor={`${question._id}-${option}`}
              className="font-normal cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Conditional date input */}
      {showConditionalDate && value === options[0] && (
        <div className="ml-6 mt-2">
          <Label htmlFor={`${question._id}-date`} className="text-sm">
            When?
          </Label>
          <Input
            id={`${question._id}-date`}
            type="date"
            value={conditionalDateValue}
            onChange={(e) => onConditionalDateChange?.(e.target.value)}
            className="mt-1 max-w-xs"
          />
        </div>
      )}

      {/* Conditional text input */}
      {showConditionalInput && value === options[0] && (
        <div className="ml-6 mt-2">
          <Label htmlFor={`${question._id}-input`} className="text-sm">
            Please specify:
          </Label>
          <Input
            id={`${question._id}-input`}
            type="text"
            value={conditionalInputValue}
            onChange={(e) => onConditionalInputChange?.(e.target.value)}
            placeholder="Enter details..."
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
};
