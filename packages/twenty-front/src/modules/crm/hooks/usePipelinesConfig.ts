import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTenant } from '@/auth/hooks/useTenant';
import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import { supabase } from '~/lib/supabase';
import type {
    Pipeline,
    PipelineEtapa,
    PipelineEtapaInsert,
    PipelineEtapaUpdate,
    PipelineInsert,
    PipelineUpdate,
} from '~/types/supabase';

// ===================== PIPELINES =====================

// Retorna TODOS os pipelines do tenant (inclusive inativos) — para a tela de config.
export const usePipelinesConfig = () =>
  useSupabaseQuery<Pipeline[]>({
    table: 'pipelines',
    order: [{ column: 'nome', ascending: true }],
  });

export const useCreatePipelineConfig = () =>
  useSupabaseMutation<PipelineInsert, Pipeline>({
    table: 'pipelines',
    type: 'insert',
    invalidateKeys: ['pipeline_etapas'],
  });

export const useUpdatePipelineConfig = () =>
  useSupabaseMutation<PipelineUpdate & { id: string }, Pipeline>({
    table: 'pipelines',
    type: 'update',
  });

// ===================== ETAPAS =====================

// Etapas ativas de um pipeline específico, ordenadas por posicao — para a tela de config.
export const usePipelineEtapasConfig = (pipelineId: string | null) =>
  useSupabaseQuery<PipelineEtapa[]>({
    table: 'pipeline_etapas',
    filters: [
      { column: 'pipeline_id', operator: 'eq', value: pipelineId },
      { column: 'is_active', operator: 'eq', value: true },
    ],
    order: [{ column: 'posicao', ascending: true }],
    enabled: !!pipelineId,
    queryKeyExtra: ['config', pipelineId],
  });

export const useCreatePipelineEtapaConfig = () =>
  useSupabaseMutation<PipelineEtapaInsert, PipelineEtapa>({
    table: 'pipeline_etapas',
    type: 'insert',
    invalidateKeys: ['pipelines'],
  });

export const useUpdatePipelineEtapaConfig = () =>
  useSupabaseMutation<PipelineEtapaUpdate & { id: string }, PipelineEtapa>({
    table: 'pipeline_etapas',
    type: 'update',
    invalidateKeys: ['pipelines'],
  });

// ===================== REORDER (batch) =====================

export type EtapaOrder = { id: string; posicao: number };

// Salva a nova ordem de etapas em lote — usado pelo construtor visual (↑ ↓).
export const useReorderEtapas = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation<void, Error, EtapaOrder[]>({
    mutationFn: async (etapas) => {
      if (!tenantId) throw new Error('Tenant não selecionado');

      // Promise.all para update em paralelo (mais eficiente que loop sequencial).
      const results = await Promise.all(
        etapas.map(({ id, posicao }) =>
          supabase
            .from('pipeline_etapas')
            .update({ posicao })
            .eq('id', id)
            .eq('tenant_id', tenantId),
        ),
      );

      for (const { error } of results) {
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_etapas'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
};
