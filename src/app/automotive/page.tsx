import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

export default function AutomotivePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-card-light/70 dark:bg-card-dark/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 dark:border-border-dark/50">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
          >
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                arrow_back_ios_new
              </span>
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">Automotive</h1>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Tesla Model Y
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10 relative"
          >
            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
              settings
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Vehicle Overview</h2>
              <span className="material-symbols-outlined text-primary text-3xl">
                directions_car
              </span>
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-24">
                <Image
                  alt="Tesla Model Y"
                  className="w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7DovHprWjIz7SVVl5KKelDJP839BOxHHe521Sfd4zor7VodzmSMFDpXd5SoZ9W8E4q4m65-uKldF85GZweSLxUwmb2q8g2F8bFpAU_6_z2SurI_cE1D6mVKE9ryNrkEv2lmTbzcO34kZqq4vytm66vpqEnAYcYoyLvRw9LZzGRAR7vEgOOmzXPaKI9ATdo0Bdc8nFwBfrc7g7Ka9bO6LiSq3GIzd7si7uYF3BHz9PcJB3RILzRoDTMhNYIn_ibvnYDwD7J8_pA"
                  width={192}
                  height={96}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Range
                </p>
                <p className="text-xl font-bold">287 mi</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Status
                </p>
                <p className="text-xl font-bold text-green-500">Parked</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">
                  Charge
                </p>
                <p className="text-xl font-bold">82%</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: "82%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 mt-2">
          <h2 className="text-2xl font-bold mb-4">Trip History</h2>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 space-y-3 frosted-glass border border-white/30 dark:border-white/10">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    route
                  </span>
                </div>
                <div>
                  <p className="font-medium">Commute to Work</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    12.5 mi • 28 min
                  </p>
                </div>
              </div>
              <span className="text-sm text-subtle-light dark:text-subtle-dark">
                8:15 AM
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    shopping_cart
                  </span>
                </div>
                <div>
                  <p className="font-medium">Grocery Run</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    3.2 mi • 12 min
                  </p>
                </div>
              </div>
              <span className="text-sm text-subtle-light dark:text-subtle-dark">
                Yesterday
              </span>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full text-center py-2 px-4 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
            >
              View All Trips
            </Button>
          </div>
        </div>
        <div className="px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Maintenance Schedule</h2>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 frosted-glass border border-white/30 dark:border-white/10">
            <div className="flex items-center justify-between py-2 border-b border-border-light/50 dark:border-border-dark/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500">
                  check_circle
                </span>
                <p className="font-medium">Tire Rotation</p>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Completed 2 mo ago
              </p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light/50 dark:border-border-dark/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500">
                  schedule
                </span>
                <p className="font-medium">Cabin Air Filter</p>
              </div>
              <p className="text-sm text-amber-500">Due in 1,200 mi</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                  calendar_today
                </span>
                <p className="font-medium">Brake Fluid Check</p>
              </div>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Due in 4 mo
              </p>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full text-center py-2 px-4 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Manage Reminders
            </Button>
          </div>
        </div>
        <div className="px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Controls</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">
                ac_unit
              </span>
              <p className="font-semibold text-sm">Climate On</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl mb-2">
                lock
              </span>
              <p className="font-semibold text-sm">Lock Car</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl mb-2">
                local_parking
              </span>
              <p className="font-semibold text-sm">Find Parking</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow duration-300 frosted-glass border border-white/30 dark:border-white/10">
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl mb-2">
                local_gas_station
              </span>
              <p className="font-semibold text-sm">Log Fuel</p>
            </div>
          </div>
        </div>
      </main>
      <VoiceAssistantWrapper />
      <BottomNav />
    </div>
  );
}
