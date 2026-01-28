/**
 * InfoTooltip Component
 *
 * Info icon with tooltip for question help text.
 */

import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

export const InfoTooltip = ({ content, className }) => {
  if (!content) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors',
            className
          )}
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">More information</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};
