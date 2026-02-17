/**
 * DeltaQuestionItem Component
 *
 * Renders a single delta item with 6 fields:
 * - Runbook (text)
 * - Migrated (number)
 * - Owner (dropdown: IW, Client, IW/Client)
 * - Date (date picker)
 * - Notes (textarea)
 * - Complete (checkbox)
 *
 * InterWorks users can delete delta items.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DeltaQuestionItem = ({
  delta,
  onChange,
  onDelete,
  isInterWorks = false,
  readOnly = false,
}) => {
  const deltaFields = delta.metadata?.deltaFields || {};

  const handleFieldChange = (field, value) => {
    if (readOnly) return;

    const updatedDeltaFields = {
      ...deltaFields,
      [field]: value,
    };

    onChange(delta.id, {
      metadata: {
        ...delta.metadata,
        deltaFields: updatedDeltaFields,
      },
    });
  };

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-blue-600">
            {delta.questionText}
          </CardTitle>
          {isInterWorks && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(delta.id)}
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Runbook and Migrated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${delta.id}-runbook`}>Runbook</Label>
            <Input
              id={`${delta.id}-runbook`}
              type="text"
              placeholder="Enter runbook details"
              value={deltaFields.runbook || ''}
              onChange={(e) => handleFieldChange('runbook', e.target.value)}
              disabled={readOnly}
              className={cn(readOnly && 'bg-gray-50 cursor-not-allowed')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${delta.id}-migrated`}>Migrated</Label>
            <Input
              id={`${delta.id}-migrated`}
              type="number"
              placeholder="Number migrated"
              value={deltaFields.migrated || ''}
              onChange={(e) =>
                handleFieldChange('migrated', e.target.value ? parseInt(e.target.value, 10) : null)
              }
              disabled={readOnly}
              className={cn(readOnly && 'bg-gray-50 cursor-not-allowed')}
            />
          </div>
        </div>

        {/* Row 2: Owner and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${delta.id}-owner`}>Owner</Label>
            <Select
              value={deltaFields.owner || ''}
              onValueChange={(value) => handleFieldChange('owner', value)}
              disabled={readOnly}
            >
              <SelectTrigger
                id={`${delta.id}-owner`}
                className={cn(readOnly && 'bg-gray-50 cursor-not-allowed')}
              >
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IW">IW</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="IW/Client">IW/Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${delta.id}-date`}>Date</Label>
            <Input
              id={`${delta.id}-date`}
              type="date"
              value={deltaFields.date ? new Date(deltaFields.date).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFieldChange('date', e.target.value ? new Date(e.target.value) : null)}
              disabled={readOnly}
              className={cn(readOnly && 'bg-gray-50 cursor-not-allowed')}
            />
          </div>
        </div>

        {/* Row 3: Notes (full width) */}
        <div className="space-y-2">
          <Label htmlFor={`${delta.id}-notes`}>Notes</Label>
          <Textarea
            id={`${delta.id}-notes`}
            placeholder="Additional notes"
            rows={3}
            value={deltaFields.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            disabled={readOnly}
            className={cn(readOnly && 'bg-gray-50 cursor-not-allowed')}
          />
        </div>

        {/* Row 4: Complete checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${delta.id}-complete`}
            checked={deltaFields.complete || false}
            onCheckedChange={(checked) => handleFieldChange('complete', checked)}
            disabled={readOnly}
          />
          <Label
            htmlFor={`${delta.id}-complete`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Complete
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeltaQuestionItem;
