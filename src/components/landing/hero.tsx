import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ5yG50laMTBw1_JkgXzD3XZtIgrqrGBX2uYp1sKPxgCEwCItf3LhKYe90gVvSeAoqh9cc3r4cW6c5JzC3DM_StzOKOzPat05xC6vKOXMxdvBsXfPWiZGSKogwM9u2IkZmagI7QVRyZz7PwUGLzuFqLvuy7yWkVJCeD2O1OheVBepar7LfWpYcUF_HG3lzrc3TrN3l0erJ_WMwYmoKmsULERNOK9gZXReMNQgSffnOHdu6P0rOa6slDv2Ak2m6na7FfpHzCH82ww"
          alt="Abstract background"
          fill
          className="object-cover opacity-30"
          data-ai-hint="abstract background"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center max-w-3xl mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <span className="material-symbols-outlined text-base">
            auto_awesome
          </span>
          <span>AI-Powered Assistant</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          Your Personal AI Assistant
        </h1>

        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
          Manage your day effortlessly. Plan your schedule, set reminders, use
          voice commands, and get personalized insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base font-bold shadow-lg shadow-primary/20"
          >
            <Link href="/signin">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base font-bold bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
