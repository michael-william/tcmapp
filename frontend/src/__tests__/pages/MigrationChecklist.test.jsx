/**
 * MigrationChecklist Page Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MigrationChecklist } from '@/pages/MigrationChecklist';
import * as useAuthModule from '@/hooks/useAuth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'migration-123' }),
  };
});

describe('MigrationChecklist Page', () => {
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

  const renderChecklist = () => {
    return render(
      <MemoryRouter initialEntries={['/migration/migration-123']}>
        <Routes>
          <Route path="/migration/:id" element={<MigrationChecklist />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('displays loading state initially', () => {
    renderChecklist();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders client name when loaded', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });
  });

  it('renders progress section', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Pre-requisite Progress')).toBeInTheDocument();
    });
  });

  it('renders client information section', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Client Information')).toBeInTheDocument();
    });
  });

  it('renders search filter', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
    });
  });

  it('renders questions grouped by section', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    });
  });

  it('shows Manage Questions button for InterWorks users', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage questions/i })).toBeInTheDocument();
    });
  });

  it('does not show Manage Questions for client users', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        name: 'Client User',
        email: 'client@example.com',
        role: 'client',
      },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /manage questions/i })).not.toBeInTheDocument();
  });

  it('renders export section', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByText('Export Checklist')).toBeInTheDocument();
    });
  });

  it('renders Back button', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });
});
