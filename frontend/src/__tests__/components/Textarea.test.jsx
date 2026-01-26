/**
 * Textarea Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea Component', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter notes" />);
    expect(screen.getByPlaceholderText('Enter notes')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea value="" onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('applies rows attribute', () => {
    render(<Textarea rows={6} placeholder="Textarea" />);
    const textarea = screen.getByPlaceholderText('Textarea');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('defaults to 4 rows', () => {
    render(<Textarea placeholder="Default" />);
    const textarea = screen.getByPlaceholderText('Default');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('disables textarea when disabled prop is true', () => {
    render(<Textarea disabled placeholder="Disabled" />);
    const textarea = screen.getByPlaceholderText('Disabled');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" placeholder="Custom" />);
    const textarea = screen.getByPlaceholderText('Custom');
    expect(textarea).toHaveClass('custom-class');
  });

  it('forwards ref to textarea element', () => {
    const ref = React.createRef();
    render(<Textarea ref={ref} placeholder="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
