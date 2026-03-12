import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type { Empresa, EmpresaInsert, EmpresaUpdate } from '~/types/supabase';

const TABLE = 'empresas';

// Lista empresas do tenant (exclui soft-deleted)
export const useEmpresas = (options?: {
  segmento?: string;
  donoContaId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.segmento) {
    filters.push({
      column: 'segmento',
      operator: 'eq' as const,
      value: options.segmento,
    });
  }
  if (options?.donoContaId) {
    filters.push({
      column: 'dono_conta_id',
      operator: 'eq' as const,
      value: options.donoContaId,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'razao_social',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Empresa[]>({
    table: TABLE,
    filters,
    order: [{ column: 'razao_social', ascending: true }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Busca uma empresa por ID
export const useEmpresa = (id: string | null) => {
  return useSupabaseQuery<Empresa>({
    table: TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar empresa (tenant_id injetado automaticamente)
export const useCreateEmpresa = () => {
  return useSupabaseMutation<EmpresaInsert, Empresa>({
    table: TABLE,
    type: 'insert',
  });
};

// Atualizar empresa
export const useUpdateEmpresa = () => {
  return useSupabaseMutation<EmpresaUpdate & { id: string }, Empresa>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete empresa
export const useDeleteEmpresa = () => {
  return useSupabaseMutation<{ id: string }, Empresa>({
    table: TABLE,
    type: 'softDelete',
  });
};
