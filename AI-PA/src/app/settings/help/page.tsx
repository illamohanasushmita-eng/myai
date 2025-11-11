
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Help Center</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6">
        <div className="relative">
          <Input placeholder="Search help articles..." className="bg-input-light dark:bg-input-dark" />
           <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
        </div>
        <div>
            <h2 className="font-semibold mb-2">Frequently Asked Questions</h2>
            <div className="space-y-2">
                <Link href="#" className="block p-4 rounded-lg bg-card-light dark:bg-card-dark">How do I reset my password?</Link>
                <Link href="#" className="block p-4 rounded-lg bg-card-light dark:bg-card-dark">How do I manage my subscription?</Link>
                <Link href="#" className="block p-4 rounded-lg bg-card-light dark:bg-card-dark">How to use voice commands?</Link>
            </div>
        </div>
      </main>
    </div>
  );
}
