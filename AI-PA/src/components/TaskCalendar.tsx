"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/lib/types/database";
import { FestivalEvent } from "@/lib/types/festival";
import { getFestivals, toggleFestivalReminder } from "@/lib/services/festivalService";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Bell, BellOff } from "lucide-react";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

// Festival category icons
const FESTIVAL_ICONS: Record<string, string> = {
  national: "🇮🇳",
  religious: "🙏",
  observance: "📅",
  cultural: "🎨",
  custom: "⭐",
};

// Combined event type for calendar display
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'task' | 'festival';
  category?: string;
  priority?: string;
  status?: string;
  reminder_enabled?: boolean;
}

export default function TaskCalendar({ tasks, onTaskSelect }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [festivals, setFestivals] = useState<FestivalEvent[]>([]);
  const [showFestivals, setShowFestivals] = useState<boolean>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showFestivals');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [loadingFestivals, setLoadingFestivals] = useState(false);
  const [togglingReminder, setTogglingReminder] = useState<string | null>(null);

  // Fetch festivals when component mounts or when calendar month changes
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoadingFestivals(true);
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        // Get current month range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const festivalData = await getFestivals(userId, {
          country: 'IN',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          isActive: true,
        });

        setFestivals(festivalData);
      } catch (error) {
        // Silently fail if festival table doesn't exist yet
        console.warn('Festival feature not available yet. Deploy the festival schema to enable it.');
        setFestivals([]);
      } finally {
        setLoadingFestivals(false);
      }
    };

    fetchFestivals();
  }, []);

  // Save showFestivals preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showFestivals', String(showFestivals));
    }
  }, [showFestivals]);

  // Combine tasks and festivals into calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add tasks
    tasks.forEach(task => {
      if (task.due_date) {
        events.push({
          id: task.task_id,
          title: task.title,
          description: task.description,
          date: task.due_date,
          type: 'task',
          category: task.category,
          priority: task.priority,
          status: task.status,
        });
      }
    });

    // Add festivals if enabled
    if (showFestivals) {
      festivals.forEach(festival => {
        events.push({
          id: festival.id,
          title: festival.name,
          description: festival.description || undefined,
          date: festival.event_date,
          type: 'festival',
          category: festival.category,
          reminder_enabled: festival.reminder_enabled,
        });
      });
    }

    return events;
  }, [tasks, festivals, showFestivals]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    calendarEvents.forEach(event => {
      const dateStr = new Date(event.date).toDateString();
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });

    return grouped;
  }, [calendarEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toDateString();
    return eventsByDate[dateStr] || [];
  }, [selectedDate, eventsByDate]);

  // Separate tasks and festivals for selected date
  const { selectedDateTasks, selectedDateFestivals } = useMemo(() => {
    const tasks = selectedDateEvents.filter(e => e.type === 'task');
    const festivals = selectedDateEvents.filter(e => e.type === 'festival');
    return { selectedDateTasks: tasks, selectedDateFestivals: festivals };
  }, [selectedDateEvents]);

  // Handle festival reminder toggle
  const handleToggleReminder = async (festivalId: string, currentEnabled: boolean) => {
    try {
      setTogglingReminder(festivalId);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Optimistic update
      setFestivals(prev => prev.map(f =>
        f.id === festivalId ? { ...f, reminder_enabled: !currentEnabled } : f
      ));

      await toggleFestivalReminder(userId, festivalId, !currentEnabled);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      // Revert on error
      setFestivals(prev => prev.map(f =>
        f.id === festivalId ? { ...f, reminder_enabled: currentEnabled } : f
      ));
    } finally {
      setTogglingReminder(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Festival Toggle */}
        <div className="rounded-xl bg-card-light p-4 shadow-md dark:bg-card-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Show Festivals
              </span>
              {loadingFestivals && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Loading...)
                </span>
              )}
            </div>
            <Switch
              checked={showFestivals}
              onCheckedChange={setShowFestivals}
            />
          </div>
          {!loadingFestivals && festivals.length === 0 && showFestivals && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              ℹ️ No festivals available. Deploy the festival schema to enable this feature.
            </p>
          )}
        </div>

        {/* Calendar */}
        <div className="rounded-xl bg-card-light p-4 shadow-md dark:bg-card-dark">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => false}
            className="w-full"
          />
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>

            {/* Festivals for selected date */}
            {selectedDateFestivals.length > 0 && (
              <div className="mb-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Festivals & Events
                </h3>
                {selectedDateFestivals.map(festival => {
                  const icon = FESTIVAL_ICONS[festival.category || 'custom'] || '📅';

                  return (
                    <Tooltip key={festival.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-start gap-3 p-4 bg-orange-50/70 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-50/90 dark:hover:bg-orange-900/30 transition-colors">
                          <span className="text-2xl">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {festival.title}
                            </p>
                            {festival.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {festival.description}
                              </p>
                            )}
                            <span className="inline-block text-xs font-semibold mt-1 px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              {festival.category}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleReminder(festival.id, festival.reminder_enabled || false);
                            }}
                            disabled={togglingReminder === festival.id}
                            className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                          >
                            {festival.reminder_enabled ? (
                              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            ) : (
                              <BellOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-semibold">{festival.title}</p>
                          {festival.description && (
                            <p className="text-sm mt-1">{festival.description}</p>
                          )}
                          <p className="text-xs mt-2 text-gray-500">
                            Category: {festival.category}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">
                            {festival.reminder_enabled
                              ? 'Click bell to disable reminder'
                              : 'Click bell to enable reminder'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Tasks for selected date */}
            {selectedDateTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tasks
                </h3>
                {selectedDateTasks.map(task => {
                  // Find the original task object
                  const originalTask = tasks.find(t => t.task_id === task.id);
                  if (!originalTask) return null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskSelect?.(originalTask)}
                      className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/60 rounded-lg cursor-pointer hover:bg-white/90 dark:hover:bg-gray-700/80 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        readOnly
                        className="w-5 h-5 rounded mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {task.description}
                          </p>
                        )}
                        {task.priority && (
                          <span className={`inline-block text-xs font-semibold mt-1 px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No events message */}
            {selectedDateTasks.length === 0 && selectedDateFestivals.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No events for this date</p>
            )}
          </section>
        )}

        {/* Upcoming Events (Next 7 days) */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Upcoming Events
          </h2>

          {/* Upcoming Festivals */}
          {showFestivals && festivals.filter(festival => {
            const festivalDate = new Date(festival.event_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return festivalDate >= today && festivalDate < nextWeek;
          }).length > 0 && (
            <div className="mb-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Festivals
              </h3>
              {festivals
                .filter(festival => {
                  const festivalDate = new Date(festival.event_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const nextWeek = new Date(today);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  return festivalDate >= today && festivalDate < nextWeek;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.event_date).getTime();
                  const dateB = new Date(b.event_date).getTime();
                  return dateA - dateB;
                })
                .map(festival => {
                  const icon = FESTIVAL_ICONS[festival.category] || '📅';

                  return (
                    <Tooltip key={festival.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-start gap-3 p-4 bg-orange-50/70 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <span className="text-2xl">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {festival.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(festival.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleReminder(festival.id, festival.reminder_enabled);
                            }}
                            disabled={togglingReminder === festival.id}
                            className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                          >
                            {festival.reminder_enabled ? (
                              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            ) : (
                              <BellOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-semibold">{festival.name}</p>
                          {festival.description && (
                            <p className="text-sm mt-1">{festival.description}</p>
                          )}
                          <p className="text-xs mt-2 text-gray-500">
                            Category: {festival.category}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">
                            {festival.reminder_enabled
                              ? 'Click bell to disable reminder'
                              : 'Click bell to enable reminder'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
          )}

          {/* Upcoming Tasks */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tasks
            </h3>
            {tasks
              .filter(task => {
                if (!task.due_date) return false;
                const taskDate = new Date(task.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                return taskDate >= today && taskDate < nextWeek;
              })
              .sort((a, b) => {
                const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
                const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
                return dateA - dateB;
              })
              .map(task => (
                <div
                  key={task.task_id}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/60 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    readOnly
                    className="w-5 h-5 rounded mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {tasks.filter(task => {
              if (!task.due_date) return false;
              const taskDate = new Date(task.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const nextWeek = new Date(today);
              nextWeek.setDate(nextWeek.getDate() + 7);
              return taskDate >= today && taskDate < nextWeek;
            }).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No upcoming tasks</p>
            )}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

