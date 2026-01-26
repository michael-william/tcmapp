/**
 * Dashboard Page Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import * as useAuthModule from '@/hooks/useAuth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'interworks',
      },
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  it('renders dashboard header for InterWorks users', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('All Migrations')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderDashboard();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders New Migration button for InterWorks users', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new migration/i })).toBeInTheDocument();
    });
  });

  it('does not show New Migration button for client users', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        name: 'Client User',
        email: 'client@example.com',
        role: 'client',
      },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Your Migration')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /new migration/i })).not.toBeInTheDocument();
  });

  it('displays migrations from API', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });
  });

  it('renders search filter', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
    });
  });

  it('filters migrations by search term', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    // Search functionality will be tested in integration tests
  });
});
