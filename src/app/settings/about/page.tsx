import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button
          asChild
          variant="ghost"
          className="p-2 rounded-full hover:bg-primary/10"
        >
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">
              arrow_back_ios_new
            </span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">About</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">MyAI</h2>
        <p>Version 1.0.0</p>
        <p className="text-subtle-light dark:text-subtle-dark">
          Your personal AI assistant to organize your life.
        </p>
        <div className="py-4">
          <Link href="#" className="text-primary">
            Terms of Service
          </Link>
          <span className="mx-2">|</span>
          <Link href="#" className="text-primary">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
