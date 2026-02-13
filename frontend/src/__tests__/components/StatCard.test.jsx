import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/atoms/StatCard';

describe('StatCard', () => {
  it('renders with label and value', () => {
    render(<StatCard label="Total Tasks" value={42} />);

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard label="Progress" value="75%" />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard label="Test" value={10} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<StatCard label="Test" value={10} />);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('shadow-md');
    expect(card).toHaveClass('hover:-translate-y-0.5');
  });

  it('displays value in bold with primary-dark color', () => {
    render(<StatCard label="Test" value={100} />);

    const value = screen.getByText('100');
    expect(value).toHaveClass('text-3xl');
    expect(value).toHaveClass('font-bold');
    expect(value).toHaveClass('text-primary-dark');
  });

  it('displays label with correct styling', () => {
    render(<StatCard label="Completed Tasks" value={50} />);

    const label = screen.getByText('Completed Tasks');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('text-muted-foreground');
    expect(label).toHaveClass('font-semibold');
    expect(label).toHaveClass('text-center');
  });
});
