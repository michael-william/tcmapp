/**
 * Header Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/organisms/Header';

describe('Header Component', () => {
  it('renders application title', () => {
    renderWithRouter(<Header userName="John Doe" role="interworks" />);
    expect(screen.getByText('Tableau Migration')).toBeInTheDocument();
    expect(screen.getByText('Cloud Migration Checklist')).toBeInTheDocument();
  });

  it('displays user name', () => {
    renderWithRouter(<Header userName="John Doe" role="interworks" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays InterWorks badge for interworks role', () => {
    renderWithRouter(<Header userName="John Doe" role="interworks" />);
    expect(screen.getByText('InterWorks')).toBeInTheDocument();
  });

  it('displays Client badge for client role', () => {
    renderWithRouter(<Header userName="Jane Smith" role="client" />);
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderWithRouter(<Header userName="John Doe" role="interworks" />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const handleLogout = vi.fn();
    const user = userEvent.setup();

    renderWithRouter(<Header userName="John Doe" role="interworks" onLogout={handleLogout} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('renders logo', () => {
    const { container } = renderWithRouter(<Header userName="John Doe" role="interworks" />);
    const logo = container.querySelector('.bg-gradient-to-r');
    expect(logo).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <Header userName="John Doe" role="interworks" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
