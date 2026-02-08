/**
 * SkuRequiredModal Component
 *
 * Modal shown when user tries to enter sites without selecting SKU type first.
 * Prompts them to select Q33 (SKU type) before entering Q34 (number of sites).
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
import { Info } from 'lucide-react';

export const SkuRequiredModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <DialogTitle>SKU Type Required</DialogTitle>
          </div>
          <DialogDescription className="space-y-2 pt-2">
            <p>
              Please select your <strong>Tableau Cloud SKU type</strong> first.
            </p>
            <p className="text-sm text-muted-foreground">
              The number of allowed sites depends on your SKU selection
              (Standard, Enterprise, or Tableau +).
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onClose}>
            OK, I'll select it now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
