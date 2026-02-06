/**
 * WeeklyNotesSection Component
 *
 * Weekly notes management for Migration Management module.
 * InterWorks users can add/edit/delete notes.
 * Client users see read-only view.
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar as CalendarIcon,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const WeeklyNotesSection = ({
  notes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
  isReadOnly = false,
  saving = false,
}) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
  });

  // Sort notes by date descending (most recent first)
  const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleStartAdd = () => {
    setIsAddingNote(true);
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      content: '',
    });
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
    setNoteForm({ date: '', content: '' });
  };

  const handleSaveAdd = async () => {
    if (!noteForm.content.trim()) return;

    const success = await onAddNote(noteForm.content, noteForm.date);
    if (success) {
      setIsAddingNote(false);
      setNoteForm({ date: '', content: '' });
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note._id);
    setNoteForm({
      date: new Date(note.date).toISOString().split('T')[0],
      content: note.content,
    });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteForm({ date: '', content: '' });
  };

  const handleSaveEdit = async (noteId) => {
    if (!noteForm.content.trim()) return;

    const success = await onEditNote(noteId, {
      content: noteForm.content,
      date: noteForm.date,
    });
    if (success) {
      setEditingNoteId(null);
      setNoteForm({ date: '', content: '' });
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    await onDeleteNote(noteId);
  };

  const NoteForm = ({ onSave, onCancel, submitLabel = 'Save' }) => (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="space-y-2">
        <Label htmlFor="note-date">Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="note-date"
            type="date"
            value={noteForm.date}
            onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
            className="pl-9"
            disabled={saving}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note-content">Note Content</Label>
        <Textarea
          id="note-content"
          value={noteForm.content}
          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
          placeholder="Enter weekly recap notes..."
          rows={4}
          disabled={saving}
          className="resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving || !noteForm.content.trim()}
        >
          <Save className="h-4 w-4 mr-2" />
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  const NoteCard = ({ note }) => {
    const isEditing = editingNoteId === note._id;

    if (isEditing) {
      return (
        <NoteForm
          onSave={() => handleSaveEdit(note._id)}
          onCancel={handleCancelEdit}
          submitLabel="Update"
        />
      );
    }

    return (
      <Card className="animate-fadeIn">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">
                {new Date(note.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {!isReadOnly && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(note)}
                  disabled={saving}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(note._id)}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{note.createdBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {note.updatedAt
                  ? `Updated ${new Date(note.updatedAt).toLocaleDateString()}`
                  : `Created ${new Date(note.createdAt).toLocaleDateString()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Recap Notes</CardTitle>
          {!isReadOnly && !isAddingNote && (
            <Button size="sm" onClick={handleStartAdd} disabled={saving}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAddingNote && (
          <NoteForm onSave={handleSaveAdd} onCancel={handleCancelAdd} submitLabel="Add Note" />
        )}

        {/* Notes List */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isReadOnly
                ? 'No weekly notes have been added yet.'
                : 'No weekly notes yet. Click "Add Note" to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
