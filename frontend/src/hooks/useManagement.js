/**
 * useManagement Hook
 *
 * Custom hook for managing Migration Management module data and operations.
 * Handles fetching management data, adding/editing/deleting weekly notes.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';

export const useManagement = (migrationId) => {
  const [management, setManagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /**
   * Fetch management data
   */
  const fetchManagement = useCallback(async () => {
    if (!migrationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/migrations/${migrationId}/management`);

      if (response.data.success) {
        setManagement(response.data.management);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load management data';
      setError(errorMessage);
      console.error('Fetch management error:', err);
    } finally {
      setLoading(false);
    }
  }, [migrationId]);

  /**
   * Enable management module (one-time)
   */
  const enableManagement = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.post(`/migrations/${migrationId}/management/enable`);

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchManagement();
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to enable management module';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Add weekly note
   */
  const addNote = async (content, date) => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.post(`/migrations/${migrationId}/management/notes`, {
        content,
        date,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchManagement();
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add note';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Edit weekly note
   */
  const editNote = async (noteId, updates) => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.put(
        `/migrations/${migrationId}/management/notes/${noteId}`,
        updates
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
        });
        await fetchManagement();
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update note';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete weekly note
   */
  const deleteNote = async (noteId) => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.delete(`/migrations/${migrationId}/management/notes/${noteId}`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
        });
        await fetchManagement();
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete note';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Refetch management data
   */
  const refetch = useCallback(() => {
    fetchManagement();
  }, [fetchManagement]);

  // Fetch on mount and when migrationId changes
  useEffect(() => {
    fetchManagement();
  }, [fetchManagement]);

  return {
    management,
    loading,
    error,
    saving,
    enableManagement,
    addNote,
    editNote,
    deleteNote,
    refetch,
  };
};

export default useManagement;
