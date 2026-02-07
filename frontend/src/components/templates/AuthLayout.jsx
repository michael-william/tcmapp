/**
 * AuthLayout Template
 *
 * Centered card layout for authentication pages.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export const AuthLayout = ({ children, className }) => {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        className
      )}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-xl bg-gradient-to-r from-primary to-primary-dark items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tableau Migration
          </h1>
          <p className="text-muted-foreground">Cloud Migration Checklist</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
