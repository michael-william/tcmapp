/**
 * ClientInfoSection Component
 *
 * Grid of client information fields (8 fields in 2-column responsive grid).
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ClientInfoField } from '@/components/molecules/ClientInfoField';
import { cn } from '@/lib/utils';

export const ClientInfoSection = ({ clientInfo = {}, onChange, readOnly = false, className }) => {
  const fields = [
    { key: 'clientName', label: 'Client Name', type: 'text' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'serverVersion', label: 'Server Version', type: 'text' },
    { key: 'serverUrl', label: 'Server URL', type: 'text' },
    { key: 'kickoffDate', label: 'Kickoff Date', type: 'date' },
    { key: 'primaryContact', label: 'Primary Contact', type: 'text' },
    { key: 'meetingCadence', label: 'Meeting Cadence', type: 'text' },
    { key: 'goLiveDate', label: 'Go-Live Date', type: 'date' },
  ];

  const handleFieldChange = (key, value) => {
    onChange?.(key, value);
  };

  return (
    <Card className={cn('animate-fadeIn', className)}>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <ClientInfoField
              key={field.key}
              label={field.label}
              type={field.type}
              value={clientInfo[field.key] || ''}
              onChange={(value) => handleFieldChange(field.key, value)}
              readOnly={readOnly}
              placeholder={readOnly ? 'Not specified' : `Enter ${field.label.toLowerCase()}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
