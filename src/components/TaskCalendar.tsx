"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/lib/types/database";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

export default function TaskCalendar({
  tasks,
  onTaskSelect,
}: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (task.due_date) {
        const dateStr = new Date(task.due_date).toDateString();
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toDateString();
    return tasksByDate[dateStr] || [];
  }, [selectedDate, tasksByDate]);

  // Get dates that have tasks
  const datesWithTasks = useMemo(() => {
    return Object.keys(tasksByDate).map((dateStr) => new Date(dateStr));
  }, [tasksByDate]);

  // Custom day renderer to show task indicators
  const getDayContent = (date: Date) => {
    const dateStr = date.toDateString();
    const dayTasks = tasksByDate[dateStr] || [];
    const taskCount = dayTasks.length;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <span>{date.getDate()}</span>
        {taskCount > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {taskCount <= 3 ? (
              dayTasks.map((_, idx) => (
                <div key={idx} className="w-1 h-1 rounded-full bg-primary" />
              ))
            ) : (
              <span className="text-xs font-semibold text-primary">
                {taskCount}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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

      {/* Selected Date Tasks */}
      {selectedDate && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Tasks for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <div className="space-y-3">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => onTaskSelect?.(task)}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/60 rounded-lg cursor-pointer hover:bg-white/90 dark:hover:bg-gray-700/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    readOnly
                    className="w-5 h-5 rounded mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {task.description}
                      </p>
                    )}
                    {task.priority && (
                      <span
                        className={`inline-block text-xs font-semibold mt-1 px-2 py-1 rounded ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No tasks for this date
              </p>
            )}
          </div>
        </section>
      )}

      {/* Upcoming Tasks (Next 7 days) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Upcoming Tasks
        </h2>
        <div className="space-y-3">
          {tasks
            .filter((task) => {
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
            .map((task) => (
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
                  <p
                    className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                  >
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(task.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          {tasks.filter((task) => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return taskDate >= today && taskDate < nextWeek;
          }).length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming tasks
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
