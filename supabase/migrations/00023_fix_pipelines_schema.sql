-- ============================================================
-- Migration 00023: Corrige Schema Mismatch nas tabelas
--                  pipelines e pipeline_etapas
-- ============================================================
-- PROBLEMA: O hook useSupabaseQuery injeta automaticamente o
--   filtro `.is('deleted_at', null)` em TODAS as queries.
--   O hook useSupabaseMutation injeta `created_by: userId`
--   em TODOS os inserts.
--   As tabelas pipelines e pipeline_etapas foram criadas na
--   migration 00010 sem essas colunas, causando HTTP 400
--   (Bad Request / column does not exist) no Supabase.
--
-- SOLUÇÃO: Adicionar as colunas faltantes compatibilizando
--   o schema com o padrão das demais tabelas (empresas,
--   contatos, leads, etc.) que já possuem deleted_at e
--   created_by.
-- ============================================================

BEGIN;

-- ===================== PIPELINES =====================

-- Adiciona coluna de soft-delete (necessária para useSupabaseQuery)
ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Adiciona coluna de auditoria (necessária para useSupabaseMutation insert)
ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Índice de suporte para soft-delete queries
CREATE INDEX IF NOT EXISTS idx_pipelines_deleted_at
  ON public.pipelines (tenant_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON COLUMN public.pipelines.deleted_at IS 'Soft delete — NULL = ativo';
COMMENT ON COLUMN public.pipelines.created_by IS 'Usuário que criou o registro';

-- ===================== PIPELINE_ETAPAS =====================

-- Adiciona coluna de soft-delete (necessária para useSupabaseQuery)
ALTER TABLE public.pipeline_etapas
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Adiciona coluna de auditoria (necessária para useSupabaseMutation insert)
ALTER TABLE public.pipeline_etapas
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Índice de suporte para soft-delete queries
CREATE INDEX IF NOT EXISTS idx_pipeline_etapas_deleted_at
  ON public.pipeline_etapas (pipeline_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON COLUMN public.pipeline_etapas.deleted_at IS 'Soft delete — NULL = ativo';
COMMENT ON COLUMN public.pipeline_etapas.created_by IS 'Usuário que criou o registro';

COMMIT;
