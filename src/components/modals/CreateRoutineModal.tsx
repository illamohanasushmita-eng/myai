"use client";

import { useState, useEffect } from "react";
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
import {
  createRoutine,
  createRoutineAction,
} from "@/lib/services/smartHomeRoutineService";
import { getUserSmartDevices } from "@/lib/services/smartHomeService";
import { SmartDevice } from "@/lib/types/database";

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROUTINE_ICONS = [
  { id: "wb_sunny", label: "Morning" },
  { id: "bedtime", label: "Night" },
  { id: "movie", label: "Movie" },
  { id: "work", label: "Work" },
  { id: "home", label: "Home" },
  { id: "favorite", label: "Favorite" },
];

const ROUTINE_COLORS = [
  {
    id: "orange",
    label: "Orange",
    bg: "bg-orange-100",
    text: "text-orange-500",
  },
  {
    id: "indigo",
    label: "Indigo",
    bg: "bg-indigo-100",
    text: "text-indigo-500",
  },
  { id: "red", label: "Red", bg: "bg-red-100", text: "text-red-500" },
  { id: "blue", label: "Blue", bg: "bg-blue-100", text: "text-blue-500" },
  { id: "green", label: "Green", bg: "bg-green-100", text: "text-green-500" },
  {
    id: "purple",
    label: "Purple",
    bg: "bg-purple-100",
    text: "text-purple-500",
  },
];

const ACTION_TYPES = [
  { id: "turn_on", label: "Turn On" },
  { id: "turn_off", label: "Turn Off" },
  { id: "set_brightness", label: "Set Brightness" },
  { id: "set_temperature", label: "Set Temperature" },
];

export function CreateRoutineModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoutineModalProps) {
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("home");
  const [color, setColor] = useState("blue");
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<
    { deviceId: string; actionType: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const userDevices = await getUserSmartDevices(userId);
      setDevices(userDevices);
    } catch (err) {
      console.error("Error loading devices:", err);
    }
  };

  const handleAddDevice = () => {
    if (devices.length > 0) {
      setSelectedDevices([
        ...selectedDevices,
        { deviceId: devices[0].device_id, actionType: "turn_on" },
      ]);
    }
  };

  const handleRemoveDevice = (index: number) => {
    setSelectedDevices(selectedDevices.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!routineName.trim()) {
      setError("Routine name is required");
      return;
    }

    if (selectedDevices.length === 0) {
      setError("Please add at least one device to the routine");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);

      // Create the routine
      const newRoutine = await createRoutine(userId, {
        routine_name: routineName,
        description: description || undefined,
        icon,
        color,
        is_active: true,
      });

      // Create routine actions
      for (let i = 0; i < selectedDevices.length; i++) {
        const device = selectedDevices[i];
        await createRoutineAction(userId, {
          routine_id: newRoutine.routine_id,
          device_id: device.deviceId,
          action_type: device.actionType,
          order_index: i,
        });
      }

      // Reset form
      setRoutineName("");
      setDescription("");
      setIcon("home");
      setColor("blue");
      setSelectedDevices([]);

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error creating routine:", err);
      setError("Failed to create routine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Routine</DialogTitle>
          <DialogDescription>
            Create a smart routine to control multiple devices at once
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Routine Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Routine Name *
            </label>
            <Input
              placeholder="e.g., Good Morning"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <Input
              placeholder="e.g., Turns on lights and sets thermostat"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ROUTINE_ICONS.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setIcon(i.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    icon === i.id
                      ? "border-primary bg-primary/10"
                      : "border-border-light dark:border-border-dark"
                  }`}
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">{i.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {ROUTINE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${c.bg} ${
                    color === c.id
                      ? "border-2 border-gray-800 dark:border-white"
                      : "border-border-light dark:border-border-dark"
                  }`}
                  disabled={isLoading}
                >
                  <span className={`material-symbols-outlined ${c.text}`}>
                    palette
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Devices *</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddDevice}
                disabled={isLoading || devices.length === 0}
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Device
              </Button>
            </div>

            {devices.length === 0 ? (
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                No devices available. Please add devices first.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDevices.map((selected, index) => {
                  const device = devices.find(
                    (d) => d.device_id === selected.deviceId,
                  );
                  return (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={selected.deviceId}
                          onChange={(e) => {
                            const newSelected = [...selectedDevices];
                            newSelected[index].deviceId = e.target.value;
                            setSelectedDevices(newSelected);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={isLoading}
                        >
                          {devices.map((d) => (
                            <option key={d.device_id} value={d.device_id}>
                              {d.device_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={selected.actionType}
                          onChange={(e) => {
                            const newSelected = [...selectedDevices];
                            newSelected[index].actionType = e.target.value;
                            setSelectedDevices(newSelected);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={isLoading}
                        >
                          {ACTION_TYPES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDevice(index)}
                        disabled={isLoading}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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
              {isLoading ? "Creating..." : "Create Routine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
