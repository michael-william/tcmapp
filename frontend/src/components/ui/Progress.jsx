/**
 * Progress Component
 *
 * Progress bar component using Radix UI Progress primitive.
 */

import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export const Progress = React.forwardRef(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-gradient-to-r from-primary to-primary-dark transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  }
);

Progress.displayName = 'Progress';
