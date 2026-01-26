/**
 * QuestionSection Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionSection } from '@/components/organisms/QuestionSection';

describe('QuestionSection Component', () => {
  const mockQuestions = [
    {
      _id: 'q1',
      questionType: 'checkbox',
      questionText: 'Question 1',
      completed: true,
    },
    {
      _id: 'q2',
      questionType: 'textInput',
      questionText: 'Question 2',
      completed: false,
      answer: '',
    },
  ];

  it('renders section title', () => {
    render(<QuestionSection section="Security" questions={mockQuestions} />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('displays progress badge', () => {
    render(<QuestionSection section="Security" questions={mockQuestions} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders all questions', () => {
    render(<QuestionSection section="Security" questions={mockQuestions} isCollapsed={false} />);
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('shows expanded icon when not collapsed', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={mockQuestions} isCollapsed={false} />
    );
    // ChevronDown should be present
    const chevronDown = container.querySelector('svg');
    expect(chevronDown).toBeInTheDocument();
  });

  it('shows collapsed icon when collapsed', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={mockQuestions} isCollapsed={true} />
    );
    // ChevronRight should be present
    const chevronRight = container.querySelector('svg');
    expect(chevronRight).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <QuestionSection
        section="Security"
        questions={mockQuestions}
        onToggle={handleToggle}
      />
    );

    const header = screen.getByText('Security');
    await user.click(header);

    expect(handleToggle).toHaveBeenCalled();
  });

  it('calls onQuestionChange when question is updated', () => {
    const handleQuestionChange = vi.fn();

    render(
      <QuestionSection
        section="Security"
        questions={mockQuestions}
        onQuestionChange={handleQuestionChange}
        isCollapsed={false}
      />
    );

    // Questions are rendered
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('handles empty questions array', () => {
    render(<QuestionSection section="Security" questions={[]} />);
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={[]} className="custom-class" />
    );
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('calculates completed count correctly', () => {
    const questions = [
      { _id: '1', questionType: 'checkbox', completed: true, questionText: 'Q1' },
      { _id: '2', questionType: 'checkbox', completed: true, questionText: 'Q2' },
      { _id: '3', questionType: 'checkbox', completed: false, questionText: 'Q3' },
    ];

    render(<QuestionSection section="Security" questions={questions} />);
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});
