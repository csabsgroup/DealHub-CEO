import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTenant } from '@/auth/hooks/useTenant';
import { supabase } from '~/lib/supabase';
import type { TenantRole, TenantRoleInsert, TenantRoleUpdate } from '~/types/supabase';

const QK = 'tenant_roles';

// Lista todos os perfis de acesso do tenant
export const useTenantRoles = () => {
  const { tenantId } = useTenant();

  return useQuery<TenantRole[], Error>({
    queryKey: [QK, tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_roles')
        .select('*')
        .eq('tenant_id', tenantId as string)
        .order('is_system_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as TenantRole[];
    },
  });
};

// Cria um novo perfil de acesso
export const useCreateTenantRole = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<TenantRole, Error, TenantRoleInsert>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from('tenant_roles')
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um perfil com este nome. Use um nome diferente.');
        }
        throw error;
      }
      return data as TenantRole;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK] }),
  });
};

// Atualiza nome, descrição ou permissões de um perfil
export const useUpdateTenantRole = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string } & TenantRoleUpdate>({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase
        .from('tenant_roles')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId as string);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK] });
      // Invalida usuários pois o nome do role pode ter mudado
      queryClient.invalidateQueries({ queryKey: ['usuarios_crm'] });
    },
  });
};

// Remove um perfil de acesso (apenas perfis não-padrão)
export const useDeleteTenantRole = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tenant_roles')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId as string)
        .eq('is_system_default', false); // Proteção: nunca deleta padrões

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK] }),
  });
};
