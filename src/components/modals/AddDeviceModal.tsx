"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createSmartDevice } from "@/lib/services/smartHomeService";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEVICE_TYPES = [
  { id: "light", label: "Light", icon: "lightbulb" },
  { id: "thermostat", label: "Thermostat", icon: "thermostat" },
  { id: "tv", label: "TV", icon: "tv" },
  { id: "speaker", label: "Speaker", icon: "speaker" },
  { id: "camera", label: "Camera", icon: "videocam" },
  { id: "lock", label: "Smart Lock", icon: "lock" },
  { id: "plug", label: "Smart Plug", icon: "power" },
  { id: "other", label: "Other", icon: "devices" },
];

export function AddDeviceModal({
  isOpen,
  onClose,
  onSuccess,
}: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("light");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!deviceName.trim()) {
      setError("Device name is required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      await createSmartDevice(userId, {
        device_name: deviceName,
        device_type: deviceType,
        location: location || undefined,
        is_active: true,
        status: "online",
      });

      // Reset form
      setDeviceName("");
      setDeviceType("light");
      setLocation("");

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error creating device:", err);
      setError("Failed to create device. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Add a new smart home device to your collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Device Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Device Name *
            </label>
            <Input
              placeholder="e.g., Living Room Light"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Device Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Device Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DEVICE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setDeviceType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    deviceType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border-light dark:border-border-dark hover:border-primary/50"
                  }`}
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-lg">
                    {type.icon}
                  </span>
                  <span className="text-xs text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location (Optional)
            </label>
            <Input
              placeholder="e.g., Living Room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
