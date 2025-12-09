import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: (
      <span className="material-symbols-outlined text-primary text-2xl">
        calendar_today
      </span>
    ),
    title: "Daily Planning",
    description:
      "Organize your tasks and events with intelligent scheduling and priority management.",
  },
  {
    icon: (
      <span className="material-symbols-outlined text-primary text-2xl">
        notifications
      </span>
    ),
    title: "Smart Reminders",
    description:
      "Never miss an important deadline with context-aware notifications.",
  },
  {
    icon: (
      <span className="material-symbols-outlined text-primary text-2xl">
        mic
      </span>
    ),
    title: "Voice Commands",
    description: "Control the app with your voice for hands-free productivity.",
  },
  {
    icon: (
      <span className="material-symbols-outlined text-primary text-2xl">
        psychology
      </span>
    ),
    title: "AI Personalization",
    description:
      "Get personalized insights and recommendations based on your behavior.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-8 px-6 bg-gradient-to-b from-transparent to-background/50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Core Features
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to stay organized and productive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-start gap-3 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border border-transparent hover:border-primary/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base font-bold shadow-lg shadow-primary/20 w-full sm:w-auto"
          >
            <Link href="/signin">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base font-bold bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 w-full sm:w-auto"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
