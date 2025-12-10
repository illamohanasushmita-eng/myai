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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSymptom } from "@/lib/services/healthRecordService";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const symptomSchema = z.object({
  symptomName: z.string().min(1, "Symptom name is required"),
  severity: z.enum(["mild", "moderate", "severe"], {
    required_error: "Severity is required",
  }),
  description: z.string().optional(),
  durationHours: z.string().optional(),
  notes: z.string().optional(),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

const SEVERITY_OPTIONS = [
  { id: "mild", label: "Mild" },
  { id: "moderate", label: "Moderate" },
  { id: "severe", label: "Severe" },
];

export default function AddSymptomPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptomName: "",
      severity: "mild",
      description: "",
      durationHours: "",
      notes: "",
    },
  });

  const selectedSeverity = watch("severity");

  const onSubmit = async (data: SymptomFormData) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSymptom(userId, {
        symptom_name: data.symptomName.trim(),
        severity: data.severity,
        description: data.description?.trim() || undefined,
        logged_date: new Date().toISOString(),
        duration_hours: data.durationHours
          ? parseInt(data.durationHours)
          : undefined,
        notes: data.notes?.trim() || undefined,
      });

      toast({
        title: "Symptom added successfully!",
        description: "Your symptom has been logged.",
      });

      router.push("/healthcare");
    } catch (err) {
      console.error("Error creating symptom:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to log symptom. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-lg font-bold">Log Symptom</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
            <p className="text-sm text-subtle-light dark:text-subtle-dark mb-6 text-center">
              Record a symptom you're experiencing. This helps track your health
              patterns.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Symptom Name *</label>
                <Input
                  placeholder="e.g., Headache, Cough, Fever"
                  {...register("symptomName")}
                  className={errors.symptomName ? "border-red-500" : ""}
                />
                {errors.symptomName && (
                  <p className="text-sm text-red-500">
                    {errors.symptomName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity *</label>
                <Select
                  value={selectedSeverity}
                  onValueChange={(value) =>
                    setValue(
                      "severity",
                      value as "mild" | "moderate" | "severe",
                    )
                  }
                >
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
                {errors.severity && (
                  <p className="text-sm text-red-500">
                    {errors.severity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your symptom in detail..."
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (hours)</label>
                <Input
                  type="number"
                  placeholder="How long have you had this symptom?"
                  {...register("durationHours")}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  placeholder="Any other relevant information..."
                  {...register("notes")}
                  rows={2}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-1/2"
                >
                  {isSubmitting ? "Logging..." : "Log Symptom"}
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-1/2">
                  <Link href="/healthcare">Cancel / Back</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
