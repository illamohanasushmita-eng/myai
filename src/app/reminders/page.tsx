"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useSearchParams } from "next/navigation";
import { Reminder } from "@/lib/types/database";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

// Memoized reminder item component
const ReminderItem = memo(
  ({
    reminder,
    formatTime,
    isPast: isPastReminder,
  }: {
    reminder: Reminder;
    formatTime: (dateString: string) => string;
    isPast: boolean;
  }) => (
    <div
      className={`flex items-center gap-4 rounded-lg backdrop-blur-sm p-3 shadow-sm ${isPastReminder ? "bg-white/50 opacity-60" : "bg-white/70"}`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${isPastReminder ? "bg-gray-400/20 text-gray-600" : "bg-blue-500/20 text-blue-600"}`}
      >
        <svg
          fill="currentColor"
          height="24px"
          viewBox="0 0 256 256"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M208 32H184V24a8 8 0 0 0-16 0v8H88V24a8 8 0 0 0-16 0v8H48A16 16 0 0 0 32 48v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16ZM72 48v8a8 8 0 0 0 16 0V48h80v8a8 8 0 0 0 16 0V48h24v32H48V48Zm136 160H48V96h160v112Z"></path>
        </svg>
      </div>
      <div>
        <p className="font-medium text-gray-800">{reminder.title}</p>
        <p className="text-sm text-gray-600">
          {formatTime(reminder.reminder_time)}
        </p>
        {reminder.description && (
          <p className="text-xs text-gray-500 mt-1">{reminder.description}</p>
        )}
      </div>
    </div>
  ),
);

ReminderItem.displayName = "ReminderItem";

export default function RemindersPage() {
  const searchParams = useSearchParams();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch reminders function
  const fetchReminders = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      console.log("[REMINDERS-PAGE] Fetching reminders for userId:", userId);

      const response = await fetch(`/api/reminders?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reminders");
      }

      const result = await response.json();
      console.log("[REMINDERS-PAGE] Reminders fetched:", result.data);
      setReminders(result.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load reminders";
      setError(errorMessage);
      console.error("[REMINDERS-PAGE] Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Add reminder optimistically to the list
  const addReminderOptimistically = useCallback((reminder: Reminder) => {
    console.log(
      "📌 [REMINDERS-PAGE] Adding reminder optimistically:",
      reminder,
    );
    setReminders((prevReminders) => {
      // Check if reminder already exists (avoid duplicates)
      const exists = prevReminders.some(
        (r) => r.reminder_id === reminder.reminder_id,
      );
      if (exists) {
        console.log("📌 [REMINDERS-PAGE] Reminder already exists, skipping");
        return prevReminders;
      }
      // Add new reminder to the list
      return [reminder, ...prevReminders];
    });
  }, []);

  // Store the function on window so voice assistant can access it
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__addReminderOptimistically = addReminderOptimistically;
      console.log(
        "📌 [REMINDERS-PAGE] Stored addReminderOptimistically on window",
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__addReminderOptimistically;
      }
    };
  }, [addReminderOptimistically]);

  // Refetch reminders when refresh query param is set (for voice-created reminders)
  useEffect(() => {
    if (searchParams) {
      const refresh = searchParams.get("refresh");
      console.log("📌 [REMINDERS-PAGE] Checking refresh param:", refresh);
      if (refresh === "true") {
        console.log(
          "📌 [REMINDERS-PAGE] Refresh triggered, refetching reminders...",
        );
        // Add a small delay to ensure the database has been updated
        setTimeout(() => {
          fetchReminders();
        }, 500);
      }
    }
  }, [searchParams, fetchReminders]);

  // Refetch reminders when page comes into focus (for voice-created reminders)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log(
          "📌 Reminders page came into focus, refetching reminders...",
        );
        fetchReminders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchReminders]);

  // Memoize reminder filtering and formatting
  const { upcomingReminders, pastReminders } = useMemo(() => {
    const upcoming = reminders.filter(
      (r) => !isPast(new Date(r.reminder_time)),
    );
    const past = reminders.filter((r) => isPast(new Date(r.reminder_time)));
    return { upcomingReminders: upcoming, pastReminders: past };
  }, [reminders]);

  const formatReminderTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  }, []);

  return (
    <div className="font-display flex h-auto min-h-screen w-full flex-col bg-[#D6EAF8]">
      <div className="flex-grow pb-20">
        <header className="flex items-center bg-transparent p-4 pb-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-800"
          >
            <Link href="/dashboard">
              <svg
                fill="currentColor"
                height="24"
                viewBox="0 0 256 256"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8Z"></path>
              </svg>
            </Link>
          </Button>
          <h1 className="flex-1 text-center text-xl font-bold text-gray-800 pr-10">
            Reminders
          </h1>
        </header>
        <main className="px-4">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-medium">❌ {error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading reminders...</p>
            </div>
          )}

          {!loading &&
            upcomingReminders.length === 0 &&
            pastReminders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No reminders yet</p>
                <Button asChild>
                  <Link href="/reminders/add">Create your first reminder</Link>
                </Button>
              </div>
            )}

          {!loading && upcomingReminders.length > 0 && (
            <section className="py-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <ReminderItem
                    key={reminder.reminder_id}
                    reminder={reminder}
                    formatTime={formatReminderTime}
                    isPast={false}
                  />
                ))}
              </div>
            </section>
          )}

          {!loading && pastReminders.length > 0 && (
            <section className="py-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Past</h2>
              <div className="space-y-3">
                {pastReminders.map((reminder) => (
                  <ReminderItem
                    key={reminder.reminder_id}
                    reminder={reminder}
                    formatTime={formatReminderTime}
                    isPast={true}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <div className="fixed bottom-24 left-4 z-20">
        <Button
          asChild
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 h-16 w-16"
        >
          <Link href="/reminders/add">
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </Button>
      </div>
      <VoiceAssistantWrapper />
      <BottomNav />
    </div>
  );
}
