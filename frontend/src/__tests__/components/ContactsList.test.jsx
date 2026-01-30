import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { ContactsList } from '@/components/molecules/ContactsList';
import userEvent from '@testing-library/user-event';

describe('ContactsList', () => {
  const mockGuestContacts = [
    { _id: 'guest1', email: 'guest1@client.com', name: 'Guest One', role: 'guest' },
    { _id: 'guest2', email: 'guest2@client.com', name: 'Guest Two', role: 'guest' },
  ];

  const mockInterworksContacts = [
    { _id: 'iw1', email: 'consultant1@interworks.com', name: 'IW Consultant 1', role: 'interworks' },
    { _id: 'iw2', email: 'consultant2@interworks.com', name: 'IW Consultant 2', role: 'interworks' },
  ];

  it('renders contact buttons with client name', () => {
    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    expect(screen.getByText('Acme Corp Contacts')).toBeInTheDocument();
    expect(screen.getByText('InterWorks Team')).toBeInTheDocument();
  });

  it('renders with default "Client" text when no clientName provided', () => {
    render(
      <ContactsList
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    expect(screen.getByText('Client Contacts')).toBeInTheDocument();
  });

  it('opens client contacts modal when client button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    const clientButton = screen.getByLabelText('View client contacts');
    await user.click(clientButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Guest One')).toBeInTheDocument();
      expect(screen.getByText('guest1@client.com')).toBeInTheDocument();
    });
  });

  it('opens InterWorks team modal when InterWorks button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    const interworksButton = screen.getByLabelText('View InterWorks team contacts');
    await user.click(interworksButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('IW Consultant 1')).toBeInTheDocument();
      expect(screen.getByText('consultant1@interworks.com')).toBeInTheDocument();
    });
  });

  it('closes modal when close button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    // Open modal
    const clientButton = screen.getByLabelText('View client contacts');
    await user.click(clientButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close modal - get the first Close button (in footer, not X button)
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    await user.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('copies emails to clipboard when copy button clicked', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });

    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    // Open modal
    const clientButton = screen.getByLabelText('View client contacts');
    await user.click(clientButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click copy button
    const copyButton = screen.getByText('Copy Emails');
    await user.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('guest1@client.com, guest2@client.com');
    });
  });

  it('handles empty contacts array', async () => {
    const user = userEvent.setup();

    render(
      <ContactsList
        clientName="Acme Corp"
        guestContacts={[]}
        interworksContacts={[]}
      />
    );

    // Open modal
    const clientButton = screen.getByLabelText('View client contacts');
    await user.click(clientButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('No contacts assigned')).toBeInTheDocument();
    });

    // Copy button should be disabled
    const copyButton = screen.getByText('Copy Emails');
    expect(copyButton).toBeDisabled();
  });
});
