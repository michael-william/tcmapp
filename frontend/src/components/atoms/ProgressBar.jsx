/**
 * ProgressBar Component
 *
 * Styled progress bar with optional percentage display.
 */

import React from 'react';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

export const ProgressBar = ({ value = 0, showPercentage = true, className }) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        {showPercentage && (
          <span className="text-sm font-bold text-primary">{Math.round(percentage)}%</span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};
