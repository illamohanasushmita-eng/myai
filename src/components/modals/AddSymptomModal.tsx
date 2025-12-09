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
import { createSymptom } from '@/lib/services/healthRecordService';

interface AddSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SEVERITY_OPTIONS = [
  { id: 'mild', label: 'Mild' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'severe', label: 'Severe' },
];

export function AddSymptomModal({ isOpen, onClose, onSuccess }: AddSymptomModalProps) {
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [description, setDescription] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!symptomName.trim()) {
      setError('Symptom name is required');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      await createSymptom(userId, {
        symptom_name: symptomName.trim(),
        severity: severity,
        description: description.trim() || undefined,
        logged_date: new Date().toISOString(),
        duration_hours: durationHours ? parseInt(durationHours) : undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setSymptomName('');
      setSeverity('mild');
      setDescription('');
      setDurationHours('');
      setNotes('');

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Error creating symptom:', err);
      setError(err instanceof Error ? err.message : 'Failed to log symptom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Symptom</DialogTitle>
          <DialogDescription>
            Record a symptom you're experiencing. This helps track your health patterns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Symptom Name *</label>
            <Input
              placeholder="e.g., Headache, Cough, Fever"
              value={symptomName}
              onChange={(e) => setSymptomName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Severity</label>
            <Select value={severity} onValueChange={setSeverity} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe your symptom in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (hours)</label>
            <Input
              type="number"
              placeholder="How long have you had this symptom?"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              disabled={isLoading}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              placeholder="Any other relevant information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging...' : 'Log Symptom'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

