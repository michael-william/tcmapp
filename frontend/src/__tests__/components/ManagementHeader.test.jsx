import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ManagementHeader } from '@/components/organisms/ManagementHeader';

describe('ManagementHeader', () => {
  const mockClientInfo = {
    clientName: 'Acme Corp',
    region: 'North America',
    serverVersion: '2023.1',
    serverUrl: 'https://tableau.acme.com',
    kickoffDate: '2024-01-15',
    primaryContact: 'John Doe',
    meetingCadence: 'Weekly',
    goLiveDate: '2024-03-01',
  };

  const mockProgress = {
    completed: 25,
    total: 62,
    percentage: 40,
  };

  const mockGuestContacts = [
    { name: 'Jane Smith', email: 'jane@acme.com', role: 'Admin' },
  ];

  const mockInterworksContacts = [
    { name: 'Bob Johnson', email: 'bob@interworks.com', role: 'Consultant' },
  ];

  it('renders with client info and contacts', () => {
    render(
      <ManagementHeader
        clientInfo={mockClientInfo}
        progress={mockProgress}
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    // Check for Client Information card title
    expect(screen.getByText('Client Information')).toBeInTheDocument();

    // Check for contacts
    expect(screen.getByText('Acme Corp Contacts')).toBeInTheDocument();
    expect(screen.getByText('InterWorks Team')).toBeInTheDocument();

    // NOTE: Stat cards are commented out to save vertical space
    // They are not expected to be rendered
  });

  it('shows purple gradient background', () => {
    const { container } = render(
      <ManagementHeader
        clientInfo={mockClientInfo}
        progress={mockProgress}
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    const gradientDiv = container.querySelector('.bg-gradient-to-r.from-primary.to-primary-dark');
    expect(gradientDiv).toBeInTheDocument();
  });

  it('displays only 6 client info fields in 3-column grid', () => {
    render(
      <ManagementHeader
        clientInfo={mockClientInfo}
        progress={mockProgress}
      />
    );

    // Check for the 6 fields that SHOULD be displayed
    expect(screen.getByText('Client Name')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Server Version')).toBeInTheDocument();
    expect(screen.getByText('Server URL')).toBeInTheDocument();
    expect(screen.getByText('Meeting Cadence')).toBeInTheDocument();
    expect(screen.getByText('Go-Live Date')).toBeInTheDocument();

    // Check for input values
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('North America')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023.1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://tableau.acme.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Weekly')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-01')).toBeInTheDocument();

    // Verify that kickoffDate and primaryContact are NOT displayed
    expect(screen.queryByText('Kickoff Date')).not.toBeInTheDocument();
    expect(screen.queryByText('Primary Contact')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('2024-01-15')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<ManagementHeader />);

    // Should still render the Client Information card
    expect(screen.getByText('Client Information')).toBeInTheDocument();
  });

  // NOTE: Test removed - stat cards are commented out to save vertical space
  // it('calculates remaining tasks correctly', () => { ... }

  it('displays contacts horizontally in card header', () => {
    render(
      <ManagementHeader
        clientInfo={mockClientInfo}
        progress={mockProgress}
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    // Check that contacts are in the same row as "Client Information"
    const cardHeader = screen.getByText('Client Information').closest('div[class*="flex"]');
    expect(cardHeader).toBeInTheDocument();

    // Both contact buttons should be present
    expect(screen.getByText('Acme Corp Contacts')).toBeInTheDocument();
    expect(screen.getByText('InterWorks Team')).toBeInTheDocument();

    // Contact buttons should have aria-labels for accessibility
    expect(screen.getByLabelText('View client contacts')).toBeInTheDocument();
    expect(screen.getByLabelText('View InterWorks team contacts')).toBeInTheDocument();
  });

  it('renders with chevron icon pointing down when expanded', () => {
    render(<ManagementHeader clientInfo={mockClientInfo} />);

    // Check for ChevronDown icon (should be present)
    const chevron = document.querySelector('svg');
    expect(chevron).toBeInTheDocument();

    // Should NOT have rotate class when expanded
    expect(chevron).not.toHaveClass('rotate-[-90deg]');
  });

  it('toggles collapsed state when clicking header', async () => {
    const user = userEvent.setup();
    render(<ManagementHeader clientInfo={mockClientInfo} />);

    // Should start expanded - fields visible
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('North America')).toBeInTheDocument();

    // Get the header trigger (the CardHeader with cursor-pointer class)
    const header = screen.getByText('Client Information').closest('div[class*="cursor-pointer"]');
    expect(header).toBeInTheDocument();

    // Click header to collapse
    await user.click(header);

    // Wait for collapse animation and check that fields are hidden
    await waitFor(() => {
      // After collapse, content should be hidden (Radix Collapsible sets display:none or height:0)
      const clientNameField = screen.queryByDisplayValue('Acme Corp');
      // The field might still be in the DOM but not visible
      if (clientNameField) {
        expect(clientNameField).not.toBeVisible();
      } else {
        // Or it might be removed from the DOM entirely
        expect(clientNameField).not.toBeInTheDocument();
      }
    });

    // Check chevron has rotated
    const chevron = document.querySelector('svg');
    expect(chevron).toHaveClass('rotate-[-90deg]');
  });

  it('expands again when clicking collapsed header', async () => {
    const user = userEvent.setup();
    render(<ManagementHeader clientInfo={mockClientInfo} />);

    // Get header
    const header = screen.getByText('Client Information').closest('div[class*="cursor-pointer"]');

    // Collapse
    await user.click(header);
    await waitFor(() => {
      const chevron = document.querySelector('svg');
      expect(chevron).toHaveClass('rotate-[-90deg]');
    });

    // Expand again
    await user.click(header);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Corp')).toBeVisible();
    });

    // Chevron should point down again
    const chevron = document.querySelector('svg');
    expect(chevron).not.toHaveClass('rotate-[-90deg]');
  });

  it('keeps contacts visible when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <ManagementHeader
        clientInfo={mockClientInfo}
        guestContacts={mockGuestContacts}
        interworksContacts={mockInterworksContacts}
      />
    );

    // Get header and collapse
    const header = screen.getByText('Client Information').closest('div[class*="cursor-pointer"]');
    await user.click(header);

    // Contacts should still be visible
    expect(screen.getByText('Acme Corp Contacts')).toBeInTheDocument();
    expect(screen.getByText('InterWorks Team')).toBeInTheDocument();
  });

  it('has cursor-pointer and select-none on header', () => {
    render(<ManagementHeader clientInfo={mockClientInfo} />);

    const header = screen.getByText('Client Information').closest('div[class*="cursor-pointer"]');
    expect(header).toHaveClass('cursor-pointer');
    expect(header).toHaveClass('select-none');
  });
});
