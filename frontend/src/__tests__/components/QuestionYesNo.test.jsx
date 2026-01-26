/**
 * QuestionYesNo Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionYesNo } from '@/components/molecules/QuestionYesNo';

describe('QuestionYesNo Component', () => {
  const mockQuestion = {
    _id: 'q1',
    questionText: 'Do you have a backup plan?',
    helpText: 'Ensure you have proper backups',
  };

  it('renders question text', () => {
    render(<QuestionYesNo question={mockQuestion} />);
    expect(screen.getByText('Do you have a backup plan?')).toBeInTheDocument();
  });

  it('renders help tooltip when helpText is provided', () => {
    render(<QuestionYesNo question={mockQuestion} />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('renders Yes and No radio options', () => {
    render(<QuestionYesNo question={mockQuestion} />);
    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<QuestionYesNo question={mockQuestion} onChange={handleChange} />);

    const yesOption = screen.getByLabelText('Yes');
    await user.click(yesOption);

    expect(handleChange).toHaveBeenCalledWith('Yes');
  });

  it('shows conditional date input when Yes is selected and showConditionalDate is true', () => {
    render(
      <QuestionYesNo
        question={mockQuestion}
        value="Yes"
        showConditionalDate={true}
      />
    );

    expect(screen.getByLabelText('When?')).toBeInTheDocument();
    expect(screen.getByLabelText('When?')).toHaveAttribute('type', 'date');
  });

  it('does not show conditional date input when No is selected', () => {
    render(
      <QuestionYesNo
        question={mockQuestion}
        value="No"
        showConditionalDate={true}
      />
    );

    expect(screen.queryByLabelText('When?')).not.toBeInTheDocument();
  });

  it('shows conditional text input when Yes is selected and showConditionalInput is true', () => {
    render(
      <QuestionYesNo
        question={mockQuestion}
        value="Yes"
        showConditionalInput={true}
      />
    );

    expect(screen.getByLabelText('Please specify:')).toBeInTheDocument();
  });

  it('calls onConditionalDateChange when date is entered', async () => {
    const handleDateChange = vi.fn();
    const user = userEvent.setup();

    render(
      <QuestionYesNo
        question={mockQuestion}
        value="Yes"
        showConditionalDate={true}
        onConditionalDateChange={handleDateChange}
      />
    );

    const dateInput = screen.getByLabelText('When?');
    await user.type(dateInput, '2024-01-15');

    expect(handleDateChange).toHaveBeenCalled();
  });

  it('calls onConditionalInputChange when text is entered', async () => {
    const handleInputChange = vi.fn();
    const user = userEvent.setup();

    render(
      <QuestionYesNo
        question={mockQuestion}
        value="Yes"
        showConditionalInput={true}
        onConditionalInputChange={handleInputChange}
      />
    );

    const textInput = screen.getByLabelText('Please specify:');
    await user.type(textInput, 'Details');

    expect(handleInputChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionYesNo question={mockQuestion} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
