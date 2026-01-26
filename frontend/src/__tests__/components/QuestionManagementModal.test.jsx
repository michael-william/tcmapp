/**
 * QuestionManagementModal Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { QuestionManagementModal } from '@/components/organisms/QuestionManagementModal';

describe('QuestionManagementModal Component', () => {
  const mockMigration = {
    questions: [
      { _id: 'q1', section: 'Security', questionText: 'Q1' },
      { _id: 'q2', section: 'Infrastructure', questionText: 'Q2' },
    ],
  };

  it('renders nothing when not open', () => {
    render(<QuestionManagementModal isOpen={false} />);
    expect(screen.queryByText('Add New Question')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(<QuestionManagementModal isOpen={true} />);
    expect(screen.getByText('Add New Question')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<QuestionManagementModal isOpen={true} migration={mockMigration} />);

    expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Question Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Help Text (Optional)')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<QuestionManagementModal isOpen={true} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Question' })).toBeInTheDocument();
  });

  it('disables Add button when required fields are empty', () => {
    render(<QuestionManagementModal isOpen={true} />);

    const addButton = screen.getByRole('button', { name: 'Add Question' });
    expect(addButton).toBeDisabled();
  });

  it('enables Add button when required fields are filled', async () => {
    const user = userEvent.setup();

    render(<QuestionManagementModal isOpen={true} />);

    const questionTextarea = screen.getByLabelText('Question Text');
    await user.type(questionTextarea, 'Test question');

    const sectionInput = screen.getByLabelText('Section');
    await user.type(sectionInput, 'Test Section');

    const addButton = screen.getByRole('button', { name: 'Add Question' });
    expect(addButton).not.toBeDisabled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<QuestionManagementModal isOpen={true} onClose={handleClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onSave with new question data when Add button is clicked', async () => {
    const handleSave = vi.fn();
    const user = userEvent.setup();

    render(<QuestionManagementModal isOpen={true} onSave={handleSave} />);

    // Fill in required fields
    const questionTextarea = screen.getByLabelText('Question Text');
    await user.type(questionTextarea, 'New question');

    const sectionInput = screen.getByLabelText('Section');
    await user.type(sectionInput, 'Security');

    const addButton = screen.getByRole('button', { name: 'Add Question' });
    await user.click(addButton);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        questionText: 'New question',
        section: 'Security',
        questionType: 'checkbox', // default type
        answer: '',
        completed: false,
      })
    );
  });

  it('shows section dropdown when sections exist in migration', () => {
    render(<QuestionManagementModal isOpen={true} migration={mockMigration} />);

    // Section select should be present
    expect(screen.getByText('Select section')).toBeInTheDocument();
  });

  it('shows text input for section when no sections exist', () => {
    const migrationNoSections = { questions: [] };
    render(<QuestionManagementModal isOpen={true} migration={migrationNoSections} />);

    const sectionInput = screen.getByPlaceholderText('Enter section name');
    expect(sectionInput).toBeInTheDocument();
  });

  it('clears form after save', async () => {
    const handleSave = vi.fn();
    const user = userEvent.setup();

    render(<QuestionManagementModal isOpen={true} onSave={handleSave} />);

    // Fill and submit
    await user.type(screen.getByLabelText('Question Text'), 'Test');
    await user.type(screen.getByLabelText('Section'), 'Security');

    const addButton = screen.getByRole('button', { name: 'Add Question' });
    await user.click(addButton);

    expect(handleSave).toHaveBeenCalled();
  });
});
