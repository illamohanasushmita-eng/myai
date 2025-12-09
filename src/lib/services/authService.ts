import { supabase } from '@/lib/supabaseClient';

<<<<<<< HEAD
// Cooldown for signup to prevent rate limiting
let lastSignupTime = 0;
const SIGNUP_COOLDOWN = 60000; // 60 seconds

// Sign up a new user using Supabase Auth
=======

// Sign up with Supabase Auth
>>>>>>> a6255b82338b7ae41ee0071d55d8e67f3c8aa6d2
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string
<<<<<<< HEAD
): Promise<any> {
  try {
    // Check cooldown
    const now = Date.now();
    if (now - lastSignupTime < SIGNUP_COOLDOWN) {
      const remaining = Math.ceil((SIGNUP_COOLDOWN - (now - lastSignupTime)) / 1000);
      throw new Error(`Please wait ${remaining} seconds before trying to sign up again.`);
    }

    console.log('[SIGNUP] Starting signup process for email:', email);

    // Update last signup time
    lastSignupTime = now;

    // Step 2: Create Supabase Auth user
    console.log('[SIGNUP] Creating Supabase Auth user...');
=======
): Promise<{ user: any; error: any }> {
  try {
>>>>>>> a6255b82338b7ae41ee0071d55d8e67f3c8aa6d2
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
<<<<<<< HEAD
        },
      },
    });

    if (error) {
      // Check if user already exists in auth
      if (
        error.message?.includes('already registered') ||
        error.message?.includes('User already exists')
      ) {
        console.log('[SIGNUP] User already exists in auth');
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      console.error('[SIGNUP] Auth signup failed:', error.message);
      throw new Error(error.message || 'Failed to create auth user');
    }

    if (!data.user) {
      throw new Error('Failed to create auth user');
    }

    console.log('[SIGNUP] Auth user created successfully:', data.user.id);
    console.log('[SIGNUP] Signup completed successfully');
    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    console.error('[SIGNUP] Signup error:', errorMessage);
    throw new Error(errorMessage);
  }
}

// Sign in user using Supabase Auth
export async function signIn(email: string, password: string): Promise<any> {
  try {
    console.log('[SIGNIN] Starting sign in for email:', email);

    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if Supabase is initialized
    if (!supabase) {
      console.error('[SIGNIN] Supabase client not initialized');
      throw new Error('Authentication service not available. Please check your environment configuration.');
    }

    console.log('[SIGNIN] Calling Supabase auth.signInWithPassword...');

    // Use Supabase Auth for signin
=======
        }
      }
    });

    if (error) throw error;

    // If signup successful, create user profile
    if (data.user) {
      await createUserProfile(data.user.id, { name, phone, email });
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
}

// Sign in with Supabase Auth
export async function signIn(email: string, password: string): Promise<{ user: any; error: any }> {
  try {
>>>>>>> a6255b82338b7ae41ee0071d55d8e67f3c8aa6d2
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

<<<<<<< HEAD
    if (error) {
      console.error('[SIGNIN] Supabase auth error:', error);
      throw new Error(error.message || 'Sign in failed');
    }

    console.log('[SIGNIN] Sign in successful for user:', data.user?.id);

    // Update last login in user profile
    if (data.user) {
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', data.user.id);
        console.log('[SIGNIN] Updated last login timestamp');
      } catch (updateError) {
        console.warn('[SIGNIN] Failed to update last login:', updateError);
        // Don't throw - this is not critical
      }
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[SIGNIN] Sign in error:', errorMessage);
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
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Note: This is a simple implementation
    // In production, use bcryptjs.compare()
    const parts = hash.split(':');
    const hashedPassword = parts[1];
    return hashedPassword === password; // This is NOT secure - use bcryptjs in production
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Change password
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await verifyPassword(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('user_id', userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error changing password:', error);
=======
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
}

// Create user profile in your custom users table
async function createUserProfile(userId: string, userData: { name: string; phone?: string; email: string }) {
  try {
    const { error } = await supabase
      .from('users')
      .insert([
        {
          user_id: userId, // Use Supabase Auth user ID
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          theme: 'light',
          language: 'en',
        },
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating user profile:', error);
>>>>>>> a6255b82338b7ae41ee0071d55d8e67f3c8aa6d2
    throw error;
  }
}

<<<<<<< HEAD
// Reset password (send reset link via Supabase Auth)
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    // Use Supabase Auth to send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}

// Sign out user
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
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
    console.error('Error getting current user:', error);
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
    console.error('Error getting session:', error);
    return null;
  }
}
=======
// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
>>>>>>> a6255b82338b7ae41ee0071d55d8e67f3c8aa6d2
