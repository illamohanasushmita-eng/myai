import { supabase } from "@/lib/supabaseClient";
import { Settings, Notification } from "@/lib/types/database";

// Settings
export async function getUserSettings(
  userId: string,
): Promise<Settings | null> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
}

export async function createSettings(
  userId: string,
  settingsData?: Partial<Settings>,
): Promise<Settings> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .insert([
        {
          user_id: userId,
          ...settingsData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating settings:", error);
    throw error;
  }
}

export async function updateSettings(
  userId: string,
  updates: Partial<Settings>,
): Promise<Settings> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}

// Notifications
export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_time", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function getPendingNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("scheduled_time", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pending notifications:", error);
    throw error;
  }
}

export async function createNotification(
  userId: string,
  notificationData: Omit<Notification, "notification_id" | "user_id">,
): Promise<Notification> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          ...notificationData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function updateNotification(
  notificationId: string,
  updates: Partial<Notification>,
): Promise<Notification> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update(updates)
      .eq("notification_id", notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("notification_id", notificationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}
