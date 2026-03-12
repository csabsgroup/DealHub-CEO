import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    MotivoPerda,
    MotivoPerdaInsert,
    MotivoPerdaUpdate,
    Pipeline,
    PipelineEtapa,
    PipelineEtapaInsert,
    PipelineEtapaUpdate,
    PipelineInsert,
    PipelineUpdate,
} from '~/types/supabase';

// ===================== PIPELINES =====================
const PIPELINES_TABLE = 'pipelines';

export const usePipelines = () => {
  return useSupabaseQuery<Pipeline[]>({
    table: PIPELINES_TABLE,
    filters: [{ column: 'is_active', operator: 'eq', value: true }],
    order: [{ column: 'nome', ascending: true }],
  });
};

export const usePipeline = (id: string | null) => {
  return useSupabaseQuery<Pipeline>({
    table: PIPELINES_TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

export const useCreatePipeline = () => {
  return useSupabaseMutation<PipelineInsert, Pipeline>({
    table: PIPELINES_TABLE,
    type: 'insert',
    invalidateKeys: ['pipeline_etapas'],
  });
};

export const useUpdatePipeline = () => {
  return useSupabaseMutation<PipelineUpdate & { id: string }, Pipeline>({
    table: PIPELINES_TABLE,
    type: 'update',
  });
};

// ===================== PIPELINE ETAPAS =====================
const ETAPAS_TABLE = 'pipeline_etapas';

// Etapas de um pipeline específico (ordenadas por posição)
export const usePipelineEtapas = (pipelineId: string | null) => {
  return useSupabaseQuery<PipelineEtapa[]>({
    table: ETAPAS_TABLE,
    filters: [
      { column: 'pipeline_id', operator: 'eq', value: pipelineId },
      { column: 'is_active', operator: 'eq', value: true },
    ],
    order: [{ column: 'posicao', ascending: true }],
    enabled: !!pipelineId,
    queryKeyExtra: ['byPipeline', pipelineId],
  });
};

export const useCreatePipelineEtapa = () => {
  return useSupabaseMutation<PipelineEtapaInsert, PipelineEtapa>({
    table: ETAPAS_TABLE,
    type: 'insert',
    invalidateKeys: ['pipelines'],
  });
};

export const useUpdatePipelineEtapa = () => {
  return useSupabaseMutation<
    PipelineEtapaUpdate & { id: string },
    PipelineEtapa
  >({
    table: ETAPAS_TABLE,
    type: 'update',
    invalidateKeys: ['pipelines'],
  });
};

// ===================== MOTIVOS PERDA =====================
const MOTIVOS_TABLE = 'motivos_perda';

export const useMotivosPerda = () => {
  return useSupabaseQuery<MotivoPerda[]>({
    table: MOTIVOS_TABLE,
    filters: [{ column: 'is_active', operator: 'eq', value: true }],
    order: [{ column: 'nome', ascending: true }],
  });
};

export const useCreateMotivoPerda = () => {
  return useSupabaseMutation<MotivoPerdaInsert, MotivoPerda>({
    table: MOTIVOS_TABLE,
    type: 'insert',
  });
};

export const useUpdateMotivoPerda = () => {
  return useSupabaseMutation<MotivoPerdaUpdate & { id: string }, MotivoPerda>({
    table: MOTIVOS_TABLE,
    type: 'update',
  });
};
