import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types/database";

// Get user by ID
export async function getUser(userId: string): Promise<User | null> {
  try {
    console.log("[USER-SERVICE] Fetching user with ID:", userId);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If it's a "no rows found" error, return null instead of throwing
      if (error.code === "PGRST116") {
        console.log("[USER-SERVICE] User profile not found (PGRST116)");
        return null;
      }

      // Log detailed error information for other errors
      const errorDetails = {
        code: error.code,
        message: error.message,
        status: (error as any).status,
        details: (error as any).details,
      };
      console.error("[USER-SERVICE] Error fetching user:", errorDetails);
      throw error;
    }

    console.log("[USER-SERVICE] User fetched successfully");
    return data;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[USER-SERVICE] Exception in getUser:", errorMsg);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

// Create a new user
export async function createUser(
  userData: Partial<User> & { email: string; user_id?: string },
): Promise<User> {
  try {
    console.log("[USER-SERVICE] Creating user with email:", userData.email);

    // Use upsert to avoid duplicate-key errors when a profile already exists.
    // Prefer updating existing record if `user_id` is provided.
    try {
      const { data, error } = await supabase
        .from("users")
        .upsert(userData, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          status: (error as any).status,
          details: (error as any).details,
        };
        console.error("[USER-SERVICE] Error upserting user:", errorDetails);
        throw error;
      }

      console.log("[USER-SERVICE] User upserted successfully");
      return data;
    } catch (e: any) {
      // If upsert isn't supported or still errors due to unique constraint,
      // fall back to returning the existing record when possible.
      if (e?.code === "23505") {
        console.warn("[USER-SERVICE] Duplicate user detected, fetching existing record");
        try {
          const existing = await getUserByEmail(userData.email as string);
          if (existing) return existing;
        } catch (fetchErr) {
          console.error("[USER-SERVICE] Failed to fetch existing user after duplicate error:", fetchErr);
        }
      }
      const errorMsg = e instanceof Error ? e.message : JSON.stringify(e);
      console.error("[USER-SERVICE] Exception in createUser:", errorMsg);
      throw e;
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[USER-SERVICE] Exception in createUser:", errorMsg);
    throw error;
  }
}

// Update user
export async function updateUser(
  userId: string,
  updates: Partial<User>,
): Promise<User> {
  try {
    console.log("[USER-SERVICE] updateUser called with userId:", userId);
    console.log("[USER-SERVICE] Updates to apply:", {
      ...updates,
      avatar_url: updates.avatar_url
        ? `${updates.avatar_url.substring(0, 50)}...`
        : "not set",
    });

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[USER-SERVICE] Supabase error during update:", error);
      throw error;
    }

    console.log("[USER-SERVICE] Update successful, returned data:", {
      ...data,
      avatar_url: data.avatar_url
        ? `${data.avatar_url.substring(0, 50)}...`
        : "empty",
    });

    return data;
  } catch (error) {
    console.error("[USER-SERVICE] Error updating user:", error);
    throw error;
  }
}

// Update last login
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
