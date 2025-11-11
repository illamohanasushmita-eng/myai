
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createReminderViaAPI } from "@/lib/services/reminderApiService";

export default function AddReminderPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("09:00");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [reminderType, setReminderType] = useState<string>("notification");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Validate required fields
      if (!title.trim()) {
        setError("Reminder title is required");
        return;
      }

      if (!date) {
        setError("Please select a date");
        return;
      }

      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number);
      const reminderDateTime = new Date(date);
      reminderDateTime.setHours(hours, minutes, 0, 0);

      console.log('[ADD-REMINDER] Submitting reminder:', {
        title,
        date: date.toISOString(),
        time,
        reminderDateTime: reminderDateTime.toISOString(),
      });

      // Create reminder via API
      const reminderPromise = createReminderViaAPI(userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        reminder_time: reminderDateTime.toISOString(),
        reminder_type: reminderType,
        status: "pending",
        is_recurring: isRecurring,
      });

      console.log('[ADD-REMINDER] Reminder created successfully');

      // Optimistic navigation - redirect immediately for better UX
      router.push("/reminders");

      // Wait for the reminder to be created
      await reminderPromise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create reminder";
      setError(errorMessage);
      console.error('[ADD-REMINDER] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
        <Button asChild variant="ghost" size="icon">
          <Link href="/reminders">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Add New Reminder</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reminder Title *</label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Call the doctor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <Input
              id="description"
              type="text"
              placeholder="Optional details about the reminder"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  disabled={loading}
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-lg border-gray-300 bg-white/70 hover:bg-white/90 dark:border-gray-600 dark:bg-gray-700/60 dark:hover:bg-gray-700/80",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time *</label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="reminder-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reminder Type</label>
            <select
              id="reminder-type"
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            >
              <option value="notification">Notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              disabled={loading}
              className="rounded border-gray-300"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">Recurring Reminder</label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-1/2"
            >
              {loading ? "Saving..." : "Save Reminder"}
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-1/2">
              <Link href="/reminders">Cancel / Back</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

