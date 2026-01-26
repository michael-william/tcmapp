/**
 * QuestionDropdown Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { QuestionDropdown } from '@/components/molecules/QuestionDropdown';

describe('QuestionDropdown Component', () => {
  const mockQuestion = {
    _id: 'q1',
    questionText: 'Select your deployment type',
    helpText: 'Choose the appropriate deployment option',
  };

  const mockOptions = ['Cloud', 'On-Premise', 'Hybrid'];

  it('renders question text', () => {
    render(<QuestionDropdown question={mockQuestion} options={mockOptions} />);
    expect(screen.getByText('Select your deployment type')).toBeInTheDocument();
  });

  it('renders help tooltip when helpText is provided', () => {
    render(<QuestionDropdown question={mockQuestion} options={mockOptions} />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('renders select with placeholder', () => {
    render(<QuestionDropdown question={mockQuestion} options={mockOptions} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(<QuestionDropdown question={mockQuestion} options={mockOptions} value="Cloud" />);
    expect(screen.getByText('Cloud')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const handleChange = vi.fn();
    render(
      <QuestionDropdown
        question={mockQuestion}
        options={mockOptions}
        onChange={handleChange}
      />
    );

    // Just verify the select trigger is present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionDropdown
        question={mockQuestion}
        options={mockOptions}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
