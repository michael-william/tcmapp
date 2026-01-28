/**
 * ClientSelector Component
 *
 * Dropdown for selecting a client company.
 * Used when creating migrations or guest users.
 */

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export const ClientSelector = ({
  value,
  onChange,
  required = false,
  disabled = false,
  label = 'Select Client',
  placeholder = 'Choose a client...',
  className,
}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/clients');
      setClients(response.data.clients || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        {label && <Label className="mb-2">{label}</Label>}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading clients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {label && <Label className="mb-2">{label}</Label>}
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className={className}>
        {label && <Label className="mb-2">{label}</Label>}
        <p className="text-sm text-muted-foreground">
          No clients available. Please create a client first.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <Label className="mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="__none__">
              <span className="text-muted-foreground">None (No client assignment)</span>
            </SelectItem>
          )}
          {clients.map((client) => (
            <SelectItem key={client._id} value={client._id}>
              {client.name} ({client.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
