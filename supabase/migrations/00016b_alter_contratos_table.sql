-- ============================================================
-- Migration 00016b: Alterar tabela contratos (PRD_V2.md §9.12)
-- ============================================================
-- PASSO 2 DE 2 — Execute SOMENTE após 00016a ter sido commitada.
--
-- Adiciona as novas colunas definidas na Seção 9.12 do PRD_V2.md,
-- migra os dados das colunas legadas e atualiza os índices.
-- ============================================================

-- ==================== PASSO 1: Adicionar colunas novas ====================

-- deal_id: negócio pai (substitui empresa_id como FK principal)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.negocios(id) ON DELETE RESTRICT;

-- proposal_id: novo nome semântico para proposta_id
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.propostas(id) ON DELETE SET NULL;

-- template_id: identificador textual do template contratual
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS template_id text NULL;

-- status_contrato: campo de status PRD_V2 (substitui status)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS status_contrato public.contrato_status NULL;

-- inicio_vigencia: substitui data_inicio
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS inicio_vigencia date NULL;

-- fim_vigencia: substitui data_fim
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS fim_vigencia date NULL;

-- Campos de assinatura digital (PRD_V2 §9.12)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS assinatura_provider text NULL;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS link_assinatura text NULL;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS enviado_em timestamptz NULL;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS assinado_em timestamptz NULL;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS arquivo_final text NULL;

-- ==================== PASSO 2: Migrar dados das colunas legadas ====================

-- Copiar proposta_id → proposal_id
UPDATE public.contratos
SET proposal_id = proposta_id
WHERE proposal_id IS NULL
  AND proposta_id IS NOT NULL;

-- Migrar status (4 valores legados) → status_contrato (7 valores PRD_V2)
-- Os novos valores já foram commitados pela migration 00016a.
UPDATE public.contratos
SET status_contrato =
  CASE status::text
    WHEN 'Minuta'    THEN 'Rascunho'
    WHEN 'Enviado'   THEN 'enviado'
    WHEN 'Assinado'  THEN 'assinado'
    WHEN 'Cancelado' THEN 'cancelado'
    ELSE 'Rascunho'
  END::public.contrato_status
WHERE status_contrato IS NULL;

-- Preencher linhas sem status (registros novos inseridos após 00016a)
UPDATE public.contratos
SET status_contrato = 'Rascunho'::public.contrato_status
WHERE status_contrato IS NULL;

-- Definir NOT NULL + DEFAULT na coluna
ALTER TABLE public.contratos
  ALTER COLUMN status_contrato SET DEFAULT 'Rascunho'::public.contrato_status;

ALTER TABLE public.contratos
  ALTER COLUMN status_contrato SET NOT NULL;

-- Copiar data_inicio → inicio_vigencia
UPDATE public.contratos
SET inicio_vigencia = data_inicio
WHERE inicio_vigencia IS NULL
  AND data_inicio IS NOT NULL;

-- Copiar data_fim → fim_vigencia
UPDATE public.contratos
SET fim_vigencia = data_fim
WHERE fim_vigencia IS NULL
  AND data_fim IS NOT NULL;

-- Copiar data_assinatura → assinado_em (date → timestamptz)
UPDATE public.contratos
SET assinado_em = data_assinatura::timestamptz
WHERE assinado_em IS NULL
  AND data_assinatura IS NOT NULL;

-- ==================== PASSO 3: Atualizar índices ====================

-- Remover índices que referenciam colunas renomeadas/legadas
DROP INDEX IF EXISTS public.contratos_empresa_id_idx;
DROP INDEX IF EXISTS public.contratos_proposta_id_idx;
DROP INDEX IF EXISTS public.contratos_status_idx;

-- Criar índices alinhados ao PRD_V2
CREATE INDEX IF NOT EXISTS contratos_deal_id_idx
  ON public.contratos (deal_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS contratos_proposal_id_idx
  ON public.contratos (proposal_id)
  WHERE proposal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS contratos_status_contrato_idx
  ON public.contratos (tenant_id, status_contrato)
  WHERE deleted_at IS NULL;

-- ==================== PASSO 4: Comentários descritivos ====================

COMMENT ON COLUMN public.contratos.deal_id             IS 'PRD_V2 §9.12 – Negócio pai (FK negocios)';
COMMENT ON COLUMN public.contratos.proposal_id         IS 'PRD_V2 §9.12 – Proposta de origem (FK propostas)';
COMMENT ON COLUMN public.contratos.template_id         IS 'PRD_V2 §9.12 – Template contratual (texto livre por ora)';
COMMENT ON COLUMN public.contratos.status_contrato     IS 'PRD_V2 §9.12 – Status: Rascunho|enviado|assinado parcial|assinado|recusado|expirado|cancelado';
COMMENT ON COLUMN public.contratos.inicio_vigencia     IS 'PRD_V2 §9.12 – Data inicial de vigência';
COMMENT ON COLUMN public.contratos.fim_vigencia        IS 'PRD_V2 §9.12 – Data final de vigência';
COMMENT ON COLUMN public.contratos.assinatura_provider IS 'PRD_V2 §9.12 – Provedor de assinatura digital (ex: DocuSign, ClickSign)';
COMMENT ON COLUMN public.contratos.link_assinatura     IS 'PRD_V2 §9.12 – Link externo do documento para assinatura';
COMMENT ON COLUMN public.contratos.enviado_em          IS 'PRD_V2 §9.12 – Timestamp do envio ao cliente';
COMMENT ON COLUMN public.contratos.assinado_em         IS 'PRD_V2 §9.12 – Timestamp da assinatura final';
COMMENT ON COLUMN public.contratos.arquivo_final       IS 'PRD_V2 §9.12 – URL/path do PDF final assinado';
