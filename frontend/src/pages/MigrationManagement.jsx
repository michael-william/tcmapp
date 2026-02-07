/**
 * MigrationManagement Page
 *
 * Management view for tracking migration progress and weekly notes.
 * InterWorks users can edit notes, clients have read-only access.
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationLayout } from '@/components/templates/MigrationLayout';
import { ChecklistOverview } from '@/components/organisms/ChecklistOverview';
import { WeeklyNotesSection } from '@/components/organisms/WeeklyNotesSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useManagement } from '@/hooks/useManagement';
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react';

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

  // Page header with navigation
  const pageHeader = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {management?.clientInfo?.clientName || 'Migration Management'}
          </h1>
        </div>
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
    </div>
  );

  if (loading) {
    return (
      <MigrationLayout
        completed={0}
        total={0}
        percentage={0}
        pageHeader={pageHeader}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MigrationLayout>
    );
  }

  if (error) {
    return (
      <MigrationLayout
        completed={0}
        total={0}
        percentage={0}
        pageHeader={pageHeader}
      >
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
      <MigrationLayout
        completed={0}
        total={0}
        percentage={0}
        pageHeader={pageHeader}
      >
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

  const { completed = 0, total = 0, percentage = 0 } = management.progress || {};

  return (
    <MigrationLayout
      completed={completed}
      total={total}
      percentage={percentage}
      clientName={management.clientInfo?.clientName}
      pageHeader={pageHeader}
    >
      <div className="space-y-6">
        {/* Checklist Overview Section */}
        <ChecklistOverview
          clientInfo={management.clientInfo}
          progress={management.progress}
        />

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
