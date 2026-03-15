-- Migration 00022: Garantir ordenação sequencial das etapas de pipeline
-- A tabela pipeline_etapas já possui as colunas `posicao` (ordem) e `probabilidade`
-- desde a migration 00010. Esta migration assegura que os valores de `posicao`
-- são sequenciais e contíguos por pipeline, evitando duplicatas ou lacunas.

BEGIN;

-- 1. Corrigir posicao NULL para 0 (segurança)
UPDATE public.pipeline_etapas
SET    posicao = 0
WHERE  posicao IS NULL;

-- 2. Re-sequenciar posicao garantindo valores contíguos (0, 1, 2 ...)
--    particionado por pipeline_id, para garantir que o construtor visual
--    funcione corretamente (move up / move down).
WITH ranked AS (
  SELECT
    id,
    (ROW_NUMBER() OVER (
      PARTITION BY pipeline_id
      ORDER BY posicao, created_at
    ) - 1) AS nova_posicao
  FROM public.pipeline_etapas
)
UPDATE public.pipeline_etapas e
SET    posicao = r.nova_posicao
FROM   ranked r
WHERE  e.id = r.id;

-- 3. Garantir default correto nas colunas de ordenação
ALTER TABLE public.pipeline_etapas
  ALTER COLUMN posicao      SET DEFAULT 0,
  ALTER COLUMN probabilidade SET DEFAULT 0;

-- 4. Índice de suporte à ordenação no Kanban e na tela de configuração
CREATE INDEX IF NOT EXISTS idx_pipeline_etapas_posicao
  ON public.pipeline_etapas (pipeline_id, posicao);

COMMIT;
