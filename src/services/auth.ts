import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase/client';
import { referralService } from './referralService';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Sign up new user
  async signUp({ email, password, firstName, lastName, birthDate, phone }: SignUpData, referralCode?: string | null) {
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password);
      const cleanFirstName = String(firstName).trim();
      const cleanLastName = String(lastName).trim();
      const cleanBirthDate = birthDate ? String(birthDate).trim() : null;
      const cleanPhone = phone ? String(phone).trim() : null;

      console.log('🔍 Starting signup process for:', cleanEmail);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            birth_date: cleanBirthDate,
            phone: cleanPhone,
          },
          emailRedirectTo: 'https://opendoorsgame.com/confirm-email.html',
        }
      });

      if (error) {
        console.warn('⚠️ Signup failed:', error.message);
        
        // Check if it's actually an orphaned account issue
        if (error.code === 'user_already_exists' || error.message?.includes('already registered')) {
          // Try to check if profile exists for this email
          try {
            const { data: existingUser } = await supabase.auth.getUser();
            if (existingUser?.user) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', existingUser.user.id)
                .single();
              
              if (!profile) {
                console.error('❌ ORPHANED ACCOUNT DETECTED: Auth user exists but no profile');
                throw new Error('Account exists but is incomplete. Please contact support or try signing in.');
              }
            }
          } catch (checkError) {
            // Ignore check errors, just throw the original
          }
        }
        
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

      // If email confirmation is required, profile will be created when user confirms email
      // We can't verify it now because user isn't authenticated yet
      if (!data.session) {
        console.log('✅ Account created - email confirmation required');
        console.log('📧 Profile will be created when user confirms email');
      } else {
        // User is immediately signed in (email confirmation disabled)
        // Verify profile was created by trigger
        try {
          // Wait a moment for trigger to complete
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, user_type, status')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            console.warn('⚠️ Profile not found, creating manually');
            // Try to create profile manually as fallback
            const { error: manualInsertError } = await supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                email: cleanEmail,
                first_name: cleanFirstName,
                last_name: cleanLastName,
                phone: cleanPhone,
                status: 'active',
                total_games: 0,
                total_wins: 0,
                daily_plays_remaining: 1,
                subscription_status: 'free',
                user_type: 'user',
                doors_available: 0,
                doors_distributed: 0
              });

            if (manualInsertError) {
              console.warn('⚠️ Could not create profile manually:', manualInsertError.message);
              // Don't throw - trigger may have worked
            } else {
              console.log('✅ Profile created manually');
            }
          } else {
            console.log('✅ Profile verified:', profile.id);
          }
        } catch (profileError: any) {
          console.warn('⚠️ Profile check skipped:', profileError.message);
          // Don't fail signup - profile will exist after email confirmation
        }
      }
      
      // Process referral code if provided
      console.log('🔍 Referral code check:', { referralCode, hasUser: !!data.user, userId: data.user?.id });

      if (referralCode && data.user) {
        console.log('📎 Creating referral relationship with code:', referralCode);
        try {
          const { success, error: refError } = await referralService.createReferral(
            referralCode,
            data.user.id
          );
          if (refError) {
            console.warn('⚠️ Referral creation failed (user still created):', refError);
            // Log specific referral error for debugging
            if (refError.includes('unique') || refError.includes('duplicate')) {
              console.warn('⚠️ Referral code constraint issue (should be fixed by migration):', refError);
            }
          } else if (success) {
            console.log('✅ Referral relationship created successfully');
          }
        } catch (refErr: any) {
          console.warn('⚠️ Error processing referral (user still created):', refErr);
          // Check if it's a constraint error
          if (refErr?.code === '23505' || refErr?.message?.includes('unique')) {
            console.warn('⚠️ Referral code unique constraint error (run migration to fix):', refErr.message);
          }
        }
      }

      console.log('🔍 Returning signup data (user not signed in)');
      return { data, error: null };
      
    } catch (error: any) {
      console.error('❌ Sign up error:', error.message);
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

  // Reset password with retry logic
  async resetPassword(email: string, retryCount = 0): Promise<{ error: any | null }> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'opendoors://reset-password',
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);

      // Check if it's a network error and we haven't exceeded retry limit
      const isNetworkError =
        error?.message?.toLowerCase().includes('network') ||
        error?.message?.toLowerCase().includes('fetch') ||
        error?.message?.toLowerCase().includes('timeout') ||
        error?.code === 'NETWORK_ERROR' ||
        !error?.message; // Empty error messages are often network issues

      if (isNetworkError && retryCount < MAX_RETRIES) {
        console.log(`🔄 Network error detected, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.resetPassword(email, retryCount + 1);
      }

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