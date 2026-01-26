/**
 * Card Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders Card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies glassmorphism styles', () => {
    const { container } = render(<Card>Glass Card</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('backdrop-blur-lg', 'bg-white/80');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref to div element', () => {
    const ref = React.createRef();
    render(<Card ref={ref}>Ref Card</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader Component', () => {
  it('renders with children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies padding styles', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild;
    expect(header).toHaveClass('p-6');
  });
});

describe('CardTitle Component', () => {
  it('renders with text', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H3');
  });

  it('applies title styles', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('text-2xl', 'font-semibold');
  });
});

describe('CardContent Component', () => {
  it('renders with children', () => {
    render(<CardContent>Content area</CardContent>);
    expect(screen.getByText('Content area')).toBeInTheDocument();
  });

  it('applies padding styles', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    const content = container.firstChild;
    expect(content).toHaveClass('p-6', 'pt-0');
  });
});

describe('Card Composition', () => {
  it('renders full card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content here')).toBeInTheDocument();
  });
});
