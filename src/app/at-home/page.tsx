"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { AddDeviceModal } from "@/components/modals/AddDeviceModal";
import { CreateRoutineModal } from "@/components/modals/CreateRoutineModal";
import { getUserSmartDevices } from "@/lib/services/smartHomeService";
import { getUserRoutines } from "@/lib/services/smartHomeRoutineService";
import { SmartDevice, SmartHomeRoutine } from "@/lib/types/database";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";

// Helper function to get icon for device type
const getDeviceIcon = (deviceType: string): string => {
  const iconMap: Record<string, string> = {
    light: "lightbulb",
    thermostat: "thermostat",
    tv: "tv",
    speaker: "speaker",
    camera: "videocam",
    lock: "lock",
    plug: "power",
    other: "devices",
  };
  return iconMap[deviceType.toLowerCase()] || "devices";
};

// Helper function to get color for device type
const getDeviceColor = (deviceType: string): string => {
  const colorMap: Record<string, string> = {
    light: "text-yellow-500",
    thermostat: "text-blue-500",
    tv: "text-purple-500",
    speaker: "text-pink-500",
    camera: "text-green-500",
    lock: "text-red-500",
    plug: "text-orange-500",
    other: "text-gray-500",
  };
  return colorMap[deviceType.toLowerCase()] || "text-gray-500";
};

// Helper function to get color for routine
const getRoutineColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-100 dark:bg-orange-900/50",
    indigo: "bg-indigo-100 dark:bg-indigo-900/50",
    red: "bg-red-100 dark:bg-red-900/50",
    blue: "bg-blue-100 dark:bg-blue-900/50",
    green: "bg-green-100 dark:bg-green-900/50",
    purple: "bg-purple-100 dark:bg-purple-900/50",
  };
  return colorMap[color.toLowerCase()] || "bg-blue-100 dark:bg-blue-900/50";
};

// Helper function to get text color for routine
const getRoutineTextColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    orange: "text-orange-500 dark:text-orange-400",
    indigo: "text-indigo-500 dark:text-indigo-400",
    red: "text-red-500 dark:text-red-400",
    blue: "text-blue-500 dark:text-blue-400",
    green: "text-green-500 dark:text-green-400",
    purple: "text-purple-500 dark:text-purple-400",
  };
  return colorMap[color.toLowerCase()] || "text-blue-500 dark:text-blue-400";
};

export default function AtHomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [routines, setRoutines] = useState<SmartHomeRoutine[]>([]);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
    if (storedUserId) {
      loadData(storedUserId);
    }
  }, []);

  const loadData = async (id: string) => {
    try {
      setIsLoading(true);
      const [userDevices, userRoutines] = await Promise.all([
        getUserSmartDevices(id),
        getUserRoutines(id),
      ]);

      setDevices(userDevices || []);
      setRoutines(userRoutines || []);
    } catch (error) {
      console.error("Error loading data - Details:", error);
      // Set empty arrays to prevent page crash
      setDevices([]);
      setRoutines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAdded = () => {
    if (userId) loadData(userId);
  };

  const handleRoutineCreated = () => {
    if (userId) loadData(userId);
  };

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
          <h1 className="text-lg font-bold">At Home</h1>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
              more_horiz
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Connected Devices</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Dynamic Device Cards */}
            {devices.map((device) => (
              <div
                key={device.device_id}
                className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm frosted-glass border border-white/30 dark:border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`material-symbols-outlined ${getDeviceColor(device.device_type)} text-3xl`}
                  >
                    {getDeviceIcon(device.device_type)}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      device.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-white text-sm">
                      power_settings_new
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{device.device_name}</h3>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  {device.location ? `${device.location} • ` : ""}
                  {device.status === "online" ? "Online" : "Offline"}
                </p>
              </div>
            ))}

            {/* Add Device Button */}
            <button
              onClick={() => setIsAddDeviceOpen(true)}
              className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex items-center justify-center flex-col text-center border-dashed border-2 border-primary/50 dark:border-primary/40 frosted-glass hover:border-primary/70 transition-colors"
            >
              <div className="w-10 h-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-primary">
                  add
                </span>
              </div>
              <h3 className="font-semibold text-sm">Add Device</h3>
            </button>
          </div>
        </div>
        <div className="px-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Routines</h2>
            <Button
              variant="ghost"
              className="text-primary font-semibold text-sm flex items-center gap-1 p-0 h-auto"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Manage
            </Button>
          </div>
          <div className="space-y-4">
            {/* Dynamic Routine Cards */}
            {routines.map((routine) => (
              <div
                key={routine.routine_id}
                className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex items-center justify-between frosted-glass border border-white/30 dark:border-white/10 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 flex-shrink-0 ${getRoutineColorClass(routine.color)} rounded-full flex items-center justify-center`}
                  >
                    <span
                      className={`material-symbols-outlined ${getRoutineTextColor(routine.color)} text-3xl`}
                    >
                      {routine.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {routine.routine_name}
                    </h3>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                      {routine.description || "No description"}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <span className="material-symbols-outlined text-3xl">
                    play_arrow
                  </span>
                </Button>
              </div>
            ))}

            {/* Create New Routine Button */}
            <Button
              onClick={() => setIsCreateRoutineOpen(true)}
              variant="secondary"
              className="w-full text-center py-3 px-4 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create New Routine
            </Button>
          </div>
        </div>
        <div className="px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-2 space-y-1 frosted-glass border border-white/30 dark:border-white/10">
            <div className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-full">
                <span className="material-symbols-outlined text-green-500">
                  power_settings_new
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  Living Room Light turned on.
                </p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  1 min ago
                </p>
              </div>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                more_vert
              </span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-900/50 rounded-full">
                <span className="material-symbols-outlined text-orange-500">
                  wb_sunny
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  "Good Morning" routine activated.
                </p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  2 min ago
                </p>
              </div>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                more_vert
              </span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-full">
                <span className="material-symbols-outlined text-gray-500">
                  power_settings_new
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">Thermostat turned off.</p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  15 mins ago
                </p>
              </div>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark ml-auto">
                more_vert
              </span>
            </div>
          </div>
        </div>
      </main>
      <VoiceAssistantWrapper />
      <BottomNav />

      {/* Modals */}
      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        onSuccess={handleDeviceAdded}
      />
      <CreateRoutineModal
        isOpen={isCreateRoutineOpen}
        onClose={() => setIsCreateRoutineOpen(false)}
        onSuccess={handleRoutineCreated}
      />
    </div>
  );
}
