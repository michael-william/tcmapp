import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
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

  it('renders with client info, progress stats, and contacts', () => {
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

    // Check for stat cards
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();

    // Check for contacts
    expect(screen.getByText('Acme Corp Contacts')).toBeInTheDocument();
    expect(screen.getByText('InterWorks Team')).toBeInTheDocument();
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

    // Should still render with default values
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    // Look for "0" in stat cards - there should be multiple
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts.length).toBeGreaterThan(0);
  });

  it('calculates remaining tasks correctly', () => {
    render(
      <ManagementHeader
        progress={{ completed: 10, total: 50, percentage: 20 }}
      />
    );

    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

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
});
