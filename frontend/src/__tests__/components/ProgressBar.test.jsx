/**
 * ProgressBar Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { ProgressBar } from '@/components/atoms/ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with default value of 0', () => {
    render(<ProgressBar />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays percentage', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressBar value={50} showPercentage={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('rounds percentage to nearest integer', () => {
    render(<ProgressBar value={33.7} />);
    expect(screen.getByText('34%')).toBeInTheDocument();
  });

  it('clamps value to 0-100 range (too high)', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps value to 0-100 range (too low)', () => {
    render(<ProgressBar value={-20} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('shows 100% when fully complete', () => {
    render(<ProgressBar value={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
