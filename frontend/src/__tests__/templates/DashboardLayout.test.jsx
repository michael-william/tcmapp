/**
 * DashboardLayout Template Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import * as useAuthModule from '@/hooks/useAuth';

describe('DashboardLayout Template', () => {
  beforeEach(() => {
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

  it('renders Header component', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText('Tableau Migration')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('displays user name in header', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays user role badge', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText('InterWorks')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('applies custom className to main', () => {
    const { container } = render(
      <DashboardLayout className="custom-class">
        <div>Content</div>
      </DashboardLayout>
    );
    const main = container.querySelector('main');
    expect(main).toHaveClass('custom-class');
  });

  it('handles missing user gracefully', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
