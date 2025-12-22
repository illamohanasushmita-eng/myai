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
  }) => {
    const getReminderTypeIcon = (type?: string) => {
      switch (type) {
        case "meeting":
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
            </svg>
          );
        case "call":
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
            </svg>
          );
        case "event":
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
            </svg>
          );
        default:
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
            </svg>
          );
      }
    };

    return (
      <div
        className={`group relative flex items-start gap-4 rounded-xl p-4 transition-all duration-200 ${
          isPastReminder
            ? "bg-white/40 dark:bg-gray-800/40 opacity-70"
            : "bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
        }`}
      >
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isPastReminder
              ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
          }`}
        >
          {getReminderTypeIcon(reminder.reminder_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-1 ${
              isPastReminder
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {reminder.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-4 h-4 ${isPastReminder ? "text-gray-400" : "text-primary"}`}
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
            </svg>
            <p
              className={`text-sm font-medium ${
                isPastReminder
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {formatTime(reminder.reminder_time)}
            </p>
          </div>
          {reminder.description && (
            <p
              className={`text-sm line-clamp-2 ${
                isPastReminder
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {reminder.description}
            </p>
          )}
          {reminder.reminder_type && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  isPastReminder
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {reminder.reminder_type}
              </span>
            </div>
          )}
        </div>
        {isPastReminder && (
          <div className="absolute top-4 right-4">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
          </div>
        )}
      </div>
    );
  },
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
    <div className="relative flex h-auto min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background-light font-sans dark:bg-background-dark">
      <div className="flex-grow pb-20">
        <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                fill="currentColor"
                height="24px"
                viewBox="0 0 256 256"
                width="24px"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-700 dark:text-gray-300"
              >
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Reminders
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"}
              </p>
            </div>
            <Link
              href="/reminders/add"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                fill="currentColor"
                height="24px"
                viewBox="0 0 256 256"
                width="24px"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-700 dark:text-gray-300"
              >
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
            </Link>
          </div>
        </header>
        <main className="p-4 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Loading reminders...
              </p>
            </div>
          )}

          {!loading &&
            upcomingReminders.length === 0 &&
            pastReminders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-primary"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No reminders yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  Stay on top of your schedule by creating your first reminder
                </p>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Link href="/reminders/add">Create Reminder</Link>
                </Button>
              </div>
            )}

          {!loading && upcomingReminders.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upcoming
                </h2>
                <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {upcomingReminders.length}
                </span>
              </div>
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
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Past
                </h2>
                <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {pastReminders.length}
                </span>
              </div>
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

      <VoiceAssistantWrapper />
      <BottomNav />
    </div>
  );
}
