import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    Lead,
    LeadInsert,
    LeadStatusTriagem,
    LeadUpdate,
    OrigemLead,
    OrigemLeadInsert,
    OrigemLeadUpdate,
} from '~/types/supabase';

// ===================== ORIGENS LEAD =====================
const ORIGENS_TABLE = 'origens_lead';

export const useOrigensLead = () => {
  return useSupabaseQuery<OrigemLead[]>({
    table: ORIGENS_TABLE,
    filters: [{ column: 'is_active', operator: 'eq', value: true }],
    order: [{ column: 'nome', ascending: true }],
  });
};

export const useCreateOrigemLead = () => {
  return useSupabaseMutation<OrigemLeadInsert, OrigemLead>({
    table: ORIGENS_TABLE,
    type: 'insert',
  });
};

export const useUpdateOrigemLead = () => {
  return useSupabaseMutation<OrigemLeadUpdate & { id: string }, OrigemLead>({
    table: ORIGENS_TABLE,
    type: 'update',
  });
};

// ===================== LEADS =====================
const LEADS_TABLE = 'leads';

// Lista leads com filtros opcionais
export const useLeads = (options?: {
  status?: LeadStatusTriagem;
  responsavelId?: string;
  origemId?: string;
  temperatura?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const filters = [];
  if (options?.status) {
    filters.push({
      column: 'status_triagem',
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
  if (options?.origemId) {
    filters.push({
      column: 'origem_id',
      operator: 'eq' as const,
      value: options.origemId,
    });
  }
  if (options?.temperatura) {
    filters.push({
      column: 'temperatura',
      operator: 'eq' as const,
      value: options.temperatura,
    });
  }
  if (options?.search) {
    filters.push({
      column: 'nome',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Lead[]>({
    table: LEADS_TABLE,
    columns: '*, origens_lead(nome, tipo)',
    filters,
    order: [{ column: 'created_at', ascending: false }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Busca um lead por ID com dados relacionados
export const useLead = (id: string | null) => {
  return useSupabaseQuery<Lead>({
    table: LEADS_TABLE,
    columns: '*, origens_lead(nome, tipo)',
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Criar lead
export const useCreateLead = () => {
  return useSupabaseMutation<LeadInsert, Lead>({
    table: LEADS_TABLE,
    type: 'insert',
  });
};

// Atualizar lead
export const useUpdateLead = () => {
  return useSupabaseMutation<LeadUpdate & { id: string }, Lead>({
    table: LEADS_TABLE,
    type: 'update',
  });
};

// Soft delete lead
export const useDeleteLead = () => {
  return useSupabaseMutation<{ id: string }, Lead>({
    table: LEADS_TABLE,
    type: 'softDelete',
  });
};
