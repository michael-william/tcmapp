/**
 * ProgressSection Component
 *
 * Displays overall progress with stats and progress bar.
 */

import React from 'react';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { ContactsList } from '@/components/molecules/ContactsList';
import { cn } from '@/lib/utils';

export const ProgressSection = ({
  completed = 0,
  total = 0,
  percentage = 0,
  clientName,
  guestContacts,
  interworksContacts,
  className
}) => {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-lg border-b px-4 py-4 sticky top-[73px] z-30',
        className
      )}
    >
      <div className="container mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          {/* Left: Progress stats */}
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-lg font-semibold text-foreground">
              Overall Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              {completed} of {total} questions completed
            </p>
          </div>

          {/* Right: Contacts */}
          {clientName && (
            <ContactsList
              clientName={clientName}
              guestContacts={guestContacts}
              interworksContacts={interworksContacts}
            />
          )}
        </div>

        {/* Full width progress bar */}
        <ProgressBar value={percentage} showPercentage={true} />
      </div>
    </div>
  );
};
