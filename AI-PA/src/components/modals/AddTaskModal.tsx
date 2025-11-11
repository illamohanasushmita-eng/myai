'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProfessionalNote } from '@/lib/services/professionalService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  category?: string;
}

const CATEGORY_OPTIONS = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'project', label: 'Project' },
  { id: 'task', label: 'Task' },
  { id: 'note', label: 'Note' },
  { id: 'other', label: 'Other' },
];

export function AddTaskModal({ isOpen, onClose, onSuccess, category = 'Professional' }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('task');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Note title is required');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      await createProfessionalNote(userId, {
        title: title.trim(),
        content: content.trim() || undefined,
        category: noteCategory,
        tags: tags.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setContent('');
      setNoteCategory('task');
      setTags('');

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Error creating professional note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setContent('');
      setNoteCategory('task');
      setTags('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new professional note or task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <Input
              id="title"
              placeholder="Enter note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="Enter note content (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              className="rounded-lg min-h-[100px]"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <Select value={noteCategory} onValueChange={setNoteCategory} disabled={isLoading}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas (optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
              className="rounded-lg"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg"
            >
              {isLoading ? 'Creating...' : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

