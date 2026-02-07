/**
 * Select Component
 *
 * Dropdown select component using Radix UI Select primitive.
 */

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;

export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const isPrimary = variant === 'primary';

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>span]:line-clamp-1',
          'transition-colors',
          isPrimary
            ? 'bg-primary hover:bg-primary-dark text-primary-foreground border-primary'
            : 'border border-input bg-background ring-offset-background placeholder:text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className={cn('h-4 w-4', isPrimary ? 'text-white' : 'opacity-50')} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

export const SelectScrollUpButton = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
          'flex cursor-default items-center justify-center py-1',
          className
        )}
        {...props}
      >
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
    );
  }
);

SelectScrollUpButton.displayName = 'SelectScrollUpButton';

export const SelectScrollDownButton = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
          'flex cursor-default items-center justify-center py-1',
          className
        )}
        {...props}
      >
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    );
  }
);

SelectScrollDownButton.displayName = 'SelectScrollDownButton';

export const SelectContent = React.forwardRef(
  ({ className, children, position = 'popper', ...props }, ref) => {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
          position={position}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);

SelectContent.displayName = 'SelectContent';

export const SelectLabel = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <SelectPrimitive.Label
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
        {...props}
      />
    );
  }
);

SelectLabel.displayName = 'SelectLabel';

export const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export const SelectSeparator = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
      />
    );
  }
);

SelectSeparator.displayName = 'SelectSeparator';
