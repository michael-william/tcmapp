/**
 * UpdateInfo Component
 *
 * Displays persistent update information with checkmark icon.
 * Shows when a question was last answered and by whom.
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const UpdateInfo = ({ updatedAt, updatedBy, className }) => {
  if (!updatedAt) return null;

  const formattedDate = format(new Date(updatedAt), 'MMM dd, yyyy, hh:mm:ss a');

  return (
    <div className={cn('flex items-center gap-2 mt-2', className)}>
      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
      <span className="text-sm italic text-blue-600">
        Answered: {formattedDate}
        {updatedBy && ` by ${updatedBy}`}
      </span>
    </div>
  );
};
