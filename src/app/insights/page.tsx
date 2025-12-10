import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

export default function InsightsPage() {
  return (
    <div className="bg-background-dark font-display text-text-light">
      <div className="flex flex-col min-h-screen bg-[#D6EAF8]">
        <header className="sticky top-0 bg-transparent backdrop-blur-sm z-10">
          <div className="flex items-center p-4">
            <Button
              asChild
              variant="ghost"
              className="p-2 rounded-full hover:bg-primary/10"
            >
              <Link href="/dashboard">
                <svg
                  className="text-gray-800"
                  fill="currentColor"
                  height="24"
                  viewBox="0 0 256 256"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                </svg>
              </Link>
            </Button>
            <h1 className="text-lg font-bold text-center flex-1 pr-10 text-gray-800">
              Insights
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Weekly Overview
            </h2>
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base font-medium text-gray-600">
                    Tasks Completed
                  </p>
                  <p className="text-4xl font-bold text-gray-900">25</p>
                  <p className="text-sm text-gray-500">Last 7 Days</p>
                </div>
                <div className="flex items-center gap-1 text-accent-teal">
                  <span className="font-semibold">+12%</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 0L16 8L13.41 10.59L9 6.17V16H7V6.17L2.59 10.59L0 8L8 0Z"></path>
                  </svg>
                </div>
              </div>
              <div className="h-48 mt-4 grid grid-cols-7 gap-2 items-end">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full bg-accent-yellow rounded-lg h-2/5 animate-grow"></div>
                  <p className="text-xs font-medium text-gray-500">Mon</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-orange rounded-lg h-4/5 animate-grow"
                    style={{ animationDelay: "100ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Tue</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-teal rounded-lg h-3/5 animate-grow"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Wed</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-yellow rounded-lg h-3/4 animate-grow"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Thu</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-orange rounded-lg h-4/5 animate-grow"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Fri</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-teal/50 rounded-lg h-1/5 animate-grow"
                    style={{ animationDelay: "500ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Sat</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-yellow/70 rounded-lg h-2/5 animate-grow"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                  <p className="text-xs font-medium text-gray-500">Sun</p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Personalized Suggestions
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <div className="bg-accent-teal/20 p-3 rounded-full">
                  <svg
                    className="text-accent-teal"
                    fill="currentColor"
                    height="24"
                    viewBox="0 0 256 256"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Time Blocking</p>
                  <p className="text-sm text-gray-600">
                    Set specific times for tasks to improve focus.
                  </p>
                </div>
                <Button
                  variant="link"
                  className="ml-auto text-accent-teal font-bold text-sm"
                >
                  Try It
                </Button>
              </div>
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <div className="bg-accent-orange/20 p-3 rounded-full">
                  <svg
                    className="text-accent-orange"
                    fill="currentColor"
                    height="24"
                    viewBox="0 0 256 256"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Review Habits</p>
                  <p className="text-sm text-gray-600">
                    Check your weekly progress and stay motivated.
                  </p>
                </div>
                <Button
                  variant="link"
                  className="ml-auto text-accent-orange font-bold text-sm"
                >
                  Review
                </Button>
              </div>
            </div>
          </section>
        </main>
        <VoiceAssistantWrapper />
        <BottomNav />
      </div>
    </div>
  );
}
