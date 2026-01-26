/**
 * QuestionSection Component
 *
 * Collapsible section containing questions with progress badge.
 */

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { SectionBadge } from '@/components/atoms/SectionBadge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { QuestionItem } from './QuestionItem';
import { cn } from '@/lib/utils';

export const QuestionSection = ({
  section,
  questions = [],
  onQuestionChange,
  isCollapsed = false,
  onToggle,
  className,
}) => {
  const completedCount = questions.filter((q) => q.completed).length;
  const totalCount = questions.length;

  return (
    <Card className={cn('animate-fadeIn', className)}>
      <Collapsible open={!isCollapsed} onOpenChange={onToggle}>
        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="text-xl font-semibold">{section}</h3>
                <SectionBadge completed={completedCount} total={totalCount} />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question) => (
                <div key={question._id} className="p-4 rounded-lg border bg-card">
                  <QuestionItem question={question} onChange={onQuestionChange} />
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
