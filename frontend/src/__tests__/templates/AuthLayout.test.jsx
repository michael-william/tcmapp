/**
 * AuthLayout Template Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { AuthLayout } from '@/components/templates/AuthLayout';

describe('AuthLayout Template', () => {
  it('renders application title', () => {
    render(<AuthLayout><div>Content</div></AuthLayout>);
    expect(screen.getByText('Tableau Migration')).toBeInTheDocument();
    expect(screen.getByText('Cloud Migration Checklist')).toBeInTheDocument();
  });

  it('renders logo', () => {
    const { container } = render(<AuthLayout><div>Content</div></AuthLayout>);
    const logo = container.querySelector('.bg-gradient-to-r');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent('T');
  });

  it('renders children content', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AuthLayout className="custom-class">
        <div>Content</div>
      </AuthLayout>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has gradient background', () => {
    const { container } = render(<AuthLayout><div>Content</div></AuthLayout>);
    expect(container.firstChild).toHaveClass('bg-gradient-to-br');
  });

  it('centers content', () => {
    const { container } = render(<AuthLayout><div>Content</div></AuthLayout>);
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
