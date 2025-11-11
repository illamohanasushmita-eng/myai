
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Change Password</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="old-password">Old Password</label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="old-password"
                placeholder="Old Password"
                type="password"
              />
              <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark">
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>
          <div>
            <label className="sr-only" htmlFor="new-password">New Password</label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="new-password"
                placeholder="New Password"
                type="password"
              />
              <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark">
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>
          <div>
            <label className="sr-only" htmlFor="confirm-password">Confirm New Password</label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="confirm-password"
                placeholder="Confirm New Password"
                type="password"
              />
              <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark">
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
          <p className="text-sm font-medium text-primary">Password Requirements:</p>
          <ul className="mt-2 space-y-1 text-xs text-foreground-light/80 dark:text-foreground-dark/80 list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>A mix of uppercase and lowercase letters</li>
            <li>At least one number</li>
            <li>At least one symbol (e.g., !@#$%)</li>
          </ul>
        </div>
      </main>
      <footer className="p-6">
        <Button className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors">
          Update Password
        </Button>
      </footer>
    </div>
  );
}
