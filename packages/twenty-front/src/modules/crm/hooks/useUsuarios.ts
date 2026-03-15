import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTenant } from '@/auth/hooks/useTenant';
import { supabase } from '~/lib/supabase';
import type { RbacPermissoes, UsuarioCRM } from '~/types/supabase';

const QK = 'usuarios_crm';

// Shape bruta retornada pelo Supabase no join user_tenants ← profiles + tenant_roles
type UserTenantRow = {
  id: string;
  user_id: string;
  tenant_role_id: string | null;
  is_active: boolean;
  created_at: string;
  profiles:
    | Array<{ id: string; email: string; full_name: string | null }>
    | { id: string; email: string; full_name: string | null }
    | null;
  tenant_roles:
    | { id: string; nome: string; permissoes: RbacPermissoes }
    | null;
};

// Lista todos os membros do tenant com join em profiles e tenant_roles
export const useUsuarios = () => {
  const { tenantId } = useTenant();

  return useQuery<UsuarioCRM[], Error>({
    queryKey: [QK, tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tenants')
        .select(
          'id, user_id, tenant_role_id, is_active, created_at, profiles!user_id(id, email, full_name), tenant_roles(id, nome, permissoes)',
        )
        .eq('tenant_id', tenantId as string)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data as unknown as UserTenantRow[]).map((row) => {
        const profile = Array.isArray(row.profiles)
          ? (row.profiles[0] ?? null)
          : row.profiles;
        return {
          id: row.id,
          user_id: row.user_id,
          tenant_role_id: row.tenant_role_id,
          is_active: row.is_active,
          created_at: row.created_at,
          email: profile?.email ?? '',
          full_name: profile?.full_name ?? null,
          role_nome: row.tenant_roles?.nome ?? null,
          role_permissoes: row.tenant_roles?.permissoes ?? null,
        };
      });
    },
  });
};

// Input para convidar um usuário existente para o tenant
export type ConvidarInput = {
  email: string;
  full_name: string;
  tenant_role_id: string;
};

export const useConvidarUsuario = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ConvidarInput>({
    mutationFn: async ({ email, full_name, tenant_role_id }) => {
      // 1. Busca o UUID do usuário pelo e-mail (SECURITY DEFINER ignora RLS)
      const { data: foundId, error: rpcError } = await supabase.rpc(
        'find_user_id_by_email',
        { p_email: email.toLowerCase().trim() },
      );

      if (rpcError) throw rpcError;
      if (!foundId) {
        throw new Error(
          'Nenhum usuário encontrado com este e-mail. Peça que ele crie uma conta primeiro.',
        );
      }

      // 2. Atualiza o nome no profile se fornecido
      if (full_name.trim()) {
        await supabase
          .from('profiles')
          .update({ full_name: full_name.trim() })
          .eq('id', foundId as string);
      }

      // 3. Vincula ao tenant com o perfil de acesso dinâmico
      const { error: insertError } = await supabase
        .from('user_tenants')
        .insert({
          user_id: foundId as string,
          tenant_id: tenantId,
          role: 'viewer',
          tenant_role_id,
          scope: 'own',
          is_active: true,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Este usuário já faz parte da sua equipe.');
        }
        throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK] });
    },
  });
};

// Input para atualizar perfil de acesso e/ou status de um membro
export type UpdateUsuarioInput = {
  id: string;
  user_id: string;
  tenant_role_id: string | null;
  is_active: boolean;
  full_name?: string;
};

export const useUpdateUsuarioCRM = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateUsuarioInput>({
    mutationFn: async ({ id, user_id, tenant_role_id, is_active, full_name }) => {
      const { error: utError } = await supabase
        .from('user_tenants')
        .update({ tenant_role_id, is_active })
        .eq('id', id)
        .eq('tenant_id', tenantId as string);

      if (utError) throw utError;

      if (full_name !== undefined) {
        await supabase
          .from('profiles')
          .update({ full_name: full_name.trim() || null })
          .eq('id', user_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK] });
    },
  });
};
