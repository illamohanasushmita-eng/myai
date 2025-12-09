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
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AddGoalPage() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground-light dark:text-foreground-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-background-light/80 p-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-background-dark/80">
        <Button asChild variant="ghost" size="icon">
          <Link href="/personal-growth">
            <span className="material-symbols-outlined">
              arrow_back_ios_new
            </span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Add New Goal</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6">
        <form className="space-y-6">
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
              placeholder="e.g. Learn a new language"
              className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60 dark:text-white"
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
                    !date && "text-muted-foreground",
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
            <Select>
              <SelectTrigger className="w-full rounded-lg border-gray-300 bg-white/70 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700/60">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill">Skill Acquisition</SelectItem>
                <SelectItem value="habit">Habit Formation</SelectItem>
                <SelectItem value="reading">Reading List</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" className="w-full sm:w-1/2">
              Save Goal
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
