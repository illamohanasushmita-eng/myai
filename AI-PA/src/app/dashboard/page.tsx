
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { generatePersonalizedDailyPlan } from "@/ai/openai-client";
import { VoiceCommandButton } from "@/components/voice/VoiceCommandButton";
import { supabase } from "@/lib/supabaseClient";

type DailyPlan = {
  morning: string;
  afternoon: string;
  evening: string;
  message: string;
};

export default function DashboardPage() {
  const userImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCdo5G2NLz9RtwbAmMqs7lY-7i-pNnVm7svrNO_NONAWCfV4_jKBt9TpRQ6ax2CrE7TmEjwpxKxElhGNTMT8xonP_6l9MBrylDCWqv3vzEdIP8OFS4aBovtRD6YNqqBzDCGWPerfGuY9rzgrPXub2X0RWaauN61CiScUSEMYF1RGmiQR1mg_7jq4Z_ndznMN08npc2BdCJqG5B69C3OLpt0d1r68vETYgDwSBXh3nQgTx7iawsGUYI4T2LJTEWNV6fvvK8AEFDEYw";

  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get authenticated user ID from Supabase
  useEffect(() => {
    const getAuthenticatedUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        if (user) {
          setUserId(user.id);
          // Also store in localStorage for other components
          localStorage.setItem('userId', user.id);
        }
      } catch (error) {
        console.error('Error fetching authenticated user:', error);
      }
    };

    getAuthenticatedUser();
  }, []);

  useEffect(() => {
    const fetchDailyPlan = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch this data from a user's profile
        const mockData = {
          name: "User",
          pastActivities: "Completed project proposal, attended team meeting, went for a run.",
          preferences: "Prefers focused work in the morning, enjoys listening to podcasts during breaks.",
          upcomingDeadlines: "Finalize Project Phoenix report due today at 4 PM.",
        };

        const result = await generatePersonalizedDailyPlan(mockData);
        setDailyPlan(result);
      } catch (error) {
        console.error("Failed to generate daily plan:", error);
        // Set a fallback plan in case of an error
        setDailyPlan({
          morning: "Start your day with focused work on your top priority.",
          afternoon: "Take a break for lunch and continue with collaborative tasks.",
          evening: "Review your progress and plan for tomorrow.",
          message: "You're most productive in the morning. Schedule deep work before lunch."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPlan();
  }, []);

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background-light/70 dark:bg-background-dark/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
          >
            <Link href="/settings">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                menu
              </span>
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">Hello, Alex!</h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Let's make today productive.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer">
                { <Image
                    src={userImage}
                    alt="User profile picture"
                    width={48}
                    height={48}
                    className="object-cover"
                /> }
              </div>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none max-w-sm w-full">
              <DialogTitle className="sr-only">User Profile Picture</DialogTitle>
              <div className="relative aspect-square w-full h-full">
                {<Image
                  src={userImage}
                  alt="User profile picture"
                  fill
                  className="object-cover rounded-lg"
                /> }
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
              search
            </span>
            <Input
              className="w-full bg-card-light dark:bg-card-dark border border-white/20 dark:border-white/10 rounded-full py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow frosted-glass"
              placeholder="Search tasks, notes, reminders..."
              type="text"
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6 pt-0">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md transform hover:scale-[1.02] transition-transform duration-300 frosted-glass border border-white/30 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Daily Briefing</h2>
              <span className="material-symbols-outlined text-primary text-3xl">flare</span>
            </div>
            <p className="text-subtle-light dark:text-subtle-dark mb-6">
              Here's a personalized summary for your day.
            </p>
            {loading ? (
                 <div className="space-y-4">
                    <div className="animate-pulse flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                     <div className="animate-pulse flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                             <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="animate-pulse flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                             <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                             <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    </div>
                 </div>
            ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                      <span className="material-symbols-outlined text-primary">
                        task_alt
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Morning Plan</h3>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {dailyPlan?.morning}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-400/10 rounded-full">
                      <span className="material-symbols-outlined text-amber-500">
                        alarm
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Afternoon Plan</h3>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {dailyPlan?.afternoon}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-400/10 rounded-full">
                      <span className="material-symbols-outlined text-emerald-500">
                        lightbulb
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Evening Plan & Message</h3>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        {dailyPlan?.evening} - {dailyPlan?.message}
                      </p>
                    </div>
                  </div>
                </div>
            )}
            <Button
              variant="ghost"
              className="mt-6 w-full text-center py-2 px-4 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
            >
              View Full Schedule
            </Button>
          </div>
        </div>
        <div className="px-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-display">
              Categorized Dashboard
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/at-home" className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-start text-left cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-2xl">
                  home
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                At Home
              </h3>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-3 flex-grow">
                Chores, family, pets
              </p>
            </Link>
            <Link href="/professional" className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-start text-left cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <div className="w-12 h-12 flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 text-2xl">
                  business_center
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                Professional
              </h3>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-3 flex-grow">
                Work, projects, meetings
              </p>
            </Link>
            <Link href="/personal-growth" className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-start text-left cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <div className="w-12 h-12 flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-green-500 dark:text-green-400 text-2xl">
                  self_improvement
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                Personal Growth
              </h3>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-3 flex-grow">
                Learning, habits, goals
              </p>
            </Link>
            <Link href="/automotive" className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-start text-left cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <div className="w-12 h-12 flex-shrink-0 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 text-2xl">
                  directions_car
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                Automotive
              </h3>
              <p className="text-xs text-subtle-light dark:text-subtle-dark mb-3 flex-grow">
                Maintenance, trips
              </p>
            </Link>
            <Link href="/healthcare" className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-start text-left cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10 col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-2xl">
                    health_and_safety
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground-light dark:text-foreground-dark">
                    Healthcare
                  </h3>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Appointments, fitness
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-2 space-y-2 frosted-glass border border-white/30 dark:border-white/10">
            <Link
              href="/tasks/add"
              className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary">
                  add_task
                </span>
              </div>
              <p className="font-medium">Add a New Task</p>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                chevron_right
              </span>
            </Link>
            <Link
              href="/reminders/add"
              className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary">
                  add_alarm
                </span>
              </div>
              <p className="font-medium">Set a Reminder</p>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                chevron_right
              </span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary">
                  mic
                </span>
              </div>
              <p className="font-medium">Use Voice Command</p>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                chevron_right
              </span>
            </Link>
          </div>
        </div>
      </main>
      <div className="fixed bottom-20 right-6 z-20">
        <VoiceCommandButton userId={userId || undefined} />
      </div>
      <BottomNav />
    </div>
    </>
  );
}

    