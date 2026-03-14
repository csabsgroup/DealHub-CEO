import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
  Implantacao,
  ImplantacaoInsert,
  ImplantacaoRisco,
  ImplantacaoStatus,
  ImplantacaoUpdate,
} from '~/types/supabase';

const TABLE = 'implantacoes';

// Implantações com joins nas entidades relacionadas
const COLUMNS_WITH_RELATIONS =
  '*, empresas(razao_social, nome_fantasia), contratos(numero, status)';

// Lista implantações com filtros
export const useImplantacoes = (options?: {
  empresaId?: string;
  contratoId?: string;
  status?: ImplantacaoStatus;
  risco?: ImplantacaoRisco;
  responsavelId?: string;
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
  if (options?.contratoId) {
    filters.push({
      column: 'contrato_id',
      operator: 'eq' as const,
      value: options.contratoId,
    });
  }
  if (options?.status) {
    filters.push({
      column: 'status',
      operator: 'eq' as const,
      value: options.status,
    });
  }
  if (options?.risco) {
    filters.push({
      column: 'risco',
      operator: 'eq' as const,
      value: options.risco,
    });
  }
  if (options?.responsavelId) {
    filters.push({
      column: 'responsavel_id',
      operator: 'eq' as const,
      value: options.responsavelId,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'nome',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Implantacao[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters,
    order: [{ column: 'created_at', ascending: false }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Implantações de uma empresa específica
export const useImplantacoesByEmpresa = (empresaId: string | null) => {
  return useSupabaseQuery<Implantacao[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'empresa_id', operator: 'eq', value: empresaId }],
    order: [{ column: 'created_at', ascending: false }],
    enabled: !!empresaId,
    queryKeyExtra: ['byEmpresa', empresaId],
  });
};

// Busca uma implantação por ID
export const useImplantacao = (id: string | null) => {
  return useSupabaseQuery<Implantacao>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar implantação
export const useCreateImplantacao = () => {
  return useSupabaseMutation<ImplantacaoInsert, Implantacao>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: ['empresas', 'contratos'],
  });
};

// Atualizar implantação
export const useUpdateImplantacao = () => {
  return useSupabaseMutation<ImplantacaoUpdate & { id: string }, Implantacao>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete implantação
export const useDeleteImplantacao = () => {
  return useSupabaseMutation<{ id: string }, Implantacao>({
    table: TABLE,
    type: 'softDelete',
  });
};
