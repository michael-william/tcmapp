/**
 * AnswerChangeWarningModal Component
 *
 * Warns users when they're about to change a previously answered question.
 * Shows when the question was last answered and by whom.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export const AnswerChangeWarningModal = ({
  isOpen,
  onCancel,
  onConfirm,
  questionText,
  updatedAt,
  updatedBy,
}) => {
  const formattedDate = updatedAt
    ? format(new Date(updatedAt), 'MMM dd, yyyy \'at\' hh:mm a')
    : 'an earlier time';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>Change Answer?</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            This question was previously answered on <strong>{formattedDate}</strong>
            {updatedBy && ` by ${updatedBy}`}.
            <br />
            <br />
            Changing the answer will update the timestamp. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={onConfirm}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
