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

/**
 * Generate a semantic questionKey from section and question text
 *
 * Follows the naming convention: {section_prefix}_{semantic_description}
 * Ensures uniqueness by appending a counter if needed.
 *
 * @param {string} section - Question section (e.g., "Security", "Tableau Cloud")
 * @param {string} questionText - Full question text
 * @param {Array} existingQuestions - Array of existing questions to check uniqueness
 * @returns {string} - Generated questionKey (e.g., "security_mfa_enabled")
 *
 * @example
 * const key = generateQuestionKey('Security', 'Is MFA enabled?', questions);
 * // Returns: 'security_mfa_enabled'
 */
function generateQuestionKey(section, questionText, existingQuestions = []) {
  if (!section || !questionText) {
    throw new Error('Section and questionText are required to generate questionKey');
  }

  // Convert section to snake_case prefix
  const sectionPrefix = section
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_'); // Replace spaces with underscores

  // Extract key words from question text (remove common words)
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'of', 'in', 'on', 'at', 'to', 'for',
    'with', 'by', 'from', 'as', 'and', 'or', 'but', 'if', 'then', 'than',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where',
    'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'you', 'your'
  ]);

  const words = questionText
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars and punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word)) // Keep meaningful words
    .slice(0, 4); // Take first 4 meaningful words

  // Generate base key
  const baseKey = `${sectionPrefix}_${words.join('_')}`;

  // Ensure uniqueness
  let questionKey = baseKey;
  let counter = 1;

  while (existingQuestions.some(q => q.questionKey === questionKey)) {
    questionKey = `${baseKey}_${counter}`;
    counter++;
  }

  return questionKey;
}

module.exports = {
  findQuestion,
  getQuestionValue,
  hasQuestion,
  findMultipleQuestions,
  generateQuestionKey,
};
