/**
 * useMigration Hook
 *
 * Manages migration data fetching, updates, and auto-save.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export const useMigration = (migrationId) => {
  const [migration, setMigration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
      setMigration(response.data.migration);
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

      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q._id === questionId ? { ...q, ...updates } : q
        ),
      };
    });
  }, []);

  // Update client info
  const updateClientInfo = useCallback((field, value) => {
    setMigration((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        clientInfo: {
          ...prev.clientInfo,
          [field]: value,
        },
      };
    });
  }, []);

  // Save migration to backend
  const saveMigration = useCallback(async () => {
    if (!migration || !migrationId) return;

    try {
      setSaving(true);
      const response = await api.put(`/migrations/${migrationId}`, {
        clientInfo: migration.clientInfo,
        questions: migration.questions,
      });

      // Optionally update local state with server response
      if (response.data.migration) {
        setMigration(response.data.migration);
      }

      return { success: true };
    } catch (err) {
      console.error('Error saving migration:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to save migration',
      };
    } finally {
      setSaving(false);
    }
  }, [migration, migrationId]);

  // Fetch migration on mount or when migrationId changes
  useEffect(() => {
    fetchMigration();
  }, [fetchMigration]);

  return {
    migration,
    loading,
    error,
    saving,
    updateQuestion,
    updateClientInfo,
    saveMigration,
    refetch: fetchMigration,
  };
};
