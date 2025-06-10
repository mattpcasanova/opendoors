import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ error: any; user?: User }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

interface AuthResult {
  error: any;
  user?: User;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<AuthResult> => {
    try {
      const cleanData = {
        email: String(data.email || '').trim().toLowerCase(),
        password: String(data.password || ''),
        firstName: String(data.firstName || '').trim(),
        lastName: String(data.lastName || '').trim(),
        phone: data.phone ? String(data.phone).trim() : undefined,
      };

      console.log('useAuthProvider signUp called:', { 
        email: cleanData.email, 
        firstName: cleanData.firstName, 
        lastName: cleanData.lastName 
      });

      const result = await authService.signUp(cleanData);
      
      if (result.error) {
        return { error: result.error };
      }
      
      return { error: null, user: result.data?.user || undefined };
    } catch (error) {
      console.error('useAuthProvider signUp catch block:', error);
      return { 
        error: error instanceof Error ? error : { message: 'An unexpected error occurred during sign up' }
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');

      console.log('useAuthProvider signIn called');
      
      if (!cleanEmail || !cleanPassword) {
        return { error: { message: 'Email and password are required' } };
      }

      const result = await authService.signIn(cleanEmail, cleanPassword);
      
      if (result.error) {
        return { error: result.error };
      }
      
      // Don't manually set state here - let the auth state change handler do it
      return { error: null, user: result.data?.user };
    } catch (error) {
      console.error('useAuthProvider signIn error:', error);
      return {
        error: error instanceof Error ? error : { message: 'An unexpected error occurred during sign in' }
      };
    }
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await authService.resendConfirmation(email);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 