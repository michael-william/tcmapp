/**
 * ClientInfoSection Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ClientInfoSection } from '@/components/organisms/ClientInfoSection';

describe('ClientInfoSection Component', () => {
  const mockClientInfo = {
    clientName: 'Acme Corp',
    region: 'US-West',
    serverVersion: '2023.1',
    serverUrl: 'https://tableau.acme.com',
    kickoffDate: '2024-05-01',
    primaryContact: 'John Doe',
    meetingCadence: 'Weekly',
    goLiveDate: '2024-06-15',
  };

  it('renders section title', () => {
    render(<ClientInfoSection />);
    expect(screen.getByText('Client Information')).toBeInTheDocument();
  });

  it('renders all 8 client info fields', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} />);

    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Region')).toBeInTheDocument();
    expect(screen.getByLabelText('Server Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Server URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Kickoff Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Primary Contact')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting Cadence')).toBeInTheDocument();
    expect(screen.getByLabelText('Go-Live Date')).toBeInTheDocument();
  });

  it('displays client info values', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} />);

    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('US-West')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://tableau.acme.com')).toBeInTheDocument();
  });

  it('calls onChange when field value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ClientInfoSection clientInfo={{}} onChange={handleChange} />);

    const clientNameInput = screen.getByLabelText('Client Name');
    await user.type(clientNameInput, 'New Client');

    expect(handleChange).toHaveBeenCalled();
  });

  it('makes fields read-only when readOnly is true', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} readOnly />);

    const clientNameInput = screen.getByLabelText('Client Name');
    expect(clientNameInput).toHaveClass('bg-muted', 'cursor-not-allowed');
  });

  it('handles empty client info', () => {
    render(<ClientInfoSection clientInfo={{}} />);

    const clientNameInput = screen.getByLabelText('Client Name');
    expect(clientNameInput).toHaveValue('');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ClientInfoSection clientInfo={{}} className="custom-class" />
    );
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('uses correct input types', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} />);

    expect(screen.getByLabelText('Kickoff Date')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Go-Live Date')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Client Name')).toHaveAttribute('type', 'text');
  });
});
