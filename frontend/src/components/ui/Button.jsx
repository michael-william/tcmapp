/**
 * Button Component
 *
 * Reusable button component with variants.
 */

import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'bg-primary hover:bg-primary-dark text-primary-foreground',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
  ghost: 'hover:bg-primary/10 text-primary',
  gradient: 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:opacity-90',
};

const buttonSizes = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      children,
      disabled = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
