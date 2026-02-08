import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/atoms/ProgressBar';

export const ChecklistProgressCard = ({ progress, onNavigate }) => {
  const { completed = 0, total = 0, percentage = 0 } = progress || {};
  const isComplete = percentage === 100;

  return (
    <Card className="backdrop-blur-sm bg-white/10 border-white/20 h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <CardTitle>Pre-Migration Checklist</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Progress Badge */}
        <div className="flex items-center justify-center py-4">
          <Badge
            variant={isComplete ? 'default' : 'outline'}
            className={isComplete ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          >
            {isComplete ? 'Complete' : `${completed}/${total} Questions Answered`}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center">
          <ProgressBar value={percentage} showPercentage={true} />
        </div>

        {/* Navigation Button */}
        <div className="flex-none pt-2 border-t border-white/10">
          <Button
            variant="default"
            size="sm"
            onClick={onNavigate}
            className="w-full"
          >
            Go to Checklist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
