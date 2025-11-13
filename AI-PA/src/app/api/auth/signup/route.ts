import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/auth/signup - Starting signup process');

    const body = await request.json();
    console.log('[API] Request body:', { ...body, password: '[REDACTED]' });

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('[API] Validation error:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = validationResult.data;

    // Step 1: Check if email already exists in users table
    console.log('[API] Checking if email already exists...');
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('user_id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('[API] Email already exists:', email);
      return NextResponse.json(
        {
          error: 'An account with this email already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    // Step 2: Create Supabase Auth user using admin API
    console.log('[API] Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        phone: phone || null,
      },
    });

    if (authError) {
      console.error('[API] Auth user creation failed:', authError);
      console.log('[API] Auth error details:', {
        message: authError.message,
        code: (authError as any).code,
        status: (authError as any).status,
      });

      // Check if user already exists in auth
      if (
        authError.message?.includes('already registered') ||
        authError.message?.includes('User already exists') ||
        authError.message?.includes('already been registered') ||
        (authError as any).code === 'email_exists' ||
        (authError as any).status === 422
      ) {
        // User exists in auth - check if they have a profile
        console.log('[API] User exists in auth, checking for profile...');

        // Get the auth user
        const { data: authUsers } = await supabaseServer.auth.admin.listUsers();
        const existingAuthUser = authUsers.users.find((u) => u.email === email);

        if (existingAuthUser) {
          // Check if profile exists
          const { data: profile } = await supabaseServer
            .from('users')
            .select('user_id')
            .eq('user_id', existingAuthUser.id)
            .single();

          if (!profile) {
            // Orphaned auth user - create the profile
            console.log('[API] Orphaned auth user detected, creating profile...');
            const { error: profileError } = await supabaseServer
              .from('users')
              .insert({
                user_id: existingAuthUser.id,
                email: existingAuthUser.email!,
                name: name,
                phone: phone || null,
                password_hash: 'managed_by_supabase_auth', // Required by schema, but not used
                theme: 'light',
                language: 'en',
              });

            if (profileError && profileError.code !== '23505') {
              console.error('[API] Failed to create profile for orphaned user:', profileError);
              return NextResponse.json(
                {
                  error: 'Account exists but profile creation failed. Please contact support.',
                  message: profileError.message,
                },
                { status: 500 }
              );
            }

            console.log('[API] Profile created for orphaned user');
            return NextResponse.json(
              {
                success: true,
                message: 'Account recovered successfully. You can now sign in.',
                user: {
                  id: existingAuthUser.id,
                  email: existingAuthUser.email,
                },
              },
              { status: 200 }
            );
          }
        }

        return NextResponse.json(
          {
            error: 'An account with this email already exists. Please sign in instead.',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to create account',
          message: authError.message,
        },
        { status: 500 }
      );
    }

    if (!authData.user) {
      console.error('[API] No user returned from auth creation');
      return NextResponse.json(
        {
          error: 'Failed to create account',
        },
        { status: 500 }
      );
    }

    console.log('[API] Auth user created successfully:', authData.user.id);

    // Step 3: Insert user record into users table
    console.log('[API] Inserting user record...');
    const { error: insertError } = await supabaseServer
      .from('users')
      .insert({
        user_id: authData.user.id,
        email,
        name,
        phone: phone || null,
        password_hash: 'managed_by_supabase_auth', // Required by schema, but not used
        theme: 'light',
        language: 'en',
      });

    if (insertError) {
      console.error('[API] User insert error:', insertError);
      
      // Handle duplicate user gracefully
      if (insertError.code === '23505') {
        console.log('[API] User record already exists, continuing...');
      } else {
        // If insert fails, try to delete the auth user to keep things consistent
        console.log('[API] Attempting to clean up auth user...');
        await supabaseServer.auth.admin.deleteUser(authData.user.id);
        
        return NextResponse.json(
          {
            error: 'Failed to create user profile',
            message: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    console.log('[API] User record created successfully');
    console.log('[API] Signup completed successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Signup error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Signup failed';

    return NextResponse.json(
      {
        error: 'Signup failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

