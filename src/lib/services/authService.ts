import { supabase } from "@/lib/supabaseClient";

// Cooldown for signup to prevent rate limiting
let lastSignupTime = 0;
const SIGNUP_COOLDOWN = 60000; // 60 seconds

// Sign up with Supabase Auth
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<{ user: any; error: any }> {
  try {
    // Check cooldown
    const now = Date.now();
    if (now - lastSignupTime < SIGNUP_COOLDOWN) {
      const remaining = Math.ceil(
        (SIGNUP_COOLDOWN - (now - lastSignupTime)) / 1000,
      );
      throw new Error(
        `Please wait ${remaining} seconds before trying to sign up again.`,
      );
    }

    console.log("[SIGNUP] Starting signup process for email:", email);

    // Update last signup time
    lastSignupTime = now;

    // Create Supabase Auth user
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

    console.log("[SIGNUP] Auth user created successfully:", data.user.id);

    // If signup successful, create user profile
    if (data.user) {
      await createUserProfile(data.user.id, { name, phone, email });
    }

    console.log("[SIGNUP] Signup completed successfully");
    return { user: data.user, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Signup failed";
    console.error("[SIGNUP] Signup error:", errorMessage);
    return { user: null, error: errorMessage };
  }
}

// Sign in with Supabase Auth
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: any; error: any }> {
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

    return { user: data.user, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[SIGNIN] Sign in error:", errorMessage);
    return { user: null, error: errorMessage };
  }
}

// Create user profile in your custom users table
async function createUserProfile(
  userId: string,
  userData: { name: string; phone?: string; email: string },
) {
  try {
    const { error } = await supabase.from("users").insert([
      {
        user_id: userId, // Use Supabase Auth user ID
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        theme: "light",
        language: "en",
      },
    ]);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
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
    console.log("[CHANGE-PASSWORD] Starting password change for userId:", userId);

    // Get user email from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, password_hash")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      console.error("[CHANGE-PASSWORD] User not found:", userError);
      throw new Error("User not found");
    }

    console.log("[CHANGE-PASSWORD] User found:", user.email);
    console.log("[CHANGE-PASSWORD] Password hash type:", user.password_hash);

    // Check if password is managed by Supabase Auth
    if (user.password_hash === "managed_by_supabase_auth") {
      console.log("[CHANGE-PASSWORD] Using Supabase Auth to change password");

      // First, verify the old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        console.error("[CHANGE-PASSWORD] Old password verification failed:", signInError.message);
        throw new Error("Invalid password");
      }

      console.log("[CHANGE-PASSWORD] Old password verified, updating to new password");

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("[CHANGE-PASSWORD] Failed to update password:", updateError.message);
        throw new Error(updateError.message || "Failed to update password");
      }

      console.log("[CHANGE-PASSWORD] Password updated successfully via Supabase Auth");
    } else {
      // Legacy: password stored in users table (for backwards compatibility)
      console.log("[CHANGE-PASSWORD] Using legacy password verification");

      const isPasswordValid = await verifyPassword(
        oldPassword,
        user.password_hash,
      );

      if (!isPasswordValid) {
        console.error("[CHANGE-PASSWORD] Invalid old password");
        throw new Error("Invalid password");
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password in users table
      const { error: updateError } = await supabase
        .from("users")
        .update({ password_hash: newPasswordHash })
        .eq("user_id", userId);

      if (updateError) {
        console.error("[CHANGE-PASSWORD] Failed to update password hash:", updateError);
        throw updateError;
      }

      console.log("[CHANGE-PASSWORD] Password updated successfully in users table");
    }
  } catch (error) {
    console.error("[CHANGE-PASSWORD] Error changing password:", error);
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
