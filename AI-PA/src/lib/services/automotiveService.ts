import { supabase } from "@/lib/supabaseClient";
import { Vehicle, MaintenanceLog, Route } from "@/lib/types/database";

// ===== VEHICLES =====

export async function getUserVehicles(userId: string): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
}

export async function getPrimaryVehicle(
  userId: string,
): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching primary vehicle:", error);
    throw error;
  }
}

export async function createVehicle(
  userId: string,
  vehicleData: Omit<
    Vehicle,
    "vehicle_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<Vehicle> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([{ user_id: userId, ...vehicleData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
}

export async function updateVehicle(
  vehicleId: string,
  updates: Partial<Vehicle>,
): Promise<Vehicle> {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("vehicle_id", vehicleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("vehicle_id", vehicleId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
}

// ===== MAINTENANCE LOGS =====

export async function getVehicleMaintenanceLogs(
  vehicleId: string,
): Promise<MaintenanceLog[]> {
  try {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("maintenance_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching maintenance logs:", error);
    throw error;
  }
}

export async function createMaintenanceLog(
  vehicleId: string,
  userId: string,
  logData: Omit<
    MaintenanceLog,
    "maintenance_id" | "vehicle_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<MaintenanceLog> {
  try {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .insert([
        {
          vehicle_id: vehicleId,
          user_id: userId,
          ...logData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    throw error;
  }
}

export async function updateMaintenanceLog(
  maintenanceId: string,
  updates: Partial<MaintenanceLog>,
): Promise<MaintenanceLog> {
  try {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .update(updates)
      .eq("maintenance_id", maintenanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating maintenance log:", error);
    throw error;
  }
}

export async function deleteMaintenanceLog(
  maintenanceId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("maintenance_logs")
      .delete()
      .eq("maintenance_id", maintenanceId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting maintenance log:", error);
    throw error;
  }
}

// ===== ROUTES =====

export async function getUserRoutes(userId: string): Promise<Route[]> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
}

export async function getFavoriteRoutes(userId: string): Promise<Route[]> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching favorite routes:", error);
    throw error;
  }
}

export async function createRoute(
  userId: string,
  routeData: Omit<Route, "route_id" | "user_id" | "created_at" | "updated_at">,
): Promise<Route> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .insert([{ user_id: userId, ...routeData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating route:", error);
    throw error;
  }
}

export async function updateRoute(
  routeId: string,
  updates: Partial<Route>,
): Promise<Route> {
  try {
    const { data, error } = await supabase
      .from("routes")
      .update(updates)
      .eq("route_id", routeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating route:", error);
    throw error;
  }
}

export async function deleteRoute(routeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("routes")
      .delete()
      .eq("route_id", routeId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
}
