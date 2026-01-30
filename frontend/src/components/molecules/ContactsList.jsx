import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { ContactsModal } from '@/components/organisms/ContactsModal';

export const ContactsList = ({ clientName, guestContacts, interworksContacts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const modalTitle = modalType === 'client'
    ? `${clientName || 'Client'} Contacts`
    : 'InterWorks Team';

  const modalContacts = modalType === 'client'
    ? guestContacts
    : interworksContacts;

  return (
    <>
      <div className="flex flex-col gap-1 items-end">
        <button
          onClick={() => openModal('client')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="View client contacts"
        >
          <span className="text-sm text-muted-foreground">
            {clientName || 'Client'} Contacts
          </span>
          <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </button>
        <button
          onClick={() => openModal('interworks')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="View InterWorks team contacts"
        >
          <span className="text-sm text-muted-foreground">InterWorks Team</span>
          <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </button>
      </div>

      <ContactsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        contacts={modalContacts || []}
      />
    </>
  );
};
