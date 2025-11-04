import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase/client';
import { referralService } from './referralService';

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
  async signUp({ email, password, firstName, lastName, phone }: SignUpData, referralCode?: string | null) {
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password);
      const cleanFirstName = String(firstName).trim();
      const cleanLastName = String(lastName).trim();
      const cleanPhone = phone ? String(phone).trim() : null;

      console.log('🔍 Starting signup process for:', cleanEmail);

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

      console.log('🔍 Signup result:', { 
        success: !error, 
        userId: data?.user?.id,
        hasSession: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.warn('⚠️ Auth signup error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('❌ No user data returned from signup');
        throw new Error('No user data returned from signup');
      }

      console.log('✅ User created successfully:', data.user.id);
      console.log('🔍 Session data:', { 
        hasSession: !!data.session,
        sessionUser: data.session?.user?.id 
      });

      // For testing: Update user profile status to 'active' to bypass email confirmation
      if (data.user) {
        try {
          // Update user profile status
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ status: 'active' })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.warn('⚠️ Could not update user status to active:', updateError);
          } else {
            console.log('✅ User profile status updated to active');
          }
        } catch (profileError) {
          console.warn('⚠️ Error updating user profile status:', profileError);
        }
      }

      // Profile will be created automatically by trigger
      
      // Process referral code if provided
      if (referralCode && data.user) {
        try {
          const { success, error: refError } = await referralService.createReferral(
            referralCode,
            data.user.id
          );
          if (refError) {
            console.warn('⚠️ Referral creation failed (user still created):', refError);
          } else if (success) {
            console.log('✅ Referral relationship created successfully');
          }
        } catch (refErr) {
          console.warn('⚠️ Error processing referral (user still created):', refErr);
        }
      }

      console.log('🔍 Returning signup data (user not signed in)');
      return { data, error: null };
      
    } catch (error: any) {
      console.error('❌ Sign up error:', {
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

  // Sign in existing user
  async signIn({ email, password }: SignInData) {
    try {
      if (email === undefined || email === null) {
        return { data: null, error: { message: 'Email is required' } };
      }
      
      if (password === undefined || password === null) {
        return { data: null, error: { message: 'Password is required' } };
      }
      
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password);

      if (!cleanEmail || !cleanPassword) {
        return { data: null, error: { message: 'Email and password cannot be empty' } };
      }
      
      console.log('🔍 Starting signin process for:', cleanEmail);
      
      const result = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password: cleanPassword 
      });
      
      console.log('🔍 Signin result:', { 
        success: !result.error, 
        userId: result.data?.user?.id,
        error: result.error?.message 
      });
      
      if (result.error) {
        console.warn('⚠️ Signin warning:', result.error);
        return { data: null, error: result.error };
      }
      
      console.log('✅ Signin successful for user:', result.data?.user?.id);
      // Don't manually set state here - let the auth state change handler do it
      return { data: result.data, error: null };
      
    } catch (error) {
      console.error('❌ Signin catch block error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : { message: 'An unexpected error occurred during sign in' }
      };
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