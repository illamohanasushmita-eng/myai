"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserMedications,
  updateMedication,
} from "@/lib/services/healthRecordService";
import { Medication } from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";
import React from "react";

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

interface EditMedicationPageProps {
  params: Promise<{
    medicationId: string;
  }>;
}

export default function EditMedicationPage({
  params,
}: EditMedicationPageProps) {
  const { medicationId } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("once-daily");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [reason, setReason] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [medication, setMedication] = useState<Medication | null>(null);

  // Load medication data
  useEffect(() => {
    const loadMedication = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          router.push("/signin");
          return;
        }

        const medications = await getUserMedications(userId);
        const foundMedication = medications.find(
          (m) => m.medication_id === medicationId,
        );

        if (!foundMedication) {
          toast({
            title: "Medication not found",
            description: "The medication you're trying to edit doesn't exist.",
            variant: "destructive",
          });
          router.push("/healthcare");
          return;
        }

        setMedication(foundMedication);
        setMedicationName(foundMedication.medication_name);
        setDosage(foundMedication.dosage || "");
        setFrequency(foundMedication.frequency);
        setTimeOfDay(foundMedication.time_of_day);
        setReason(foundMedication.reason || "");
        setSideEffects(foundMedication.side_effects || "");
      } catch (error) {
        console.error("Error loading medication:", error);
        toast({
          title: "Error loading medication",
          description: "Failed to load medication data.",
          variant: "destructive",
        });
      }
    };

    loadMedication();
  }, [medicationId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!medicationName.trim()) {
      setError("Medication name is required");
      return;
    }

    try {
      setIsLoading(true);
      await updateMedication(medicationId, {
        medication_name: medicationName.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency,
        time_of_day: timeOfDay,
        reason: reason.trim() || undefined,
        side_effects: sideEffects.trim() || undefined,
      });

      toast({
        title: "Medication updated successfully",
        description: "Your medication has been updated.",
      });

      router.push("/healthcare");
    } catch (err) {
      console.error("Error updating medication:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update medication. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!medication) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading medication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
        <Button asChild variant="ghost" size="icon">
          <Link href="/healthcare">
            <span className="material-symbols-outlined">
              arrow_back_ios_new
            </span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Edit Medication</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
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

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Medication"}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/healthcare">Cancel / Back</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
