/**
 * Question Helper Utilities
 *
 * Provides backward-compatible lookup functions for questions using either
 * questionKey (semantic identifier) or id (legacy sequential identifier).
 */

/**
 * Find question by key or ID (backward compatible)
 *
 * @param {Array} questions - Array of question objects
 * @param {string} identifier - Either questionKey or id to search for
 * @returns {Object|undefined} - Found question or undefined
 *
 * @example
 * const question = findQuestion(migration.questions, 'bridge_required');
 * const question = findQuestion(migration.questions, 'q46'); // Still works
 */
function findQuestion(questions, identifier) {
  if (!questions || !identifier) {
    return undefined;
  }

  // Try questionKey first (preferred)
  const byKey = questions.find(q => q.questionKey === identifier);
  if (byKey) {
    return byKey;
  }

  // Fall back to id for backward compatibility
  return questions.find(q => q.id === identifier);
}

/**
 * Get specific field value from a question by key or ID
 *
 * @param {Array} questions - Array of question objects
 * @param {string} identifier - Either questionKey or id to search for
 * @param {string} field - Field name to retrieve (default: 'answer')
 * @returns {*} - Value of the field or undefined
 *
 * @example
 * const answer = getQuestionValue(migration.questions, 'bridge_required');
 * const completed = getQuestionValue(migration.questions, 'q46', 'completed');
 */
function getQuestionValue(questions, identifier, field = 'answer') {
  const question = findQuestion(questions, identifier);
  return question?.[field];
}

/**
 * Check if question exists by key or ID
 *
 * @param {Array} questions - Array of question objects
 * @param {string} identifier - Either questionKey or id to search for
 * @returns {boolean} - True if question exists
 *
 * @example
 * if (hasQuestion(migration.questions, 'cloud_manager_url')) { ... }
 */
function hasQuestion(questions, identifier) {
  return !!findQuestion(questions, identifier);
}

/**
 * Find multiple questions by keys or IDs
 *
 * @param {Array} questions - Array of question objects
 * @param {Array<string>} identifiers - Array of questionKeys or ids
 * @returns {Array} - Array of found questions (may be shorter than identifiers)
 *
 * @example
 * const bridgeQuestions = findMultipleQuestions(
 *   migration.questions,
 *   ['bridge_required', 'bridge_servers_built']
 * );
 */
function findMultipleQuestions(questions, identifiers) {
  if (!questions || !identifiers || !Array.isArray(identifiers)) {
    return [];
  }

  return identifiers
    .map(identifier => findQuestion(questions, identifier))
    .filter(q => q !== undefined);
}

module.exports = {
  findQuestion,
  getQuestionValue,
  hasQuestion,
  findMultipleQuestions,
};
