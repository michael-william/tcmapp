/**
 * ContentTestingList Component
 *
 * Simple checkbox list with 10 items and date pickers for Content Testing section.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const TESTING_ITEMS = [
  { id: 'user-access', label: 'User Access' },
  { id: 'workbook-access', label: 'Workbook Access' },
  { id: 'data-connectivity-live', label: 'Data Connectivity - Live Connections' },
  { id: 'data-connectivity-extracts', label: 'Data Connectivity - Extract Refreshes' },
  { id: 'dashboard-functionality', label: 'Dashboard functionality' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'rls', label: 'RLS', hasOwner: true, ownerOptions: ['Client'] },
  { id: 'url-actions', label: 'URL Actions', hasOwner: true, ownerOptions: ['Client'] },
  { id: 'subscription', label: 'Subscription' },
];

export const ContentTestingList = ({
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

  const handleOwnerChange = (itemId, owner) => {
    if (readOnly) return;

    const updated = {
      ...data,
      items: {
        ...(data.items || {}),
        [itemId]: {
          ...(data.items?.[itemId] || {}),
          owner,
        },
      },
    };

    onChange?.(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Content Testing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TESTING_ITEMS.map((item) => {
            const itemData = data.items?.[item.id] || {};

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center"
              >
                {/* Checkbox and Label */}
                <div className="md:col-span-5 flex items-center space-x-2">
                  <Checkbox
                    id={`testing-${item.id}`}
                    checked={itemData.checked || false}
                    onCheckedChange={(checked) => handleCheckChange(item.id, checked)}
                    disabled={readOnly}
                  />
                  <Label
                    htmlFor={`testing-${item.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>

                {/* Date Input */}
                <div className="md:col-span-4">
                  <Input
                    type="date"
                    value={itemData.date ? new Date(itemData.date).toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      handleDateChange(item.id, e.target.value ? new Date(e.target.value) : null)
                    }
                    disabled={readOnly}
                    className={cn('h-9 text-sm', readOnly && 'bg-gray-100 cursor-not-allowed')}
                  />
                </div>

                {/* Owner Dropdown (if applicable) */}
                {item.hasOwner ? (
                  <div className="md:col-span-3">
                    <Select
                      value={itemData.owner || ''}
                      onValueChange={(value) => handleOwnerChange(item.id, value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger
                        className={cn('h-9 text-sm', readOnly && 'bg-gray-100 cursor-not-allowed')}
                      >
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.ownerOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="md:col-span-3" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTestingList;
