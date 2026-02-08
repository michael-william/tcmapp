/**
 * Label Component
 *
 * Form label component using Radix UI Label primitive.
 */

import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';
