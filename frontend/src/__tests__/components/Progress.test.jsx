/**
 * Progress Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Progress } from '@/components/ui/Progress';

describe('Progress Component', () => {
  it('renders with default value of 0', () => {
    const { container } = render(<Progress />);
    const progressIndicator = container.querySelector('[role="progressbar"] > div');
    expect(progressIndicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('renders with specified value', () => {
    const { container } = render(<Progress value={50} />);
    const progressIndicator = container.querySelector('[role="progressbar"] > div');
    expect(progressIndicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('renders with 100% value', () => {
    const { container } = render(<Progress value={100} />);
    const progressIndicator = container.querySelector('[role="progressbar"] > div');
    expect(progressIndicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('applies gradient background to indicator', () => {
    const { container } = render(<Progress value={75} />);
    const progressIndicator = container.querySelector('[role="progressbar"] > div');
    expect(progressIndicator).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-primary-dark');
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toHaveClass('custom-class');
  });

  it('forwards ref to progress element', () => {
    const ref = React.createRef();
    render(<Progress ref={ref} value={50} />);
    expect(ref.current).toBeDefined();
  });
});
