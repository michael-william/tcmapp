/**
 * ClientInfoField Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ClientInfoField } from '@/components/molecules/ClientInfoField';

describe('ClientInfoField Component', () => {
  it('renders label', () => {
    render(<ClientInfoField label="Client Name" />);
    expect(screen.getByText('Client Name')).toBeInTheDocument();
  });

  it('renders input with value', () => {
    render(<ClientInfoField label="Client Name" value="Test Client" />);
    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ClientInfoField label="Client Name" onChange={handleChange} />);

    const input = screen.getByLabelText('Client Name');
    await user.type(input, 'New Client');

    expect(handleChange).toHaveBeenCalled();
  });

  it('does not call onChange when readOnly is true', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ClientInfoField label="Client Name" value="Test" readOnly onChange={handleChange} />);

    const input = screen.getByLabelText('Client Name');
    await user.type(input, 'New');

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies readOnly styles when readOnly is true', () => {
    render(<ClientInfoField label="Client Name" readOnly />);
    const input = screen.getByLabelText('Client Name');
    expect(input).toHaveClass('bg-muted', 'cursor-not-allowed');
  });

  it('supports different input types', () => {
    render(<ClientInfoField label="Email" type="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders placeholder', () => {
    render(<ClientInfoField label="Client Name" placeholder="Enter client name" />);
    expect(screen.getByPlaceholderText('Enter client name')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ClientInfoField label="Client Name" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
