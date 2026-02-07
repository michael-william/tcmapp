/**
 * SectionBadge Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { SectionBadge } from '@/components/atoms/SectionBadge';

describe('SectionBadge Component', () => {
  it('renders progress count', () => {
    render(<SectionBadge completed={8} total={12} />);
    expect(screen.getByText('8/12')).toBeInTheDocument();
  });

  it('applies outline variant when not complete', () => {
    const { container } = render(<SectionBadge completed={5} total={10} />);
    const badge = screen.getByText('5/10');
    expect(badge).toHaveClass('border');
  });

  it('applies complete styling when all questions answered', () => {
    const { container } = render(<SectionBadge completed={10} total={10} />);
    const badge = screen.getByText('10/10');
    expect(badge).toHaveClass('bg-green-600');
  });

  it('handles zero total', () => {
    render(<SectionBadge completed={0} total={0} />);
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('handles partial completion', () => {
    render(<SectionBadge completed={3} total={7} />);
    expect(screen.getByText('3/7')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SectionBadge completed={5} total={10} className="custom-class" />);
    const badge = screen.getByText('5/10');
    expect(badge).toHaveClass('custom-class');
  });

  it('uses monospace font', () => {
    const { container } = render(<SectionBadge completed={1} total={5} />);
    const badge = screen.getByText('1/5');
    expect(badge).toHaveClass('font-mono');
  });

  it('renders whiteTransparent variant with correct styling', () => {
    render(<SectionBadge completed={8} total={12} variant="whiteTransparent" />);
    const badge = screen.getByText('8/12');
    expect(badge).toHaveClass('bg-white/30');
    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('font-semibold');
    expect(badge).toHaveClass('rounded-xl');
  });

  it('whiteTransparent variant does not apply complete styling', () => {
    render(<SectionBadge completed={10} total={10} variant="whiteTransparent" />);
    const badge = screen.getByText('10/10');
    expect(badge).toHaveClass('bg-white/30');
    expect(badge).not.toHaveClass('bg-green-600');
  });

  it('applies custom className with whiteTransparent variant', () => {
    render(<SectionBadge completed={5} total={10} variant="whiteTransparent" className="custom-class" />);
    const badge = screen.getByText('5/10');
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveClass('bg-white/30');
  });
});
