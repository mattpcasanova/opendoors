import React from 'react';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
} 