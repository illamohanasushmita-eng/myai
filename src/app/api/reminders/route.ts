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

export async function GET(request: NextRequest) {
  try {
    console.log('[REMINDERS-GET] Starting reminders fetch...');

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('[REMINDERS-GET] Missing userId parameter');
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('[REMINDERS-GET] Fetching reminders for userId:', userId);

    // Fetch reminders using service role (bypasses RLS)
    // Only select necessary columns to reduce payload size
    const { error: remindersError, data: remindersData } = await supabaseAdmin
      .from('reminders')
      .select('reminder_id, user_id, title, description, reminder_time, reminder_type, status, is_recurring, created_at')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true });

    if (remindersError) {
      console.error('[REMINDERS-GET] Database error:', {
        code: remindersError.code,
        message: remindersError.message,
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch reminders',
          details: {
            code: remindersError.code,
            message: remindersError.message,
          },
        },
        { status: 500 }
      );
    }

    console.log('[REMINDERS-GET] Reminders fetched successfully:', {
      count: remindersData?.length || 0,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: remindersData || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[REMINDERS-GET] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

