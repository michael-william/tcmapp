/**
 * QuestionMultiSelect Component
 *
 * Multi-select dropdown question with checkboxes and badge display.
 * Includes N/A mutual exclusivity logic.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';
import { UpdateInfo } from '@/components/atoms/UpdateInfo';
import { cn } from '@/lib/utils';

export const QuestionMultiSelect = ({
  question,
  options = [],
  value = [],
  onChange,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleOption = (option) => {
    if (disabled) return;

    let newValues = [...selectedValues];

    if (option === 'N/A') {
      // If N/A is selected, clear all other options
      if (newValues.includes('N/A')) {
        newValues = newValues.filter((v) => v !== 'N/A');
      } else {
        newValues = ['N/A'];
      }
    } else {
      // If any other option is selected, remove N/A
      if (newValues.includes(option)) {
        newValues = newValues.filter((v) => v !== option);
      } else {
        newValues = [...newValues.filter((v) => v !== 'N/A'), option];
      }
    }

    // If no options are selected, auto-select N/A
    if (newValues.length === 0) {
      newValues = ['N/A'];
    }

    onChange(newValues);
  };

  const handleRemoveBadge = (option) => {
    if (disabled) return;

    let newValues = selectedValues.filter((v) => v !== option);

    // If no options are selected after removal, auto-select N/A
    if (newValues.length === 0) {
      newValues = ['N/A'];
    }

    onChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return 'Select options';
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor={question._id || question.id} className="text-base font-normal">
            {question.questionText}
          </Label>
          {question.metadata?.infoTooltip && (
            <InfoTooltip content={question.metadata.infoTooltip} />
          )}
          {question.helpText && <InfoTooltip content={question.helpText} />}
        </div>

        <div className="relative">
          {/* Trigger Button */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex h-10 items-center justify-between rounded-md px-3 py-2 text-sm min-w-[200px]',
              'bg-primary hover:bg-primary-dark text-primary-foreground border-primary',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors'
            )}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-white ml-2 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </button>

          {/* Dropdown Content */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className={cn(
                'absolute z-50 mt-1 min-w-[200px] rounded-md border bg-popover shadow-md',
                'animate-fadeIn'
              )}
              style={{ top: '100%', right: 0 }}
            >
              <div className="p-2 max-h-64 overflow-y-auto">
                {options
                  .filter((option) => option !== '')
                  .map((option, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center space-x-2 rounded-sm px-2 py-2',
                        'hover:bg-accent cursor-pointer transition-colors'
                      )}
                      onClick={() => handleToggleOption(option)}
                    >
                      <Checkbox
                        checked={selectedValues.includes(option)}
                        onCheckedChange={() => handleToggleOption(option)}
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm select-none">{option}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Values as Badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val, index) => (
            <Badge
              key={index}
              variant="default"
              className="flex items-center gap-1 pr-1"
            >
              <span>{val}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(val)}
                  className="ml-1 rounded-full hover:bg-primary-dark/20 p-0.5 transition-colors"
                  aria-label={`Remove ${val}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      <UpdateInfo updatedAt={question.updatedAt} updatedBy={question.updatedBy} />
    </div>
  );
};
