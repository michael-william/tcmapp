/**
 * QuestionCheckbox Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionCheckbox } from '@/components/molecules/QuestionCheckbox';

describe('QuestionCheckbox Component', () => {
  const mockQuestion = {
    _id: 'q1',
    questionText: 'Is this a test question?',
    helpText: 'This is help text',
  };

  it('renders question text', () => {
    render(<QuestionCheckbox question={mockQuestion} />);
    expect(screen.getByText('Is this a test question?')).toBeInTheDocument();
  });

  it('renders help tooltip when helpText is provided', () => {
    render(<QuestionCheckbox question={mockQuestion} />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('does not render help tooltip when helpText is not provided', () => {
    const questionNoHelp = { ...mockQuestion, helpText: '' };
    render(<QuestionCheckbox question={questionNoHelp} />);
    expect(screen.queryByRole('button', { name: 'More information' })).not.toBeInTheDocument();
  });

  it('renders checkbox in unchecked state by default', () => {
    render(<QuestionCheckbox question={mockQuestion} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('renders checkbox in checked state when checked prop is true', () => {
    render(<QuestionCheckbox question={mockQuestion} checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('calls onCheckedChange when checkbox is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<QuestionCheckbox question={mockQuestion} onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('displays timestamp when checked and timestamp is provided', () => {
    const timestamp = new Date('2024-01-15').toISOString();
    render(
      <QuestionCheckbox question={mockQuestion} checked={true} timestamp={timestamp} />
    );

    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
  });

  it('does not display timestamp when not checked', () => {
    const timestamp = new Date('2024-01-15').toISOString();
    render(
      <QuestionCheckbox question={mockQuestion} checked={false} timestamp={timestamp} />
    );

    expect(screen.queryByText(/Completed:/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionCheckbox question={mockQuestion} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
