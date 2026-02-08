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

  const { clientInfo, progress } = migration;
  // Use progress from backend if available, otherwise calculate from questions
  const completedCount = progress?.completed || 0;
  const totalCount = progress?.total || 0;
  const percentage = progress?.percentage || 0;

  return (
    <Card className={cn('hover:shadow-lg transition-shadow animate-fadeIn', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {clientInfo?.clientName || 'Untitled Migration'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {clientInfo?.region || 'No region specified'}
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

        {/* Go-Live Date */}
        {clientInfo?.goLiveDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Go-Live: {new Date(clientInfo.goLiveDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="default" size="sm" onClick={onView} className="w-full gap-2">
            <Eye className="h-4 w-4" />
            Migration Overview
          </Button>
          {isInterWorks && (
            <Button variant="destructive" size="sm" onClick={onDelete} className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
