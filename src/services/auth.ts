import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Sign up new user
  async signUp({ email, password, firstName, lastName, phone }: SignUpData) {
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password);
      const cleanFirstName = String(firstName).trim();
      const cleanLastName = String(lastName).trim();
      const cleanPhone = phone ? String(phone).trim() : null;

      console.log('Starting signup process for:', { 
        email: cleanEmail, 
        firstName: cleanFirstName, 
        lastName: cleanLastName 
      });

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            phone: cleanPhone,
          },
          emailRedirectTo: 'opendoors://auth/callback',
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('No user data returned from signup');
        throw new Error('No user data returned from signup');
      }

      console.log('Auth user created successfully:', { 
        email: data.user.email, 
        userId: data.user.id 
      });

      // Profile will be created automatically by trigger
      return { data, error: null };
      
    } catch (error: any) {
      console.error('Sign up error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error };
    }
  }

  // Resend confirmation email
  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'opendoors://auth/callback',
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  }

  // Sign in user
  async signIn({ email, password }: SignInData) {
    try {
      // Defensive parameter checking and cleaning
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');
      
      if (!cleanEmail || !cleanPassword) {
        throw new Error('Valid email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
      
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'opendoors://reset-password',
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error };
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

export const authService = new AuthService(); 