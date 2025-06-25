// This file is not used. The real Supabase client is in src/services/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Database } from '../types/database';

// Get from your .env file or app.config.ts
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
}); 