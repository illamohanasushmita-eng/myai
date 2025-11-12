
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
import { getUserGrowthGoals } from "@/lib/services/habitService";
import { GrowthGoal } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

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
  const [habitCompletion, setHabitCompletion] = useState(initialHabitState);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goals, setGoals] = useState<GrowthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleHabit = (day: keyof typeof initialHabitState) => {
    setHabitCompletion((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Load goals from database
  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const fetchedGoals = await getUserGrowthGoals(userId);
        setGoals(fetchedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load goals on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Handle goal added
  const handleGoalAdded = () => {
    loadGoals();
  };

  // Helper function to get category icon and color
  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'skill-acquisition':
        return { icon: 'code', color: 'bg-purple-100 dark:bg-purple-900/50', textColor: 'text-purple-500 dark:text-purple-400' };
      case 'reading-list':
        return { icon: 'book', color: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-500 dark:text-yellow-400' };
      case 'habit-formation':
        return { icon: 'repeat', color: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-500 dark:text-green-400' };
      case 'fitness':
        return { icon: 'fitness_center', color: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-500 dark:text-red-400' };
      case 'career':
        return { icon: 'work', color: 'bg-blue-100 dark:bg-blue-900/50', textColor: 'text-blue-500 dark:text-blue-400' };
      case 'personal':
        return { icon: 'person', color: 'bg-pink-100 dark:bg-pink-900/50', textColor: 'text-pink-500 dark:text-pink-400' };
      default:
        return { icon: 'star', color: 'bg-gray-100 dark:bg-gray-900/50', textColor: 'text-gray-500 dark:text-gray-400' };
    }
  };

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
          <div className="p-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">3</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Goals in Progress
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">5</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Skills Developing
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">8</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Habits Tracked
                  </p>
                </div>
              </div>
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
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  Loading goals...
                </div>
              ) : goals.length === 0 ? (
                <div className="p-4 text-center text-subtle-light dark:text-subtle-dark">
                  No goals yet. Create your first one!
                </div>
              ) : (
                goals.map((goal) => {
                  const categoryInfo = getCategoryIcon(goal.category);
                  return (
                    <div key={goal.goal_id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10">
                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 flex-shrink-0 ${categoryInfo.color} rounded-full flex items-center justify-center mr-3`}>
                          <span className={`material-symbols-outlined ${categoryInfo.textColor}`}>
                            {categoryInfo.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                            {goal.title}
                          </h3>
                          <p className="text-xs text-subtle-light dark:text-subtle-dark">
                            {goal.category || 'Other'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-lg">
                                more_vert
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-3">
                          {goal.description}
                        </p>
                      )}
                      <div className="relative h-2 bg-border-light dark:bg-border-dark rounded-full">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{ width: `${goal.progress_percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs mt-1 text-subtle-light dark:text-subtle-dark">
                        {goal.progress_percentage}% Complete
                      </p>
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
