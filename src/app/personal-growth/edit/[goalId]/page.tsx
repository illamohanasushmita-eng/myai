"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getUserGrowthGoals, updateGrowthGoal } from "@/lib/services/habitService";
import { GrowthGoal } from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface EditGoalPageProps {
  params: Promise<{
    goalId: string;
  }>;
}

export default function EditGoalPage({ params }: EditGoalPageProps) {
  const { goalId } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<GrowthGoal | null>(null);

  // Load goal data
  useEffect(() => {
    const loadGoal = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('/signin');
          return;
        }

        const goals = await getUserGrowthGoals(userId);
        const foundGoal = goals.find(g => g.goal_id === goalId);

        if (!foundGoal) {
          toast({
            title: "Goal not found",
            description: "The goal you're trying to edit doesn't exist.",
            variant: "destructive",
          });
          router.push('/personal-growth');
          return;
        }

        setGoal(foundGoal);
        setTitle(foundGoal.title);
        setDescription(foundGoal.description || "");
        setCategory(foundGoal.category || "");
        if (foundGoal.target_date) {
          setDate(new Date(foundGoal.target_date));
        }
      } catch (error) {
        console.error('Error loading goal:', error);
        toast({
          title: "Error loading goal",
          description: "Failed to load goal data.",
          variant: "destructive",
        });
      }
    };

    loadGoal();
  }, [goalId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal) return;

    setLoading(true);

    try {
      const updates: Partial<GrowthGoal> = {
        title,
        description: description || undefined,
        category: category || undefined,
        target_date: date ? date.toISOString() : undefined,
      };

      await updateGrowthGoal(goal.goal_id, updates);

      toast({
        title: "Goal updated successfully",
        description: "Your goal has been updated.",
      });

      router.push('/personal-growth');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error updating goal",
        description: "Failed to update the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!goal) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading goal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
        <Button asChild variant="ghost" size="icon">
          <Link href="/personal-growth">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Edit Goal</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Goal Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn a new language"
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your goal..."
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="target-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Target Date
            </label>
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
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill-acquisition">Skill Acquisition</SelectItem>
                <SelectItem value="reading-list">Reading List</SelectItem>
                <SelectItem value="habit-formation">Habit Formation</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-1/2">
              {loading ? "Updating..." : "Update Goal"}
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-1/2">
              <Link href="/personal-growth">Cancel / Back</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
