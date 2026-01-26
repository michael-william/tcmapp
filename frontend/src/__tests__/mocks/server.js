/**
 * MSW Server Setup
 *
 * Configures Mock Service Worker for API mocking in tests.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);
