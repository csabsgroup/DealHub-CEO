import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type {
    PrecificacaoParametros,
    PrecificacaoParametrosUpdate,
} from '~/types/supabase';

const TABLE = 'precificacao_parametros';

// Busca o registro único de parâmetros de precificação do tenant
export const usePrecificacaoParametros = () =>
  useSupabaseQuery<PrecificacaoParametros>({
    table: TABLE,
    single: true,
  });

// Atualiza os parâmetros de precificação
export const useUpdatePrecificacaoParametros = () =>
  useSupabaseMutation<PrecificacaoParametrosUpdate & { id: string }, PrecificacaoParametros>({
    table: TABLE,
    type: 'update',
    invalidateKeys: [TABLE],
  });
