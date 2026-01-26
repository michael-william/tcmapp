/**
 * useMigration Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMigration } from '@/hooks/useMigration';
import api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api');

describe('useMigration Hook', () => {
  const mockMigration = {
    _id: '123',
    title: 'Test Migration',
    clientInfo: {
      clientName: 'Test Client',
      projectName: 'Test Project',
    },
    questions: [
      {
        _id: 'q1',
        questionText: 'Question 1',
        answer: '',
        completed: false,
      },
      {
        _id: 'q2',
        questionText: 'Question 2',
        answer: 'Answer 2',
        completed: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches migration on mount', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });

    const { result } = renderHook(() => useMigration('123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.migration).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.migration).toEqual(mockMigration);
    expect(api.get).toHaveBeenCalledWith('/migrations/123');
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Migration not found';
    api.get.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.migration).toBeNull();
  });

  it('does not fetch when migrationId is not provided', () => {
    const { result } = renderHook(() => useMigration(null));

    expect(result.current.loading).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('updates a question', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update question
    result.current.updateQuestion('q1', { answer: 'New Answer', completed: true });

    await waitFor(() => {
      const updatedQuestion = result.current.migration.questions.find((q) => q._id === 'q1');
      expect(updatedQuestion.answer).toBe('New Answer');
      expect(updatedQuestion.completed).toBe(true);
    });
  });

  it('updates client info', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update client info
    result.current.updateClientInfo('clientName', 'New Client Name');

    await waitFor(() => {
      expect(result.current.migration.clientInfo.clientName).toBe('New Client Name');
    });
  });

  it('saves migration to backend', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });
    api.put.mockResolvedValue({ data: { migration: mockMigration } });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const saveResult = await result.current.saveMigration();

    expect(saveResult.success).toBe(true);
    expect(api.put).toHaveBeenCalledWith('/migrations/123', {
      clientInfo: mockMigration.clientInfo,
      questions: mockMigration.questions,
    });
  });

  it('handles save error', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });
    api.put.mockRejectedValue({
      response: { data: { message: 'Save failed' } },
    });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const saveResult = await result.current.saveMigration();

    expect(saveResult.success).toBe(false);
    expect(saveResult.error).toBe('Save failed');
  });

  it('refetches migration', async () => {
    api.get.mockResolvedValue({ data: { migration: mockMigration } });

    const { result } = renderHook(() => useMigration('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledTimes(1);

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
