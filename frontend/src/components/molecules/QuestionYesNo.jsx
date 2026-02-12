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
import { UpdateInfo } from '@/components/atoms/UpdateInfo';
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
  disabled = false,
  className,
}) => {
  const handleValueChange = (newValue) => {
    if (disabled) return;
    onChange?.(newValue);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-base font-normal">{question.questionText}</Label>
          {question.helpText && <InfoTooltip content={question.helpText} />}
        </div>

        <RadioGroup
          value={value}
          onValueChange={handleValueChange}
          className="flex gap-4 shrink-0"
          disabled={disabled}
        >
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`${question._id}-${option}`}
                disabled={disabled}
              />
              <Label
                htmlFor={`${question._id}-${option}`}
                className={cn(
                  'font-normal',
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Conditional date input */}
      {showConditionalDate && value === options[0] && !disabled && (
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
            disabled={disabled}
          />
        </div>
      )}

      {/* Conditional text input */}
      {showConditionalInput && value === options[0] && !disabled && (
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
            disabled={disabled}
          />
        </div>
      )}

      {!disabled && <UpdateInfo updatedAt={question.updatedAt} updatedBy={question.updatedBy} />}
    </div>
  );
};
