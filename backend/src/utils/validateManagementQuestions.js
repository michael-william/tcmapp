/**
 * Management Question Template Validator
 *
 * Validates management question template before seeding to database.
 * Prevents invalid data from reaching the database and causing save failures.
 */

/**
 * Validates management question template structure and content
 * @returns {Object} { valid: boolean, errors: array, questions: array }
 */
function validateManagementQuestions() {
  const template = require('../seeds/managementQuestionTemplate');
  const errors = [];

  // Valid question types from Migration model schema
  const validTypes = [
    'checkbox',
    'textInput',
    'dateInput',
    'dropdown',
    'yesNo',
    'numberInput',
    'hidden',
    'delta',
    'deltaParent',  // NEW: For nested delta items
  ];

  // Validate each question
  template.forEach((q, index) => {
    // Check required fields
    if (!q.id) {
      errors.push(`Question ${index}: Missing required field 'id'`);
    }

    if (!q.section) {
      errors.push(`Question ${index} (${q.id || 'unknown'}): Missing required field 'section'`);
    }

    if (!q.questionText) {
      errors.push(`Question ${index} (${q.id || 'unknown'}): Missing required field 'questionText'`);
    }

    if (!q.questionType) {
      errors.push(`Question ${index} (${q.id || 'unknown'}): Missing required field 'questionType'`);
    }

    // Validate questionType is in valid enum
    if (q.questionType && !validTypes.includes(q.questionType)) {
      errors.push(
        `Question ${index} (${q.id || 'unknown'}): Invalid questionType '${q.questionType}'. ` +
          `Must be one of: ${validTypes.join(', ')}`
      );
    }

    // Check order field exists
    if (q.order === undefined || q.order === null) {
      errors.push(`Question ${index} (${q.id || 'unknown'}): Missing required field 'order'`);
    }

    // Check metadata exists
    if (!q.metadata) {
      errors.push(`Question ${index} (${q.id || 'unknown'}): Missing required field 'metadata'`);
    }

    // Check isManagementQuestion flag
    if (q.metadata && !q.metadata.isManagementQuestion) {
      errors.push(
        `Question ${index} (${q.id || 'unknown'}): Missing 'metadata.isManagementQuestion' flag`
      );
    }
  });

  // Check for duplicate IDs
  const ids = template.map((q) => q.id).filter((id) => id); // Filter out undefined
  const idCounts = ids.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const duplicateIds = Object.keys(idCounts).filter((id) => idCounts[id] > 1);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate question IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check for duplicate order numbers
  const orders = template.map((q) => q.order).filter((o) => o !== undefined && o !== null);
  const orderCounts = orders.reduce((acc, order) => {
    acc[order] = (acc[order] || 0) + 1;
    return acc;
  }, {});

  const duplicateOrders = Object.keys(orderCounts).filter((order) => orderCounts[order] > 1);
  if (duplicateOrders.length > 0) {
    errors.push(`Duplicate order numbers found: ${duplicateOrders.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    questions: template,
  };
}

module.exports = { validateManagementQuestions };
