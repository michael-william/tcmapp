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
    projectName: 'Migration 2024',
    contactName: 'John Doe',
    contactEmail: 'john@acme.com',
    currentTableauVersion: '2023.1',
    targetTableauVersion: '2024.1',
    migrationDate: '2024-06-15',
    environment: 'Production',
  };

  it('renders section title', () => {
    render(<ClientInfoSection />);
    expect(screen.getByText('Client Information')).toBeInTheDocument();
  });

  it('renders all 8 client info fields', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} />);

    expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Tableau Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Tableau Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Migration Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Environment')).toBeInTheDocument();
  });

  it('displays client info values', () => {
    render(<ClientInfoSection clientInfo={mockClientInfo} />);

    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Migration 2024')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@acme.com')).toBeInTheDocument();
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

    expect(screen.getByLabelText('Contact Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Migration Date')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Client Name')).toHaveAttribute('type', 'text');
  });
});
