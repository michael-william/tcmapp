/**
 * QuestionTextInput Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionTextInput } from '@/components/molecules/QuestionTextInput';

describe('QuestionTextInput Component', () => {
  const mockQuestion = {
    _id: 'q1',
    questionText: 'Please describe your answer',
    helpText: 'Provide detailed information',
  };

  it('renders question text', () => {
    render(<QuestionTextInput question={mockQuestion} />);
    expect(screen.getByText('Please describe your answer')).toBeInTheDocument();
  });

  it('renders help tooltip when helpText is provided', () => {
    render(<QuestionTextInput question={mockQuestion} />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('renders textarea with placeholder', () => {
    render(<QuestionTextInput question={mockQuestion} />);
    expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
  });

  it('displays provided value', () => {
    render(<QuestionTextInput question={mockQuestion} value="Test answer" />);
    expect(screen.getByDisplayValue('Test answer')).toBeInTheDocument();
  });

  it('calls onChange when text is typed', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<QuestionTextInput question={mockQuestion} value="" onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'New text');

    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onBlur when focus is lost', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(<QuestionTextInput question={mockQuestion} onBlur={handleBlur} />);

    const textarea = screen.getByRole('textbox');
    await user.click(textarea);
    await user.tab();

    expect(handleBlur).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionTextInput question={mockQuestion} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
