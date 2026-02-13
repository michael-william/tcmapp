/**
 * ManagementHeader Component
 *
 * Purple gradient header section for Management view containing client info.
 * Displays collapsible Client Information card (3-column grid of 6 fields) with horizontal ContactsList in header.
 *
 * Note: Progress stat cards are commented out to save vertical space.
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ClientInfoField } from '@/components/molecules/ClientInfoField';
// import { ProgressStatsSection } from '@/components/organisms/ProgressStatsSection';
import { ContactsList } from '@/components/molecules/ContactsList';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { cn } from '@/lib/utils';

export const ManagementHeader = ({
  clientInfo = {},
  progress = { completed: 0, total: 0, percentage: 0 }, // Keep prop for future use
  guestContacts = [],
  interworksContacts = [],
  className,
}) => {
  // const { completed, total, percentage } = progress; // Commented out - stat cards disabled
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      'bg-gradient-to-r from-primary to-primary-dark text-white p-6',
      className
    )}>
      {/* Client Information Card with Contacts in Header */}
      <Collapsible open={!isCollapsed} onOpenChange={() => setIsCollapsed(!isCollapsed)}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isCollapsed && "rotate-[-90deg]"
                    )}
                  />
                  <CardTitle>Client Information</CardTitle>
                </div>
                {/* Horizontal contact buttons */}
                <ContactsList
                  clientName={clientInfo?.clientName}
                  guestContacts={guestContacts}
                  interworksContacts={interworksContacts}
                  variant="horizontal"
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
