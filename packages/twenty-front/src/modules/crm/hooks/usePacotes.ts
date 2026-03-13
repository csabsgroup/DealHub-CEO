import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Pacote,
    PacoteInsert,
    PacoteServico,
    PacoteServicoInsert,
    PacoteUpdate,
} from '~/types/supabase';

const TABLE = 'pacotes';
const JUNCTION_TABLE = 'pacote_servicos';

// Lista pacotes com filtros
export const usePacotes = (options?: {
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
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

  return useSupabaseQuery<Pacote[]>({
    table: TABLE,
    filters,
    order: [{ column: 'nome', ascending: true }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Busca um pacote por ID
export const usePacote = (id: string | null) => {
  return useSupabaseQuery<Pacote>({
    table: TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Serviços de um pacote (com dados do serviço via join)
export const usePacoteServicos = (pacoteId: string | null) => {
  return useSupabaseQuery<(PacoteServico & { servicos: { nome: string; categoria: string; tipo_cobranca: string; preco_sugerido: number } })[]>({
    table: JUNCTION_TABLE,
    columns: '*, servicos(nome, categoria, tipo_cobranca, preco_sugerido)',
    filters: [{ column: 'pacote_id', operator: 'eq', value: pacoteId }],
    order: [{ column: 'created_at', ascending: true }],
    enabled: !!pacoteId,
    queryKeyExtra: ['byPacote', pacoteId],
  });
};

// Criar pacote
export const useCreatePacote = () => {
  return useSupabaseMutation<PacoteInsert, Pacote>({
    table: TABLE,
    type: 'insert',
  });
};

// Atualizar pacote
export const useUpdatePacote = () => {
  return useSupabaseMutation<PacoteUpdate & { id: string }, Pacote>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete pacote
export const useDeletePacote = () => {
  return useSupabaseMutation<{ id: string }, Pacote>({
    table: TABLE,
    type: 'softDelete',
    invalidateKeys: ['pacote_servicos'],
  });
};

// Adicionar serviço a um pacote
export const useAddServicoPacote = () => {
  return useSupabaseMutation<PacoteServicoInsert, PacoteServico>({
    table: JUNCTION_TABLE,
    type: 'insert',
    invalidateKeys: ['pacotes'],
  });
};

// Remover serviço de um pacote (hard delete)
export const useRemoveServicoPacote = () => {
  return useSupabaseMutation<{ id: string }, PacoteServico>({
    table: JUNCTION_TABLE,
    type: 'delete',
    invalidateKeys: ['pacotes'],
  });
};
