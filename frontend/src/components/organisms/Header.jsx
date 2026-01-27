/**
 * Header Component
 *
 * Main application header with logo, title, user info, and logout.
 */

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export const Header = ({ userName, role, onLogout, className }) => {
  return (
    <header
      className={cn(
        'border-b bg-white/80 backdrop-blur-lg sticky top-0 z-40',
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Tableau Migration
              </h1>
              <p className="text-xs text-muted-foreground">
                Cloud Migration Checklist
              </p>
            </div>
          </div>

          {/* Navigation Menu (InterWorks only) */}
          {role === 'interworks' && (
            <nav className="flex items-center gap-4 ml-8">
              <a
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/clients"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clients
              </a>
              <a
                href="/users"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Users
              </a>
            </nav>
          )}

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{userName}</p>
              </div>
              <Badge variant={role === 'interworks' ? 'default' : 'secondary'}>
                {role === 'interworks' ? 'InterWorks' : 'Client'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
