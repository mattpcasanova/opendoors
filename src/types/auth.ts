import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export interface AuthResult {
  error: Error | null;
} 