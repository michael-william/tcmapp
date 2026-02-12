/**
 * MigrationManagement Page
 *
 * Management view for tracking migration progress and weekly notes.
 * InterWorks users can edit notes, clients have read-only access.
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import { ManagementHeader } from '@/components/organisms/ManagementHeader';
import { ActionToolbar } from '@/components/organisms/ActionToolbar';
import { WeeklyNotesSection } from '@/components/organisms/WeeklyNotesSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useManagement } from '@/hooks/useManagement';
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export const MigrationManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInterWorks = user?.role === 'interworks';

  const {
    management,
    loading,
    error,
    saving,
    addNote,
    editNote,
    deleteNote,
  } = useManagement(id);

  const [contacts, setContacts] = React.useState({ guest: [], interworks: [] });

  // Fetch contacts when migration loads
  useEffect(() => {
    const fetchContacts = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/migrations/${id}`);
        const migration = response.data.migration;

        if (!migration?.clientId) return;

        const clientId = migration.clientId._id || migration.clientId;
        const usersResponse = await api.get(`/users?clientId=${clientId}`);
        const users = usersResponse.data.users || [];

        setContacts({
          guest: users.filter(u => u.role === 'guest'),
          interworks: users.filter(u => u.role === 'interworks'),
        });
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        // Fail silently - contacts are optional feature
      }
    };

    fetchContacts();
  }, [id]);

  // Create management header content
  const managementHeaderContent = management ? (
    <ManagementHeader
      clientInfo={management.clientInfo || {}}
      progress={management.progress || { completed: 0, total: 0, percentage: 0 }}
      guestContacts={contacts.guest}
      interworksContacts={contacts.interworks}
    />
  ) : null;

  if (loading) {
    return (
      <MigrationLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MigrationLayout>
    );
  }

  if (error) {
    return (
      <MigrationLayout>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/migration/${id}`)}
              >
                View Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  if (!management) {
    return (
      <MigrationLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Management module not found
            </p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </MigrationLayout>
    );
  }

  // Create action toolbar content
  const actionToolbarContent = (
    <ActionToolbar>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Overview
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/migration/${id}`)}
        className="gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        View Checklist
      </Button>
    </ActionToolbar>
  );

  return (
    <MigrationLayout
      managementHeader={managementHeaderContent}
      actionToolbar={actionToolbarContent}
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Weekly Notes Section */}
        <WeeklyNotesSection
          notes={management.weeklyNotes}
          onAddNote={addNote}
          onEditNote={editNote}
          onDeleteNote={deleteNote}
          isReadOnly={!isInterWorks}
          saving={saving}
        />
      </div>
    </MigrationLayout>
  );
};
