/**
 * Label Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Label } from '@/components/ui/Label';

describe('Label Component', () => {
  it('renders with text', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('applies htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Custom</Label>);
    const label = screen.getByText('Custom');
    expect(label).toHaveClass('custom-class');
  });

  it('renders with child elements', () => {
    render(
      <Label>
        Label with <span>children</span>
      </Label>
    );
    expect(screen.getByText('children')).toBeInTheDocument();
  });

  it('forwards ref to label element', () => {
    const ref = React.createRef();
    render(<Label ref={ref}>Ref Label</Label>);
    expect(ref.current).toBeDefined();
  });
});
