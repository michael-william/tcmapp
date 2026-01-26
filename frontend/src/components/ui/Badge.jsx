/**
 * Badge Component
 *
 * Status indicator badge component with variants.
 */

import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-primary text-primary',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
};

export const Badge = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          badgeVariants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
