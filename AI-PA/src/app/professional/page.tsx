"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
import { getUserProfessionalNotes } from "@/lib/services/professionalService";
import { getTasksByCategory, updateTask } from "@/lib/services/taskService";
import { ProfessionalNote, Task } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

export default function ProfessionalPage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [notes, setNotes] = useState<ProfessionalNote[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Fetch professional notes and tasks
  const loadData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.log("User not authenticated");
        setIsLoading(false);
        return;
      }

      // Fetch professional notes
      const fetchedNotes = await getUserProfessionalNotes(userId);
      setNotes(fetchedNotes);

      // Fetch project tasks
      const fetchedProjects = await getTasksByCategory(userId, "project");
      setProjectTasks(fetchedProjects);
    } catch (error) {
      console.error("Error loading professional data:", error);
      setNotes([]);
      setProjectTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const handleTaskAdded = () => {
    // Refresh data after adding a new task
    loadData();
  };

  // Toggle project expansion
  const toggleProjectExpansion = (projectName: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  // Handle task checkbox toggle with optimistic updates
  const handleToggleTask = useCallback(
    async (taskId: string, currentStatus: string) => {
      try {
        const newStatus = currentStatus === "completed" ? "pending" : "completed";

        // Optimistic update for project tasks
        setProjectTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.task_id === taskId ? { ...t, status: newStatus } : t
          )
        );

        // Update on server
        await updateTask(taskId, { status: newStatus });
      } catch (err) {
        console.error("Failed to update task:", err);

        // Revert optimistic update on error
        setProjectTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.task_id === taskId ? { ...t, status: currentStatus } : t
          )
        );
      }
    },
    []
  );

  // Group project tasks by project name (using title as project identifier)
  const groupedProjects = projectTasks.reduce((acc, task) => {
    const projectName = task.title;
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get unique projects with their completion percentages
  const activeProjects = Object.entries(groupedProjects).map(([projectName, tasks]) => {
    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const totalCount = tasks.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      name: projectName,
      tasks,
      dueDate: tasks[0]?.due_date,
      percentage,
      totalTasks: totalCount,
      completedTasks: completedCount,
    };
  });

  // Filter notes to get meetings
  const meetings = notes.filter(
    (note) => note.category?.toLowerCase() === "meeting",
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
          >
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                arrow_back_ios_new
              </span>
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">Professional</h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Manage your work life
            </p>
          </div>
          <div className="w-12 h-12"></div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6 pt-4">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Active Projects</h2>
              <Link href="/tasks" className="text-primary font-semibold text-sm">
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    folder_open
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">No Active Projects</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                  Create your first project to get started!
                </p>
                <Button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-xl mr-2">add</span>
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.map((project, index) => {
                  const colors = [
                    { bg: "bg-indigo-100 dark:bg-indigo-900/50", text: "text-indigo-500 dark:text-indigo-400", bar: "bg-indigo-500", icon: "dynamic_feed" },
                    { bg: "bg-teal-100 dark:bg-teal-900/50", text: "text-teal-500 dark:text-teal-400", bar: "bg-teal-500", icon: "bar_chart" },
                    { bg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-500 dark:text-purple-400", bar: "bg-purple-500", icon: "rocket_launch" },
                    { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-500 dark:text-amber-400", bar: "bg-amber-500", icon: "lightbulb" },
                  ];
                  const color = colors[index % colors.length];
                  const isExpanded = expandedProjects.has(project.name);

                  return (
                    <div
                      key={project.name}
                      className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 overflow-hidden transition-all duration-300"
                    >
                      {/* Project Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => toggleProjectExpansion(project.name)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${color.bg} flex-shrink-0`}>
                            <span className={`material-symbols-outlined ${color.text}`}>
                              {color.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate" title={project.name}>
                              {project.name}
                            </h3>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                              {project.dueDate
                                ? `Due: ${new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                : `${project.completedTasks}/${project.totalTasks} tasks completed`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {project.percentage}%
                              </p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                Complete
                              </p>
                            </div>
                            <span className={`material-symbols-outlined text-subtle-light dark:text-subtle-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                          <div
                            className={`${color.bar} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${project.percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Expandable Task List */}
                      {isExpanded && (
                        <div className="border-t border-border-light/50 dark:border-border-dark/50">
                          <div className="p-4 space-y-3">
                            {project.tasks.map((task) => (
                              <div
                                key={task.task_id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              >
                                <Checkbox
                                  id={task.task_id}
                                  checked={task.status === "completed"}
                                  onCheckedChange={() => handleToggleTask(task.task_id, task.status || "pending")}
                                  className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary/50 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={task.task_id}
                                    className={`text-sm font-medium cursor-pointer block ${
                                      task.status === "completed"
                                        ? "line-through text-subtle-light dark:text-subtle-dark"
                                        : "text-foreground-light dark:text-foreground-dark"
                                    }`}
                                    onClick={() => handleToggleTask(task.task_id, task.status || "pending")}
                                  >
                                    {task.title}
                                  </label>
                                  {task.description && (
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {task.due_date && (
                                      <span className="text-xs text-subtle-light dark:text-subtle-dark flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">
                                          calendar_today
                                        </span>
                                        {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    )}
                                    {task.priority && (
                                      <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                          task.priority === "high"
                                            ? "bg-red-500/10 text-red-500"
                                            : task.priority === "medium"
                                              ? "bg-amber-500/10 text-amber-500"
                                              : "bg-green-500/10 text-green-500"
                                        }`}
                                      >
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-border-light/50 dark:border-border-dark/50 p-3">
                            <Button
                              onClick={() => setIsAddTaskOpen(true)}
                              variant="ghost"
                              size="sm"
                              className="w-full flex items-center justify-center gap-2 text-primary hover:bg-primary/10"
                            >
                              <span className="material-symbols-outlined text-lg">add</span>
                              <span className="text-sm font-medium">Add Task to Project</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              {isLoading ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading meetings...
                </div>
              ) : meetings.length === 0 ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No upcoming meetings. Create one to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting, index) => (
                    <div key={meeting.note_id}>
                      {index > 0 && (
                        <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>
                      )}
                      <div className="flex items-center gap-4 py-2">
                        <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-primary/10 rounded-lg">
                          <span className="text-primary font-bold text-sm">
                            --:--
                          </span>
                          <span className="text-primary text-xs">--</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{meeting.title}</h3>
                          {meeting.content && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              {meeting.content}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10"
                        >
                          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                            videocam
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                  <Image
                    alt="Slack"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaQ0CvfCsSVmZQ6FjhD6ZxYx9pEIp6isWj4qFedgf7SrIXBlAiGpbFCYb9H3zSNf3cZbEqB8FoaHevVUAhv7Plx-Bp9hShbdVA1E-Z_NglJkP4lgouOAdtXtmICm-oTbpxGGNKBi27zWg6xJvHj1O1JawQUyQBUExcF1ytoj6WC54OwUreMouoYnpHtHBH2fu53RXaO2RakAGVTZSMNNy34fvqi9vTz7lRDLthFjFeyixuAEZPDl6hEd6Ca53JywtHUynnbWfBvw"
                  />
                </div>
                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                  Slack
                </span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                  <Image
                    alt="Notion"
                    className="h-8 w-8"
                    width={32}
                    height={32}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXrN2Fxqaa551rlU4_reFkp1QtKZU_nzwrHR4iOrVtdCwCoWxtmuETetsh6qJD2gAjLiW63gjRFcFrhOR_IGJmHLUPE91-Judde-WCncXoLyrf2deQRRT03qY7UhNPyC9yjfzcztAnJ7vv9QJ8J-M9ef_wxDqLzzwe1u8zJOQsaU-HUs9C7grjPxRBhYIcxKj-cECfdytYYbfS4vjoFz9LwbCBxLshRYRy8cx2EHkDO1fDek82VVdOClZBkj86C98-fKuj8P1ieQ"
                  />
                </div>
                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                  Notion
                </span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                  <Image
                    alt="Github"
                    className="h-8 w-8 dark:invert"
                    width={32}
                    height={32}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAajTczrhubctbRrF8-npMedEG1tLiw31blNarL9skHLVZ91ZTwdjccBP-roodZ2nAIvAmO3zCfdVhZKvHd7XWDtc6R2GxOVKGlreXSzw5lBI7a4J9yt-XgrhcC6PTltWQaca9-AR5OsWdikym2zc-Ico3rp-OxbDA7U2ip8gBV1TH8A5uPUG9jsFA-g2AXC7fCdE2YfP7Radzmz1wiPU1ssIkn9WceVaBmdgzga8rg0sV8V1i4DXW39Z0gXReCg47BhF-OAL1N9A"
                  />
                </div>
                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                  Github
                </span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl">
                    add
                  </span>
                </div>
                <span className="text-xs text-subtle-light dark:text-subtle-dark">
                  Add New
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-20 right-6 z-20">
        <Button
          asChild
          size="icon"
          className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300"
        >
          <Link href="/tasks/add">
            <span className="material-symbols-outlined text-4xl">add</span>
          </Link>
        </Button>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSuccess={handleTaskAdded}
        category="Project"
      />

      <VoiceAssistantWrapper />
      <BottomNav />
    </div>
  );
}
