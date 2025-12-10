import { supabase } from "@/lib/supabaseClient";
import {
  ProfessionalNote,
  Notification,
  AILog,
  Insight,
} from "@/lib/types/database";

// ===== PROFESSIONAL NOTES =====

export async function getUserProfessionalNotes(
  userId: string,
): Promise<ProfessionalNote[]> {
  try {
    const { data, error } = await supabase
      .from("professional_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching professional notes:", error);
    throw error;
  }
}

export async function createProfessionalNote(
  userId: string,
  noteData: Omit<
    ProfessionalNote,
    "note_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<ProfessionalNote> {
  try {
    const { data, error } = await supabase
      .from("professional_notes")
      .insert([{ user_id: userId, ...noteData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating professional note:", error);
    throw error;
  }
}

export async function updateProfessionalNote(
  noteId: string,
  updates: Partial<ProfessionalNote>,
): Promise<ProfessionalNote> {
  try {
    const { data, error } = await supabase
      .from("professional_notes")
      .update(updates)
      .eq("note_id", noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating professional note:", error);
    throw error;
  }
}

export async function deleteProfessionalNote(noteId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("professional_notes")
      .delete()
      .eq("note_id", noteId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting professional note:", error);
    throw error;
  }
}

// ===== NOTIFICATIONS =====

export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function getUnreadNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
}

export async function createNotification(
  userId: string,
  notificationData: Omit<
    Notification,
    "notification_id" | "user_id" | "created_at"
  >,
): Promise<Notification> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([{ user_id: userId, ...notificationData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("notification_id", notificationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// ===== AI LOGS =====

export async function getUserAILogs(userId: string): Promise<AILog[]> {
  try {
    const { data, error } = await supabase
      .from("ai_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching AI logs:", error);
    throw error;
  }
}

export async function createAILog(
  userId: string,
  logData: Omit<AILog, "log_id" | "user_id" | "created_at">,
): Promise<AILog> {
  try {
    const { data, error } = await supabase
      .from("ai_logs")
      .insert([{ user_id: userId, ...logData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating AI log:", error);
    throw error;
  }
}

// ===== INSIGHTS =====

export async function getUserInsights(userId: string): Promise<Insight[]> {
  try {
    const { data, error } = await supabase
      .from("insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching insights:", error);
    throw error;
  }
}

export async function createInsight(
  userId: string,
  insightData: Omit<Insight, "insight_id" | "user_id" | "created_at">,
): Promise<Insight> {
  try {
    const { data, error } = await supabase
      .from("insights")
      .insert([{ user_id: userId, ...insightData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating insight:", error);
    throw error;
  }
}
