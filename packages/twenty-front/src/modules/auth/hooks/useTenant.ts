import { useAuthContext } from '@/auth/hooks/useAuthContext';

// Hook que expõe o tenant_id ativo do usuário logado.
// Deve ser usado em toda operação de leitura/escrita para garantir isolamento multi-tenant.
export const useTenant = () => {
  const { activeTenant, userTenant, user } = useAuthContext();

  const tenantId = activeTenant?.id ?? null;

  return {
    tenantId,
    tenantName: activeTenant?.name ?? null,
    role: userTenant?.role ?? null,
    scope: userTenant?.scope ?? null,
    userId: user?.id ?? null,
  };
};
