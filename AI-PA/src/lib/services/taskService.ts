import { supabase } from "@/lib/supabaseClient";
import { Task } from "@/lib/types/database";

// Fetch all tasks for a user
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

// Fetch a single task
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_id", taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

// Create a new task using API route
export async function createTask(
  userId: string,
  taskData: Omit<Task, "task_id" | "user_id" | "created_at">,
): Promise<Task> {
  try {
    console.log("[TASK-SERVICE] Creating task for user:", userId);

    // Use API route to create task (uses service role key on backend)
    const response = await fetch("/api/tasks/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ...taskData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[TASK-SERVICE] Task creation failed:", {
        status: response.status,
        error: result.error,
        details: result.details,
      });

      // Provide user-friendly error messages
      if (response.status === 400) {
        if (Array.isArray(result.details)) {
          throw new Error(`Validation error: ${result.details.join(", ")}`);
        }
        // Check if it's a user profile not found error
        if (result.error && result.error.includes("User profile not found")) {
          throw new Error(
            "Your user profile was not created. Please sign up again or contact support.",
          );
        }
        throw new Error(result.error || "Invalid input");
      }

      if (response.status === 409) {
        throw new Error(result.error || "Task already exists");
      }

      throw new Error(result.error || "Failed to create task");
    }

    console.log(
      "[TASK-SERVICE] Task created successfully:",
      result.data?.task_id,
    );
    return result.data;
  } catch (error) {
    console.error("[TASK-SERVICE] Error creating task:", error);
    throw error;
  }
}

// Update a task
export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
): Promise<Task> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("task_id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", taskId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Get tasks by status
export async function getTasksByStatus(
  userId: string,
  status: string,
): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tasks by status:", error);
    throw error;
  }
}

// Get tasks by category
export async function getTasksByCategory(
  userId: string,
  category: string,
): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .ilike("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tasks by category:", error);
    throw error;
  }
}
