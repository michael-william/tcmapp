/**
 * Dialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';

describe('Dialog Component', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('opens dialog in controlled state', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('renders dialog with description', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders dialog with custom content', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Dialog</DialogTitle>
          </DialogHeader>
          <div>
            <p>Custom content here</p>
          </div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Custom content here')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-class">
          <DialogHeader>
            <DialogTitle>Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const dialog = screen.getByText('Dialog').closest('[role="dialog"]');
    expect(dialog).toHaveClass('custom-class');
  });
});
