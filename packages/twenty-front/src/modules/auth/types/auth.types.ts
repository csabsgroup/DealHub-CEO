// Tipos de autenticação e perfil do usuário para o CRM Multi-Tenant

import { type Session, type User as SupabaseUser } from '@supabase/supabase-js';

// Perfil do usuário (tabela profiles)
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Vínculo usuário-tenant (tabela user_tenants)
export type UserTenant = {
  id: string;
  user_id: string;
  tenant_id: string;
  role: TenantRole;
  scope: AccessScope;
  manager_id: string | null;
  business_unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Tenant (tabela tenants)
export type Tenant = {
  id: string;
  name: string;
  cnpj: string | null;
  logo_url: string | null;
  domain: string | null;
  currency: string;
  timezone: string;
  language: string;
  primary_color: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// Papéis possíveis dentro de um tenant
export type TenantRole =
  | 'owner'
  | 'admin'
  | 'gestor_comercial'
  | 'sdr_bdr'
  | 'closer'
  | 'executivo_contas'
  | 'onboarding'
  | 'financeiro'
  | 'atendimento'
  | 'viewer'
  | 'custom';

// Escopos de visibilidade
export type AccessScope = 'own' | 'team' | 'business_unit' | 'all';

// Estado completo de autenticação
export type AuthState = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  activeTenant: Tenant | null;
  userTenant: UserTenant | null;
  isLoading: boolean;
};

// Credenciais para sign-in/sign-up
export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
};

// Dados para criação de tenant no onboarding
export type CreateTenantData = {
  name: string;
  cnpj?: string;
};
