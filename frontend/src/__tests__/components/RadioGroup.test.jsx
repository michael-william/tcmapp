/**
 * RadioGroup Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';

describe('RadioGroup Component', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RadioGroup onValueChange={handleChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no">No</Label>
        </div>
      </RadioGroup>
    );

    const yesOption = screen.getByLabelText('Yes');
    await user.click(yesOption);

    expect(handleChange).toHaveBeenCalledWith('yes');
  });

  it('selects correct item based on value prop', () => {
    render(
      <RadioGroup value="option2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    );

    const option2 = screen.getByLabelText('Option 2');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });

  it('disables radio group when disabled prop is true', () => {
    render(
      <RadioGroup disabled>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );

    const option = screen.getByLabelText('Option 1');
    expect(option).toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <RadioGroup className="custom-class">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('custom-class');
  });

  it('forwards ref to radio group element', () => {
    const ref = React.createRef();
    render(
      <RadioGroup ref={ref}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );
    expect(ref.current).toBeDefined();
  });
});
