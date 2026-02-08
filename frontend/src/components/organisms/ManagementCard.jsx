import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const ManagementCard = ({ hasManagement, isInterWorks, onEnable, onNavigate, loading }) => {
  const isDisabled = !hasManagement;

  return (
    <Card
      className={cn(
        'backdrop-blur-sm bg-white/10 border-white/20 h-full flex flex-col transition-all',
        isDisabled && 'opacity-50 grayscale'
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
          {isDisabled ? (
            <>
              <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground mb-2">
                No migration management started
              </p>
              {isInterWorks && (
                <p className="text-xs text-muted-foreground">
                  Click below to enable management features
                </p>
              )}
            </>
          ) : (
            <>
              <BarChart3 className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm font-medium">Management Active</p>
              <p className="text-xs text-muted-foreground mt-1">
                View migration progress and management
              </p>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-none pt-2 border-t border-white/10">
          {isDisabled ? (
            isInterWorks ? (
              <Button
                variant="default"
                size="sm"
                onClick={onEnable}
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
              View Management
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
