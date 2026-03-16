import { useTenant } from '@/auth/hooks/useTenant';
import { useQuery } from '@tanstack/react-query';
import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import { supabase } from '~/lib/supabase';
import type {
    Atividade,
    AtividadeComDetalhes,
    AtividadeInsert,
    AtividadeStatus,
    AtividadeTipo,
    AtividadeUpdate,
} from '~/types/supabase';

const TABLE = 'atividades';

// Atividades de um negócio com JOIN em tipos_atividade e profiles (responsável)
export const useAtividadesPorNegocio = (negocioId: string | null) => {
  const { tenantId } = useTenant();

  return useQuery<AtividadeComDetalhes[], Error>({
    queryKey: [TABLE, 'comDetalhes', negocioId, tenantId],
    enabled: !!negocioId && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select(
          `*, tipos_atividade(id, nome, cor, icone), profiles!responsavel_id(id, full_name, email)`,
        )
        .eq('negocio_id', negocioId as string)
        .eq('tenant_id', tenantId as string)
        .is('deleted_at', null)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as AtividadeComDetalhes[];
    },
  });
};

// Lista atividades com filtros
export const useAtividades = (options?: {
  tipo?: AtividadeTipo;
  status?: AtividadeStatus;
  responsavelId?: string;
  negocioId?: string;
  empresaId?: string;
  leadId?: string;
  contatoId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.tipo) {
    filters.push({
      column: 'tipo',
      operator: 'eq' as const,
      value: options.tipo,
    });
  }
  if (options?.status) {
    filters.push({
      column: 'status',
      operator: 'eq' as const,
      value: options.status,
    });
  }
  if (options?.responsavelId) {
    filters.push({
      column: 'responsavel_id',
      operator: 'eq' as const,
      value: options.responsavelId,
    });
  }
  if (options?.negocioId) {
    filters.push({
      column: 'negocio_id',
      operator: 'eq' as const,
      value: options.negocioId,
    });
  }
  if (options?.empresaId) {
    filters.push({
      column: 'empresa_id',
      operator: 'eq' as const,
      value: options.empresaId,
    });
  }
  if (options?.leadId) {
    filters.push({
      column: 'lead_id',
      operator: 'eq' as const,
      value: options.leadId,
    });
  }
  if (options?.contatoId) {
    filters.push({
      column: 'contato_id',
      operator: 'eq' as const,
      value: options.contatoId,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'titulo',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Atividade[]>({
    table: TABLE,
    filters,
    order: [{ column: 'data_inicio', ascending: true }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Atividades de um negócio
export const useAtividadesByNegocio = (negocioId: string | null) => {
  return useSupabaseQuery<Atividade[]>({
    table: TABLE,
    filters: [{ column: 'negocio_id', operator: 'eq', value: negocioId }],
    order: [{ column: 'data_inicio', ascending: false }],
    enabled: !!negocioId,
    queryKeyExtra: ['byNegocio', negocioId],
  });
};

// Atividades de uma empresa
export const useAtividadesByEmpresa = (empresaId: string | null) => {
  return useSupabaseQuery<Atividade[]>({
    table: TABLE,
    filters: [{ column: 'empresa_id', operator: 'eq', value: empresaId }],
    order: [{ column: 'data_inicio', ascending: false }],
    enabled: !!empresaId,
    queryKeyExtra: ['byEmpresa', empresaId],
  });
};

// Atividades de um lead
export const useAtividadesByLead = (leadId: string | null) => {
  return useSupabaseQuery<Atividade[]>({
    table: TABLE,
    filters: [{ column: 'lead_id', operator: 'eq', value: leadId }],
    order: [{ column: 'data_inicio', ascending: false }],
    enabled: !!leadId,
    queryKeyExtra: ['byLead', leadId],
  });
};

// Minhas atividades pendentes
export const useMinhasAtividadesPendentes = (userId: string | null) => {
  return useSupabaseQuery<Atividade[]>({
    table: TABLE,
    filters: [
      { column: 'responsavel_id', operator: 'eq', value: userId },
      { column: 'status', operator: 'in', value: ['Pendente', 'Em andamento'] },
    ],
    order: [{ column: 'data_inicio', ascending: true }],
    enabled: !!userId,
    queryKeyExtra: ['minhasPendentes', userId],
  });
};

// Busca uma atividade por ID
export const useAtividade = (id: string | null) => {
  return useSupabaseQuery<Atividade>({
    table: TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar atividade
export const useCreateAtividade = () => {
  return useSupabaseMutation<AtividadeInsert, Atividade>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: [TABLE, 'negocios', 'leads', 'empresas'],
  });
};

// Atualizar atividade
export const useUpdateAtividade = () => {
  return useSupabaseMutation<AtividadeUpdate & { id: string }, Atividade>({
    table: TABLE,
    type: 'update',
    invalidateKeys: [TABLE],
  });
};

// Soft delete atividade
export const useDeleteAtividade = () => {
  return useSupabaseMutation<{ id: string }, Atividade>({
    table: TABLE,
    type: 'softDelete',
  });
};
