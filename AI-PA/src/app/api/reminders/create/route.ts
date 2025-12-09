import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create a Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Validate reminder input
function validateReminderInput(body: any): string[] {
  const errors: string[] = [];

  if (!body.userId || typeof body.userId !== "string") {
    errors.push("userId is required and must be a string");
  }

  if (
    !body.title ||
    typeof body.title !== "string" ||
    body.title.trim().length === 0
  ) {
    errors.push("title is required and must be a non-empty string");
  }

  if (!body.reminder_time || typeof body.reminder_time !== "string") {
    errors.push("reminder_time is required and must be a valid ISO timestamp");
  }

  // Validate reminder_time is a valid date
  try {
    new Date(body.reminder_time);
  } catch {
    errors.push("reminder_time must be a valid ISO timestamp");
  }

  return errors;
}

// Prepare reminder data for insertion
function prepareReminderData(body: any) {
  return {
    user_id: body.userId,
    title: body.title.trim(),
    description: body.description ? body.description.trim() : null,
    reminder_time: body.reminder_time,
    reminder_type: body.reminder_type || "notification",
    status: body.status || "pending",
    is_recurring: body.is_recurring || false,
    recurrence_pattern: body.recurrence_pattern || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[REMINDER-CREATE] Starting reminder creation...");

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[REMINDER-CREATE] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    console.log("[REMINDER-CREATE] Request body received:", {
      userId: body.userId ? "***" : "missing",
      title: body.title ? `"${body.title.substring(0, 50)}..."` : "missing",
      hasDescription: !!body.description,
      reminder_type: body.reminder_type,
      status: body.status,
      is_recurring: body.is_recurring,
    });

    // Validate input
    const validationErrors = validateReminderInput(body);
    if (validationErrors.length > 0) {
      console.error("[REMINDER-CREATE] Validation errors:", validationErrors);
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }

    // Prepare reminder data
    const reminderData = prepareReminderData(body);
    console.log(
      "[REMINDER-CREATE] Reminder data prepared for userId:",
      reminderData.user_id,
    );

    // Check if user profile exists
    console.log(
      "[REMINDER-CREATE] Checking if user profile exists for userId:",
      reminderData.user_id,
    );
    const { data: userExists, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_id", reminderData.user_id)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is expected if user doesn't exist
      console.error(
        "[REMINDER-CREATE] Error checking user profile:",
        userCheckError,
      );
    }

    if (!userExists) {
      console.warn(
        "[REMINDER-CREATE] User profile not found, attempting to create it...",
      );
      // Try to create a default user profile if it doesn't exist
      const { error: createUserError } = await supabaseAdmin
        .from("users")
        .insert([
          {
            user_id: reminderData.user_id,
            email: `user-${reminderData.user_id}@app.local`, // Placeholder email
            password_hash: "managed_by_supabase_auth",
            theme: "light",
            language: "en",
          },
        ]);

      if (createUserError) {
        console.error("[REMINDER-CREATE] Failed to create user profile:", {
          code: createUserError.code,
          message: createUserError.message,
        });
        // If it's a unique constraint violation, the user might have been created by another request
        if (createUserError.code !== "23505") {
          return NextResponse.json(
            {
              error:
                "User profile not found. Please complete your signup process or sign in again.",
              details:
                "The user ID does not exist in the database. This usually means the user profile was not created during signup.",
            },
            { status: 400 },
          );
        }
      } else {
        console.log("[REMINDER-CREATE] User profile created successfully");
      }
    } else {
      console.log("[REMINDER-CREATE] User profile exists");
    }

    // Create reminder using service role (bypasses RLS)
    const { error: reminderError, data: insertedData } = await supabaseAdmin
      .from("reminders")
      .insert([reminderData])
      .select();

    if (reminderError) {
      console.error("[REMINDER-CREATE] Database error:", {
        code: reminderError.code,
        message: reminderError.message,
      });

      // Handle specific database errors
      if (reminderError.code === "23503") {
        // Foreign key constraint violation
        return NextResponse.json(
          {
            error:
              "User profile not found. Please complete your signup process or sign in again.",
            details: "The user ID does not exist in the database.",
          },
          { status: 400 },
        );
      }

      if (reminderError.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          {
            error: "A reminder with this title already exists",
            details: reminderError.message,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create reminder",
          details: {
            code: reminderError.code,
            message: reminderError.message,
          },
        },
        { status: 500 },
      );
    }

    if (!insertedData || insertedData.length === 0) {
      console.error("[REMINDER-CREATE] No data returned from insert");
      return NextResponse.json(
        { error: "Reminder created but no data returned" },
        { status: 500 },
      );
    }

    const createdReminder = insertedData[0];
    console.log("[REMINDER-CREATE] Reminder created successfully:", {
      reminder_id: createdReminder.reminder_id,
      user_id: createdReminder.user_id,
      title: createdReminder.title,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reminder created successfully",
        data: createdReminder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REMINDER-CREATE] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
