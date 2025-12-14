"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AddGoalModal } from "@/components/modals/AddGoalModal";
import {
  getUserGrowthGoals,
  updateGrowthGoal,
  deleteGrowthGoal,
  getActiveHabits,
  getUserLearningModules,
} from "@/lib/services/habitService";
import { GrowthGoal, Habit, LearningModule } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";
import { useRouter } from "next/navigation";

const initialHabitState = {
  Mon: true,
  Tue: true,
  Wed: false,
  Thu: true,
  Fri: false,
  Sat: true,
  Sun: false,
};

export default function PersonalGrowthPage() {
  const router = useRouter();
  const [habitCompletion, setHabitCompletion] = useState(initialHabitState);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goals, setGoals] = useState<GrowthGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleHabit = (day: keyof typeof initialHabitState) => {
    setHabitCompletion((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Load all data from database
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Fetch all data in parallel
      const [fetchedGoals, fetchedHabits, fetchedModules] = await Promise.all([
        getUserGrowthGoals(userId),
        getActiveHabits(userId),
        getUserLearningModules(userId),
      ]);

      setGoals(fetchedGoals);
      setHabits(fetchedHabits);
      setLearningModules(fetchedModules);
    } catch (error) {
      console.error("Error loading personal growth data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle goal added
  const handleGoalAdded = () => {
    loadData();
  };

  // Handle goal progress update
  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      // Optimistic update
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.goal_id === goalId
            ? { ...goal, progress_percentage: newProgress }
            : goal
        )
      );

      // Update in database
      await updateGrowthGoal(goalId, {
        progress_percentage: newProgress,
        status: newProgress >= 100 ? "completed" : "active",
      });

      // Reload data to ensure consistency
      loadData();
    } catch (error) {
      console.error("Error updating goal progress:", error);
      // Revert optimistic update on error
      loadData();
    }
  };

  // Handle goal status toggle (mark as complete/incomplete)
  const handleToggleGoalStatus = async (goalId: string, currentProgress: number) => {
    const newProgress = currentProgress >= 100 ? 0 : 100;
    await handleUpdateProgress(goalId, newProgress);
  };

  // Handle edit goal
  const handleEditGoal = (goalId: string) => {
    router.push(`/personal-growth/edit/${goalId}`);
  };

  // Handle delete goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      await deleteGrowthGoal(goalId);
      loadData();
    } catch (error) {
      console.error("Error deleting goal:", error);
      setError("Failed to delete goal. Please try again.");
    }
  };

  // Helper function to get category icon and color
  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "skill-acquisition":
        return {
          icon: "code",
          color: "bg-purple-100 dark:bg-purple-900/50",
          textColor: "text-purple-500 dark:text-purple-400",
        };
      case "reading-list":
        return {
          icon: "book",
          color: "bg-yellow-100 dark:bg-yellow-900/50",
          textColor: "text-yellow-500 dark:text-yellow-400",
        };
      case "habit-formation":
        return {
          icon: "repeat",
          color: "bg-green-100 dark:bg-green-900/50",
          textColor: "text-green-500 dark:text-green-400",
        };
      case "fitness":
        return {
          icon: "fitness_center",
          color: "bg-red-100 dark:bg-red-900/50",
          textColor: "text-red-500 dark:text-red-400",
        };
      case "career":
        return {
          icon: "work",
          color: "bg-blue-100 dark:bg-blue-900/50",
          textColor: "text-blue-500 dark:text-blue-400",
        };
      case "personal":
        return {
          icon: "person",
          color: "bg-pink-100 dark:bg-pink-900/50",
          textColor: "text-pink-500 dark:text-pink-400",
        };
      default:
        return {
          icon: "star",
          color: "bg-gray-100 dark:bg-gray-900/50",
          textColor: "text-gray-500 dark:text-gray-400",
        };
    }
  };

  // Calculate real-time statistics
  const activeGoalsCount = goals.filter((g) => g.status === "active").length;
  const skillsDevelopingCount = learningModules.filter(
    (m) => m.status === "in_progress" || m.status === "not_started"
  ).length;
  const habitsTrackedCount = habits.length;

  return (
    <>
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
              <h1 className="text-lg font-bold">Personal Growth</h1>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Your self-development journey
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10 relative"
            >
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                more_horiz
              </span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-28">
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Progress Section */}
          <div className="p-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {activeGoalsCount}
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Goals in Progress
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {skillsDevelopingCount}
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Skills Developing
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {habitsTrackedCount}
                    </p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Habits Tracked
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-display">Active Goals</h2>
              <Button
                onClick={() => setIsAddGoalOpen(true)}
                variant="secondary"
                className="bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                New Goal
              </Button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 animate-pulse"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : goals.length === 0 ? (
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 text-center">
                  <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                    flag
                  </span>
                  <p className="text-lg font-medium mb-2">No goals yet</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                    Create your first goal to start tracking your personal growth journey!
                  </p>
                  <Button
                    onClick={() => setIsAddGoalOpen(true)}
                    className="bg-primary text-white rounded-lg"
                  >
                    <span className="material-symbols-outlined text-base mr-2">
                      add
                    </span>
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                goals.map((goal) => {
                  const categoryInfo = getCategoryIcon(goal.category);
                  const isCompleted = goal.progress_percentage >= 100;
                  return (
                    <div
                      key={goal.goal_id}
                      className={cn(
                        "bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 transition-all",
                        isCompleted && "opacity-75"
                      )}
                    >
                      <div className="flex items-center mb-3">
                        {/* Status Checkbox */}
                        <button
                          onClick={() =>
                            handleToggleGoalStatus(
                              goal.goal_id,
                              goal.progress_percentage
                            )
                          }
                          className={cn(
                            "w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center mr-3 transition-all",
                            isCompleted
                              ? "bg-primary border-primary"
                              : "border-gray-300 dark:border-gray-600 hover:border-primary"
                          )}
                        >
                          {isCompleted && (
                            <span className="material-symbols-outlined text-white text-sm">
                              check
                            </span>
                          )}
                        </button>

                        {/* Category Icon */}
                        <div
                          className={`w-10 h-10 flex-shrink-0 ${categoryInfo.color} rounded-full flex items-center justify-center mr-3`}
                        >
                          <span
                            className={`material-symbols-outlined ${categoryInfo.textColor}`}
                          >
                            {categoryInfo.icon}
                          </span>
                        </div>

                        {/* Goal Info */}
                        <div className="flex-1">
                          <h3
                            className={cn(
                              "font-bold text-base text-foreground-light dark:text-foreground-dark",
                              isCompleted && "line-through"
                            )}
                          >
                            {goal.title}
                          </h3>
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">
                            {goal.category || "Other"}
                            {goal.target_date && (
                              <span className="ml-2">
                                • Due:{" "}
                                {new Date(goal.target_date).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">
                                more_vert
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditGoal(goal.goal_id)}
                            >
                              <span className="material-symbols-outlined text-sm mr-2">
                                edit
                              </span>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateProgress(
                                  goal.goal_id,
                                  Math.min(goal.progress_percentage + 25, 100)
                                )
                              }
                            >
                              <span className="material-symbols-outlined text-sm mr-2">
                                add_circle
                              </span>
                              Add 25% Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleGoalStatus(
                                  goal.goal_id,
                                  goal.progress_percentage
                                )
                              }
                            >
                              <span className="material-symbols-outlined text-sm mr-2">
                                {isCompleted ? "restart_alt" : "check_circle"}
                              </span>
                              {isCompleted
                                ? "Mark as Incomplete"
                                : "Mark as Complete"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteGoal(goal.goal_id)}
                              className="text-destructive"
                            >
                              <span className="material-symbols-outlined text-sm mr-2">
                                delete
                              </span>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Description */}
                      {goal.description && (
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-3 ml-9">
                          {goal.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="ml-9">
                        <div className="relative h-2 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "absolute top-0 left-0 h-full rounded-full transition-all duration-300",
                              isCompleted
                                ? "bg-green-500"
                                : "bg-primary"
                            )}
                            style={{ width: `${goal.progress_percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">
                            {goal.progress_percentage}% Complete
                          </p>
                          {isCompleted && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                              <span className="material-symbols-outlined text-sm mr-1">
                                check_circle
                              </span>
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="px-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-2 space-y-1 frosted-glass border border-white/30 dark:border-white/10">
              <Link
                href="/personal-growth/articles"
                className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">
                    menu_book
                  </span>
                </div>
                <p className="font-medium">Curated Articles</p>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                  chevron_right
                </span>
              </Link>
              <Link
                href="/personal-growth/courses"
                className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <span className="material-symbols-outlined text-purple-500 dark:text-purple-400">
                    play_circle
                  </span>
                </div>
                <p className="font-medium">Video Courses</p>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                  chevron_right
                </span>
              </Link>
              <Link
                href="/personal-growth/podcasts"
                className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-full">
                  <span className="material-symbols-outlined text-green-500 dark:text-green-400">
                    podcasts
                  </span>
                </div>
                <p className="font-medium">Podcasts for You</p>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                  chevron_right
                </span>
              </Link>
              <Link
                href="/personal-growth/community"
                className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-900/50 rounded-full">
                  <span className="material-symbols-outlined text-orange-500 dark:text-orange-400">
                    groups
                  </span>
                </div>
                <p className="font-medium">Community Forum</p>
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                  chevron_right
                </span>
              </Link>
            </div>
          </div>
        </main>
        <VoiceAssistantWrapper />
        <BottomNav />
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onSuccess={handleGoalAdded}
      />
    </>
  );
}
