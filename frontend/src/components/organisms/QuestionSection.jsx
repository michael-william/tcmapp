/**
 * QuestionSection Component
 *
 * Collapsible section containing questions with progress badge.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { SectionBadge } from '@/components/atoms/SectionBadge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { QuestionItem } from './QuestionItem';
import { cn } from '@/lib/utils';

export const QuestionSection = ({
  section,
  questions = [],
  onQuestionChange,
  onQuestionBlur,
  isCollapsed = false,
  onToggle,
  className,
}) => {
  const completedCount = questions.filter((q) => q.completed).length;
  const totalCount = questions.length;

  return (
    <div className={cn('animate-fadeIn', className)}>
      <Collapsible open={!isCollapsed} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white px-[18px] py-3 rounded-t-lg cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-white transition-transform duration-300",
                    isCollapsed && "rotate-[-90deg]"
                  )}
                />
                <h3 className="text-lg font-semibold">{section}</h3>
              </div>
              <SectionBadge
                variant="whiteTransparent"
                completed={completedCount}
                total={totalCount}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="rounded-t-none border-t-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {questions.map((question) => (
                  <div key={question._id} className="p-4 rounded-lg border bg-card">
                    <QuestionItem
                      question={question}
                      onChange={onQuestionChange}
                      onBlur={onQuestionBlur}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
