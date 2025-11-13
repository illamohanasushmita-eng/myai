'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import BottomNav from '@/components/layout/bottom-nav';
import { AddBillForm } from '@/components/billing/AddBillForm';
import { UpcomingBillsList } from '@/components/billing/UpcomingBillsList';
import { SmartSuggestions } from '@/components/billing/SmartSuggestions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export default function BillingSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleBillAdded = () => {
    // Trigger refresh of bills list
    setRefreshTrigger((prev) => prev + 1);
    // Switch to upcoming tab to see the new bill
    setActiveTab('upcoming');
  };

  if (!userId) {
    return (
      <div className="bg-calm-blue dark:bg-calm-blue-dark font-display text-gray-800 dark:text-gray-200">
        <div className="flex h-screen flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/10 bg-calm-blue/80 px-4 py-3 backdrop-blur-sm dark:border-gray-700/50 dark:bg-calm-blue-dark/80">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
            >
              <Link href="/settings">
                <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
              </Link>
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Billing & Reminders</h1>
            <div className="w-8"></div>
          </header>
          <main className="flex-1 overflow-y-auto pb-20 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please log in to manage your bills
              </p>
              <Button asChild className="mt-4">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-calm-blue dark:bg-calm-blue-dark font-display text-gray-800 dark:text-gray-200">
      <div className="flex h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/10 bg-calm-blue/80 px-4 py-3 backdrop-blur-sm dark:border-gray-700/50 dark:bg-calm-blue-dark/80">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <Link href="/settings">
              <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
            </Link>
          </Button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Billing & Reminders</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">
          <div className="p-4 space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">💰 Bill Management</h2>
              <p className="text-blue-100">
                Track your monthly bills and get voice reminders from Lara
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming Bills</TabsTrigger>
                <TabsTrigger value="add">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Bill
                </TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Upcoming Bills Tab */}
              <TabsContent value="upcoming" className="mt-6">
                <UpcomingBillsList userId={userId} refreshTrigger={refreshTrigger} />
              </TabsContent>

              {/* Add Bill Tab */}
              <TabsContent value="add" className="mt-6">
                <AddBillForm userId={userId} onSuccess={handleBillAdded} />
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-6">
                <SmartSuggestions userId={userId} refreshTrigger={refreshTrigger} />
              </TabsContent>
            </Tabs>

            {/* Voice Commands Help */}
            <div className="bg-white/50 dark:bg-gray-800/20 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">mic</span>
                Voice Commands
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    "Hey Lara, add my electricity bill of ₹1200 due on 25th"
                  </span>
                  <br />
                  Add a new bill using voice
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    "Hey Lara, what are my total bills this month?"
                  </span>
                  <br />
                  Get a summary of all bills
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    "Hey Lara, mark electricity bill as paid"
                  </span>
                  <br />
                  Mark a bill as paid
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    "Hey Lara, show my upcoming bills"
                  </span>
                  <br />
                  View all upcoming bills
                </p>
              </div>
            </div>

            {/* Features Info */}
            <div className="bg-white/50 dark:bg-gray-800/20 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">✨ Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Voice reminders 10 days before due date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Automatic recurring bill tracking (monthly, quarterly, yearly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>AI-powered spending insights and suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Category-wise bill organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Overdue bill alerts</span>
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

