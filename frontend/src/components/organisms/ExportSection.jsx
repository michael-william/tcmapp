/**
 * ExportSection Component
 *
 * PDF export functionality with loading state.
 */

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const ExportSection = ({ migration, onExport, className }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className={cn('animate-fadeIn', className)}>
      <CardHeader>
        <CardTitle>Export Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Export the complete migration checklist as a PDF document for your records.
        </p>
        <Button
          onClick={handleExport}
          disabled={exporting || !migration}
          className="gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export to PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
