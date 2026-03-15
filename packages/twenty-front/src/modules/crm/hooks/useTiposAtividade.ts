import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    TipoAtividade,
    TipoAtividadeInsert,
    TipoAtividadeUpdate,
} from '~/types/supabase';

const TABLE = 'tipos_atividade';

// Lista todos os tipos de atividade do tenant
export const useTiposAtividade = (options?: { includeInativos?: boolean }) => {
  const filters = options?.includeInativos
    ? []
    : [{ column: 'is_active', operator: 'eq' as const, value: true }];

  return useSupabaseQuery<TipoAtividade[]>({
    table: TABLE,
    filters,
    order: [{ column: 'nome', ascending: true }],
    queryKeyExtra: ['tiposAtividade', options],
  });
};

// Criar tipo de atividade
export const useCreateTipoAtividade = () =>
  useSupabaseMutation<TipoAtividadeInsert, TipoAtividade>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: [TABLE],
  });

// Atualizar tipo de atividade
export const useUpdateTipoAtividade = () =>
  useSupabaseMutation<TipoAtividadeUpdate & { id: string }, TipoAtividade>({
    table: TABLE,
    type: 'update',
    invalidateKeys: [TABLE],
  });

// Soft delete (desativar): é um update com deleted_at = now()
export const useDeleteTipoAtividade = () =>
  useSupabaseMutation<{ id: string; deleted_at: string }, TipoAtividade>({
    table: TABLE,
    type: 'update',
    invalidateKeys: [TABLE],
  });
