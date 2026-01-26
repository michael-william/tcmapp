/**
 * ExportSection Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ExportSection } from '@/components/organisms/ExportSection';

describe('ExportSection Component', () => {
  const mockMigration = {
    _id: '123',
    clientInfo: { clientName: 'Test Client' },
    questions: [],
  };

  it('renders section title', () => {
    render(<ExportSection migration={mockMigration} />);
    expect(screen.getByText('Export Checklist')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ExportSection migration={mockMigration} />);
    expect(
      screen.getByText(/Export the complete migration checklist as a PDF document/)
    ).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(<ExportSection migration={mockMigration} />);
    expect(screen.getByRole('button', { name: /export to pdf/i })).toBeInTheDocument();
  });

  it('calls onExport when button is clicked', async () => {
    const handleExport = vi.fn().mockResolvedValue();
    const user = userEvent.setup();

    render(<ExportSection migration={mockMigration} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export to pdf/i });
    await user.click(exportButton);

    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during export', async () => {
    const handleExport = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();

    render(<ExportSection migration={mockMigration} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export to pdf/i });
    await user.click(exportButton);

    expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
  });

  it('disables button when migration is not provided', () => {
    render(<ExportSection migration={null} />);
    const exportButton = screen.getByRole('button', { name: /export to pdf/i });
    expect(exportButton).toBeDisabled();
  });

  it('handles export errors gracefully', async () => {
    const handleExport = vi.fn().mockRejectedValue(new Error('Export failed'));
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ExportSection migration={mockMigration} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export to pdf/i });
    await user.click(exportButton);

    // Wait for error handling
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExportSection migration={mockMigration} className="custom-class" />
    );
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('shows download icon', () => {
    const { container } = render(<ExportSection migration={mockMigration} />);
    const downloadIcon = container.querySelector('svg');
    expect(downloadIcon).toBeInTheDocument();
  });
});
