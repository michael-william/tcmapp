/**
 * Dashboard Page
 *
 * List of migrations with create, search, and filter capabilities.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { MigrationCard } from '@/components/organisms/MigrationCard';
import { SearchFilter } from '@/components/molecules/SearchFilter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Plus, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const [migrations, setMigrations] = useState([]);
  const [filteredMigrations, setFilteredMigrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const isInterWorks = user?.role === 'interworks';

  // Fetch migrations and clients
  useEffect(() => {
    fetchMigrations();
    if (isInterWorks) {
      fetchClients();
    }
  }, [isInterWorks]);

  const fetchMigrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/migrations');
      setMigrations(response.data.migrations || []);
      setFilteredMigrations(response.data.migrations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load migrations');
      console.error('Error fetching migrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  // Filter migrations
  useEffect(() => {
    let filtered = [...migrations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.clientInfo?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.clientInfo?.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((m) => {
        // Use progress from backend
        const completedCount = m.progress?.completed || 0;
        const totalCount = m.progress?.total || 0;
        const isComplete = completedCount === totalCount && totalCount > 0;

        return selectedStatus === 'completed' ? isComplete : !isComplete;
      });
    }

    setFilteredMigrations(filtered);
  }, [searchTerm, selectedStatus, migrations]);

  // Open create migration modal
  const handleOpenCreateModal = () => {
    if (clients.length === 0) {
      setError('Please create a client first before creating a migration.');
      return;
    }
    setIsCreateModalOpen(true);
    setSelectedClientId(clients[0]?._id || '');
  };

  // Create new migration
  const handleCreateMigration = async () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await api.post('/migrations', {
        clientId: selectedClientId,
        clientInfo: {
          clientName: 'New Migration',
          projectName: 'New Project',
        },
      });

      if (response.data.migration) {
        setIsCreateModalOpen(false);
        navigate(`/migration/${response.data.migration._id}`);
      }
    } catch (err) {
      console.error('Error creating migration:', err);
      setError(err.response?.data?.message || 'Failed to create migration');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete migration
  const handleDeleteMigration = async (migrationId) => {
    if (!confirm('Are you sure you want to delete this migration?')) {
      return;
    }

    try {
      await api.delete(`/migrations/${migrationId}`);
      setMigrations(migrations.filter((m) => m._id !== migrationId));
    } catch (err) {
      console.error('Error deleting migration:', err);
      setError('Failed to delete migration');
    }
  };

  // View migration
  const handleViewMigration = (migrationId) => {
    navigate(`/migration/${migrationId}`);
  };

  // View management
  const handleViewManagement = (migrationId) => {
    navigate(`/migration/${migrationId}/management`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isInterWorks ? 'All Migrations' : 'Your Migrations'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isInterWorks
                ? 'Manage client migration projects'
                : 'View and update your migration checklists'}
            </p>
          </div>
          {isInterWorks && (
            <Button onClick={handleOpenCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              New Migration
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sections={[]}
        />

        {/* Migrations Grid */}
        {filteredMigrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all'
                  ? 'No migrations match your filters'
                  : isInterWorks
                  ? 'No migrations yet. Create your first migration to get started.'
                  : 'No migrations assigned yet. Contact your InterWorks consultant.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMigrations.map((migration) => (
              <MigrationCard
                key={migration._id}
                migration={migration}
                onView={() => handleViewMigration(migration._id)}
                onViewManagement={() => handleViewManagement(migration._id)}
                onDelete={() => handleDeleteMigration(migration._id)}
                isInterWorks={isInterWorks}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Migration Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Migration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={createLoading}
              >
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateMigration} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Migration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
