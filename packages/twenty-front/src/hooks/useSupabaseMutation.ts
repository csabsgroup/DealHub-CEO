import {
    type UseMutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import { useTenant } from '@/auth/hooks/useTenant';
import { supabase } from '~/lib/supabase';

type MutationType = 'insert' | 'update' | 'delete' | 'softDelete';

type UseSupabaseMutationOptions<TInsert, TData> = {
  table: string;
  type: MutationType;
  invalidateKeys?: string[];
  onSuccessCallback?: (data: TData, variables: TInsert) => void;
} & Omit<
  UseMutationOptions<TData, Error, TInsert>,
  'mutationFn' | 'onSuccess'
>;

// Hook genérico para mutations no Supabase com injeção automática de tenant_id
export const useSupabaseMutation = <
  TInsert extends Record<string, unknown> = Record<string, unknown>,
  TData = unknown,
>(
  options: UseSupabaseMutationOptions<TInsert, TData>,
) => {
  const { tenantId, userId } = useTenant();
  const queryClient = useQueryClient();

  const { table, type, invalidateKeys = [], onSuccessCallback, ...mutationOptions } = options;

  return useMutation<TData, Error, TInsert>({
    mutationFn: async (payload: TInsert) => {
      if (!tenantId) {
        throw new Error('Tenant não selecionado');
      }

      switch (type) {
        case 'insert': {
          const insertData = {
            ...payload,
            tenant_id: tenantId,
            created_by: userId,
          };
          const { data, error } = await supabase
            .from(table)
            .insert(insertData)
            .select()
            .single();
          if (error) throw error;
          return data as TData;
        }

        case 'update': {
          const { id, ...updateFields } = payload;
          if (!id) throw new Error('ID é obrigatório para update');
          const { data, error } = await supabase
            .from(table)
            .update(updateFields)
            .eq('id', id as string)
            .eq('tenant_id', tenantId)
            .select()
            .single();
          if (error) throw error;
          return data as TData;
        }

        case 'softDelete': {
          const { id: deleteId } = payload;
          if (!deleteId) throw new Error('ID é obrigatório para soft delete');
          const { data, error } = await supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', deleteId as string)
            .eq('tenant_id', tenantId)
            .select()
            .single();
          if (error) throw error;
          return data as TData;
        }

        case 'delete': {
          const { id: hardDeleteId } = payload;
          if (!hardDeleteId)
            throw new Error('ID é obrigatório para delete');
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', hardDeleteId as string)
            .eq('tenant_id', tenantId);
          if (error) throw error;
          return {} as TData;
        }

        default:
          throw new Error(`Tipo de mutation desconhecido: ${type}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalida queries relacionadas automaticamente
      const keysToInvalidate = [table, ...invalidateKeys];
      for (const key of keysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onSuccessCallback?.(data, variables);
    },
    ...mutationOptions,
  });
};
