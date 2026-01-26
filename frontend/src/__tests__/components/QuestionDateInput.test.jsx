/**
 * QuestionDateInput Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionDateInput } from '@/components/molecules/QuestionDateInput';

describe('QuestionDateInput Component', () => {
  const mockQuestion = {
    _id: 'q1',
    questionText: 'When is the migration date?',
    helpText: 'Select the planned migration date',
  };

  it('renders question text', () => {
    render(<QuestionDateInput question={mockQuestion} />);
    expect(screen.getByText('When is the migration date?')).toBeInTheDocument();
  });

  it('renders help tooltip when helpText is provided', () => {
    render(<QuestionDateInput question={mockQuestion} />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('renders date input', () => {
    render(<QuestionDateInput question={mockQuestion} />);
    const input = screen.getByLabelText('When is the migration date?');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('displays provided value', () => {
    render(<QuestionDateInput question={mockQuestion} value="2024-01-15" />);
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
  });

  it('calls onChange when date is selected', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<QuestionDateInput question={mockQuestion} onChange={handleChange} />);

    const input = screen.getByLabelText('When is the migration date?');
    await user.type(input, '2024-01-15');

    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionDateInput question={mockQuestion} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
