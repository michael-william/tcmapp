/**
 * Collapsible Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/Collapsible';

describe('Collapsible Component', () => {
  it('renders trigger and content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content here</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('renders in controlled closed state', () => {
    render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Hidden content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    // Trigger should be present
    expect(screen.getByText('Toggle')).toBeInTheDocument();

    // When closed, content may not be in DOM or has hidden attribute
    const content = screen.queryByText('Hidden content');
    // Either not in DOM or has hidden attribute
    if (content) {
      expect(content.closest('[hidden]')).toBeTruthy();
    }
  });

  it('starts open when defaultOpen is true', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Visible content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('renders in controlled open state', () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Content')).toBeVisible();
  });

  it('renders trigger as button by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Button Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Button Trigger');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('renders trigger with custom element using asChild', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div>Custom Trigger</div>
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Custom Trigger');
    expect(trigger.tagName).toBe('DIV');
  });
});
