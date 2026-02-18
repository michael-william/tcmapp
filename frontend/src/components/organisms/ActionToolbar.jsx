/**
 * ActionToolbar Component
 *
 * Reusable action toolbar extracted from ProgressSection.
 * Displays navigation, save status, and action buttons.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export const ActionToolbar = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};
