'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
import { getUserProfessionalNotes } from "@/lib/services/professionalService";
import { getTasksByCategory } from "@/lib/services/taskService";
import { ProfessionalNote, Task } from "@/lib/types/database";

export default function ProfessionalPage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [notes, setNotes] = useState<ProfessionalNote[]>([]);
  const [professionalTasks, setProfessionalTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch professional notes and tasks
  const loadData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch professional notes
      const fetchedNotes = await getUserProfessionalNotes(userId);
      setNotes(fetchedNotes);

      // Fetch professional tasks
      const fetchedTasks = await getTasksByCategory(userId, 'professional');
      setProfessionalTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading professional data:', error);
      setNotes([]);
      setProfessionalTasks([]);
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

  // Helper function to get priority color based on category
  const getPriorityColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'meeting':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Meeting' };
      case 'project':
        return { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Project' };
      case 'task':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Task' };
      case 'note':
        return { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Note' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Other' };
    }
  };

  // Filter notes into meetings and tasks
  const meetings = notes.filter(note => note.category?.toLowerCase() === 'meeting');
  const tasks = notes.filter(note => note.category?.toLowerCase() !== 'meeting');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button asChild variant="ghost" size="icon" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10">
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
              <Link href="#" className="text-primary font-semibold text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-3">
                  <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400">
                    dynamic_feed
                  </span>
                </div>
                <h3 className="font-semibold">Project Phoenix</h3>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  Due: 25 Oct 2023
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 mb-3">
                  <span className="material-symbols-outlined text-teal-500 dark:text-teal-400">
                    bar_chart
                  </span>
                </div>
                <h3 className="font-semibold">Q4 Analytics</h3>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  Due: 15 Nov 2023
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>
            </div>
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
                      {index > 0 && <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>}
                      <div className="flex items-center gap-4 py-2">
                        <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-primary/10 rounded-lg">
                          <span className="text-primary font-bold text-sm">--:--</span>
                          <span className="text-primary text-xs">--</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {meeting.title}
                          </h3>
                          {meeting.content && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                              {meeting.content}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10">
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
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Priority Tasks</h2>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-md frosted-glass border border-white/30 dark:border-white/10">
              {isLoading ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading tasks...
                </div>
              ) : (professionalTasks.length === 0 && tasks.length === 0) ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No tasks yet. Create your first one!
                </div>
              ) : (
                <>
                  {/* Display professional tasks from tasks table */}
                  {professionalTasks.map((task, index) => (
                    <div key={task.task_id}>
                      {index > 0 && <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>}
                      <div className="p-4">
                        <div className="flex items-center">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              id={task.task_id}
                              checked={task.status === 'completed'}
                              className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary/50"
                            />
                            <label
                              htmlFor={task.task_id}
                              className={`text-foreground-light dark:text-foreground-dark flex-1 ${
                                task.status === 'completed' ? 'line-through text-subtle-light dark:text-subtle-dark' : ''
                              }`}
                            >
                              {task.title}
                            </label>
                          </div>
                          <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2 ml-8">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Display professional notes */}
                  {tasks.map((task, index) => {
                    const colors = getPriorityColor(task.category);
                    return (
                      <div key={task.note_id}>
                        {(professionalTasks.length > 0 || index > 0) && <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>}
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                id={task.note_id}
                                className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary/50"
                              />
                              <label
                                htmlFor={task.note_id}
                                className="text-foreground-light dark:text-foreground-dark peer-data-[state=checked]:line-through peer-data-[state=checked]:text-subtle-light dark:peer-data-[state=checked]:text-subtle-dark flex-1"
                              >
                                {task.title}
                              </label>
                            </div>
                            <span className={`ml-auto text-xs font-medium ${colors.text} ${colors.bg} px-2 py-1 rounded-full whitespace-nowrap`}>
                              {colors.label}
                            </span>
                          </div>
                          {task.content && (
                            <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2 ml-8">
                              {task.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div className="border-t border-border-light/50 dark:border-border-dark/50"></div>
              <div className="p-4">
                <Button
                  onClick={() => setIsAddTaskOpen(true)}
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    add
                  </span>
                  <span>Add New Task</span>
                </Button>
              </div>
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
        <Button asChild size="icon" className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
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
        category="Professional"
      />

      <BottomNav />
    </div>
  );
}
