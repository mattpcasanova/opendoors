import { supabase } from '../services/supabase/client';

export const debugAuth = {
  // Test direct Supabase connection
  async testDirectSignIn(email: string, password: string) {
    console.log('=== DIRECT SUPABASE TEST ===');
    console.log('Email:', email, 'Type:', typeof email);
    console.log('Password length:', password.length, 'Type:', typeof password);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(email).trim(),
        password: String(password),
      });
      
      console.log('Direct result:', { 
        success: !error, 
        userEmail: data?.user?.email,
        error: error?.message 
      });
      
      return { data, error };
    } catch (err) {
      console.error('Direct test error:', err);
      return { data: null, error: err };
    }
  },

  // Test Supabase connection
  async testConnection() {
    console.log('=== SUPABASE CONNECTION TEST ===');
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Connection test result:', { 
        connected: !error, 
        hasSession: !!data?.session,
        error: error?.message 
      });
      return !error;
    } catch (err) {
      console.error('Connection test failed:', err);
      return false;
    }
  },

  // Log current auth state
  async logAuthState() {
    console.log('=== CURRENT AUTH STATE ===');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Current user:', user?.email || 'none');
      console.log('Current session:', !!session);
      console.log('Session expires:', session?.expires_at);
    } catch (err) {
      console.error('Auth state check failed:', err);
    }
  }
}; 