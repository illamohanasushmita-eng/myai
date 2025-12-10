"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMedication } from "@/lib/services/healthRecordService";

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FREQUENCY_OPTIONS = [
  { id: "once-daily", label: "Once Daily" },
  { id: "twice-daily", label: "Twice Daily" },
  { id: "three-times-daily", label: "Three Times Daily" },
  { id: "four-times-daily", label: "Four Times Daily" },
  { id: "as-needed", label: "As Needed" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const TIME_OPTIONS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
  { id: "with-meals", label: "With Meals" },
  { id: "before-bed", label: "Before Bed" },
];

export function AddMedicationModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMedicationModalProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("once-daily");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [reason, setReason] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!medicationName.trim()) {
      setError("Medication name is required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      await createMedication(userId, {
        medication_name: medicationName.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency,
        time_of_day: timeOfDay,
        reason: reason.trim() || undefined,
        side_effects: sideEffects.trim() || undefined,
        is_active: true,
      });

      // Reset form
      setMedicationName("");
      setDosage("");
      setFrequency("once-daily");
      setTimeOfDay("morning");
      setReason("");
      setSideEffects("");

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error creating medication:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add medication. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
          <DialogDescription>
            Add a new medication to your reminders. You'll get notifications for
            each dose.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Medication Name *</label>
            <Input
              placeholder="e.g., Aspirin, Vitamin D, Ibuprofen"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dosage</label>
            <Input
              placeholder="e.g., 500mg, 1 tablet, 2 capsules"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={frequency}
                onValueChange={setFrequency}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time of Day</label>
              <Select
                value={timeOfDay}
                onValueChange={setTimeOfDay}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for Taking</label>
            <Input
              placeholder="e.g., Headache relief, Vitamin supplement"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Known Side Effects</label>
            <Textarea
              placeholder="List any known side effects..."
              value={sideEffects}
              onChange={(e) => setSideEffects(e.target.value)}
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
              {isLoading ? "Adding..." : "Add Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
