import {
    type QueryKey,
    useQuery,
} from '@tanstack/react-query';

import { useTenant } from '@/auth/hooks/useTenant';
import { supabase } from '~/lib/supabase';

export type SupabaseFilter = {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
};

type SupabaseOrder = {
  column: string;
  ascending?: boolean;
};

type UseSupabaseQueryOptions = {
  table: string;
  columns?: string;
  filters?: SupabaseFilter[];
  order?: SupabaseOrder[];
  limit?: number;
  offset?: number;
  single?: boolean;
  enabled?: boolean;
  queryKeyExtra?: unknown[];
  staleTime?: number;
};

// Hook genérico para queries no Supabase com tenant_id automático e soft-delete filter
export const useSupabaseQuery = <TData = unknown[]>(
  options: UseSupabaseQueryOptions,
) => {
  const { tenantId } = useTenant();
  const {
    table,
    columns = '*',
    filters = [],
    order = [],
    limit,
    offset,
    single = false,
    enabled = true,
    queryKeyExtra = [],
    staleTime,
  } = options;

  const queryKey: QueryKey = [
    table,
    tenantId,
    { columns, filters, order, limit, offset, single },
    ...queryKeyExtra,
  ];

  return useQuery<TData, Error>({
    queryKey,
    ...(staleTime !== undefined ? { staleTime } : {}),
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant não selecionado');
      }

      let query = supabase.from(table).select(columns);

      // Sempre filtra por tenant_id
      query = query.eq('tenant_id', tenantId);

      // Filtra soft-deleted por padrão (só inclui deleted_at IS NULL)
      query = query.is('deleted_at', null);

      // Aplica filtros adicionais
      for (const filter of filters) {
        switch (filter.operator) {
          case 'in':
            query = query.in(filter.column, filter.value as unknown[]);
            break;
          case 'is':
            query = query.is(filter.column, filter.value as null);
            break;
          case 'eq':
            query = query.eq(filter.column, filter.value as string);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value as string);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value as string);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value as string);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value as string);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value as string);
            break;
          case 'like':
            query = query.like(filter.column, filter.value as string);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value as string);
            break;
        }
      }

      // Aplica ordenação
      for (const ord of order) {
        query = query.order(ord.column, {
          ascending: ord.ascending ?? true,
        });
      }

      // Paginação
      if (limit !== undefined) {
        query = query.limit(limit);
      }
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit ?? 20) - 1);
      }

      // Single ou array
      if (single) {
        const { data, error } = await query.single();
        if (error) throw error;
        return data as TData;
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as TData;
    },
    enabled: enabled && !!tenantId,
  });
};
