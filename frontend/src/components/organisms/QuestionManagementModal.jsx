/**
 * QuestionManagementModal Component
 *
 * Modal for adding, editing, and deleting questions (InterWorks only).
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export const QuestionManagementModal = ({ isOpen, onClose, migration, onSave }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('checkbox');
  const [helpText, setHelpText] = useState('');
  const [section, setSection] = useState('');

  const handleSave = () => {
    const newQuestion = {
      questionText,
      questionType,
      helpText,
      section,
      answer: '',
      completed: false,
    };

    onSave?.(newQuestion);
    handleClose();
  };

  const handleClose = () => {
    setQuestionText('');
    setQuestionType('checkbox');
    setHelpText('');
    setSection('');
    onClose?.();
  };

  const sections = migration?.questions
    ? [...new Set(migration.questions.map((q) => q.section).filter(Boolean))]
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the question text..."
              rows={3}
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger id="questionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="textInput">Text Input</SelectItem>
                <SelectItem value="dateInput">Date Input</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="yesNo">Yes/No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            {sections.length > 0 ? (
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter section name"
              />
            )}
          </div>

          {/* Help Text */}
          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text (Optional)</Label>
            <Input
              id="helpText"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Enter helpful information..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!questionText || !section}>
            Add Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
