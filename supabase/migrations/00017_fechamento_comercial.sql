-- Migration 00017: FECHAMENTO COMERCIAL
-- Adiciona DEFAULT em status_final, garante colunas de fechamento e semeia
-- motivos_perda padrão por tenant. Seguro executar mesmo após 00010/00012.

-- ===================== NEGOCIOS — colunas de fechamento =====================

-- Garante que a coluna status_final exista (já existe em 00010, mas idempotente)
alter table public.negocios
  add column if not exists status_final text
    check (status_final in ('Aberto','Ganho','Perdido'));

-- Define DEFAULT 'Aberto' para novos registros
alter table public.negocios
  alter column status_final set default 'Aberto';

-- Preenche registros existentes sem status_final
update public.negocios
  set status_final = 'Aberto'
  where status_final is null and deleted_at is null;

-- data_fechamento_real: momento exato em que o deal foi ganho ou perdido
alter table public.negocios
  add column if not exists data_fechamento_real timestamptz;

-- Garante FK motivo_perda_id (já existe em 00010, idempotente)
alter table public.negocios
  add column if not exists motivo_perda_id uuid references public.motivos_perda(id);

alter table public.negocios
  add column if not exists motivo_perda_detalhe text;

-- ===================== SEED: motivos_perda padrão =====================
-- A tabela motivos_perda usa coluna "is_active" (conforme migration 00010).
-- Insere 8 motivos padrão para cada tenant que ainda não os possui.
insert into public.motivos_perda (tenant_id, nome, is_active)
select
  t.id as tenant_id,
  m.nome,
  true as is_active
from
  public.tenants t
  cross join (
    values
      ('Preço muito alto'),
      ('Escolheu concorrente'),
      ('Sem orçamento no momento'),
      ('Não viu valor na solução'),
      ('Projeto cancelado / adiado'),
      ('Contato perdido / sem retorno'),
      ('Solução não atende a necessidade'),
      ('Outro')
  ) as m(nome)
where not exists (
  select 1 from public.motivos_perda mp
  where mp.tenant_id = t.id and lower(mp.nome) = lower(m.nome)
);
