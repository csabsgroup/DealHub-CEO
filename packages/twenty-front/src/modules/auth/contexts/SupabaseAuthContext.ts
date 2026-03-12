import { type Session, type User as SupabaseUser } from '@supabase/supabase-js';
import { createContext } from 'react';

import {
    type Profile,
    type Tenant,
    type UserTenant,
} from '@/auth/types/auth.types';

export type SupabaseAuthContextType = {
  // Estado
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  activeTenant: Tenant | null;
  userTenant: UserTenant | null;
  isLoading: boolean;

  // Ações
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setActiveTenant: (tenantId: string) => Promise<void>;
};

export const SupabaseAuthContext = createContext<SupabaseAuthContextType>(
  {} as SupabaseAuthContextType,
);
