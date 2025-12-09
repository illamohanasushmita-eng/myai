import { supabase } from "@/lib/supabaseClient";
import {
  Habit,
  HabitLog,
  GrowthGoal,
  LearningModule,
} from "@/lib/types/database";

// ===== HABITS =====

export async function getUserHabits(userId: string): Promise<Habit[]> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
}

export async function getActiveHabits(userId: string): Promise<Habit[]> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active habits:", error);
    throw error;
  }
}

export async function createHabit(
  userId: string,
  habitData: Omit<Habit, "habit_id" | "user_id" | "created_at" | "updated_at">,
): Promise<Habit> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .insert([{ user_id: userId, ...habitData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Habit>,
): Promise<Habit> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .update(updates)
      .eq("habit_id", habitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
}

// ===== HABIT LOGS =====

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  try {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .order("log_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    throw error;
  }
}

export async function logHabitCompletion(
  habitId: string,
  userId: string,
  logDate: string,
  completed: boolean,
  notes?: string,
): Promise<HabitLog> {
  try {
    const { data, error } = await supabase
      .from("habit_logs")
      .insert([
        {
          habit_id: habitId,
          user_id: userId,
          log_date: logDate,
          completed,
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error logging habit completion:", error);
    throw error;
  }
}

export async function getTodayHabitLogs(userId: string): Promise<HabitLog[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", today);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching today habit logs:", error);
    throw error;
  }
}

// ===== GROWTH GOALS =====

export async function getUserGrowthGoals(
  userId: string,
): Promise<GrowthGoal[]> {
  try {
    const { data, error } = await supabase
      .from("growth_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching growth goals:", error);
    throw error;
  }
}

export async function createGrowthGoal(
  userId: string,
  goalData: Omit<
    GrowthGoal,
    "goal_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<GrowthGoal> {
  try {
    const { data, error } = await supabase
      .from("growth_goals")
      .insert([{ user_id: userId, ...goalData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating growth goal:", error);
    throw error;
  }
}

export async function updateGrowthGoal(
  goalId: string,
  updates: Partial<GrowthGoal>,
): Promise<GrowthGoal> {
  try {
    const { data, error } = await supabase
      .from("growth_goals")
      .update(updates)
      .eq("goal_id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating growth goal:", error);
    throw error;
  }
}

export async function deleteGrowthGoal(goalId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("growth_goals")
      .delete()
      .eq("goal_id", goalId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting growth goal:", error);
    throw error;
  }
}

// ===== LEARNING MODULES =====

export async function getUserLearningModules(
  userId: string,
): Promise<LearningModule[]> {
  try {
    const { data, error } = await supabase
      .from("learning_modules")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching learning modules:", error);
    throw error;
  }
}

export async function createLearningModule(
  userId: string,
  moduleData: Omit<
    LearningModule,
    "module_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<LearningModule> {
  try {
    const { data, error } = await supabase
      .from("learning_modules")
      .insert([{ user_id: userId, ...moduleData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating learning module:", error);
    throw error;
  }
}
