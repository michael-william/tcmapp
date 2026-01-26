/**
 * MigrationCard Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { MigrationCard } from '@/components/organisms/MigrationCard';

describe('MigrationCard Component', () => {
  const mockMigration = {
    _id: '123',
    clientInfo: {
      clientName: 'Acme Corp',
      projectName: 'Q2 Migration',
      migrationDate: '2024-06-15',
    },
    questions: [
      { _id: 'q1', completed: true },
      { _id: 'q2', completed: true },
      { _id: 'q3', completed: false },
      { _id: 'q4', completed: false },
    ],
  };

  it('returns null when migration is not provided', () => {
    const { container } = render(<MigrationCard migration={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays client name', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('displays project name', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByText('Q2 Migration')).toBeInTheDocument();
  });

  it('displays fallback text when client name is missing', () => {
    const migrationNoName = { ...mockMigration, clientInfo: {} };
    render(<MigrationCard migration={migrationNoName} />);
    expect(screen.getByText('Untitled Migration')).toBeInTheDocument();
    expect(screen.getByText('No project name')).toBeInTheDocument();
  });

  it('displays completion percentage', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  it('displays progress count', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByText('2/4 questions')).toBeInTheDocument();
  });

  it('displays migration date when provided', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByText(/Migration: 6\/15\/2024/)).toBeInTheDocument();
  });

  it('does not display migration date when not provided', () => {
    const migrationNoDate = {
      ...mockMigration,
      clientInfo: { ...mockMigration.clientInfo, migrationDate: null },
    };
    render(<MigrationCard migration={migrationNoDate} />);
    expect(screen.queryByText(/Migration:/)).not.toBeInTheDocument();
  });

  it('renders View Checklist button', () => {
    render(<MigrationCard migration={mockMigration} />);
    expect(screen.getByRole('button', { name: /view checklist/i })).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', async () => {
    const handleView = vi.fn();
    const user = userEvent.setup();

    render(<MigrationCard migration={mockMigration} onView={handleView} />);

    const viewButton = screen.getByRole('button', { name: /view checklist/i });
    await user.click(viewButton);

    expect(handleView).toHaveBeenCalledTimes(1);
  });

  it('shows delete button for InterWorks users', () => {
    render(<MigrationCard migration={mockMigration} isInterWorks={true} />);
    const deleteButton = screen.getByRole('button', { name: '' });
    expect(deleteButton).toBeInTheDocument();
  });

  it('does not show delete button for client users', () => {
    render(<MigrationCard migration={mockMigration} isInterWorks={false} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // Only View button
  });

  it('calls onDelete when delete button is clicked', async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <MigrationCard migration={mockMigration} isInterWorks={true} onDelete={handleDelete} />
    );

    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1]; // Second button is delete
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('calculates 100% for fully completed migration', () => {
    const completedMigration = {
      ...mockMigration,
      questions: [
        { _id: 'q1', completed: true },
        { _id: 'q2', completed: true },
      ],
    };

    render(<MigrationCard migration={completedMigration} />);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MigrationCard migration={mockMigration} className="custom-class" />
    );
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});
