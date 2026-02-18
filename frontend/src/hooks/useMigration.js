/**
 * useMigration Hook
 *
 * Manages migration data fetching, updates, and manual save.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

export const useMigration = (migrationId) => {
  const [migration, setMigration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Refs to track current state without re-creating functions
  const migrationRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Fetch migration data
  const fetchMigration = useCallback(async () => {
    if (!migrationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/migrations/${migrationId}`);
      const fetchedMigration = response.data.migration;
      setMigration(fetchedMigration);
      migrationRef.current = fetchedMigration; // Keep ref in sync
      setHasUnsavedChanges(false); // Reset unsaved flag when loading fresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load migration');
      console.error('Error fetching migration:', err);
    } finally {
      setLoading(false);
    }
  }, [migrationId]);

  // Update a single question
  const updateQuestion = useCallback((questionId, updates) => {
    setMigration((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      };
      migrationRef.current = updated; // Keep ref in sync
      return updated;
    });
    setHasUnsavedChanges(true); // Mark as unsaved (no auto-save trigger)
    setSaveError(null); // Clear previous errors
  }, []);

  // Update client info
  const updateClientInfo = useCallback((field, value) => {
    setMigration((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        clientInfo: {
          ...prev.clientInfo,
          [field]: value,
        },
      };
      migrationRef.current = updated; // Keep ref in sync
      return updated;
    });
    setHasUnsavedChanges(true); // Mark as unsaved (no auto-save trigger)
    setSaveError(null); // Clear previous errors
  }, []);

  // Internal function to save to backend (uses ref for current data)
  const saveToBackend = useCallback(async () => {
    const currentMigration = migrationRef.current;
    if (!currentMigration || !migrationId) return;

    try {
      setSaving(true);
      setSaveError(null);
      const response = await api.put(`/migrations/${migrationId}`, {
        clientInfo: currentMigration.clientInfo,
        questions: currentMigration.questions,
      });

      // Update state with backend response to get updatedAt and updatedBy fields
      if (response.data.migration) {
        const updatedMigration = response.data.migration;
        setMigration(updatedMigration);
        migrationRef.current = updatedMigration;
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false); // Clear unsaved flag
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save migration';
      setSaveError(errorMessage);
      console.error('Error saving migration:', err);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [migrationId]);

  // Save migration to backend (manual save)
  const saveMigration = useCallback(async () => {
    const result = await saveToBackend();
    if (result.success) {
      setHasUnsavedChanges(false);
    }
    return result;
  }, [saveToBackend]);

  // Retry failed save
  const retrySave = useCallback(async () => {
    return await saveMigration();
  }, [saveMigration]);

  // Fetch migration on mount or when migrationId changes
  useEffect(() => {
    fetchMigration();
  }, [fetchMigration]);

  return {
    migration,
    loading,
    error,
    saving,
    saveError,
    lastSaved,
    hasUnsavedChanges,
    updateQuestion,
    updateClientInfo,
    saveMigration,
    retrySave,
    refetch: fetchMigration,
  };
};
