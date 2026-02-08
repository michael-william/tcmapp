/**
 * Input Component
 *
 * Text input component with error states and variants.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(
  (
    {
      className,
      type = 'text',
      error,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
