import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Validates and sanitizes task input data
 */
function validateTaskInput(body: any) {
  const errors: string[] = [];

  // Check required fields
  if (!body.userId || typeof body.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  // Validate optional fields
  if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') {
    errors.push('description must be a string');
  }

  if (body.status !== undefined && body.status !== null && typeof body.status !== 'string') {
    errors.push('status must be a string');
  }

  if (body.category !== undefined && body.category !== null && typeof body.category !== 'string') {
    errors.push('category must be a string');
  }

  if (body.priority !== undefined && body.priority !== null && typeof body.priority !== 'string') {
    errors.push('priority must be a string');
  }

  if (body.due_date !== undefined && body.due_date !== null && typeof body.due_date !== 'string') {
    errors.push('due_date must be a string (ISO format)');
  }

  if (body.ai_generated !== undefined && body.ai_generated !== null && typeof body.ai_generated !== 'boolean') {
    errors.push('ai_generated must be a boolean');
  }

  return errors;
}

/**
 * Sanitizes and prepares task data for insertion
 */
function prepareTaskData(body: any) {
  return {
    user_id: body.userId.trim(),
    title: body.title.trim(),
    description: body.description ? body.description.trim() : null,
    status: body.status ? body.status.trim() : 'pending',
    category: body.category ? body.category.trim() : null,
    priority: body.priority ? body.priority.trim() : 'medium',
    due_date: body.due_date || null,
    ai_generated: body.ai_generated ?? false,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('[TASK-CREATE] Starting task creation...');

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[TASK-CREATE] Failed to parse JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log('[TASK-CREATE] Request body received:', {
      userId: body.userId ? '***' : 'missing',
      title: body.title ? `"${body.title.substring(0, 50)}..."` : 'missing',
      hasDescription: !!body.description,
      status: body.status,
      category: body.category,
      priority: body.priority,
      hasDueDate: !!body.due_date,
      ai_generated: body.ai_generated,
    });

    // Validate input
    const validationErrors = validateTaskInput(body);
    if (validationErrors.length > 0) {
      console.error('[TASK-CREATE] Validation errors:', validationErrors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Prepare task data
    const taskData = prepareTaskData(body);
    console.log('[TASK-CREATE] Task data prepared for userId:', taskData.user_id);

    // Check if user profile exists
    console.log('[TASK-CREATE] Checking if user profile exists for userId:', taskData.user_id);
    const { data: userExists, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .eq('user_id', taskData.user_id)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if user doesn't exist
      console.error('[TASK-CREATE] Error checking user profile:', userCheckError);
    }

    if (!userExists) {
      console.warn('[TASK-CREATE] User profile not found, attempting to create it...');
      // Try to create a default user profile if it doesn't exist
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            user_id: taskData.user_id,
            email: `user-${taskData.user_id}@app.local`, // Placeholder email
            password_hash: 'managed_by_supabase_auth',
            theme: 'light',
            language: 'en',
          },
        ]);

      if (createUserError) {
        console.error('[TASK-CREATE] Failed to create user profile:', {
          code: createUserError.code,
          message: createUserError.message,
        });
        // If it's a unique constraint violation, the user might have been created by another request
        if (createUserError.code !== '23505') {
          return NextResponse.json(
            {
              error: 'User profile not found. Please complete your signup process or sign in again.',
              details: 'The user ID does not exist in the database. This usually means the user profile was not created during signup.'
            },
            { status: 400 }
          );
        }
      } else {
        console.log('[TASK-CREATE] User profile created successfully');
      }
    } else {
      console.log('[TASK-CREATE] User profile exists');
    }

    // Create task using service role (bypasses RLS)
    const { error: taskError, data: insertedData } = await supabaseAdmin
      .from('tasks')
      .insert([taskData])
      .select();

    if (taskError) {
      console.error('[TASK-CREATE] Supabase insert error:', {
        code: taskError.code,
        message: taskError.message,
        details: taskError.details,
        hint: taskError.hint,
      });

      // Return appropriate error based on error code
      if (taskError.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Task with this title already exists for this user' },
          { status: 409 }
        );
      }

      if (taskError.code === '23503') {
        // Foreign key constraint violation
        return NextResponse.json(
          {
            error: 'User profile not found. Please complete your signup process or sign in again.',
            details: 'The user ID does not exist in the database. This usually means the user profile was not created during signup.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to create task',
          details: {
            code: taskError.code,
            message: taskError.message,
          },
        },
        { status: 500 }
      );
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('[TASK-CREATE] No data returned from insert');
      return NextResponse.json(
        { error: 'Task created but no data returned' },
        { status: 500 }
      );
    }

    const createdTask = insertedData[0];
    console.log('[TASK-CREATE] Task created successfully:', {
      task_id: createdTask.task_id,
      user_id: createdTask.user_id,
      title: createdTask.title,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: createdTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[TASK-CREATE] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

