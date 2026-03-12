export { ProtectedRoute } from '@/auth/components/ProtectedRoute';
export { SupabaseAuthProvider } from '@/auth/components/SupabaseAuthProvider';
export { useAuthContext } from '@/auth/hooks/useAuthContext';
export { useSupabaseAuth } from '@/auth/hooks/useSupabaseAuth';
export { CreateTenantPage } from '@/auth/sign-in-up/components/CreateTenantPage';
export { SignInUpPage } from '@/auth/sign-in-up/components/SignInUpPage';

export type {
    AccessScope,
    AuthState, CreateTenantData, Profile, SignInCredentials,
    SignUpCredentials, Tenant, TenantRole, UserTenant
} from '@/auth/types/auth.types';

