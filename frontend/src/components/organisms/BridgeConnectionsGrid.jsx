/**
 * BridgeConnectionsGrid Component
 *
 * 2-column grid of 10 checkboxes with dates for Bridge Connections section.
 * Includes validation notes textarea at bottom.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

const BRIDGE_ITEMS = [
  { id: 'intro', label: 'Introduction to Bridge', column: 1 },
  { id: 'pooling', label: 'Configure Pooling', column: 1 },
  { id: 'workbooks', label: 'Update Bridge Workbooks', column: 1 },
  { id: 'prep-flows', label: 'Update Bridge Prep Flows', column: 1 },
  { id: 'testing', label: 'Testing & Troubleshoot if necessary', column: 1 },
  { id: 'setup', label: 'Set Up/Install Bridge (if necessary)', column: 2 },
  { id: 'connections', label: 'Test Connections', column: 2 },
  { id: 'data-sources', label: 'Update Bridge Data Sources', column: 2 },
  { id: 'virtual-connections', label: 'Update Bridge Virtual Connections', column: 2 },
  { id: 'runbook', label: 'Runbook Bridge Updates', column: 2 },
];

export const BridgeConnectionsGrid = ({
  data = {},
  onChange,
  readOnly = false,
}) => {
  const handleCheckChange = (itemId, checked) => {
    if (readOnly) return;

    const updated = {
      ...data,
      items: {
        ...(data.items || {}),
        [itemId]: {
          ...(data.items?.[itemId] || {}),
          checked,
        },
      },
    };

    onChange?.(updated);
  };

  const handleDateChange = (itemId, date) => {
    if (readOnly) return;

    const updated = {
      ...data,
      items: {
        ...(data.items || {}),
        [itemId]: {
          ...(data.items?.[itemId] || {}),
          date,
        },
      },
    };

    onChange?.(updated);
  };

  const handleNotesChange = (notes) => {
    if (readOnly) return;

    const updated = {
      ...data,
      validationNotes: notes,
    };

    onChange?.(updated);
  };

  const column1Items = BRIDGE_ITEMS.filter(item => item.column === 1);
  const column2Items = BRIDGE_ITEMS.filter(item => item.column === 2);

  const renderItem = (item) => {
    const itemData = data.items?.[item.id] || {};

    return (
      <div key={item.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`bridge-${item.id}`}
            checked={itemData.checked || false}
            onCheckedChange={(checked) => handleCheckChange(item.id, checked)}
            disabled={readOnly}
          />
          <Label
            htmlFor={`bridge-${item.id}`}
            className="text-sm font-medium cursor-pointer"
          >
            {item.label}
          </Label>
        </div>
        <Input
          type="date"
          value={itemData.date ? new Date(itemData.date).toISOString().split('T')[0] : ''}
          onChange={(e) => handleDateChange(item.id, e.target.value ? new Date(e.target.value) : null)}
          disabled={readOnly}
          className={cn('h-9 text-sm', readOnly && 'bg-gray-100 cursor-not-allowed')}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bridge Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1 */}
          <div className="space-y-4">
            {column1Items.map(renderItem)}
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {column2Items.map(renderItem)}
          </div>
        </div>

        {/* Validation notes */}
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="bridge-validation-notes">
            Bridge Connections Validation notes
          </Label>
          <Textarea
            id="bridge-validation-notes"
            placeholder="Enter validation notes..."
            rows={4}
            value={data.validationNotes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={readOnly}
            className={cn(readOnly && 'bg-gray-100 cursor-not-allowed')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BridgeConnectionsGrid;
