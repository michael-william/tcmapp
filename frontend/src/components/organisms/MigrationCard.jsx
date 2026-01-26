/**
 * MigrationCard Component
 *
 * Card displaying migration info with action buttons.
 */

import React from 'react';
import { Eye, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

export const MigrationCard = ({ migration, onView, onDelete, isInterWorks = false, className }) => {
  if (!migration) return null;

  const { clientInfo, questions = [] } = migration;
  const completedCount = questions.filter((q) => q.completed).length;
  const totalCount = questions.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className={cn('hover:shadow-lg transition-shadow animate-fadeIn', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {clientInfo?.clientName || 'Untitled Migration'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {clientInfo?.projectName || 'No project name'}
            </p>
          </div>
          <Badge variant={percentage === 100 ? 'default' : 'outline'}>
            {percentage}% Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedCount}/{totalCount} questions
            </span>
          </div>
          <Progress value={percentage} />
        </div>

        {/* Migration Date */}
        {clientInfo?.migrationDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Migration: {new Date(clientInfo.migrationDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" onClick={onView} className="flex-1 gap-2">
            <Eye className="h-4 w-4" />
            View Checklist
          </Button>
          {isInterWorks && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
