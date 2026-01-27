import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export const UnsavedChangesModal = ({ isOpen, onCancel, onDiscard, onSave, saving }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <DialogTitle>Unsaved Changes</DialogTitle>
          </div>
          <DialogDescription>
            You have unsaved changes. Would you like to save them before leaving?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={saving}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Discard Changes
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
