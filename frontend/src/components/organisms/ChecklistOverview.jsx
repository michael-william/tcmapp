/**
 * ChecklistOverview Component
 *
 * Read-only display of checklist progress and client information
 * for the Migration Management view.
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  MapPin,
  Server,
  Globe,
  Calendar,
  Users,
  Clock,
} from 'lucide-react';

export const ChecklistOverview = ({ clientInfo = {}, progress = {} }) => {
  const { completed = 0, total = 0, percentage = 0 } = progress;

  const infoItems = [
    {
      icon: MapPin,
      label: 'Region',
      value: clientInfo.region,
    },
    {
      icon: Server,
      label: 'Server Version',
      value: clientInfo.serverVersion,
    },
    {
      icon: Globe,
      label: 'Server URL',
      value: clientInfo.serverUrl,
    },
    {
      icon: Calendar,
      label: 'Kickoff Date',
      value: clientInfo.kickoffDate
        ? new Date(clientInfo.kickoffDate).toLocaleDateString()
        : null,
    },
    {
      icon: Calendar,
      label: 'Go-Live Date',
      value: clientInfo.goLiveDate
        ? new Date(clientInfo.goLiveDate).toLocaleDateString()
        : null,
    },
    {
      icon: Users,
      label: 'Primary Contact',
      value: clientInfo.primaryContact,
    },
    {
      icon: Clock,
      label: 'Meeting Cadence',
      value: clientInfo.meetingCadence,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Checklist Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Completion</span>
            <Badge variant={percentage === 100 ? 'default' : 'outline'}>
              {percentage}% Complete
            </Badge>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completed} of {total} questions completed
            </span>
            <span className="font-medium text-foreground">
              {total - completed} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Client Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map(
              ({ icon: Icon, label, value }) =>
                value && (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className="text-sm text-foreground mt-0.5 break-words">{value}</p>
                    </div>
                  </div>
                )
            )}
          </div>
          {infoItems.every(item => !item.value) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No client information available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
