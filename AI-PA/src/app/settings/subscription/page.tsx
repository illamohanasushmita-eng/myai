"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const plans = {
  monthly: [
    {
      name: "Free (Version 1)",
      price: "$0",
      period: "/month",
      description: "The current version is free for everyone.",
      features: [
        "Unlimited tasks",
        "AI-powered insights",
        "Advanced reminders",
        "Standard support",
      ],
      cta: "Current Plan",
      isCurrent: true,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For professionals who need more power and features in the future.",
      features: [
        "All features from Free",
        "Priority support",
        "Advanced AI capabilities",
        "Team features",
      ],
      cta: "Coming Soon",
      isCurrent: false,
    },
  ],
  yearly: [
    {
      name: "Free (Version 1)",
      price: "$0",
      period: "/year",
      description: "The current version is free for everyone.",
      features: [
        "Unlimited tasks",
        "AI-powered insights",
        "Advanced reminders",
        "Standard support",
      ],
      cta: "Current Plan",
      isCurrent: true,
    },
    {
      name: "Pro Yearly",
      price: "$99.99",
      period: "/year",
      description: "Save with an annual plan for future pro features.",
      features: [
        "All features from Free",
        "Priority support",
        "Advanced AI capabilities",
        "Team features",
      ],
      cta: "Coming Soon",
      isCurrent: false,
      badge: "Save 16%",
    },
  ],
};


export default function SubscriptionPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Subscription</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 text-center space-y-8">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Future Plans</h2>
            <p className="mt-2 text-subtle-light dark:text-subtle-dark">
                MyAI is currently free for everyone. Pro plans are for future versions.
            </p>
        </div>

        <div className="flex items-center justify-center space-x-4">
            <span className={cn("font-medium", billingCycle === "monthly" ? "text-primary" : "text-subtle-light dark:text-subtle-dark")}>Monthly</span>
            <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                aria-label="Toggle billing cycle"
            />
            <span className={cn("font-medium", billingCycle === "yearly" ? "text-primary" : "text-subtle-light dark:text-subtle-dark")}>Yearly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {(billingCycle === 'monthly' ? plans.monthly : plans.yearly).map((plan) => (
            <div key={plan.name} className={cn("p-6 rounded-xl border-2 flex flex-col", plan.isCurrent ? 'border-primary bg-primary/5' : 'bg-card-light dark:bg-card-dark border-transparent')}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-subtle-light dark:text-subtle-dark h-12">{plan.description}</p>
                <div className="my-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-subtle-light dark:text-subtle-dark">{plan.period}</span>
                </div>
                <ul className="space-y-3 text-left mb-8">
                    {plan.features.map(feature => (
                        <li key={feature} className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto">
                    <Button className="w-full h-12 text-base font-bold" disabled={true}>
                        {plan.cta}
                    </Button>
                </div>
            </div>
            ))}
        </div>
      </main>
    </div>
  );
}
