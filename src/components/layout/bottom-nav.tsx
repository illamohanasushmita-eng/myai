"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/tasks", icon: "task_alt", label: "Tasks" },
  { href: "/reminders", icon: "notifications", label: "Reminders" },
  { href: "/insights", icon: "insights", label: "Insights" },
  { href: "/settings/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-lg border-t border-white/20 dark:border-white/10 z-30">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-1/5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-subtle-light dark:text-subtle-dark hover:text-primary",
              )}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-3xl">
                  {item.icon}
                </span>
                {isActive && (
                  <div className="absolute -top-2 w-full h-1 bg-primary rounded-full"></div>
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isActive ? "font-bold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
