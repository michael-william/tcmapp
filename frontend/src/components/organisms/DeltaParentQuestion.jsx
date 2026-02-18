/**
 * DeltaParentQuestion Component
 *
 * Renders a delta parent question that can have multiple delta items.
 * Each section (Users, Groups, etc.) has a "+Add Delta" button at the bottom.
 */

import React from 'react';
import { Button } from '../ui/Button';
import { DeltaItem } from './DeltaItem';
import { Plus } from 'lucide-react';

export const DeltaParentQuestion = ({ question, section, onAddDelta, onUpdateDelta, onRemoveDelta }) => {
  const handleAddDelta = async () => {
    const deltaCount = question.deltas?.length || 0;
    const autoName = `${section} Delta ${deltaCount + 1}`;
    await onAddDelta(question.id, autoName);
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
      <Button
        onClick={handleAddDelta}
        variant="outline"
        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Delta Item
      </Button>

      {/* Show message if no deltas */}
      {(!question.deltas || question.deltas.length === 0) && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No items yet. Click "Add Delta Item" to get started.
        </div>
      )}
    </div>
  );
};
