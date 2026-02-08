/**
 * SiteLimitWarningModal Component
 *
 * Warning modal shown when user exceeds site limits for their SKU type.
 * Automatically resets value to maximum allowed.
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

export const SiteLimitWarningModal = ({
  isOpen,
  onClose,
  skuType,
  maxSites,
  enteredValue,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Site Limit Exceeded</DialogTitle>
          </div>
          <DialogDescription className="space-y-2 pt-2">
            <p>
              You entered <strong>{enteredValue}</strong> sites, but the{' '}
              <strong>{skuType}</strong> SKU is limited to a maximum of{' '}
              <strong>{maxSites}</strong> {maxSites === 1 ? 'site' : 'sites'}.
            </p>
            <p className="text-sm text-muted-foreground">
              The value will be automatically adjusted to {maxSites}.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onClose}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
