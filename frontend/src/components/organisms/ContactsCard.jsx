import React, { useState } from 'react';
import { Users, Mail, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { ContactsModal } from '@/components/organisms/ContactsModal';

export const ContactsCard = ({ contacts, clientName }) => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isInterWorksModalOpen, setIsInterWorksModalOpen] = useState(false);

  const guestContacts = contacts?.guest || [];
  const interworksContacts = contacts?.interworks || [];
  const totalContacts = guestContacts.length + interworksContacts.length;

  const handleCopyAllEmails = async () => {
    const allEmails = [
      ...guestContacts.map(c => c.email),
      ...interworksContacts.map(c => c.email)
    ];

    if (allEmails.length === 0) {
      toast.error('No contact emails to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(allEmails.join(', '));
      toast.success('All contact emails copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy emails:', error);
      toast.error('Failed to copy email addresses');
    }
  };

  const handleDownloadPrereqs = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = '/TCM_Prereqs.pdf';
    link.download = 'TCM_Prerequisites.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/10 border-white/20 h-full flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Contacts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Contact Sections */}
          <div className="space-y-3 flex-1">
            {/* Client Contacts */}
            <div>
              <button
                onClick={() => setIsClientModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <span className="text-sm font-medium">
                  {clientName || 'Client'} Contacts
                </span>
                <Badge variant="outline" className="ml-2">
                  {guestContacts.length}
                </Badge>
              </button>
            </div>

            {/* InterWorks Team */}
            <div>
              <button
                onClick={() => setIsInterWorksModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <span className="text-sm font-medium">InterWorks Team</span>
                <Badge variant="outline" className="ml-2">
                  {interworksContacts.length}
                </Badge>
              </button>
            </div>

            {/* Empty State */}
            {totalContacts === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No contacts assigned</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-none pt-2 border-t border-white/10 space-y-2">
            {/* Download TCM Prereqs Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPrereqs}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download TCM Prereqs.
            </Button>

            {/* Copy All Emails Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleCopyAllEmails}
              disabled={totalContacts === 0}
              className="w-full gap-2"
            >
              <Mail className="h-4 w-4" />
              Copy All Emails
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ContactsModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={`${clientName || 'Client'} Contacts`}
        contacts={guestContacts}
      />
      <ContactsModal
        isOpen={isInterWorksModalOpen}
        onClose={() => setIsInterWorksModalOpen(false)}
        title="InterWorks Team"
        contacts={interworksContacts}
      />
    </>
  );
};
