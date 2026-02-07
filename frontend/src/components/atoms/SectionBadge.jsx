/**
 * SectionBadge Component
 *
 * Badge showing progress in section headers (e.g., "8/12").
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export const SectionBadge = ({ completed, total, variant = 'default', className }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  // New variant for gradient headers
  if (variant === 'whiteTransparent') {
    return (
      <Badge
        className={cn(
          'bg-white/30 text-white font-semibold px-3 py-1 rounded-xl font-mono',
          className
        )}
      >
        {completed}/{total}
      </Badge>
    );
  }

  // Existing behavior (default variant)
  return (
    <Badge
      variant={isComplete ? 'default' : 'outline'}
      className={cn(
        'ml-2 font-mono',
        isComplete && 'bg-green-600 hover:bg-green-700',
        className
      )}
    >
      {completed}/{total}
    </Badge>
  );
};
