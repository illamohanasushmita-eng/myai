"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { VoiceAssistantWrapper } from "@/components/layout/VoiceAssistantWrapper";
import { useState, useEffect } from "react";
import {
  getUserVehicles,
  getPrimaryVehicle,
  getVehicleMaintenanceLogs,
  getUserRoutes,
  deleteVehicle,
  deleteMaintenanceLog,
  updateVehicle,
} from "@/lib/services/automotiveService";
import { Vehicle, MaintenanceLog, Route } from "@/lib/types/database";
import { AddVehicleModal } from "@/components/modals/AddVehicleModal";
import { AddMaintenanceModal } from "@/components/modals/AddMaintenanceModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function AutomotivePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);

  // Load all data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Fetch vehicles and routes in parallel
      const [fetchedVehicles, fetchedRoutes] = await Promise.all([
        getUserVehicles(userId),
        getUserRoutes(userId),
      ]);

      setVehicles(fetchedVehicles);
      setRoutes(fetchedRoutes);

      // Set selected vehicle (primary or first vehicle)
      if (fetchedVehicles.length > 0) {
        const primary = fetchedVehicles.find((v) => v.is_primary);
        const vehicle = primary || fetchedVehicles[0];
        setSelectedVehicle(vehicle);

        // Fetch maintenance logs for selected vehicle
        const logs = await getVehicleMaintenanceLogs(vehicle.vehicle_id);
        setMaintenanceLogs(logs);
      } else {
        setSelectedVehicle(null);
        setMaintenanceLogs([]);
      }
    } catch (error) {
      console.error("Error loading automotive data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load maintenance logs when selected vehicle changes
  useEffect(() => {
    const loadMaintenanceLogs = async () => {
      if (selectedVehicle) {
        try {
          const logs = await getVehicleMaintenanceLogs(selectedVehicle.vehicle_id);
          setMaintenanceLogs(logs);
        } catch (error) {
          console.error("Error loading maintenance logs:", error);
        }
      }
    };
    loadMaintenanceLogs();
  }, [selectedVehicle]);

  // Handle vehicle added
  const handleVehicleAdded = () => {
    loadData();
  };

  // Handle maintenance added
  const handleMaintenanceAdded = () => {
    loadData();
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      await deleteVehicle(vehicleId);
      loadData();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setError("Failed to delete vehicle. Please try again.");
    }
  };

  // Handle delete maintenance log
  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      await deleteMaintenanceLog(maintenanceId);
      loadData();
    } catch (error) {
      console.error("Error deleting maintenance log:", error);
      setError("Failed to delete maintenance record. Please try again.");
    }
  };

  // Handle set primary vehicle
  const handleSetPrimary = async (vehicleId: string) => {
    try {
      // Update all vehicles to not primary
      await Promise.all(
        vehicles.map((v) =>
          updateVehicle(v.vehicle_id, { is_primary: v.vehicle_id === vehicleId })
        )
      );
      loadData();
    } catch (error) {
      console.error("Error setting primary vehicle:", error);
      setError("Failed to set primary vehicle. Please try again.");
    }
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
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold">Automotive</h1>
            {selectedVehicle && (
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                {selectedVehicle.make} {selectedVehicle.model}
              </p>
            )}
          </div>
          <Button
            onClick={() => setIsAddVehicleOpen(true)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-primary/10 relative"
          >
            <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
              add
            </span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-28">
        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Vehicle Overview Section */}
        <div className="p-6">
          {isLoading ? (
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-8 shadow-md frosted-glass border border-white/30 dark:border-white/10 text-center">
              <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                directions_car
              </span>
              <h2 className="text-xl font-bold mb-2">No Vehicles Yet</h2>
              <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                Add your first vehicle to start tracking maintenance and trips
              </p>
              <Button
                onClick={() => setIsAddVehicleOpen(true)}
                className="bg-primary text-white rounded-lg"
              >
                <span className="material-symbols-outlined text-base mr-2">
                  add
                </span>
                Add Your First Vehicle
              </Button>
            </div>
          ) : selectedVehicle ? (
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  {selectedVehicle.year && (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      {selectedVehicle.year}
                      {selectedVehicle.color && ` • ${selectedVehicle.color}`}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                        more_vert
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!selectedVehicle.is_primary && (
                      <DropdownMenuItem
                        onClick={() => handleSetPrimary(selectedVehicle.vehicle_id)}
                      >
                        <span className="material-symbols-outlined text-sm mr-2">
                          star
                        </span>
                        Set as Primary
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteVehicle(selectedVehicle.vehicle_id)}
                      className="text-destructive"
                    >
                      <span className="material-symbols-outlined text-sm mr-2">
                        delete
                      </span>
                      Delete Vehicle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Vehicle Selector */}
              {vehicles.length > 1 && (
                <div className="mb-4">
                  <select
                    value={selectedVehicle.vehicle_id}
                    onChange={(e) => {
                      const vehicle = vehicles.find(
                        (v) => v.vehicle_id === e.target.value
                      );
                      setSelectedVehicle(vehicle || null);
                    }}
                    className="w-full p-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark"
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                        {vehicle.make} {vehicle.model}
                        {vehicle.is_primary && " (Primary)"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Mileage
                  </p>
                  <p className="text-xl font-bold">
                    {selectedVehicle.mileage?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Fuel Type
                  </p>
                  <p className="text-xl font-bold capitalize">
                    {selectedVehicle.fuel_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    Maintenance
                  </p>
                  <p className="text-xl font-bold">{maintenanceLogs.length}</p>
                </div>
              </div>

              {selectedVehicle.license_plate && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-xs text-subtle-light dark:text-subtle-dark mb-1">
                    License Plate
                  </p>
                  <p className="text-lg font-bold">{selectedVehicle.license_plate}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Saved Routes Section */}
        {selectedVehicle && (
          <div className="px-6 mt-2">
            <h2 className="text-2xl font-bold mb-4">Saved Routes</h2>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 frosted-glass border border-white/30 dark:border-white/10">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : routes.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">
                    route
                  </span>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    No saved routes yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.slice(0, 3).map((route) => (
                    <div
                      key={route.route_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                          <span className="material-symbols-outlined text-primary">
                            {route.is_favorite ? "star" : "route"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {route.start_location} → {route.end_location}
                          </p>
                          <p className="text-sm text-subtle-light dark:text-subtle-dark">
                            {route.distance_km && `${route.distance_km} km`}
                            {route.estimated_time_minutes &&
                              ` • ${route.estimated_time_minutes} min`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {routes.length > 3 && (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full text-center py-2 px-4 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      View All Routes ({routes.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Maintenance History Section */}
        {selectedVehicle && (
          <div className="px-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Maintenance History</h2>
              <Button
                onClick={() => setIsAddMaintenanceOpen(true)}
                size="sm"
                className="bg-primary text-white rounded-lg"
              >
                <span className="material-symbols-outlined text-base mr-1">
                  add
                </span>
                Add Record
              </Button>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 frosted-glass border border-white/30 dark:border-white/10">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : maintenanceLogs.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-2">
                    build
                  </span>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                    No maintenance records yet
                  </p>
                  <Button
                    onClick={() => setIsAddMaintenanceOpen(true)}
                    size="sm"
                    variant="outline"
                  >
                    Add Your First Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceLogs.slice(0, 5).map((log, index) => (
                    <div
                      key={log.maintenance_id}
                      className={cn(
                        "flex items-center justify-between py-2",
                        index < maintenanceLogs.length - 1 &&
                          "border-b border-border-light/50 dark:border-border-dark/50"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="material-symbols-outlined text-primary">
                          build
                        </span>
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {log.service_type.replace(/-/g, " ")}
                          </p>
                          {log.description && (
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                              {log.description}
                            </p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                            <span>
                              {new Date(log.maintenance_date).toLocaleDateString()}
                            </span>
                            {log.mileage && <span>{log.mileage.toLocaleString()} mi</span>}
                            {log.cost && <span>${log.cost.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <span className="material-symbols-outlined text-sm text-subtle-light dark:text-subtle-dark">
                              more_vert
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteMaintenance(log.maintenance_id)}
                            className="text-destructive"
                          >
                            <span className="material-symbols-outlined text-sm mr-2">
                              delete
                            </span>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  {maintenanceLogs.length > 5 && (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full text-center py-2 px-4 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      View All Records ({maintenanceLogs.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Quick Actions Section */}
        {selectedVehicle && (
          <div className="px-6 mt-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsAddMaintenanceOpen(true)}
                className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all duration-300 frosted-glass border border-white/30 dark:border-white/10 hover:border-primary/50"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-2">
                  build
                </span>
                <p className="font-semibold text-sm">Log Maintenance</p>
              </button>
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all duration-300 frosted-glass border border-white/30 dark:border-white/10 hover:border-primary/50"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-2">
                  add_circle
                </span>
                <p className="font-semibold text-sm">Add Vehicle</p>
              </button>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all duration-300 frosted-glass border border-white/30 dark:border-white/10 opacity-50">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl mb-2">
                  route
                </span>
                <p className="font-semibold text-sm">Add Route</p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                  Coming Soon
                </p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all duration-300 frosted-glass border border-white/30 dark:border-white/10 opacity-50">
                <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-3xl mb-2">
                  local_gas_station
                </span>
                <p className="font-semibold text-sm">Log Fuel</p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSuccess={handleVehicleAdded}
      />
      {selectedVehicle && (
        <AddMaintenanceModal
          isOpen={isAddMaintenanceOpen}
          onClose={() => setIsAddMaintenanceOpen(false)}
          onSuccess={handleMaintenanceAdded}
          vehicleId={selectedVehicle.vehicle_id}
        />
      )}

      <VoiceAssistantWrapper />
      <BottomNav />
    </div>
  );
}
