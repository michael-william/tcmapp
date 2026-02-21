import { describe, it, expect } from 'vitest';
import { formatISOToDateInput, normalizeMigrationDates } from '@/lib/dateUtils';

describe('dateUtils', () => {
  describe('formatISOToDateInput', () => {
    it('should convert ISO 8601 string to YYYY-MM-DD format', () => {
      expect(formatISOToDateInput('2024-05-01T00:00:00.000Z')).toBe('2024-05-01');
      expect(formatISOToDateInput('2024-12-31T23:59:59.999Z')).toBe('2024-12-31');
      expect(formatISOToDateInput('2023-01-15T12:30:45.123Z')).toBe('2023-01-15');
    });

    it('should return null for null input', () => {
      expect(formatISOToDateInput(null)).toBe(null);
    });

    it('should return undefined for undefined input', () => {
      expect(formatISOToDateInput(undefined)).toBe(undefined);
    });

    it('should return empty string for empty string input', () => {
      expect(formatISOToDateInput('')).toBe('');
    });

    it('should return unchanged if already in YYYY-MM-DD format', () => {
      expect(formatISOToDateInput('2024-05-01')).toBe('2024-05-01');
      expect(formatISOToDateInput('2023-12-31')).toBe('2023-12-31');
    });

    it('should return original value for invalid date strings', () => {
      expect(formatISOToDateInput('not-a-date')).toBe('not-a-date');
      expect(formatISOToDateInput('2024-13-45')).toBe('2024-13-45');
    });

    it('should handle non-string values by returning them as-is', () => {
      expect(formatISOToDateInput(12345)).toBe(12345);
      expect(formatISOToDateInput({})).toEqual({});
      expect(formatISOToDateInput([])).toEqual([]);
    });

    it('should handle dates with different time zones', () => {
      // ISO string with different time zones should still convert to correct UTC date
      expect(formatISOToDateInput('2024-05-01T10:30:00.000+05:00')).toBe('2024-05-01');
      expect(formatISOToDateInput('2024-05-01T22:00:00.000-05:00')).toBe('2024-05-02');
    });
  });

  describe('normalizeMigrationDates', () => {
    it('should normalize kickoffDate and goLiveDate from ISO to YYYY-MM-DD', () => {
      const migration = {
        _id: 'migration-123',
        clientEmail: 'client@example.com',
        clientInfo: {
          clientName: 'Test Client',
          kickoffDate: '2024-05-01T00:00:00.000Z',
          goLiveDate: '2024-06-15T00:00:00.000Z',
        },
        questions: [],
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.clientInfo.kickoffDate).toBe('2024-05-01');
      expect(normalized.clientInfo.goLiveDate).toBe('2024-06-15');
    });

    it('should preserve null date values', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          clientName: 'Test Client',
          kickoffDate: null,
          goLiveDate: null,
        },
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.clientInfo.kickoffDate).toBe(null);
      expect(normalized.clientInfo.goLiveDate).toBe(null);
    });

    it('should preserve undefined date values', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          clientName: 'Test Client',
          kickoffDate: undefined,
          goLiveDate: undefined,
        },
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.clientInfo.kickoffDate).toBe(undefined);
      expect(normalized.clientInfo.goLiveDate).toBe(undefined);
    });

    it('should handle migration without clientInfo', () => {
      const migration = {
        _id: 'migration-123',
        clientEmail: 'client@example.com',
        questions: [],
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized).toEqual(migration);
    });

    it('should handle null migration', () => {
      expect(normalizeMigrationDates(null)).toBe(null);
    });

    it('should handle undefined migration', () => {
      expect(normalizeMigrationDates(undefined)).toBe(undefined);
    });

    it('should preserve dates already in YYYY-MM-DD format', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          clientName: 'Test Client',
          kickoffDate: '2024-05-01',
          goLiveDate: '2024-06-15',
        },
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.clientInfo.kickoffDate).toBe('2024-05-01');
      expect(normalized.clientInfo.goLiveDate).toBe('2024-06-15');
    });

    it('should not mutate original migration object', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          clientName: 'Test Client',
          kickoffDate: '2024-05-01T00:00:00.000Z',
          goLiveDate: '2024-06-15T00:00:00.000Z',
        },
      };

      const normalized = normalizeMigrationDates(migration);

      // Original should remain unchanged
      expect(migration.clientInfo.kickoffDate).toBe('2024-05-01T00:00:00.000Z');
      expect(migration.clientInfo.goLiveDate).toBe('2024-06-15T00:00:00.000Z');

      // Normalized should be different
      expect(normalized.clientInfo.kickoffDate).toBe('2024-05-01');
      expect(normalized.clientInfo.goLiveDate).toBe('2024-06-15');

      // Should be different objects
      expect(normalized).not.toBe(migration);
      expect(normalized.clientInfo).not.toBe(migration.clientInfo);
    });

    it('should preserve other clientInfo fields', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          clientName: 'Test Client',
          region: 'US-East',
          serverVersion: '2023.3',
          serverUrl: 'https://tableau.example.com',
          primaryContact: 'John Doe',
          meetingCadence: 'Weekly',
          kickoffDate: '2024-05-01T00:00:00.000Z',
          goLiveDate: '2024-06-15T00:00:00.000Z',
        },
        questions: [],
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.clientInfo.clientName).toBe('Test Client');
      expect(normalized.clientInfo.region).toBe('US-East');
      expect(normalized.clientInfo.serverVersion).toBe('2023.3');
      expect(normalized.clientInfo.serverUrl).toBe('https://tableau.example.com');
      expect(normalized.clientInfo.primaryContact).toBe('John Doe');
      expect(normalized.clientInfo.meetingCadence).toBe('Weekly');
    });

    it('should preserve questions array', () => {
      const migration = {
        _id: 'migration-123',
        clientInfo: {
          kickoffDate: '2024-05-01T00:00:00.000Z',
          goLiveDate: '2024-06-15T00:00:00.000Z',
        },
        questions: [
          { id: 'q1', questionText: 'Question 1' },
          { id: 'q2', questionText: 'Question 2' },
        ],
      };

      const normalized = normalizeMigrationDates(migration);

      expect(normalized.questions).toEqual(migration.questions);
    });
  });
});
