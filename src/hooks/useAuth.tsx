import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, SignUpData } from '../services/auth';
import { supabase } from '../services/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData, referralCode?: string | null) => Promise<{ error: any; user?: User }>;
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });
      if (session) {
        setUser(session.user);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    // Listen for auth changes and restore session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth state change:', { 
          event, 
          hasSession: !!session, 
          userId: session?.user?.id 
        });
        if (session?.user) {
          setUser(session.user);
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData, referralCode?: string | null): Promise<AuthResult> => {
    setLoading(true);
    try {
      const cleanData = {
        email: String(data.email || '').trim().toLowerCase(),
        password: String(data.password || ''),
        firstName: String(data.firstName || '').trim(),
        lastName: String(data.lastName || '').trim(),
        phone: data.phone ? String(data.phone).trim() : undefined,
      };

      const result = await authService.signUp(cleanData, referralCode);
      
      if (result.error) {
        setLoading(false);
        return { error: result.error };
      }
      
      setLoading(false);
      return { error: null, user: result.data?.user || undefined };
    } catch (error) {
      console.error('AuthProvider signUp catch block:', error);
      setLoading(false);
      return { 
        error: error instanceof Error ? error : { message: 'An unexpected error occurred during sign up' }
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      if (email === undefined || email === null) {
        return { error: { message: 'Email is required' } };
      }
      
      if (password === undefined || password === null) {
        return { error: { message: 'Password is required' } };
      }
      
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password);

      if (!cleanEmail || !cleanPassword) {
        return { error: { message: 'Email and password cannot be empty' } };
      }
      
      const result = await authService.signIn({ 
        email: cleanEmail, 
        password: cleanPassword 
      });
      
      if (result.error) {
        return { error: result.error };
      }
      
      // Don't manually set state here - let the auth state change handler do it
      return { error: null, user: result.data?.user };
      
    } catch (error) {
      console.error('AuthProvider signIn error:', error);
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
    try {
      const { error } = await authService.resendConfirmation(email);
      return { error };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'An error occurred while resending confirmation'
      };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

