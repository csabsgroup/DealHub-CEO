import React from 'react';

import { SupabaseAuthContext } from '@/auth/contexts/SupabaseAuthContext';
import { useSupabaseAuth } from '@/auth/hooks/useSupabaseAuth';

// Provider de autenticação Supabase
// Envolve a aplicação e disponibiliza o contexto de auth
export const SupabaseAuthProvider = ({ children }: React.PropsWithChildren) => {
  const auth = useSupabaseAuth();

  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
