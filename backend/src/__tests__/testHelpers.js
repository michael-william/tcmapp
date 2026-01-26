/**
 * Test Helpers
 *
 * Utility functions for creating test data and generating tokens.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a valid JWT token for testing
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT token
 */
const generateJWT = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Create test user data
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} User data
 */
const createTestUserData = (overrides = {}) => {
  return {
    email: 'test@interworks.com',
    password: 'Password123!',
    name: 'Test User',
    role: 'interworks',
    ...overrides,
  };
};

/**
 * Create test client user data
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Client user data
 */
const createTestClientData = (overrides = {}) => {
  return {
    email: 'client@company.com',
    password: 'ClientPass123!',
    name: 'Test Client',
    role: 'client',
    ...overrides,
  };
};

/**
 * Create test migration data
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Migration data
 */
const createTestMigrationData = (overrides = {}) => {
  return {
    clientEmail: 'client@company.com',
    clientInfo: {
      clientName: 'Test Company',
      region: 'US-East',
      serverVersion: '2023.3',
      serverUrl: 'https://tableau.test.com',
      kickoffDate: new Date('2024-02-01'),
      primaryContact: 'John Doe',
      meetingCadence: 'Weekly',
      goLiveDate: new Date('2024-06-01'),
    },
    questions: [
      {
        id: 'q1',
        section: 'Security',
        questionText: 'Test question?',
        questionType: 'checkbox',
        answer: null,
        completed: false,
        order: 1,
      },
    ],
    additionalNotes: '',
    createdBy: 'test@interworks.com',
    ...overrides,
  };
};

/**
 * Wait for a specified number of milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateJWT,
  createTestUserData,
  createTestClientData,
  createTestMigrationData,
  wait,
};
