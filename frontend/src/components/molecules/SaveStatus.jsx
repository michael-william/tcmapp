import React from 'react';
import { CheckCircle2, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const SaveStatus = ({ saving, lastSaved, error, hasUnsavedChanges, onRetry }) => {
  if (saving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving changes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive mt-1">
        <XCircle className="h-3 w-3" />
        <span>Failed to save</span>
        <button
          onClick={onRetry}
          className="underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-xs text-warning mt-1">
        <AlertCircle className="h-3 w-3" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        <span>Saved at {format(lastSaved, 'h:mm a')}</span>
      </div>
    );
  }

  return null;
};
