import { supabase } from '@/lib/supabaseClient';

// Sign up a new user using API route (server-side)
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<any> {
  try {
    console.log('[SIGNUP] Starting signup process for email:', email);

    // Call the server-side API route to handle signup
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        phone: phone || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[SIGNUP] API error:', data);
      throw new Error(data.error || data.message || 'Signup failed');
    }

    console.log('[SIGNUP] Signup successful:', data);

    // Now sign in the user to get a session
    console.log('[SIGNUP] Signing in user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('[SIGNUP] Auto sign-in failed:', signInError);
      // Don't throw error - user was created successfully, they can sign in manually
      return {
        user: data.user,
        session: null,
        message: 'Account created successfully. Please sign in.',
      };
    }

    console.log('[SIGNUP] User signed in successfully');
    return signInData;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    console.error('[SIGNUP] Signup error:', errorMessage);
    throw new Error(errorMessage);
  }
}

// Sign in user using Supabase Auth
export async function signIn(email: string, password: string): Promise<any> {
  try {
    // Use Supabase Auth for signin
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update last login in user profile
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', data.user.id);
    }

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
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

