"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaintenanceLog } from "@/lib/services/automotiveService";

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vehicleId: string;
}

const SERVICE_TYPE_OPTIONS = [
  { id: "oil-change", label: "Oil Change" },
  { id: "tire-rotation", label: "Tire Rotation" },
  { id: "brake-service", label: "Brake Service" },
  { id: "air-filter", label: "Air Filter Replacement" },
  { id: "battery", label: "Battery Service" },
  { id: "inspection", label: "General Inspection" },
  { id: "repair", label: "Repair" },
  { id: "other", label: "Other" },
];

export function AddMaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  vehicleId,
}: AddMaintenanceModalProps) {
  const [serviceType, setServiceType] = useState("oil-change");
  const [description, setDescription] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cost, setCost] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!serviceType) {
      setError("Service type is required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      await createMaintenanceLog(vehicleId, userId, {
        service_type: serviceType,
        description: description.trim() || undefined,
        maintenance_date: maintenanceDate,
        cost: cost ? parseFloat(cost) : undefined,
        mileage: mileage ? parseInt(mileage) : undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setServiceType("oil-change");
      setDescription("");
      setMaintenanceDate(new Date().toISOString().split("T")[0]);
      setCost("");
      setMileage("");
      setNotes("");

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error creating maintenance log:", err);
      setError("Failed to create maintenance log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            Log a maintenance or service record for your vehicle
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Service Type <span className="text-red-500">*</span>
            </label>
            <Select value={serviceType} onValueChange={setServiceType} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the service"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cost ($)</label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g., 75.00"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mileage</label>
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 15000"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or details..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


