/**
 * ClientInfoField Component
 *
 * Form field for client information with label and input.
 */

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export const ClientInfoField = ({
  label,
  value = '',
  onChange,
  readOnly = false,
  type = 'text',
  placeholder = '',
  className,
}) => {
  const handleChange = (e) => {
    if (!readOnly) {
      onChange?.(e.target.value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={label}
        type={type}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={cn(readOnly && 'bg-muted cursor-not-allowed')}
      />
    </div>
  );
};
