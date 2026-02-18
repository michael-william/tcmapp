/**
 * useManagement Hook
 *
 * Custom hook for managing Migration Management module data and operations.
 * Handles fetching management data, adding/editing/deleting weekly notes,
 * and managing questions with delta support.
 *
 * REDESIGNED: Manual save pattern - local state updates + batch save
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';

export const useManagement = (migrationId) => {
  const [management, setManagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Ref to track current state for batch saves
  const managementRef = useRef(null);

  /**
   * Fetch management data
   */
  const fetchManagement = useCallback(async () => {
    if (!migrationId) return;

    try {
      console.log(`[FETCH] Loading management data for migration ${migrationId}`);
      setLoading(true);
      setError(null);

      const response = await api.get(`/migrations/${migrationId}/management`);

      if (response.data.success) {
        console.log(`[FETCH] Loaded ${response.data.management.questions?.length || 0} questions`);
        setManagement(response.data.management);
        managementRef.current = response.data.management;
        setHasUnsavedChanges(false); // Reset on fresh load
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load management data';
      console.error('[FETCH] Error:', errorMessage, err);
      setError(errorMessage);
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
   * Update single question - LOCAL STATE ONLY (no API call)
   */
  const updateQuestion = useCallback((questionId, updates) => {
    setManagement((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      };
      managementRef.current = updated; // Keep ref in sync
      return updated;
    });
    setHasUnsavedChanges(true); // Mark as unsaved
    setSaveError(null); // Clear previous errors
  }, []);

  /**
   * Add delta - immediate execution with direct state update
   */
  const addDelta = async (parentId, name) => {
    try {
      setSaving(true);
      const response = await api.post(
        `/migrations/${migrationId}/management/questions/${parentId}/deltas`,
        { name }
      );

      if (response.data.success) {
        const newDelta = response.data.delta;

        // Update local state directly (no refetch)
        setManagement(prev => ({
          ...prev,
          questions: prev.questions.map(q => {
            if (q.id === parentId) {
              return {
                ...q,
                deltas: [...(q.deltas || []), newDelta]
              };
            }
            return q;
          })
        }));

        toast.success('Delta added');
        return newDelta;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add delta';
      console.error('[DELTA ADD] Error:', errorMessage, err);
      toast.error(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update delta - immediate execution with direct state update
   */
  const updateDelta = async (parentId, deltaId, updates) => {
    try {
      setSaving(true);
      const response = await api.put(
        `/migrations/${migrationId}/management/questions/${parentId}/deltas/${deltaId}`,
        updates
      );

      if (response.data.success) {
        const updatedDelta = response.data.delta;

        // Update local state directly (no refetch)
        setManagement((prev) => ({
          ...prev,
          questions: prev.questions.map((q) => {
            if (q.id === parentId && q.deltas) {
              return {
                ...q,
                deltas: q.deltas.map((delta) =>
                  delta.id === deltaId ? updatedDelta : delta
                ),
              };
            }
            return q;
          }),
        }));

        toast.success('Changes saved');
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save changes';
      console.error('[DELTA UPDATE] Error:', errorMessage, err);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Remove delta - immediate execution + refetch
   */
  const removeDelta = async (parentId, deltaId) => {
    try {
      setSaving(true);
      const response = await api.delete(
        `/migrations/${migrationId}/management/questions/${parentId}/deltas/${deltaId}`
      );

      if (response.data.success) {
        toast.success('Delta removed');
        await fetchManagement();  // ← Refetch
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove delta';
      console.error('[DELTA DELETE] Error:', errorMessage, err);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save management - batch update all questions
   */
  const saveManagement = useCallback(async () => {
    const currentManagement = managementRef.current;
    if (!currentManagement || !migrationId) {
      return { success: false, error: 'No data to save' };
    }

    try {
      setSaving(true);
      setSaveError(null);

      // Prepare payload: collect all questions
      const questionsToUpdate = currentManagement.questions || [];

      // Batch update all questions in a single API call
      const response = await api.put(
        `/migrations/${migrationId}/management/batch-update`,
        {
          questions: questionsToUpdate,
        }
      );

      if (response.data.success) {
        // Update state with backend response
        const updatedManagement = response.data.management;
        setManagement(updatedManagement);
        managementRef.current = updatedManagement;

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save changes';
      setSaveError(errorMessage);
      console.error('[SAVE MANAGEMENT] Error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [migrationId]);

  /**
   * Retry save after error
   */
  const retrySave = useCallback(async () => {
    return await saveManagement();
  }, [saveManagement]);

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
    saveError,
    lastSaved,
    hasUnsavedChanges,
    enableManagement,
    updateQuestion,     // Now local-only
    addDelta,           // Still immediate
    updateDelta,        // Now local-only
    removeDelta,        // Still immediate
    addNote,
    editNote,
    deleteNote,
    saveManagement,
    retrySave,
    refetch,
  };
};

export default useManagement;
