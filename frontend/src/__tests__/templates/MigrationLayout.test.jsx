/**
 * MigrationLayout Template Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import * as useAuthModule from '@/hooks/useAuth';

describe('MigrationLayout Template', () => {
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
    render(
      <MigrationLayout completed={10} total={50} percentage={20}>
        <div>Content</div>
      </MigrationLayout>
    );
    expect(screen.getByText('Tableau Migration')).toBeInTheDocument();
  });

  it('renders ProgressSection component', () => {
    render(
      <MigrationLayout completed={10} total={50} percentage={20}>
        <div>Content</div>
      </MigrationLayout>
    );
    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    expect(screen.getByText('10 of 50 questions completed')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(
      <MigrationLayout completed={25} total={50} percentage={50}>
        <div>Content</div>
      </MigrationLayout>
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <MigrationLayout completed={10} total={50} percentage={20}>
        <div>Checklist Content</div>
      </MigrationLayout>
    );
    expect(screen.getByText('Checklist Content')).toBeInTheDocument();
  });

  it('applies custom className to main', () => {
    const { container } = render(
      <MigrationLayout completed={10} total={50} percentage={20} className="custom-class">
        <div>Content</div>
      </MigrationLayout>
    );
    const main = container.querySelector('main');
    expect(main).toHaveClass('custom-class');
  });

  it('handles default values', () => {
    render(
      <MigrationLayout>
        <div>Content</div>
      </MigrationLayout>
    );
    expect(screen.getByText('0 of 0 questions completed')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
