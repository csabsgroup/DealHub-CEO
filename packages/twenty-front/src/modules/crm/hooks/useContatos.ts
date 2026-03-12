import { useSupabaseMutation } from '~/hooks/useSupabaseMutation';
import { useSupabaseQuery } from '~/hooks/useSupabaseQuery';
import type { Contato, ContatoInsert, ContatoUpdate } from '~/types/supabase';

const TABLE = 'contatos';

// Lista contatos do tenant
export const useContatos = (options?: {
  empresaId?: string;
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
  if (options?.search) {
    filters.push({
      column: 'nome',
      operator: 'ilike' as const,
      value: `%${options.search}%`,
    });
  }

  return useSupabaseQuery<Contato[]>({
    table: TABLE,
    filters,
    order: [{ column: 'nome', ascending: true }],
    limit: options?.limit,
    offset: options?.offset,
    queryKeyExtra: [options],
  });
};

// Busca um contato por ID
export const useContato = (id: string | null) => {
  return useSupabaseQuery<Contato>({
    table: TABLE,
    filters: [{ column: 'id', operator: 'eq', value: id }],
    single: true,
    enabled: !!id,
    queryKeyExtra: ['single', id],
  });
};

// Contatos de uma empresa específica
export const useContatosByEmpresa = (empresaId: string | null) => {
  return useSupabaseQuery<Contato[]>({
    table: TABLE,
    filters: [{ column: 'empresa_id', operator: 'eq', value: empresaId }],
    order: [{ column: 'is_principal', ascending: false }, { column: 'nome', ascending: true }],
    enabled: !!empresaId,
    queryKeyExtra: ['byEmpresa', empresaId],
  });
};

// Criar contato
export const useCreateContato = () => {
  return useSupabaseMutation<ContatoInsert, Contato>({
    table: TABLE,
    type: 'insert',
    invalidateKeys: ['empresas'],
  });
};

// Atualizar contato
export const useUpdateContato = () => {
  return useSupabaseMutation<ContatoUpdate & { id: string }, Contato>({
    table: TABLE,
    type: 'update',
  });
};

// Soft delete contato
export const useDeleteContato = () => {
  return useSupabaseMutation<{ id: string }, Contato>({
    table: TABLE,
    type: 'softDelete',
  });
};
