-- Migration 00019: Proposta × Precificação — variáveis do Cálculo Inteligente
-- Adiciona colunas de diagnóstico à tabela propostas para salvar memória de cálculo

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS faturamento_anual    NUMERIC(20, 2),
  ADD COLUMN IF NOT EXISTS numero_funcionarios  INTEGER,
  ADD COLUMN IF NOT EXISTS regime_tributario    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS fator_operacoes      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fator_filiais        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS fator_automacao      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fator_risco          VARCHAR(50),
  ADD COLUMN IF NOT EXISTS pacote_escolhido     VARCHAR(50);

-- Índice para análise e relatórios por regime e pacote
CREATE INDEX IF NOT EXISTS idx_propostas_regime
  ON public.propostas (tenant_id, regime_tributario)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_propostas_pacote
  ON public.propostas (tenant_id, pacote_escolhido)
  WHERE deleted_at IS NULL;
