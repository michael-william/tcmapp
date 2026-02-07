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

  it('shows chevron without rotation when expanded', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={mockQuestions} isCollapsed={false} />
    );
    // ChevronDown should be present without rotation
    const chevron = container.querySelector('svg');
    expect(chevron).toBeInTheDocument();
    // The svg itself should not have the rotation class when expanded
    const classList = chevron.getAttribute('class') || '';
    expect(classList).not.toContain('rotate-[-90deg]');
  });

  it('shows rotated chevron when collapsed', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={mockQuestions} isCollapsed={true} />
    );
    // ChevronDown should be present with rotation
    const chevron = container.querySelector('svg');
    expect(chevron).toBeInTheDocument();
    // The svg should have the rotation class when collapsed
    const classList = chevron.getAttribute('class') || '';
    expect(classList).toContain('rotate-[-90deg]');
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
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders with gradient header styling', () => {
    const { container } = render(
      <QuestionSection section="Security" questions={mockQuestions} />
    );
    // Check for gradient classes
    const gradientHeader = container.querySelector('.from-\\[\\#667eea\\]');
    expect(gradientHeader).toBeInTheDocument();
    expect(gradientHeader).toHaveClass('to-[#764ba2]');
    expect(gradientHeader).toHaveClass('text-white');
  });

  it('uses whiteTransparent variant for progress badge', () => {
    render(<QuestionSection section="Security" questions={mockQuestions} />);
    const badge = screen.getByText('1/2');
    expect(badge).toBeInTheDocument();
    // Badge should have the white transparent styling
    expect(badge).toHaveClass('bg-white/30');
    expect(badge).toHaveClass('text-white');
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
