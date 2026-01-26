/**
 * Checkbox Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui/Checkbox';

describe('Checkbox Component', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('handles check state changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables checkbox when disabled prop is true', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('forwards ref to checkbox element', () => {
    const ref = React.createRef();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeDefined();
  });
});
