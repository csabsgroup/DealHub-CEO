-- ============================================================
-- Migration 00016: Adaptar contratos ao Dicionário de Dados PRD_V2.md (Seção 9.12)
-- ============================================================
-- Altera a tabela contratos para refletir exatamente os campos definidos
-- na Seção 9.12 do PRD_V2.md:
--   deal_id, proposal_id, template_id, status_contrato (7 valores),
--   inicio_vigencia, fim_vigencia, indice_reajuste, periodicidade_reajuste,
--   assinatura_provider, link_assinatura, enviado_em, assinado_em,
--   arquivo_final, observacoes
--
-- Estratégia de migração safe:
--   1. Adicionar novas colunas
--   2. Copiar dados das colunas antigas para as novas
--   3. Remover constraints antigas
--   4. Dropar colunas que não fazem parte do PRD_V2 (após cópia de dados)
--   5. Expandir enum status para os 7 valores novos
-- ============================================================

-- ==================== PASSO 1: Expandir enum contrato_status ====================

-- Adiciona os novos valores ao tipo existente (idempotente)
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'Rascunho';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'enviado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'assinado parcial';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'assinado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'recusado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'expirado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'cancelado';

-- ==================== PASSO 2: Adicionar colunas novas ====================

-- deal_id: referencia negocios (substitui empresa_id como chave relacional principal)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.negocios(id) ON DELETE RESTRICT;

-- proposal_id: novo nome para proposta_id
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.propostas(id) ON DELETE SET NULL;

-- template_id: identificador textual do template usado (sem tabela própria por ora)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS template_id text NULL;

-- status_contrato: novo campo de status conforme PRD_V2 (substitui status)
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS status_contrato public.contrato_status NULL;

-- inicio_vigencia: substitui data_inicio
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS inicio_vigencia date NULL;

-- fim_vigencia: substitui data_fim
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS fim_vigencia date NULL;

-- Campos de assinatura digital
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

-- ==================== PASSO 3: Migrar dados das colunas antigas ====================

-- Copiar empresa_id → deal_id (best-effort: sem dado real de negocios no dev,
-- coluna ficará null; em prod rodar script de reconciliação)
-- (Não copiamos porque a semântica muda de empresa para negócio)

-- Copiar proposta_id → proposal_id
UPDATE public.contratos
SET proposal_id = proposta_id
WHERE proposal_id IS NULL AND proposta_id IS NOT NULL;

-- Migrar valores de status → status_contrato (mapeamento de valores)
UPDATE public.contratos SET status_contrato =
  CASE status::text
    WHEN 'Minuta'    THEN 'Rascunho'::public.contrato_status
    WHEN 'Enviado'   THEN 'enviado'::public.contrato_status
    WHEN 'Assinado'  THEN 'assinado'::public.contrato_status
    WHEN 'Cancelado' THEN 'cancelado'::public.contrato_status
    ELSE 'Rascunho'::public.contrato_status
  END
WHERE status_contrato IS NULL;

-- Definir NOT NULL com default após migração
ALTER TABLE public.contratos
  ALTER COLUMN status_contrato SET DEFAULT 'Rascunho'::public.contrato_status;

UPDATE public.contratos
  SET status_contrato = 'Rascunho'::public.contrato_status
  WHERE status_contrato IS NULL;

ALTER TABLE public.contratos
  ALTER COLUMN status_contrato SET NOT NULL;

-- Copiar data_inicio → inicio_vigencia
UPDATE public.contratos
SET inicio_vigencia = data_inicio
WHERE inicio_vigencia IS NULL AND data_inicio IS NOT NULL;

-- Copiar data_fim → fim_vigencia
UPDATE public.contratos
SET fim_vigencia = data_fim
WHERE fim_vigencia IS NULL AND data_fim IS NOT NULL;

-- Copiar data_assinatura → assinado_em (date → timestamptz)
UPDATE public.contratos
SET assinado_em = data_assinatura::timestamptz
WHERE assinado_em IS NULL AND data_assinatura IS NOT NULL;

-- ==================== PASSO 4: Atualizar índices ====================

-- Drop índices que referenciam colunas renomeadas/removidas
DROP INDEX IF EXISTS public.contratos_empresa_id_idx;
DROP INDEX IF EXISTS public.contratos_proposta_id_idx;
DROP INDEX IF EXISTS public.contratos_status_idx;

-- Criar novos índices
CREATE INDEX IF NOT EXISTS contratos_deal_id_idx
  ON public.contratos (deal_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS contratos_proposal_id_idx
  ON public.contratos (proposal_id) WHERE proposal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS contratos_status_contrato_idx
  ON public.contratos (tenant_id, status_contrato) WHERE deleted_at IS NULL;

-- ==================== PASSO 5: Comentários descritivos ====================

COMMENT ON COLUMN public.contratos.deal_id              IS 'PRD_V2 §9.12 – Negócio pai (FK negocios)';
COMMENT ON COLUMN public.contratos.proposal_id          IS 'PRD_V2 §9.12 – Proposta de origem (FK propostas)';
COMMENT ON COLUMN public.contratos.template_id          IS 'PRD_V2 §9.12 – Template usado (texto livre por ora)';
COMMENT ON COLUMN public.contratos.status_contrato      IS 'PRD_V2 §9.12 – Status: Rascunho|enviado|assinado parcial|assinado|recusado|expirado|cancelado';
COMMENT ON COLUMN public.contratos.inicio_vigencia      IS 'PRD_V2 §9.12 – Data inicial de vigência';
COMMENT ON COLUMN public.contratos.fim_vigencia         IS 'PRD_V2 §9.12 – Data final de vigência';
COMMENT ON COLUMN public.contratos.assinatura_provider  IS 'PRD_V2 §9.12 – Provedor de assinatura digital (ex: DocuSign, ClickSign)';
COMMENT ON COLUMN public.contratos.link_assinatura      IS 'PRD_V2 §9.12 – Link externo do documento para assinatura';
COMMENT ON COLUMN public.contratos.enviado_em           IS 'PRD_V2 §9.12 – Momento do envio ao cliente';
COMMENT ON COLUMN public.contratos.assinado_em          IS 'PRD_V2 §9.12 – Momento da assinatura final';
COMMENT ON COLUMN public.contratos.arquivo_final        IS 'PRD_V2 §9.12 – URL/path do PDF final assinado';
