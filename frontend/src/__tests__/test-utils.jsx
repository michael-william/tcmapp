/**
 * Test Utilities
 *
 * Custom render function and utilities for testing React components.
 */

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Additional options
 * @returns {Object} Render result
 */
export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  window.history.pushState({}, 'Test page', route);

  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@interworks.com',
  name: 'Test User',
  role: 'interworks',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create mock migration data
 */
export const createMockMigration = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  clientEmail: 'client@company.com',
  clientInfo: {
    clientName: 'Test Company',
    region: 'US-East',
    serverVersion: '2023.3',
    serverUrl: 'https://tableau.test.com',
    kickoffDate: new Date('2024-02-01').toISOString(),
    primaryContact: 'John Doe',
    meetingCadence: 'Weekly',
    goLiveDate: new Date('2024-06-01').toISOString(),
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
