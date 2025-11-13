import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

// Validation schema
const fixUserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * This endpoint fixes orphaned auth users (users in auth.users but not in public.users)
 * It creates the missing user profile in the users table
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/auth/fix-orphaned-user - Starting fix process');

    const body = await request.json();
    const validationResult = fixUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Step 1: Get the auth user
    console.log('[API] Looking up auth user for email:', email);
    const { data: authUsers, error: listError } = await supabaseServer.auth.admin.listUsers();

    if (listError) {
      console.error('[API] Error listing users:', listError);
      return NextResponse.json(
        {
          error: 'Failed to lookup user',
          message: listError.message,
        },
        { status: 500 }
      );
    }

    const authUser = authUsers.users.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        {
          error: 'No auth user found with this email',
        },
        { status: 404 }
      );
    }

    console.log('[API] Found auth user:', authUser.id);

    // Step 2: Check if user profile already exists
    const { data: existingProfile } = await supabaseServer
      .from('users')
      .select('user_id')
      .eq('user_id', authUser.id)
      .single();

    if (existingProfile) {
      console.log('[API] User profile already exists');
      return NextResponse.json(
        {
          success: true,
          message: 'User profile already exists. You can sign in now.',
        },
        { status: 200 }
      );
    }

    // Step 3: Create the missing user profile
    console.log('[API] Creating missing user profile...');
    const { error: insertError } = await supabaseServer
      .from('users')
      .insert({
        user_id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        phone: authUser.user_metadata?.phone || null,
        theme: 'light',
        language: 'en',
      });

    if (insertError) {
      console.error('[API] Error creating user profile:', insertError);
      return NextResponse.json(
        {
          error: 'Failed to create user profile',
          message: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log('[API] User profile created successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'User profile created successfully. You can now sign in.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Fix orphaned user error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fix user';

    return NextResponse.json(
      {
        error: 'Failed to fix user',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to remove orphaned auth user
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[API] DELETE /api/auth/fix-orphaned-user - Starting delete process');

    const body = await request.json();
    const validationResult = fixUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Step 1: Get the auth user
    console.log('[API] Looking up auth user for email:', email);
    const { data: authUsers, error: listError } = await supabaseServer.auth.admin.listUsers();

    if (listError) {
      console.error('[API] Error listing users:', listError);
      return NextResponse.json(
        {
          error: 'Failed to lookup user',
          message: listError.message,
        },
        { status: 500 }
      );
    }

    const authUser = authUsers.users.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        {
          error: 'No auth user found with this email',
        },
        { status: 404 }
      );
    }

    console.log('[API] Found auth user:', authUser.id);

    // Step 2: Delete the auth user
    console.log('[API] Deleting auth user...');
    const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(authUser.id);

    if (deleteError) {
      console.error('[API] Error deleting auth user:', deleteError);
      return NextResponse.json(
        {
          error: 'Failed to delete auth user',
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    console.log('[API] Auth user deleted successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Auth user deleted successfully. You can now sign up again.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Delete orphaned user error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete user';

    return NextResponse.json(
      {
        error: 'Failed to delete user',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

