/**
 * BridgeConditionalModal Component
 *
 * Confirmation modal shown when user answers q45 "No" and has existing answers in dependent questions.
 * Warns about clearing existing answers and requires confirmation before proceeding.
 */

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

export const BridgeConditionalModal = ({
  isOpen,
  onClose,
  onConfirm,
  hasExistingAnswers,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Bridge Not Required</DialogTitle>
          </div>
          <DialogDescription className="space-y-2 pt-2">
            {hasExistingAnswers ? (
              <>
                <p>
                  Changing this answer will mark all other Bridge questions as <strong>N/A</strong> and clear any existing answers.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can change back to 'Yes' later, but the cleared answers cannot be recovered.
                </p>
              </>
            ) : (
              <p>
                Changing this answer will mark all other Bridge questions as <strong>N/A</strong>.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
