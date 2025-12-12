import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";
import InsightsClientWrapper from "@/components/InsightsClientWrapper";

export default function InsightsPage() {
  return (
    <div className="bg-background-dark font-display text-text-light">
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link href="/dashboard">
                <svg
                  className="text-gray-700 dark:text-gray-300"
                  fill="currentColor"
                  height="24"
                  viewBox="0 0 256 256"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              📊 Your Insights
            </h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-28">
          <div className="max-w-4xl mx-auto">
            {/* Main Insights Section */}
            <section className="mb-6">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <InsightsClientWrapper />
              </div>
            </section>

            {/* Quick Tips Section */}
            <section>
              <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 px-1">
                💡 Quick Tips
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-teal-200 dark:border-teal-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
                      <svg
                        className="text-teal-600 dark:text-teal-400"
                        fill="currentColor"
                        height="20"
                        viewBox="0 0 256 256"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Time Blocking
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Set specific times for tasks to improve focus and productivity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                      <svg
                        className="text-orange-600 dark:text-orange-400"
                        fill="currentColor"
                        height="20"
                        viewBox="0 0 256 256"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        Review Progress
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Check your weekly progress regularly to stay motivated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <VoiceAssistantWrapper />
        <BottomNav />
      </div>
    </div>
  );
}
