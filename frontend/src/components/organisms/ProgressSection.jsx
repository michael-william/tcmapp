/**
 * ProgressSection Component
 *
 * Displays overall progress with stats and progress bar.
 */

import React from 'react';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { cn } from '@/lib/utils';

export const ProgressSection = ({ completed = 0, total = 0, percentage = 0, className }) => {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-lg border-b px-4 py-4 sticky top-[73px] z-30',
        className
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Overall Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              {completed} of {total} questions completed
            </p>
          </div>
        </div>
        <ProgressBar value={percentage} showPercentage={true} />
      </div>
    </div>
  );
};
