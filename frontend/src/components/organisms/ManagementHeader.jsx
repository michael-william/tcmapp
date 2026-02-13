/**
 * ManagementHeader Component
 *
 * Purple gradient header section for Management view containing client info.
 * Displays Client Information card (3-column grid of 6 fields) with horizontal ContactsList in header.
 *
 * Note: Progress stat cards are commented out to save vertical space.
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ClientInfoField } from '@/components/molecules/ClientInfoField';
// import { ProgressStatsSection } from '@/components/organisms/ProgressStatsSection';
import { ContactsList } from '@/components/molecules/ContactsList';
import { cn } from '@/lib/utils';

export const ManagementHeader = ({
  clientInfo = {},
  progress = { completed: 0, total: 0, percentage: 0 }, // Keep prop for future use
  guestContacts = [],
  interworksContacts = [],
  className,
}) => {
  // const { completed, total, percentage } = progress; // Commented out - stat cards disabled

  return (
    <div className={cn(
      'bg-gradient-to-r from-primary to-primary-dark text-white p-6',
      className
    )}>
      {/* Client Information Card with Contacts in Header */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Client Information</CardTitle>
              {/* Horizontal contact buttons */}
              <ContactsList
                clientName={clientInfo?.clientName}
                guestContacts={guestContacts}
                interworksContacts={interworksContacts}
                variant="horizontal"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* 3-column grid with 6 fields only (no kickoffDate or primaryContact) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClientInfoField
                label="Client Name"
                value={clientInfo.clientName || ''}
                readOnly={true}
              />
              <ClientInfoField
                label="Region"
                value={clientInfo.region || ''}
                readOnly={true}
              />
              <ClientInfoField
                label="Server Version"
                value={clientInfo.serverVersion || ''}
                readOnly={true}
              />
              <ClientInfoField
                label="Server URL"
                value={clientInfo.serverUrl || ''}
                readOnly={true}
                type="url"
              />
              <ClientInfoField
                label="Meeting Cadence"
                value={clientInfo.meetingCadence || ''}
                readOnly={true}
              />
              <ClientInfoField
                label="Go-Live Date"
                value={clientInfo.goLiveDate || ''}
                readOnly={true}
                type="date"
              />
            </div>
          </CardContent>
        </Card>

      {/* Bottom Row: 4 Stat Cards - COMMENTED OUT to save vertical space */}
      {/*
      <ProgressStatsSection
        completed={completed}
        total={total}
        percentage={percentage}
      />
      */}
    </div>
  );
};
