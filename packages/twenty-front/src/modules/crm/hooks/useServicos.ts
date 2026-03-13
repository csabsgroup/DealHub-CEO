import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Servico,
    ServicoCategoria,
    ServicoInsert,
    ServicoTipoCobranca,
    ServicoUpdate,
} from '~/types/supabase';

const TABLE = 'servicos';

// Lista serviços com filtros
export const useServicos = (options?: {
  categoria?: ServicoCategoria;
  tipoCobranca?: ServicoTipoCobranca;
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.categoria) {
    filters.push({
      column: 'categoria',
      operator: 'eq' as const,
      value: options.categoria,
    });
  }
  if (options?.tipoCobranca) {
    filters.push({
      column: 'tipo_cobranca',
      operator: 'eq' as const,
      value: options.tipoCobranca,
    });
  }
  if (options?.isActive !== undefined) {
    filters.push({
      column: 'is_active',
      operator: 'eq' as const,
      value: options.isActive,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'nome',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Servico[]>({
    table: TABLE,
    filters,
    order: [{ column: 'nome', ascending: true }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Busca um serviço por ID
export const useServico = (id: string | null) => {
  return useSupabaseQuery<Servico>({
    table: TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar serviço
export const useCreateServico = () => {
  return useSupabaseMutation<ServicoInsert, Servico>({
    table: TABLE,
    type: 'insert',
  });
};

// Atualizar serviço
export const useUpdateServico = () => {
  return useSupabaseMutation<ServicoUpdate & { id: string }, Servico>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete serviço
export const useDeleteServico = () => {
  return useSupabaseMutation<{ id: string }, Servico>({
    table: TABLE,
    type: 'softDelete',
    invalidateKeys: ['pacote_servicos'],
  });
};
