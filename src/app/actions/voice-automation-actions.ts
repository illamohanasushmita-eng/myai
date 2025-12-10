/**
 * Next.js Server Actions for Voice Automation
 * Handles server-side voice command processing
 */

"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  userId: z.string(),
});

const ReminderSchema = z.object({
  title: z.string().min(1),
  reminderTime: z.string(),
  userId: z.string(),
});

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(url, key);
}

// ============================================================================
// TASK ACTIONS
// ============================================================================

export async function createTaskAction(data: z.infer<typeof TaskSchema>) {
  try {
    const validated = TaskSchema.parse(data);
    const supabase = getSupabaseClient();

    const { data: task, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: validated.title,
          description: validated.description || "",
          user_id: validated.userId,
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      task,
      message: `Task "${validated.title}" created successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Task creation error:", error);

    return {
      success: false,
      message: "Failed to create task",
      error: message,
    };
  }
}

export async function getTasksAction(userId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      tasks: tasks || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Get tasks error:", error);

    return {
      success: false,
      tasks: [],
      error: message,
    };
  }
}

export async function completeTaskAction(taskId: string, userId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data: task, error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      task,
      message: "Task marked as complete",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Complete task error:", error);

    return {
      success: false,
      message: "Failed to complete task",
      error: message,
    };
  }
}

// ============================================================================
// REMINDER ACTIONS
// ============================================================================

export async function createReminderAction(
  data: z.infer<typeof ReminderSchema>,
) {
  try {
    const validated = ReminderSchema.parse(data);
    const supabase = getSupabaseClient();

    const { data: reminder, error } = await supabase
      .from("reminders")
      .insert([
        {
          title: validated.title,
          reminder_time: validated.reminderTime,
          user_id: validated.userId,
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      reminder,
      message: `Reminder "${validated.title}" created successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Reminder creation error:", error);

    return {
      success: false,
      message: "Failed to create reminder",
      error: message,
    };
  }
}

export async function getRemindersAction(userId: string) {
  try {
    const supabase = getSupabaseClient();

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .order("reminder_time", { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      reminders: reminders || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Get reminders error:", error);

    return {
      success: false,
      reminders: [],
      error: message,
    };
  }
}

export async function completeReminderAction(
  reminderId: string,
  userId: string,
) {
  try {
    const supabase = getSupabaseClient();

    const { data: reminder, error } = await supabase
      .from("reminders")
      .update({ completed: true })
      .eq("id", reminderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      reminder,
      message: "Reminder marked as complete",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Complete reminder error:", error);

    return {
      success: false,
      message: "Failed to complete reminder",
      error: message,
    };
  }
}

// ============================================================================
// VOICE COMMAND LOGGING
// ============================================================================

export async function logVoiceCommandAction(
  userId: string,
  command: string,
  intent: string,
  success: boolean,
) {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("voice_command_logs").insert([
      {
        user_id: userId,
        command,
        intent,
        success,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Logging error:", error);
      // Don't throw, just log
    }

    return { success: true };
  } catch (error) {
    console.error("Voice command logging error:", error);
    return { success: false };
  }
}
