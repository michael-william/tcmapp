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

  const { user } = useAuth();
  const navigate = useNavigate();
  const isInterWorks = user?.role === 'interworks';

  // Fetch migrations
  useEffect(() => {
    fetchMigrations();
  }, []);

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
        const completedCount = m.questions?.filter((q) => q.completed).length || 0;
        const totalCount = m.questions?.length || 0;
        const isComplete = completedCount === totalCount && totalCount > 0;

        return selectedStatus === 'completed' ? isComplete : !isComplete;
      });
    }

    setFilteredMigrations(filtered);
  }, [searchTerm, selectedStatus, migrations]);

  // Create new migration
  const handleCreateMigration = async () => {
    try {
      const response = await api.post('/migrations', {
        clientInfo: {
          clientName: 'New Client',
          projectName: 'New Migration',
        },
      });

      if (response.data.migration) {
        navigate(`/migration/${response.data.migration._id}`);
      }
    } catch (err) {
      console.error('Error creating migration:', err);
      setError('Failed to create migration');
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
              {isInterWorks ? 'All Migrations' : 'Your Migration'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isInterWorks
                ? 'Manage client migration projects'
                : 'View and update your migration checklist'}
            </p>
          </div>
          {isInterWorks && (
            <Button onClick={handleCreateMigration} className="gap-2">
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
                  : 'No migration assigned yet. Contact your InterWorks consultant.'}
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
                onDelete={() => handleDeleteMigration(migration._id)}
                isInterWorks={isInterWorks}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
