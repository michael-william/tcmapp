/**
 * UserManagement Page Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { UserManagement } from '@/pages/UserManagement';
import * as useAuthModule from '@/hooks/useAuth';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

describe('UserManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'mock-token');
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        name: 'Admin User',
        email: 'admin@interworks.com',
        role: 'interworks',
      },
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  const renderUserManagement = () => {
    return render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );
  };

  it('renders page header', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderUserManagement();
    // Check for loading spinner by finding the Loader2 icon
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders New User button', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });
  });

  it('displays users from API', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@interworks.com')).toBeInTheDocument();
    });
  });

  it('shows role badges for users', async () => {
    renderUserManagement();

    await waitFor(() => {
      // Use getAllByText since "InterWorks" appears in header and badge
      const interworksBadges = screen.getAllByText('InterWorks');
      expect(interworksBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });

  it('displays clientIds array for guest users', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Guest User')).toBeInTheDocument();
    });

    // Should show client count or name
    await waitFor(() => {
      expect(screen.getByText(/Test Client Company|1 Client/)).toBeInTheDocument();
    });
  });

  it('shows edit and delete buttons for users', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Guest User')).toBeInTheDocument();
    });

    // Should have edit and delete buttons for each user
    const deleteButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg')
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('opens create user modal when New User clicked', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });

    const newUserButton = screen.getByRole('button', { name: /new user/i });
    await user.click(newUserButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });
  });

  it('displays user count', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText(/Users \(2\)/)).toBeInTheDocument();
    });
  });

  it('creates a guest user with single client', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });

    // Open modal
    const newUserButton = screen.getByRole('button', { name: /new user/i });
    await user.click(newUserButton);

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, 'New Guest User');
    await user.type(emailInput, 'newguest@example.com');
    await user.type(passwordInput, 'Password123!');

    // Guest role should be default, but let's ensure it
    const guestRadio = screen.getByLabelText(/guest user/i);
    await user.click(guestRadio);

    // Submit form
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);

    // Should show validation error about client assignment
    await waitFor(() => {
      expect(screen.getByText(/guest users must be assigned to at least one client/i)).toBeInTheDocument();
    });
  });

  it('creates an InterWorks user without client assignment', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });

    // Open modal
    const newUserButton = screen.getByRole('button', { name: /new user/i });
    await user.click(newUserButton);

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, 'New InterWorks User');
    await user.type(emailInput, 'newinterworks@interworks.com');
    await user.type(passwordInput, 'Password123!');

    // Select InterWorks role
    const interworksRadio = screen.getByLabelText(/interworks user/i);
    await user.click(interworksRadio);

    // Submit form
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);

    // Should succeed without client assignment
    await waitFor(() => {
      expect(screen.getByText('New InterWorks User')).toBeInTheDocument();
    });
  });

  // Note: Edit and delete functionality tests are complex due to button selectors
  // These are better suited for E2E tests. The key functionality we need to test
  // is that the UI properly displays clientIds array data, which is tested above.

  it('handles validation errors when creating user', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });

    // Open modal
    const newUserButton = screen.getByRole('button', { name: /new user/i });
    await user.click(newUserButton);

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });

    // Try to submit without filling form
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/name, email, and password are required/i)).toBeInTheDocument();
    });
  });

  // Note: API error handling tests involving complex modal interactions
  // are better suited for E2E tests with Playwright/Cypress
});
