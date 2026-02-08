/**
 * Migration Overview Page
 *
 * Landing page for a migration showing contacts, checklist progress, and management status.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { ContactsCard } from '@/components/organisms/ContactsCard';
import { ChecklistProgressCard } from '@/components/organisms/ChecklistProgressCard';
import { ManagementCard } from '@/components/organisms/ManagementCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export const MigrationOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [migration, setMigration] = useState(null);
  const [contacts, setContacts] = useState({ guest: [], interworks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enablingManagement, setEnablingManagement] = useState(false);

  const isInterWorks = user?.role === 'interworks';

  // Fetch migration and contacts data
  useEffect(() => {
    fetchMigrationData();
  }, [id]);

  const fetchMigrationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch migration
      const migrationResponse = await api.get(`/migrations/${id}`);
      const migrationData = migrationResponse.data.migration;
      setMigration(migrationData);

      // Fetch contacts for this client
      const clientId = migrationData.clientId._id || migrationData.clientId;
      const usersResponse = await api.get(`/users?clientId=${clientId}`);

      // Separate by role
      const allUsers = usersResponse.data.users || [];
      const guestContacts = allUsers.filter(u => u.role === 'guest');
      const interworksContacts = allUsers.filter(u => u.role === 'interworks');

      setContacts({
        guest: guestContacts,
        interworks: interworksContacts
      });
    } catch (err) {
      console.error('Error fetching migration data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load migration';
      setError(errorMessage);

      // Redirect to dashboard if 403 (unauthorized)
      if (err.response?.status === 403) {
        toast.error('You do not have access to this migration');
        navigate('/');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enable management for this migration
  const handleEnableManagement = async () => {
    try {
      setEnablingManagement(true);
      await api.post(`/migrations/${id}/management/enable`);

      // Update local state
      setMigration(prev => ({ ...prev, hasManagement: true }));
      toast.success('Migration management enabled successfully');
    } catch (err) {
      console.error('Error enabling management:', err);
      toast.error(err.response?.data?.message || 'Failed to enable management');
    } finally {
      setEnablingManagement(false);
    }
  };

  // Calculate progress from questions
  const calculateProgress = () => {
    if (!migration?.questions) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = migration.questions.length;
    const completed = migration.questions.filter(q => q.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
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

  if (error || !migration) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || 'Migration not found'}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const clientName = migration.clientInfo?.clientName || 'Unknown Client';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="default"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{clientName} - Migration Overview</h1>
          <div className="w-[120px]"></div> {/* Spacer for centering */}
        </div>

        {/* Three Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ContactsCard
            contacts={contacts}
            clientName={clientName}
          />
          <ChecklistProgressCard
            progress={progress}
            onNavigate={() => navigate(`/migration/${id}`)}
          />
          <ManagementCard
            hasManagement={migration.hasManagement}
            isInterWorks={isInterWorks}
            onEnable={handleEnableManagement}
            onNavigate={() => navigate(`/migration/${id}/management`)}
            loading={enablingManagement}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
