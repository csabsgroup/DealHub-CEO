import { useContext } from 'react';

import {
    SupabaseAuthContext,
    type SupabaseAuthContextType,
} from '@/auth/contexts/SupabaseAuthContext';

// Hook de conveniência para acessar o contexto de autenticação
export const useAuthContext = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);

  if (!context.signIn) {
    throw new Error(
      'useAuthContext deve ser utilizado dentro de <SupabaseAuthProvider>',
    );
  }

  return context;
};
