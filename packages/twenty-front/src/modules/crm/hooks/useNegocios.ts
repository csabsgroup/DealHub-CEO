import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Negocio,
    NegocioInsert,
    NegocioStatusFinal,
    NegocioUpdate,
} from '~/types/supabase';

const TABLE = 'negocios';

// Negocios com joins nas entidades relacionadas
const COLUMNS_WITH_RELATIONS =
  '*, empresas(razao_social, nome_fantasia), contatos(nome, email), pipelines(nome), pipeline_etapas(nome, cor, posicao), motivos_perda(nome)';

// Lista negócios com filtros
export const useNegocios = (options?: {
  pipelineId?: string;
  etapaId?: string;
  responsavelId?: string;
  statusFinal?: NegocioStatusFinal;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.pipelineId) {
    filters.push({
      column: 'pipeline_id',
      operator: 'eq' as const,
      value: options.pipelineId,
    });
  }
  if (options?.etapaId) {
    filters.push({
      column: 'etapa_id',
      operator: 'eq' as const,
      value: options.etapaId,
    });
  }
  if (options?.responsavelId) {
    filters.push({
      column: 'responsavel_id',
      operator: 'eq' as const,
      value: options.responsavelId,
    });
  }
  if (options?.statusFinal) {
    filters.push({
      column: 'status_final',
      operator: 'eq' as const,
      value: options.statusFinal,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'titulo',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Negocio[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters,
    order: [{ column: 'created_at', ascending: false }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Negócios de um pipeline agrupados por etapa (para Kanban)
export const useNegociosByPipeline = (pipelineId: string | null) => {
  return useSupabaseQuery<Negocio[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [
      { column: 'pipeline_id', operator: 'eq', value: pipelineId },
      { column: 'status_final', operator: 'is' as const, value: null },
    ],
    order: [{ column: 'updated_at', ascending: false }],
    enabled: !!pipelineId,
    queryKeyExtra: ['byPipeline', pipelineId],
  });
};

// Negócios de uma empresa
export const useNegociosByEmpresa = (empresaId: string | null) => {
  return useSupabaseQuery<Negocio[]>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'empresa_id', operator: 'eq', value: empresaId }],
    order: [{ column: 'created_at', ascending: false }],
    enabled: !!empresaId,
    queryKeyExtra: ['byEmpresa', empresaId],
  });
};

// Busca um negócio por ID
export const useNegocio = (id: string | null) => {
  return useSupabaseQuery<Negocio>({
    table: TABLE,
    columns: COLUMNS_WITH_RELATIONS,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar negócio
export const useCreateNegocio = () => {
  return useSupabaseMutation<NegocioInsert, Negocio>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: ['empresas', 'leads'],
  });
};

// Atualizar negócio (inclui mover etapa no Kanban)
export const useUpdateNegocio = () => {
  return useSupabaseMutation<NegocioUpdate & { id: string }, Negocio>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete negócio
export const useDeleteNegocio = () => {
  return useSupabaseMutation<{ id: string }, Negocio>({
    table: TABLE,
    type: 'softDelete',
  });
};
