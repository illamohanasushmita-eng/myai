"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import TaskCalendar from "@/components/TaskCalendar";
import {
  updateTask,
  deleteTask,
  getUserTasks,
} from "@/lib/services/taskService";
import { Task } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

// Memoized task item component to prevent unnecessary re-renders
const TaskItem = memo(
  ({
    task,
    onToggle,
    onDelete,
  }: {
    task: Task;
    onToggle: (taskId: string, status: string) => void;
    onDelete: (taskId: string) => void;
  }) => {
    const getPriorityColor = (priority?: string) => {
      switch (priority) {
        case "high":
          return "border-l-red-500";
        case "medium":
          return "border-l-yellow-500";
        case "low":
          return "border-l-green-500";
        default:
          return "border-l-gray-300";
      }
    };

    const getCategoryIcon = (category?: string) => {
      switch (category) {
        case "work":
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.36V200Z"></path>
            </svg>
          );
        case "personal":
          return (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
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
              <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z"></path>
            </svg>
          );
      }
    };

    return (
      <div
        className={`group relative flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${getPriorityColor(task.priority)}`}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={task.status === "completed"}
              onChange={() => onToggle(task.task_id, task.status)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-gray-500 dark:text-gray-400">
                {getCategoryIcon(task.category)}
              </div>
              <h3
                className={`font-semibold text-gray-900 dark:text-white ${task.status === "completed" ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
              >
                {task.title}
              </h3>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
                  </svg>
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {task.category && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                  {task.category}
                </span>
              )}
              {task.priority && (
                <span
                  className={`px-2 py-0.5 rounded-full capitalize ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(task.task_id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 hover:text-red-700 dark:hover:text-red-400"
          aria-label="Delete task"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
          </svg>
        </button>
      </div>
    );
  },
);

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
        console.error("[TASKS-PAGE] No userId found in localStorage");
        return;
      }

      console.log("📝 [TASKS-PAGE] Fetching tasks for userId:", userId);

      const response = await fetch(`/api/tasks?userId=${userId}`);
      console.log("📝 [TASKS-PAGE] Fetch response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const result = await response.json();
      console.log("📝 [TASKS-PAGE] Tasks fetched successfully:", {
        count: result.data?.length || 0,
        tasks: result.data,
      });
      setTasks(result.data || []);
      setError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
      console.error("❌ [TASKS-PAGE] Error fetching tasks:", err);
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
      const refresh = searchParams.get("refresh");
      console.log("📝 [TASKS-PAGE] Checking refresh param:", refresh);
      if (refresh === "true") {
        console.log(
          "📝 [TASKS-PAGE] Refresh triggered, refetching tasks immediately...",
        );
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
        console.log(
          "📝 [TASKS-PAGE] Tasks page came into focus, refetching tasks...",
        );
        fetchTasks();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchTasks]);

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const handleToggleTask = useCallback(
    async (taskId: string, currentStatus: string) => {
      try {
        const newStatus =
          currentStatus === "completed" ? "pending" : "completed";
        // Optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.task_id === taskId ? { ...t, status: newStatus } : t,
          ),
        );
        // Then update on server
        await updateTask(taskId, { status: newStatus });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        // Revert optimistic update on error
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.task_id === taskId ? { ...t, status: currentStatus } : t,
          ),
        );
      }
    },
    [],
  );

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      // Optimistic update
      setTasks((prevTasks) => prevTasks.filter((t) => t.task_id !== taskId));
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

    console.log("📝 [TASKS-PAGE] Filtering tasks:", {
      totalTasks: tasks.length,
      today,
      tomorrow: tomorrowStr,
    });

    const todayTasks = tasks.filter((t) => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toDateString();
      const isToday = taskDate === today;
      if (isToday) {
        console.log("📝 [TASKS-PAGE] Found today task:", {
          title: t.title,
          due_date: t.due_date,
          taskDate,
        });
      }
      return isToday;
    });

    const tomorrowTasks = tasks.filter((t) => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toDateString();
      const isTomorrow = taskDate === tomorrowStr;
      if (isTomorrow) {
        console.log("📝 [TASKS-PAGE] Found tomorrow task:", {
          title: t.title,
          due_date: t.due_date,
          taskDate,
        });
      }
      return isTomorrow;
    });

    const completedCount = tasks.filter((t) => t.status === "completed").length;

    console.log("📝 [TASKS-PAGE] Filtering complete:", {
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
                  Tasks
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>
              <Link
                href="/tasks/add"
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

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setView("list")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    view === "list"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                  </svg>
                  List
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    view === "calendar"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path>
                  </svg>
                  Calendar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading tasks...
                </p>
              </div>
            ) : (
              <>
                {view === "list" && (
                  <div className="space-y-6">
                    {tasks.length > 0 && (
                      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              Progress Overview
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {completedCount} of {tasks.length} tasks completed
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                              {tasks.length > 0
                                ? Math.round((completedCount / tasks.length) * 100)
                                : 0}
                              %
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Complete
                            </p>
                          </div>
                        </div>
                        <div className="relative h-3 w-full rounded-full bg-white/50 dark:bg-gray-700/50 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </section>
                    )}

                    {todayTasks.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Today
                          </h2>
                          <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {todayTasks.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {todayTasks.map((task) => (
                            <TaskItem
                              key={task.task_id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {tomorrowTasks.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Tomorrow
                          </h2>
                          <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {tomorrowTasks.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {tomorrowTasks.map((task) => (
                            <TaskItem
                              key={task.task_id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-12 h-12 text-gray-400 dark:text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No tasks yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                          Start organizing your day by creating your first task
                        </p>
                        <Button
                          asChild
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <Link href="/tasks/add">Create Task</Link>
                        </Button>
                      </div>
                    )}

                    {todayTasks.length === 0 &&
                      tomorrowTasks.length === 0 &&
                      tasks.length > 0 && (
                        <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <p className="text-gray-600 dark:text-gray-400">
                            No tasks scheduled for today or tomorrow
                          </p>
                        </div>
                      )}
                  </div>
                )}
                {view === "calendar" && <TaskCalendar tasks={tasks} />}
              </>
            )}
          </main>
        </div>


        <VoiceAssistantWrapper />
        <BottomNav />
      </div>
    </>
  );
}
