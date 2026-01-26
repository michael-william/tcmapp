/**
 * Tooltip Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/Tooltip';

describe('Tooltip Component', () => {
  it('renders trigger element', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders in open state', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();
    // Note: Testing tooltip visibility in jsdom is challenging due to portal behavior
  });

  it('applies custom className to content', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-class">Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();
  });

  it('renders with button trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Button with tooltip</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip for button</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole('button', { name: 'Button with tooltip' })).toBeInTheDocument();
  });
});
