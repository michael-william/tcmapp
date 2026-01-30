import React from 'react';
import { toast } from '@/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export const ContactsModal = ({ isOpen, onClose, title, contacts }) => {
  const handleCopyEmails = async () => {
    const emails = contacts.map(c => c.email).join(', ');
    try {
      await navigator.clipboard.writeText(emails);
      toast.success('Email addresses copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy emails:', error);
      toast.error('Failed to copy email addresses');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts assigned</p>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <div key={contact._id} className="border-b pb-2 last:border-b-0">
                  <p className="font-medium">{contact.name || contact.email}</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleCopyEmails} disabled={contacts.length === 0}>
            Copy Emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
