"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createTask } from "@/lib/services/taskService";
import { useRouter } from "next/navigation";

export default function AddTaskPage() {
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get user ID from localStorage (you should use proper auth context)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Optimistic navigation - redirect immediately for better UX
      // The task will be created in the background
      const taskPromise = createTask(userId, {
        title,
        description,
        due_date: date ? date.toISOString() : undefined,
        category,
        status: "pending",
        priority: "medium",
        updated_at: new Date().toISOString(),
        ai_generated: false,
      });

      // Navigate immediately for perceived speed improvement
      router.push("/tasks");

      // Wait for the task to be created
      await taskPromise;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
        <Button asChild variant="ghost" size="icon">
          <Link href="/tasks">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Add New Task</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Finish project proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <Textarea
              id="description"
              placeholder="Add more details about your task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <Select>
              <SelectTrigger className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-1/2">
              {loading ? "Saving..." : "Save Task"}
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-1/2" disabled={loading}>
              <Link href="/tasks">Cancel / Back</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
