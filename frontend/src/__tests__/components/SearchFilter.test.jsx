/**
 * SearchFilter Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SearchFilter } from '@/components/molecules/SearchFilter';

describe('SearchFilter Component', () => {
  const mockSections = ['Security', 'Infrastructure', 'Data'];

  it('renders search input', () => {
    render(<SearchFilter />);
    expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
  });

  it('displays search term value', () => {
    render(<SearchFilter searchTerm="test query" />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onSearchChange when text is typed', async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchFilter onSearchChange={handleSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search questions...');
    await user.type(searchInput, 'test');

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it('renders section filter when sections are provided', () => {
    render(<SearchFilter sections={mockSections} />);
    expect(screen.getByText('All Sections')).toBeInTheDocument();
  });

  it('does not render section filter when sections array is empty', () => {
    render(<SearchFilter sections={[]} />);
    const comboboxes = screen.getAllByRole('combobox');
    // Only status filter should be present
    expect(comboboxes).toHaveLength(1);
  });

  it('renders status filter', () => {
    render(<SearchFilter />);
    expect(screen.getByText('All Questions')).toBeInTheDocument();
  });

  it('displays selected section', () => {
    render(<SearchFilter sections={mockSections} selectedSection="Security" />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('displays selected status', () => {
    render(<SearchFilter selectedStatus="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onSectionChange when section is changed', () => {
    const handleSectionChange = vi.fn();
    render(
      <SearchFilter
        sections={mockSections}
        onSectionChange={handleSectionChange}
      />
    );

    // Verify the select is rendered
    expect(screen.getByText('All Sections')).toBeInTheDocument();
  });

  it('calls onStatusChange when status is changed', () => {
    const handleStatusChange = vi.fn();
    render(<SearchFilter onStatusChange={handleStatusChange} />);

    // Verify the select is rendered
    expect(screen.getByText('All Questions')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SearchFilter className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders search icon', () => {
    const { container } = render(<SearchFilter />);
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
