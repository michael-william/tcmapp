/**
 * ContentValidationTable Component
 *
 * 3-column table for content validation tracking.
 * Columns: Migrated Content, Runbook, Cloud
 * 20+ rows of content types from PDF.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { cn } from '@/lib/utils';

const CONTENT_TYPES = [
  'Users',
  'Site Admin Creators (Server Admins)',
  'Site Admin Explorers',
  'Creators',
  'Explorers',
  'Viewers',
  'Groups',
  'Projects (excluding default/samples)',
  'Workbooks',
  'Published Data Sources',
  'Metrics',
  'Ask Data Lenses',
  'Flows',
  'Data Roles',
  'Virtual Connections',
  'Custom Views',
  'Subscriptions',
  'Data Driven Alerts',
  'Collections',
  'View Accelerations',
  'Extractions',
  'Webhooks',
  'Favourites',
  'Tags',
];

export const ContentValidationTable = ({
  data = {},
  onChange,
  readOnly = false,
}) => {
  const handleChange = (contentType, field, value) => {
    if (readOnly) return;

    const updated = {
      ...data,
      [contentType]: {
        ...(data[contentType] || {}),
        [field]: value,
      },
    };

    onChange?.(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Content Validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 bg-teal-600 text-white font-semibold">
                  Migrated Content
                </TableHead>
                <TableHead className="w-1/3 bg-teal-600 text-white font-semibold">
                  Runbook
                </TableHead>
                <TableHead className="w-1/3 bg-teal-600 text-white font-semibold">
                  Cloud
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONTENT_TYPES.map((contentType, index) => {
                const rowData = data[contentType] || {};

                return (
                  <TableRow key={contentType} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">{contentType}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Enter runbook value"
                        value={rowData.runbook || ''}
                        onChange={(e) => handleChange(contentType, 'runbook', e.target.value)}
                        disabled={readOnly}
                        className={cn(
                          'h-9 text-sm',
                          readOnly && 'bg-gray-100 cursor-not-allowed'
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Enter cloud value"
                        value={rowData.cloud || ''}
                        onChange={(e) => handleChange(contentType, 'cloud', e.target.value)}
                        disabled={readOnly}
                        className={cn(
                          'h-9 text-sm',
                          readOnly && 'bg-gray-100 cursor-not-allowed'
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentValidationTable;
