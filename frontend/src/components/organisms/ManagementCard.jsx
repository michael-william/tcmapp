import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

export const ManagementCard = ({ hasManagement, isInterWorks, onEnable, onNavigate, loading }) => {
  const isDisabled = !hasManagement;
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  const handleCardClick = () => {
    if (hasManagement) {
      onNavigate();
    } else {
      setShowRequirementsModal(true);
    }
  };

  const handleOverrideEnable = async () => {
    await onEnable();
    setShowRequirementsModal(false);
  };

  const getDescription = () => {
    if (hasManagement) {
      return {
        icon: "text-primary",
        title: "Management Active",
        subtitle: "View migration progress, manage weekly notes, and collaborate with your team. Track checklist completion and monitor key milestones."
      };
    } else {
      return {
        icon: "opacity-50",
        title: "Management Not Started",
        subtitle: "Migration management features are not yet active. Complete the migration prerequisites to unlock progress tracking, weekly notes, and team collaboration tools."
      };
    }
  };

  const description = getDescription();

  return (
    <Card
      className={cn(
        'backdrop-blur-sm bg-white/10 border-white/20 h-full flex flex-col transition-all',
        isDisabled && 'border-dashed border-white/30'
      )}
    >
      <CardHeader className="flex-none">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Migration Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Status Display */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <BarChart3 className={`h-12 w-12 mb-4 ${description.icon}`} />
          <p className="text-sm font-medium mb-2">{description.title}</p>
          <p className="text-xs text-muted-foreground px-4">
            {description.subtitle}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex-none pt-2 border-t border-white/10">
          {isDisabled ? (
            isInterWorks ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleCardClick}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Enabling...' : 'Start Migration'}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full"
              >
                Not Available
              </Button>
            )
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onNavigate}
              className="w-full"
            >
              Migration Management
            </Button>
          )}
        </div>
      </CardContent>

      {/* Requirements Modal */}
      <Dialog open={showRequirementsModal} onOpenChange={setShowRequirementsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Migration Management Requirements</DialogTitle>
            <DialogDescription className="pt-3">
              The following prerequisites should be completed before enabling Migration Management:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Recommended Prerequisites:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Client information should be completed</li>
                <li>Migration kickoff date should be scheduled</li>
                <li>At least one checklist question should be answered</li>
                <li>Primary contact information should be provided</li>
              </ul>
            </div>

            {isInterWorks ? (
              <p className="text-sm text-muted-foreground">
                As an InterWorks administrator, you can override these requirements and enable management immediately.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please contact your InterWorks consultant to enable the Management module once prerequisites are completed.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRequirementsModal(false)}>
              Cancel
            </Button>
            {isInterWorks && (
              <Button
                variant="gradient"
                onClick={handleOverrideEnable}
                disabled={loading}
              >
                {loading ? 'Enabling...' : 'Override & Enable'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
