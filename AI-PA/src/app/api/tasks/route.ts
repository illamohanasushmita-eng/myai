import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client (uses service role key for bypassing RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    console.log('[TASKS-GET] Starting tasks fetch...');

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('[TASKS-GET] Missing userId parameter');
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('[TASKS-GET] Fetching tasks for userId:', userId);

    // Fetch tasks using service role (bypasses RLS)
    // Only select necessary columns to reduce payload size
    const { error: tasksError, data: tasksData } = await supabaseAdmin
      .from('tasks')
      .select('task_id, user_id, title, description, due_date, category, status, priority, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('[TASKS-GET] Database error:', {
        code: tasksError.code,
        message: tasksError.message,
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch tasks',
          details: {
            code: tasksError.code,
            message: tasksError.message,
          },
        },
        { status: 500 }
      );
    }

    console.log('[TASKS-GET] Tasks fetched successfully:', {
      count: tasksData?.length || 0,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: tasksData || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[TASKS-GET] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

