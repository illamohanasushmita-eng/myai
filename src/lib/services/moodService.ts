import { supabase } from "@/lib/supabaseClient";
import { Mood } from "@/lib/types/database";

// Get all moods for a user
export async function getUserMoods(userId: string): Promise<Mood[]> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching moods:", error);
    throw error;
  }
}

// Get mood for a specific date
export async function getMoodByDate(
  userId: string,
  date: string,
): Promise<Mood | null> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching mood by date:", error);
    throw error;
  }
}

// Create a new mood entry
export async function createMood(
  userId: string,
  moodData: Omit<Mood, "mood_id" | "user_id">,
): Promise<Mood> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .insert([
        {
          user_id: userId,
          ...moodData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating mood:", error);
    throw error;
  }
}

// Update a mood entry
export async function updateMood(
  moodId: string,
  updates: Partial<Mood>,
): Promise<Mood> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .update(updates)
      .eq("mood_id", moodId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating mood:", error);
    throw error;
  }
}

// Delete a mood entry
export async function deleteMood(moodId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("moods")
      .delete()
      .eq("mood_id", moodId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting mood:", error);
    throw error;
  }
}

// Get moods for a date range
export async function getMoodsInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Mood[]> {
  try {
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching moods in range:", error);
    throw error;
  }
}
