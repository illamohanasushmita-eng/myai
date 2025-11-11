
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ArticlesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
          >
            <Link href="/personal-growth">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                arrow_back_ios_new
              </span>
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Curated Articles</h1>
          <div className="w-12"></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-subtle-light dark:text-subtle-dark">
          Articles content coming soon.
        </p>
      </main>
    </div>
  );
}
