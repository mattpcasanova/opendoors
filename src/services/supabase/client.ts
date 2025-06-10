import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from '@env';
import { createClient } from '@supabase/supabase-js';

// Regular client for user operations
export const supabase = createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY);

// For admin operations, we'll need to handle this differently since we can't expose the service role key
// We'll need to create a serverless function or API endpoint to handle admin operations
export const createAdminClient = (serviceRoleKey: string) => {
  return createClient(EXPO_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}; 