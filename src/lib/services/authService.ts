import { supabase } from '@/lib/supabaseClient';


// Sign up with Supabase Auth
export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<{ user: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
    throw error;
  }
}

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