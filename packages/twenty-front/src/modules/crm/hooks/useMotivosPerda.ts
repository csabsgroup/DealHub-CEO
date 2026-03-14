import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    MotivoPerda,
    MotivoPerdaInsert,
    MotivoPerdaUpdate,
} from '~/types/supabase';

const TABLE = 'motivos_perda';

// Lista todos os motivos de perda ativos do tenant
export const useMotivosPerda = (options?: { includeInativos?: boolean }) => {
  const filters = options?.includeInativos
    ? []
    : [{ column: 'is_active', operator: 'eq' as const, value: true }];

  return useSupabaseQuery<MotivoPerda[]>({
    table: TABLE,
    columns: '*',
    filters,
    order: [{ column: 'nome', ascending: true }],
    queryKeyExtra: ['motivosPerda', options],
  });
};

// Criar motivo de perda
export const useCreateMotivoPerda = () => {
  return useSupabaseMutation<MotivoPerdaInsert, MotivoPerda>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: ['motivos_perda'],
  });
};

// Atualizar motivo de perda
export const useUpdateMotivoPerda = () => {
  return useSupabaseMutation<MotivoPerdaUpdate & { id: string }, MotivoPerda>({
    table: TABLE,
    type: 'update',
    invalidateKeys: ['motivos_perda'],
  });
};

// Soft delete (via campo is_active = false, pois a tabela não tem deleted_at)
export const useDesativarMotivoPerda = () => {
  return useSupabaseMutation<{ id: string }, MotivoPerda>({
    table: TABLE,
    type: 'update',
    invalidateKeys: ['motivos_perda'],
  });
};
