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
  getUserAppointments,
  updateAppointment,
} from "@/lib/services/healthRecordService";
import { Appointment } from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const STATUS_OPTIONS = [
  { id: "scheduled", label: "Scheduled" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

interface EditAppointmentPageProps {
  params: Promise<{
    appointmentId: string;
  }>;
}

export default function EditAppointmentPage({
  params,
}: EditAppointmentPageProps) {
  const { appointmentId } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [location, setLocation] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Load appointment data
  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          router.push("/signin");
          return;
        }

        const appointments = await getUserAppointments(userId);
        const foundAppointment = appointments.find(
          (a) => a.appointment_id === appointmentId,
        );

        if (!foundAppointment) {
          toast({
            title: "Appointment not found",
            description: "The appointment you're trying to edit doesn't exist.",
            variant: "destructive",
          });
          router.push("/healthcare");
          return;
        }

        setAppointment(foundAppointment);
        setTitle(foundAppointment.title);
        setDoctorName(foundAppointment.doctor_name || "");
        setClinicName(foundAppointment.clinic_name || "");
        setLocation(foundAppointment.location || "");
        setDurationMinutes(foundAppointment.duration_minutes?.toString() || "");
        setNotes(foundAppointment.notes || "");
        setStatus(foundAppointment.status || "scheduled");

        // Split date and time
        const dateTime = new Date(foundAppointment.appointment_date);
        setAppointmentDate(dateTime.toISOString().split("T")[0]);
        setAppointmentTime(dateTime.toTimeString().slice(0, 5));
      } catch (error) {
        console.error("Error loading appointment:", error);
        toast({
          title: "Error loading appointment",
          description: "Failed to load appointment data.",
          variant: "destructive",
        });
      }
    };

    loadAppointment();
  }, [appointmentId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Appointment title is required");
      return;
    }

    if (!appointmentDate) {
      setError("Appointment date is required");
      return;
    }

    if (!appointmentTime) {
      setError("Appointment time is required");
      return;
    }

    try {
      setIsLoading(true);

      // Combine date and time into ISO string
      const dateTimeString = `${appointmentDate}T${appointmentTime}:00`;
      const appointmentDateTime = new Date(dateTimeString).toISOString();

      await updateAppointment(appointmentId, {
        title: title.trim(),
        doctor_name: doctorName.trim() || undefined,
        clinic_name: clinicName.trim() || undefined,
        appointment_date: appointmentDateTime,
        duration_minutes: durationMinutes
          ? parseInt(durationMinutes)
          : undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        status: status,
      });

      toast({
        title: "Appointment updated successfully",
        description: "Your appointment has been updated.",
      });

      router.push("/healthcare");
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update appointment. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading appointment...</p>
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
        <h1 className="text-lg font-bold">Edit Appointment</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Appointment Title *</label>
            <Input
              placeholder="e.g., Annual Checkup, Dentist Visit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor Name</label>
              <Input
                placeholder="e.g., Dr. Smith"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Clinic/Hospital</label>
              <Input
                placeholder="e.g., City Medical Center"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time *</label>
              <Input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Address or room number"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="e.g., 30, 60"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Any additional information..."
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

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Appointment"}
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
