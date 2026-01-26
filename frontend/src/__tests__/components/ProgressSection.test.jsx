/**
 * ProgressSection Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { ProgressSection } from '@/components/organisms/ProgressSection';

describe('ProgressSection Component', () => {
  it('renders progress title', () => {
    render(<ProgressSection completed={10} total={50} percentage={20} />);
    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
  });

  it('displays completed and total questions', () => {
    render(<ProgressSection completed={10} total={50} percentage={20} />);
    expect(screen.getByText('10 of 50 questions completed')).toBeInTheDocument();
  });

  it('displays percentage', () => {
    render(<ProgressSection completed={25} total={50} percentage={50} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles zero progress', () => {
    render(<ProgressSection completed={0} total={54} percentage={0} />);
    expect(screen.getByText('0 of 54 questions completed')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles complete progress', () => {
    render(<ProgressSection completed={54} total={54} percentage={100} />);
    expect(screen.getByText('54 of 54 questions completed')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressSection completed={10} total={50} percentage={20} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses default values when props not provided', () => {
    render(<ProgressSection />);
    expect(screen.getByText('0 of 0 questions completed')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
