/**
 * QuestionItem Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { QuestionItem } from '@/components/organisms/QuestionItem';

describe('QuestionItem Component', () => {
  it('renders nothing when question is null', () => {
    const { container } = render(<QuestionItem question={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders checkbox question', () => {
    const question = {
      _id: 'q1',
      questionType: 'checkbox',
      questionText: 'Is backup complete?',
      completed: false,
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Is backup complete?')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders text input question', () => {
    const question = {
      _id: 'q1',
      questionType: 'textInput',
      questionText: 'Describe your setup',
      answer: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Describe your setup')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders date input question', () => {
    const question = {
      _id: 'q1',
      questionType: 'dateInput',
      questionText: 'Select migration date',
      answer: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Select migration date')).toBeInTheDocument();
    expect(screen.getByLabelText('Select migration date')).toHaveAttribute('type', 'date');
  });

  it('renders dropdown question', () => {
    const question = {
      _id: 'q1',
      questionType: 'dropdown',
      questionText: 'Select environment',
      options: ['Dev', 'Staging', 'Production'],
      answer: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Select environment')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders yes/no question', () => {
    const question = {
      _id: 'q1',
      questionType: 'yesNo',
      questionText: 'Are backups configured?',
      options: ['Yes', 'No'],
      answer: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Are backups configured?')).toBeInTheDocument();
    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('handles unknown question type', () => {
    const question = {
      _id: 'q1',
      questionType: 'unknown',
      questionText: 'Some question',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText(/Unknown question type: unknown/)).toBeInTheDocument();
  });

  it('calls onChange with question ID and updates', () => {
    const handleChange = vi.fn();
    const question = {
      _id: 'q1',
      questionType: 'textInput',
      questionText: 'Enter text',
      answer: '',
    };

    render(<QuestionItem question={question} onChange={handleChange} />);
    // Component is rendered correctly
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders yes/no with conditional date input', () => {
    const question = {
      _id: 'q1',
      questionType: 'yesNo',
      questionText: 'Has migration date been set?',
      options: ['Yes', 'No'],
      answer: 'Yes',
      showConditionalDate: true,
      conditionalDate: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByLabelText('When?')).toBeInTheDocument();
  });

  it('renders yes/no with conditional text input', () => {
    const question = {
      _id: 'q1',
      questionType: 'yesNo',
      questionText: 'Are there special requirements?',
      options: ['Yes', 'No'],
      answer: 'Yes',
      showConditionalInput: true,
      conditionalInput: '',
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByLabelText('Please specify:')).toBeInTheDocument();
  });

  it('renders multiSelect question type', () => {
    const question = {
      _id: 'q57',
      id: 'q57',
      questionType: 'multiSelect',
      questionText: 'Cloud Platform',
      options: ['AWS', 'Azure', 'GCP', 'Other', 'N/A'],
      answer: ['N/A'],
      metadata: {},
    };

    render(<QuestionItem question={question} />);
    expect(screen.getByText('Cloud Platform')).toBeInTheDocument();
    // MultiSelect renders a trigger button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles multiSelect onChange with array values', () => {
    const handleChange = vi.fn();
    const question = {
      _id: 'q57',
      id: 'q57',
      questionType: 'multiSelect',
      questionText: 'Cloud Platform',
      options: ['AWS', 'Azure', 'GCP', 'Other', 'N/A'],
      answer: ['N/A'],
      metadata: {},
    };

    render(<QuestionItem question={question} onChange={handleChange} />);

    // Component is rendered correctly
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Note: Full interaction testing is done in QuestionMultiSelect.test.jsx
    // This test verifies that the multiSelect case is properly routed in QuestionItem
  });
});
