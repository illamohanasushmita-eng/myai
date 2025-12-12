import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    // Disable automatic refresh attempts to avoid noisy errors when the network
    // or Supabase is temporarily unreachable. Set to `true` if you prefer
    // automatic token refresh behavior.
    autoRefreshToken: false,
  },
});

// Helpful debug log while developing — remove or comment out in production
console.debug("Supabase client initialized. URL present:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
