-- ============================================================
-- Migration 00016a: Expandir enum contrato_status (PRD_V2.md §9.12)
-- ============================================================
-- PASSO 1 DE 2 — Execute este arquivo PRIMEIRO e aguarde o commit
-- ser concluído antes de executar 00016b.
--
-- Contexto: ALTER TYPE ADD VALUE não pode ser usado na mesma
-- transação que faz referência aos novos valores (erro 55P04).
-- Por isso esta migration roda isolada para que os novos valores
-- sejam persistidos no catálogo antes de serem usados em UPDATEs.
-- ============================================================

-- Adiciona os 7 valores definidos na Seção 9.12 do PRD_V2.md.
-- IF NOT EXISTS torna idempotente (seguro re-executar).

ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'Rascunho';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'enviado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'assinado parcial';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'assinado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'recusado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'expirado';
ALTER TYPE public.contrato_status ADD VALUE IF NOT EXISTS 'cancelado';

-- ============================================================
-- Após executar este arquivo: rode 00016b_alter_contratos_table.sql
-- ============================================================
