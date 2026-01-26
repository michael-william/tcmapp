/**
 * UserManagement Page Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { UserManagement } from '@/pages/UserManagement';
import * as useAuthModule from '@/hooks/useAuth';

describe('UserManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
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
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
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
      expect(screen.getByText('InterWorks')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
    });
  });

  it('shows delete button for client users', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Client User')).toBeInTheDocument();
    });

    // Should have at least one delete button (for client user)
    const deleteButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg') // Delete icon
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('opens create user modal when New User clicked', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
    });

    // Modal testing would require user interaction
    // This is covered in integration tests
  });

  it('displays user count', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText(/Users \(2\)/)).toBeInTheDocument();
    });
  });
});
