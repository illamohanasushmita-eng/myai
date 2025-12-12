import { supabase } from "@/lib/supabaseClient";

// Sign up a new user using Supabase Auth
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<any> {
  try {
    console.log("[SIGNUP] Starting signup process for email:", email);

    // Step 1: Pre-signup email check - query users table for existing email
    console.log("[SIGNUP] Checking if email already exists in users table...");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("user_id, email")
      .eq("email", email)
      .single();

    // If email exists in users table, return user-friendly error
    if (existingUser) {
      console.log("[SIGNUP] Email already exists in users table:", email);
      throw new Error(
        "An account with this email already exists. Please sign in instead.",
      );
    }

    // Ignore "no rows" error - this is expected for new emails
    if (checkError && checkError.code !== "PGRST116") {
      console.warn("[SIGNUP] Unexpected error checking email:", checkError);
      // Continue anyway - don't block signup on check errors
    }

    // Step 2: Create Supabase Auth user
    console.log("[SIGNUP] Creating Supabase Auth user...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) {
      // Check if user already exists in auth
      if (
        error.message?.includes("already registered") ||
        error.message?.includes("User already exists")
      ) {
        console.log("[SIGNUP] User already exists in auth");
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }
      console.error("[SIGNUP] Auth signup failed:", error.message);
      throw new Error(error.message || "Failed to create auth user");
    }

    if (!data.user) {
      throw new Error("Failed to create auth user");
    }

    console.log(
      "[SIGNUP] Auth signup result: user=",
      data?.user?.id ?? null,
      " session=",
      data?.session ? "present" : "absent",
    );

    // If Supabase returns a session, the user is immediately authenticated
    // (email confirmations are not required). Only in that case can we
    // safely insert into the `users` table from the client. If there is no
    // session (common when email confirmation is required), skip the insert
    // because client-side inserts will often be rejected by RLS policies.
    const needsConfirmation = !data?.session;

    if (!needsConfirmation && data?.user) {
      console.log("[SIGNUP] Inserting user record for userId:", data.user.id);
      const maxAttempts = 3;
      let attempt = 0;
      let inserted = false;
      while (attempt < maxAttempts && !inserted) {
        attempt += 1;
        try {
          const { error: insertError } = await supabase.from("users").insert({
            user_id: data.user.id,
            email,
            name,
            phone: phone || null,
            password_hash: "managed_by_supabase_auth",
            theme: "light",
            language: "en",
          });

          if (insertError) {
            const code = (insertError as any)?.code;
            const message = (insertError as any)?.message || JSON.stringify(insertError);
            console.warn(
              `[SIGNUP] Users table insert failed (attempt ${attempt}/${maxAttempts}):`,
              code,
              message,
            );
            if (attempt < maxAttempts) {
              // exponential backoff
              const delayMs = 500 * Math.pow(2, attempt - 1);
              await new Promise((res) => setTimeout(res, delayMs));
              continue;
            }
          } else {
            console.log("[SIGNUP] User record created successfully");
            inserted = true;
            break;
          }
        } catch (e) {
          console.warn(
            `[SIGNUP] Error inserting users record (attempt ${attempt}/${maxAttempts}):`,
            e,
          );
          if (attempt < maxAttempts) {
            const delayMs = 500 * Math.pow(2, attempt - 1);
            await new Promise((res) => setTimeout(res, delayMs));
            continue;
          }
        }
      }

      if (!inserted) {
        console.warn(
          "[SIGNUP] Users table insert failed after retries (non-blocking). Will not block signup.",
        );
      }
    } else {
      console.log("[SIGNUP] Skipping users table insert; confirmation required or session absent");
    }

    console.log("[SIGNUP] Signup completed successfully (auth created)");
    return { user: data?.user ?? null, session: data?.session ?? null, needsConfirmation };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Signup failed";
    console.error("[SIGNUP] Signup error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Sign in user using Supabase Auth
export async function signIn(email: string, password: string): Promise<any> {
  try {
    console.log("[SIGNIN] Starting sign in for email:", email);

    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if Supabase is initialized
    if (!supabase) {
      console.error("[SIGNIN] Supabase client not initialized");
      throw new Error(
        "Authentication service not available. Please check your environment configuration.",
      );
    }

    console.log("[SIGNIN] Calling Supabase auth.signInWithPassword...");

    // Use Supabase Auth for signin
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[SIGNIN] Supabase auth error:", error);
      throw new Error(error.message || "Sign in failed");
    }

    console.log("[SIGNIN] Sign in successful for user:", data.user?.id);

    // Update last login in user profile
    if (data.user) {
      try {
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("user_id", data.user.id);
        console.log("[SIGNIN] Updated last login timestamp");
      } catch (updateError) {
        console.warn("[SIGNIN] Failed to update last login:", updateError);
        // Don't throw - this is not critical
      }
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[SIGNIN] Sign in error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  try {
    // Note: In production, use a proper bcrypt library
    // For now, we'll use a simple approach
    // You should install bcryptjs: npm install bcryptjs
    const salt = Math.random().toString(36).substring(2, 15);
    return `${salt}:${password}`; // This is NOT secure - use bcryptjs in production
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

// Verify password
async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    // Note: This is a simple implementation
    // In production, use bcryptjs.compare()
    const parts = hash.split(":");
    const hashedPassword = parts[1];
    return hashedPassword === password; // This is NOT secure - use bcryptjs in production
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

// Change password
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isPasswordValid = await verifyPassword(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("user_id", userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Reset password (send reset link via Supabase Auth)
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    // Use Supabase Auth to send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

// Sign out user
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Get current user session
export async function getCurrentUser(): Promise<any> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Get session
export async function getSession(): Promise<any> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
