import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
  Contrato,
  ContratoInsert,
  ContratoStatus,
  ContratoUpdate,
} from '~/types/supabase';

const TABLE = 'contratos';

// Contratos com joins nas entidades relacionadas
const COLUMNS_WITH_RELATIONS =
  '*, empresas(razao_social, nome_fantasia), propostas(numero, valor_total)';

// Lista contratos com filtros
export const useContratos = (options?: {
  empresaId?: string;
  propostaId?: string;
  status?: ContratoStatus;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];

  if (options?.empresaId) {
    filters.push({
      column: 'empresa_id',
      operator: 'eq' as const,
      value: options.empresaId,
    });
  }
  if (options?.propostaId) {
    filters.push({
      column: 'proposta_id',
      operator: 'eq' as const,
      value: options.propostaId,
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

// Contratos de uma empresa específica
export const useContratosByEmpresa = (empresaId: string | null) => {
  return useSupabaseQuery<Contrato[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'empresa_id', operator: 'eq', value: empresaId }],
    order: [{ column: 'created_at', ascending: false }],
    enabled: !!empresaId,
    queryKeyExtra: ['byEmpresa', empresaId],
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
    invalidateKeys: ['empresas'],
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
