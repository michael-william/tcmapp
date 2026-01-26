/**
 * InfoTooltip Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { InfoTooltip } from '@/components/atoms/InfoTooltip';

describe('InfoTooltip Component', () => {
  it('renders info icon with tooltip content', () => {
    render(<InfoTooltip content="This is help text" />);

    const button = screen.getByRole('button', { name: 'More information' });
    expect(button).toBeInTheDocument();
  });

  it('returns null when content is not provided', () => {
    const { container } = render(<InfoTooltip content="" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when content is undefined', () => {
    const { container } = render(<InfoTooltip />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<InfoTooltip content="Help" className="custom-class" />);

    const button = screen.getByRole('button', { name: 'More information' });
    expect(button).toHaveClass('custom-class');
  });

  it('shows tooltip content in open state', () => {
    render(<InfoTooltip content="Help text here" />);

    const button = screen.getByRole('button', { name: 'More information' });
    expect(button).toBeInTheDocument();
  });

  it('has accessible screen reader text', () => {
    render(<InfoTooltip content="Help" />);

    expect(screen.getByText('More information')).toHaveClass('sr-only');
  });
});
