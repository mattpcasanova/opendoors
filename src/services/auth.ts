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
          emailRedirectTo: 'opendoors://auth/callback',
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

      // Verify profile was created by trigger
      if (data.user) {
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
            console.error('❌ CRITICAL: Profile was NOT created by trigger!', profileError);
            console.error('❌ User ID:', data.user.id, 'Email:', cleanEmail);
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
              console.error('❌ Failed to create profile manually:', manualInsertError);
              throw new Error('Account created but profile creation failed. Please contact support.');
            } else {
              console.log('✅ Profile created manually as fallback');
            }
          } else {
            console.log('✅ Profile verified - exists:', { id: profile.id, user_type: profile.user_type });
            
            // Update user profile status to 'active' to bypass email confirmation
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ status: 'active' })
              .eq('id', data.user.id);
            
            if (updateError) {
              console.warn('⚠️ Could not update user status to active:', updateError);
            } else {
              console.log('✅ User profile status updated to active');
            }
          }
        } catch (profileError: any) {
          console.error('❌ Error verifying/creating profile:', profileError);
          // Don't fail signup if profile check fails - user is created
        }
      }
      
      // Process referral code if provided
      if (referralCode && data.user) {
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