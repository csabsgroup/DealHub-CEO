import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Proposta,
    PropostaInsert,
    PropostaItem,
    PropostaItemInsert,
    PropostaStatus,
    PropostaUpdate,
} from '~/types/supabase';

const TABLE = 'propostas';
const ITENS_TABLE = 'proposta_itens';

// Propostas com join no negócio
const COLUMNS_WITH_RELATIONS =
  '*, negocios(titulo, empresa_id, valor_estimado)';

// Lista propostas com filtros
export const usePropostas = (options?: {
  negocioId?: string;
  status?: PropostaStatus;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.negocioId) {
    filters.push({
      column: 'negocio_id',
      operator: 'eq' as const,
      value: options.negocioId,
    });
  }
  if (options?.status) {
    filters.push({
      column: 'status',
      operator: 'eq' as const,
      value: options.status,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'numero',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Proposta[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters,
    order: [{ column: 'created_at', ascending: false }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Propostas de um negócio específico
export const usePropostasByNegocio = (negocioId: string | null) => {
  return useSupabaseQuery<Proposta[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'negocio_id', operator: 'eq', value: negocioId }],
    order: [
      { column: 'versao', ascending: false },
    ],
    enabled: !!negocioId,
    queryKeyExtra: ['byNegocio', negocioId],
  });
};

// Busca uma proposta por ID
export const useProposta = (id: string | null) => {
  return useSupabaseQuery<Proposta>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Itens de uma proposta (com dados do serviço via join)
export const usePropostaItens = (propostaId: string | null) => {
  return useSupabaseQuery<(PropostaItem & { servicos: { nome: string; categoria: string } | null })[]>({
    table: ITENS_TABLE,
    columns: '*, servicos(nome, categoria)',
    filters: [{ column: 'proposta_id', operator: 'eq', value: propostaId }],
    order: [{ column: 'posicao', ascending: true }],
    enabled: !!propostaId,
    queryKeyExtra: ['itens', propostaId],
  });
};

// Criar proposta
export const useCreateProposta = () => {
  return useSupabaseMutation<PropostaInsert, Proposta>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: ['negocios'],
  });
};

// Atualizar proposta
export const useUpdateProposta = () => {
  return useSupabaseMutation<PropostaUpdate & { id: string }, Proposta>({
    table: TABLE,
    type: 'update',
    invalidateKeys: ['negocios'],
  });
};

// Soft delete proposta
export const useDeleteProposta = () => {
  return useSupabaseMutation<{ id: string }, Proposta>({
    table: TABLE,
    type: 'softDelete',
    invalidateKeys: ['negocios', 'proposta_itens'],
  });
};

// Criar item de proposta
export const useCreatePropostaItem = () => {
  return useSupabaseMutation<PropostaItemInsert, PropostaItem>({
    table: ITENS_TABLE,
    type: 'insert',
    invalidateKeys: ['propostas'],
  });
};

// Atualizar item de proposta
export const useUpdatePropostaItem = () => {
  return useSupabaseMutation<Partial<PropostaItem> & { id: string }, PropostaItem>({
    table: ITENS_TABLE,
    type: 'update',
    invalidateKeys: ['propostas'],
  });
};

// Deletar item de proposta (hard delete)
export const useDeletePropostaItem = () => {
  return useSupabaseMutation<{ id: string }, PropostaItem>({
    table: ITENS_TABLE,
    type: 'delete',
    invalidateKeys: ['propostas'],
  });
};
