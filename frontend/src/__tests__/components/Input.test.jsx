/**
 * Input Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styles when error prop is true', () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveClass('border-destructive');
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
  });

  it('sets input type attribute', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('defaults to text type', () => {
    render(<Input placeholder="Default" />);
    const input = screen.getByPlaceholderText('Default');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef();
    render(<Input ref={ref} placeholder="Ref input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
