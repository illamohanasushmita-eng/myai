
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/layout/bottom-nav";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  };

  return (
    <div className="bg-calm-blue dark:bg-calm-blue-dark font-display text-gray-800 dark:text-gray-200">
      <div className="flex h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/10 bg-calm-blue/80 px-4 py-3 backdrop-blur-sm dark:border-gray-700/50 dark:bg-calm-blue-dark/80">
          <Button asChild variant="ghost" size="icon" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-700/50">
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
            </Link>
          </Button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-8"></div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="divide-y divide-gray-300/50 dark:divide-gray-700/50">
            <div className="p-4">
              <h2 className="px-4 pb-2 text-sm font-semibold text-primary dark:text-primary">ACCOUNT</h2>
              <ul className="rounded-xl bg-white/50 dark:bg-gray-800/20">
                <li>
                  <Link href="/settings/profile" className="flex items-center gap-4 p-4">
                    <div className="relative h-14 w-14 flex-shrink-0 rounded-full bg-cover bg-center">
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdo5G2NLz9RtwbAmMqs7lY-7i-pNnVm7svrNO_NONAWCfV4_jKBt9TpRQ6ax2CrE7TmEjwpxKxElhGNTMT8xonP_6l9MBrylDCWqv3vzEdIP8OFS4aBovtRD6YNqqBzDCGWPerfGuY9rzgrPXub2X0RWaauN61CiScUSEMYF1RGmiQR1mg_7jq4Z_ndznMN08npc2BdCJqG5B69C3OLpt0d1r68vETYgDwSBXh3nQgTx7iawsGUYI4T2LJTEWNV6fvvK8AEFDEYw"
                            alt="User profile picture"
                            fill
                            className="rounded-full"
                        />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Profile</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile information</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/change-password" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">key</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Change your password</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/subscription" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">star</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Subscription</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="p-4">
              <h2 className="px-4 pb-2 text-sm font-semibold text-primary dark:text-primary">PREFERENCES</h2>
              <ul className="rounded-xl bg-white/50 dark:bg-gray-800/20">
                <li>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">contrast</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Light / Dark</p>
                    </div>
                    <Switch checked={isDark} onCheckedChange={handleThemeChange} />
                  </div>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/notifications" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">notifications</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Adjust notification settings</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/voice" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">mic</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Voice Commands</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage voice command settings</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="p-4">
              <h2 className="px-4 pb-2 text-sm font-semibold text-primary dark:text-primary">PRIVACY &amp; DATA</h2>
              <ul className="rounded-xl bg-white/50 dark:bg-gray-800/20">
                <li>
                  <Link href="/settings/privacy" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">shield</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Privacy</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your privacy settings</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/data" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">database</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Data Management</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data and storage</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="p-4">
              <h2 className="px-4 pb-2 text-sm font-semibold text-primary dark:text-primary">HELP &amp; SUPPORT</h2>
              <ul className="rounded-xl bg-white/50 dark:bg-gray-800/20">
                <li>
                  <Link href="/settings/help" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">help_center</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Help Center</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get help and support</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/contact" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">mail</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Contact Us</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contact support team</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
                <li className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link href="/settings/about" className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl">info</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">About</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Learn about the app</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">arrow_forward_ios</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
