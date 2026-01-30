/**
 * MultiClientSelector Component
 *
 * Multi-select dropdown for selecting multiple clients.
 * Displays selected clients as removable badges.
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export const MultiClientSelector = ({
  values = [],
  onValuesChange,
  required = false,
  disabled = false,
  label = 'Assign to Clients',
  placeholder = 'Select clients...',
  className,
}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clients');
        setClients(response.data.clients || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Get selected client objects
  const selectedClients = clients.filter(client =>
    values.includes(client._id)
  );

  // Filter clients by search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle client toggle
  const handleToggle = (clientId) => {
    if (values.includes(clientId)) {
      // Remove client
      onValuesChange(values.filter(id => id !== clientId));
    } else {
      // Add client
      onValuesChange([...values, clientId]);
    }
  };

  // Handle remove badge
  const handleRemove = (clientId) => {
    onValuesChange(values.filter(id => id !== clientId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('multi-client-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('space-y-2', className)} id="multi-client-dropdown">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-auto min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isOpen && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedClients.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedClients.map(client => (
              <Badge
                key={client._id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {client.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(client._id);
                  }}
                />
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 opacity-50 transition-transform ml-2 flex-shrink-0',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="relative z-50 w-full mt-1 max-h-72 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-fadeIn">
          {/* Search Input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Client List */}
          <div className="overflow-y-auto max-h-60 p-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading clients...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-destructive">
                {error}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              filteredClients.map(client => {
                const isSelected = values.includes(client._id);
                return (
                  <label
                    key={client._id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm rounded-sm cursor-pointer',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent/50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(client._id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{client.name}</div>
                      {client.email && (
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {required && values.length === 0 && (
        <p className="text-sm text-muted-foreground">
          At least one client must be selected
        </p>
      )}
    </div>
  );
};

export default MultiClientSelector;
