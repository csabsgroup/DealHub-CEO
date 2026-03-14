import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Contrato,
    ContratoInsert,
    ContratoStatus,
    ContratoUpdate,
} from '~/types/supabase';

const TABLE = 'contratos';

// Contratos com joins nas entidades relacionadas (PRD_V2 §9.12)
const COLUMNS_WITH_RELATIONS =
  '*, negocios(id, titulo, empresa_id), propostas(id, numero, valor_total)';

// Lista contratos com filtros
export const useContratos = (options?: {
  dealId?: string;
  proposalId?: string;
  status?: ContratoStatus;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];

  if (options?.dealId) {
    filters.push({
      column: 'deal_id',
      operator: 'eq' as const,
      value: options.dealId,
    });
  }
  if (options?.proposalId) {
    filters.push({
      column: 'proposal_id',
      operator: 'eq' as const,
      value: options.proposalId,
    });
  }
  if (options?.status) {
    filters.push({
      column: 'status_contrato',
      operator: 'eq' as const,
      value: options.status,
    });
  }

  return useSupabaseQuery<Contrato[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters,
    order: [{ column: 'created_at', ascending: false }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Contratos de um negócio específico
export const useContratosByDeal = (dealId: string | null) => {
  return useSupabaseQuery<Contrato[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'deal_id', operator: 'eq', value: dealId }],
    order: [{ column: 'created_at', ascending: false }],
    enabled: !!dealId,
    queryKeyExtra: ['byDeal', dealId],
  });
};

// Busca um contrato por ID
export const useContrato = (id: string | null) => {
  return useSupabaseQuery<Contrato>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar contrato
export const useCreateContrato = () => {
  return useSupabaseMutation<ContratoInsert, Contrato>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: [TABLE],
  });
};

// Atualizar contrato
export const useUpdateContrato = () => {
  return useSupabaseMutation<ContratoUpdate & { id: string }, Contrato>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete contrato
export const useDeleteContrato = () => {
  return useSupabaseMutation<{ id: string }, Contrato>({
    table: TABLE,
    type: 'softDelete',
  });
};
