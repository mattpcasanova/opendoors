import { Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ error: any; user?: User }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthError {
  message: string;
}

interface AuthResult {
  error: any;
  user?: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await authService.signIn({ email, password });
      
      if (error) {
        return { error };
      }
      
      if (data?.user) {
        setUser(data.user);
      }
      
      return { error: null, user: data?.user || undefined };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during sign in'
      };
    }
  };

  const signUp = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<AuthResult> => {
    try {
      const { data: authData, error } = await authService.signUp(data);
      
      if (error) {
        return { error };
      }
      
      return { error: null, user: authData?.user || undefined };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'An error occurred during sign up'
      };
    }
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

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  return {
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
  };
}

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await authService.signIn({ email, password });
      
      if (error) {
        return { error };
      }
      
      return { error: null, user: data?.user || undefined };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during sign in'
      };
    }
  };

  const signUp = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { data: authData, error } = await authService.signUp(data);
      
      if (error) {
        setLoading(false);
        return { error };
      }
      
      setLoading(false);
      return { error: null, user: authData?.user || undefined };
    } catch (error) {
      setLoading(false);
      return { 
        error: error instanceof Error ? error.message : 'An error occurred during sign up'
      };
    }
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

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
  };
}

export { AuthContext };
