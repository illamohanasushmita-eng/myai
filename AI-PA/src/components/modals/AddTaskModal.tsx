"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/lib/services/taskService";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  category?: string;
}

const CATEGORY_OPTIONS = [
  { id: "meeting", label: "Meeting" },
  { id: "project", label: "Project" },
  { id: "task", label: "Task" },
  { id: "note", label: "Note" },
  { id: "other", label: "Other" },
];

export function AddTaskModal({
  isOpen,
  onClose,
  onSuccess,
  category = "project",
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState(category.toLowerCase());
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      await createTask(userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: taskCategory,
        priority: priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: "pending",
        ai_generated: false,
        updated_at: new Date().toISOString(),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setTaskCategory(category.toLowerCase());
      setPriority("medium");
      setDueDate("");

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create task. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      setDescription("");
      setTaskCategory(category.toLowerCase());
      setPriority("medium");
      setDueDate("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New {taskCategory === "project" ? "Project" : "Task"}</DialogTitle>
          <DialogDescription>
            Create a new {taskCategory === "project" ? "project" : "task"} to track your work
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <Input
              id="title"
              placeholder={taskCategory === "project" ? "Enter project name" : "Enter task title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="rounded-lg min-h-[100px]"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
            >
              Category
            </label>
            <Select
              value={taskCategory}
              onValueChange={setTaskCategory}
              disabled={isLoading}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <Select
              value={priority}
              onValueChange={setPriority}
              disabled={isLoading}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="rounded-lg"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg">
              {isLoading ? "Creating..." : `Create ${taskCategory === "project" ? "Project" : "Task"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
