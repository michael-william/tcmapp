/**
 * ManagementSection Component
 *
 * Collapsible section for management questions with progress badge.
 * Uses blue gradient (vs purple for pre-check). Supports nested delta items.
 * Auto-collapses when all questions are completed.
 *
 * REDESIGNED: Delta items are now nested within deltaParent questions
 */

import React, { useEffect } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionBadge } from '@/components/atoms/SectionBadge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { QuestionItem } from './QuestionItem';
import { DeltaParentQuestion } from './DeltaParentQuestion';
import { cn } from '@/lib/utils';

export const ManagementSection = ({
  section,
  questions = [],
  onQuestionChange,
  onAddDelta,
  onUpdateDelta,
  onRemoveDelta,
  onCompleteSection,
  isCollapsed = false,
  onToggle,
  isInterWorks = false,
  readOnly = false,
  className,
}) => {
  // Calculate progress (exclude delta parent from count)
  const regularQuestions = questions.filter(q => q.questionType !== 'deltaParent');
  const completedCount = regularQuestions.filter((q) => q.completed).length;
  const totalCount = regularQuestions.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Find delta parent if exists
  const deltaParent = questions.find(q => q.questionType === 'deltaParent');

  // Auto-collapse when all questions are completed
  useEffect(() => {
    if (allCompleted && !isCollapsed) {
      onToggle?.();
    }
  }, [allCompleted]);

  const handleCompleteSection = () => {
    if (readOnly) return;
    onCompleteSection?.(section);
  };

  return (
    <div className={cn('animate-fadeIn', className)}>
      <Collapsible open={!isCollapsed} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "text-white px-[18px] py-3 rounded-t-lg cursor-pointer select-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg mb-0",
              allCompleted
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-blue-500 to-blue-700"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-white transition-transform duration-300",
                    isCollapsed && "rotate-[-90deg]"
                  )}
                />
                <h3 className="text-lg font-semibold">{section}</h3>
                {allCompleted && (
                  <CheckCircle className="h-5 w-5 text-white" />
                )}
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
            <CardContent className="pt-6 space-y-6">
              {/* Regular Questions */}
              {regularQuestions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {regularQuestions.map((question) => (
                    <div key={question.id} className="p-4 rounded-lg border bg-card">
                      <QuestionItem
                        question={question}
                        onChange={onQuestionChange}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Delta Parent Section (nested deltas) */}
              {deltaParent && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {section} Items
                      {deltaParent.deltas?.length > 0 && ` (${deltaParent.deltas.length})`}
                    </h4>
                  </div>

                  <DeltaParentQuestion
                    question={deltaParent}
                    section={section}
                    onAddDelta={onAddDelta}
                    onUpdateDelta={onUpdateDelta}
                    onRemoveDelta={onRemoveDelta}
                  />
                </div>
              )}

              {/* Section Complete Button */}
              {isInterWorks && !readOnly && !allCompleted && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCompleteSection}
                    className="w-full text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark {section} Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ManagementSection;
