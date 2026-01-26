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
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'contactName', label: 'Contact Name', type: 'text' },
    { key: 'contactEmail', label: 'Contact Email', type: 'email' },
    { key: 'currentTableauVersion', label: 'Current Tableau Version', type: 'text' },
    { key: 'targetTableauVersion', label: 'Target Tableau Version', type: 'text' },
    { key: 'migrationDate', label: 'Migration Date', type: 'date' },
    { key: 'environment', label: 'Environment', type: 'text' },
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
