"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import TaskCalendar from "@/components/TaskCalendar";
import { updateTask, deleteTask, getUserTasks } from "@/lib/services/taskService";
import { Task } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

// Memoized task item component to prevent unnecessary re-renders
const TaskItem = memo(({ task, onToggle, onDelete }: {
  task: Task;
  onToggle: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
}) => (
  <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/60 rounded-lg">
    <input
      type="checkbox"
      checked={task.status === "completed"}
      onChange={() => onToggle(task.task_id, task.status)}
      className="w-5 h-5 rounded"
    />
    <div className="flex-1">
      <p className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
        {task.title}
      </p>
      {task.description && <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>}
    </div>
    <button onClick={() => onDelete(task.task_id)} className="text-red-500 hover:text-red-700">
      Delete
    </button>
  </div>
));

TaskItem.displayName = "TaskItem";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        console.error('[TASKS-PAGE] No userId found in localStorage');
        return;
      }

      console.log('📝 [TASKS-PAGE] Fetching tasks for userId:', userId);

      const response = await fetch(`/api/tasks?userId=${userId}`);
      console.log('📝 [TASKS-PAGE] Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      console.log('📝 [TASKS-PAGE] Tasks fetched successfully:', {
        count: result.data?.length || 0,
        tasks: result.data,
      });
      setTasks(result.data || []);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
      console.error('❌ [TASKS-PAGE] Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Refetch tasks when refresh query param is set (for voice-created tasks)
  useEffect(() => {
    if (searchParams) {
      const refresh = searchParams.get('refresh');
      console.log('📝 [TASKS-PAGE] Checking refresh param:', refresh);
      if (refresh === 'true') {
        console.log('📝 [TASKS-PAGE] Refresh triggered, refetching tasks immediately...');
        // Task is already created in database by the time we navigate here
        // So we can refetch immediately without delay
        fetchTasks();
      }
    }
  }, [searchParams, fetchTasks]);

  // Refetch tasks when page comes into focus (for voice-created tasks)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📝 [TASKS-PAGE] Tasks page came into focus, refetching tasks...');
        fetchTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchTasks]);

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const handleToggleTask = useCallback(async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      // Optimistic update
      setTasks(prevTasks => prevTasks.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));
      // Then update on server
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      // Revert optimistic update on error
      setTasks(prevTasks => prevTasks.map(t => t.task_id === taskId ? { ...t, status: currentStatus } : t));
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      // Optimistic update
      setTasks(prevTasks => prevTasks.filter(t => t.task_id !== taskId));
      // Then delete on server
      await deleteTask(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      // Revert optimistic update on error - refetch tasks
      const userId = localStorage.getItem("userId");
      if (userId) {
        const userTasks = await getUserTasks(userId);
        setTasks(userTasks);
      }
    }
  }, []);

  // Memoize computed values to prevent recalculation on every render
  const { todayTasks, tomorrowTasks, completedCount } = useMemo(() => {
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    console.log('📝 [TASKS-PAGE] Filtering tasks:', {
      totalTasks: tasks.length,
      today,
      tomorrow: tomorrowStr,
    });

    const todayTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toDateString();
      const isToday = taskDate === today;
      if (isToday) {
        console.log('📝 [TASKS-PAGE] Found today task:', { title: t.title, due_date: t.due_date, taskDate });
      }
      return isToday;
    });

    const tomorrowTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toDateString();
      const isTomorrow = taskDate === tomorrowStr;
      if (isTomorrow) {
        console.log('📝 [TASKS-PAGE] Found tomorrow task:', { title: t.title, due_date: t.due_date, taskDate });
      }
      return isTomorrow;
    });

    const completedCount = tasks.filter(t => t.status === "completed").length;

    console.log('📝 [TASKS-PAGE] Filtering complete:', {
      todayCount: todayTasks.length,
      tomorrowCount: tomorrowTasks.length,
      completedCount,
    });

    return { todayTasks, tomorrowTasks, completedCount };
  }, [tasks]);

  return (
    <>
      <div className="relative flex h-auto min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background-light font-sans dark:bg-background-dark">
        <div className="flex-grow pb-20">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-300">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,68H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Zm176,120H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"></path>
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Task Management</h1>
            <div className="relative">
              <button className="text-gray-600 dark:text-gray-300">
                <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,16a2,2,0,1,0,2,2A2,2,0,0,0,12,16Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,12,10Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,12,4Z"></path>
                </svg>
              </button>
            </div>
          </header>
          <main className="p-4">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <section className="mb-6">
              <div className="mx-auto mb-6 flex w-fit rounded-lg bg-white/60 p-1 dark:bg-gray-700/60">
                <button onClick={() => setView('list')} className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${view === 'list' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                  List
                </button>
                <button onClick={() => setView('calendar')} className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${view === 'calendar' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                  Calendar
                </button>
              </div>
              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : view === 'list' && (
                <div>
                  <section className="mb-8">
                    <div className="mb-4">
                      <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Today's Progress</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-300">You've completed {completedCount} of {tasks.length} tasks.</p>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/70 dark:bg-gray-700">
                      <div className="h-2.5 rounded-full bg-primary" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}></div>
                    </div>
                  </section>
                  <section className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Today</h2>
                    <div className="space-y-4">
                      {todayTasks.length > 0 ? (
                        todayTasks.map(task => (
                          <TaskItem
                            key={task.task_id}
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        ))
                      ) : (
                        <p className="text-gray-500">No tasks for today</p>
                      )}
                    </div>
                  </section>
                  <section>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Tomorrow</h2>
                    <div className="space-y-4">
                      {tomorrowTasks.length > 0 ? (
                        tomorrowTasks.map(task => (
                          <TaskItem
                            key={task.task_id}
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        ))
                      ) : (
                        <p className="text-gray-500">No tasks for tomorrow</p>
                      )}
                    </div>
                  </section>
                </div>
              )}
              {view === 'calendar' && (
                <TaskCalendar tasks={tasks} />
              )}
            </section>
          </main>
        </div>

        <div className="fixed bottom-24 left-4 z-20">
          <Button asChild className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
            <Link href="/tasks/add">
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                </svg>
                <span className="text-sm font-semibold">Add New Task</span>
            </Link>
          </Button>
        </div>
        <VoiceAssistantWrapper />
        <BottomNav />
      </div>
    </>
  );
}
