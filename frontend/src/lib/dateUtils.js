/**
 * Date utility functions for handling date format conversions
 * between backend (ISO 8601) and frontend (YYYY-MM-DD for HTML date inputs)
 */

/**
 * Converts an ISO 8601 date string to YYYY-MM-DD format for HTML date inputs
 * @param {string|null|undefined} isoString - ISO 8601 date string (e.g., "2024-05-01T00:00:00.000Z")
 * @returns {string|null|undefined} - Date in YYYY-MM-DD format or original value if not applicable
 */
export function formatISOToDateInput(isoString) {
  // Return null/undefined as-is
  if (isoString == null) {
    return isoString;
  }

  // If not a string, return as-is
  if (typeof isoString !== 'string') {
    return isoString;
  }

  // If empty string, return as-is
  if (isoString.trim() === '') {
    return isoString;
  }

  // Check if it's already in YYYY-MM-DD format (10 characters, matches pattern)
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyPattern.test(isoString)) {
    return isoString;
  }

  // Try to parse as ISO 8601 date
  try {
    const date = new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    // Convert to YYYY-MM-DD format
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    // If parsing fails, return original value
    return isoString;
  }
}

/**
 * Normalizes date fields in a migration object from ISO 8601 to YYYY-MM-DD format
 * @param {Object} migration - Migration object from API
 * @returns {Object} - Migration object with normalized date fields
 */
export function normalizeMigrationDates(migration) {
  // Return as-is if migration is null/undefined
  if (!migration) {
    return migration;
  }

  // Create a shallow copy to avoid mutating the original
  const normalized = { ...migration };

  // Normalize clientInfo dates if clientInfo exists
  if (normalized.clientInfo) {
    normalized.clientInfo = {
      ...normalized.clientInfo,
      kickoffDate: formatISOToDateInput(normalized.clientInfo.kickoffDate),
      goLiveDate: formatISOToDateInput(normalized.clientInfo.goLiveDate),
    };
  }

  return normalized;
}
