/**
 * DeltaItem Component
 *
 * Renders a single delta item with editable fields:
 * - Runbook URL
 * - Migrated (Yes/No)
 * - Owner (dropdown)
 * - Date
 * - Notes
 * - Complete (checkbox)
 *
 * Manual save pattern - user must click "Save Changes" button.
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { Trash2, Save } from 'lucide-react';

export const DeltaItem = ({ delta, parentId, onUpdate, onRemove }) => {
  const [fields, setFields] = useState(delta.fields || {});
  const [name, setName] = useState(delta.name || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNameChange = (value) => {
    setName(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate(parentId, delta.id, { name, fields });
    setIsSaving(false);

    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  const handleRemove = async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to delete this item?'
      );
      if (!confirmed) return;
    }

    await onRemove(parentId, delta.id);
  };

  return (
    <Card className={hasUnsavedChanges ? 'border-orange-300 bg-orange-50/50' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <Label htmlFor={`name-${delta.id}`} className="text-sm font-medium">
              Item Name
            </Label>
            <Input
              id={`name-${delta.id}`}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter name"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Runbook URL */}
        <div>
          <Label htmlFor={`runbook-${delta.id}`}>Runbook URL</Label>
          <Input
            id={`runbook-${delta.id}`}
            type="url"
            value={fields.runbook || ''}
            onChange={(e) => handleFieldChange('runbook', e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Migrated Status */}
        <div>
          <Label htmlFor={`migrated-${delta.id}`}>Migrated</Label>
          <Select
            value={fields.migrated === null ? '' : fields.migrated.toString()}
            onValueChange={(val) => handleFieldChange('migrated', val === '' ? null : val === 'true')}
          >
            <SelectTrigger id={`migrated-${delta.id}`}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not Set</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Owner */}
        <div>
          <Label htmlFor={`owner-${delta.id}`}>Owner</Label>
          <Select
            value={fields.owner || ''}
            onValueChange={(val) => handleFieldChange('owner', val)}
          >
            <SelectTrigger id={`owner-${delta.id}`}>
              <SelectValue placeholder="Select owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not Assigned</SelectItem>
              <SelectItem value="IW">IW</SelectItem>
              <SelectItem value="Client">Client</SelectItem>
              <SelectItem value="IW/Client">IW/Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor={`date-${delta.id}`}>Date</Label>
          <Input
            id={`date-${delta.id}`}
            type="date"
            value={fields.date ? new Date(fields.date).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange('date', e.target.value || null)}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor={`notes-${delta.id}`}>Notes</Label>
          <Textarea
            id={`notes-${delta.id}`}
            value={fields.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Enter notes..."
            rows={3}
          />
        </div>

        {/* Complete Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`complete-${delta.id}`}
            checked={fields.complete || false}
            onCheckedChange={(checked) => handleFieldChange('complete', checked)}
          />
          <Label
            htmlFor={`complete-${delta.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mark as Complete
          </Label>
        </div>

        {/* Save Button */}
        {hasUnsavedChanges && (
          <div className="pt-2 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Metadata (small text at bottom) */}
        {delta.updatedAt && (
          <div className="text-xs text-gray-500 pt-2">
            Last updated: {new Date(delta.updatedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
