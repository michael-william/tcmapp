import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressStatsSection } from '@/components/organisms/ProgressStatsSection';

describe('ProgressStatsSection', () => {
  it('renders all 4 stat cards', () => {
    render(<ProgressStatsSection completed={30} total={50} percentage={60} />);

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('displays correct total value', () => {
    render(<ProgressStatsSection completed={30} total={50} percentage={60} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('displays correct completed value', () => {
    render(<ProgressStatsSection completed={30} total={50} percentage={60} />);

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('calculates remaining correctly', () => {
    render(<ProgressStatsSection completed={30} total={50} percentage={60} />);

    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('formats percentage with % symbol', () => {
    render(<ProgressStatsSection completed={30} total={50} percentage={60} />);

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    render(<ProgressStatsSection completed={0} total={0} percentage={0} />);

    // Verify all labels are present
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles 100% completion correctly', () => {
    render(<ProgressStatsSection completed={50} total={50} percentage={100} />);

    // Check for specific labels to verify context
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressStatsSection
        completed={10}
        total={20}
        percentage={50}
        className="custom-class"
      />
    );

    const section = container.firstChild;
    expect(section).toHaveClass('custom-class');
  });

  it('uses responsive grid layout', () => {
    const { container } = render(
      <ProgressStatsSection completed={10} total={20} percentage={50} />
    );

    const section = container.firstChild;
    expect(section).toHaveClass('grid');
    expect(section).toHaveClass('grid-cols-2');
    expect(section).toHaveClass('md:grid-cols-4');
    expect(section).toHaveClass('gap-4');
  });
});
