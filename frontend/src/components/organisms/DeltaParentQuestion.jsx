/**
 * DeltaParentQuestion Component
 *
 * Renders a delta parent question that can have multiple delta items.
 * Each section (Users, Groups, etc.) has a "+Add Delta" button at the bottom.
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DeltaItem } from './DeltaItem';
import { Plus, X } from 'lucide-react';

export const DeltaParentQuestion = ({ question, onAddDelta, onUpdateDelta, onRemoveDelta }) => {
  const [isAddingDelta, setIsAddingDelta] = useState(false);
  const [newDeltaName, setNewDeltaName] = useState('');

  const handleAddDelta = async () => {
    if (!newDeltaName.trim()) {
      return;
    }

    const success = await onAddDelta(question.id, newDeltaName);
    if (success) {
      setNewDeltaName('');
      setIsAddingDelta(false);
    }
  };

  const handleCancel = () => {
    setNewDeltaName('');
    setIsAddingDelta(false);
  };

  return (
    <div className="space-y-4">
      {/* Render existing deltas */}
      {question.deltas?.map((delta) => (
        <DeltaItem
          key={delta.id}
          delta={delta}
          parentId={question.id}
          onUpdate={onUpdateDelta}
          onRemove={onRemoveDelta}
        />
      ))}

      {/* Add Delta UI */}
      {isAddingDelta ? (
        <div className="flex gap-2 items-end border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <Input
              value={newDeltaName}
              onChange={(e) => setNewDeltaName(e.target.value)}
              placeholder="Enter name (e.g., 'John Smith', 'Finance Group')"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddDelta();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              autoFocus
            />
          </div>
          <Button onClick={handleAddDelta} size="sm" disabled={!newDeltaName.trim()}>
            Add
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsAddingDelta(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Delta Item
        </Button>
      )}

      {/* Show message if no deltas */}
      {(!question.deltas || question.deltas.length === 0) && !isAddingDelta && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No items yet. Click "Add Delta Item" to get started.
        </div>
      )}
    </div>
  );
};
