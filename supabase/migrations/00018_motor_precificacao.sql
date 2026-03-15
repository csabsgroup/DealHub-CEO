-- Migration 00018: Motor de Precificação — Metodologia Contador CEO
-- Tabela de parâmetros de precificação por tenant (coeficientes editáveis)

-- ===================== TABELA precificacao_parametros =====================

create table if not exists public.precificacao_parametros (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,

  -- Multiplicadores base por regime tributário (aplica sobre faturamento mensal)
  regime_coeficientes jsonb not null default '{
    "simples": 0.0035,
    "presumido": 0.0050,
    "real": 0.0075
  }'::jsonb,

  -- Valor por funcionário na folha de pagamento, por regime
  folha_valores jsonb not null default '{
    "simples": 45,
    "presumido": 55,
    "real": 65
  }'::jsonb,

  -- Coeficientes de Operações (tipo de atividade)
  operacoes_coeficientes jsonb not null default '{
    "Serviços": 1.0,
    "Comércio": 1.1,
    "Terceiro Setor": 1.1,
    "Comércio + Serviços": 1.2,
    "Serv. Regulamentado": 1.35,
    "Indústria": 1.4,
    "Internacional": 1.5
  }'::jsonb,

  -- Coeficientes de Filiais (quantidade)
  filiais_coeficientes jsonb not null default '{
    "1-3": 1.0,
    "4-10": 1.1,
    "10+": 1.3
  }'::jsonb,

  -- Coeficientes de Automação (nível de sistemas)
  automacao_coeficientes jsonb not null default '{
    "ERP + BI Avançado": 0.85,
    "ERP Integrado": 0.9,
    "Sistema Básico": 1.0,
    "Planilhas": 1.05,
    "Sem Sistema": 1.15
  }'::jsonb,

  -- Coeficientes de Risco Fiscal
  risco_fiscal_coeficientes jsonb not null default '{
    "Baixo": 1.0,
    "Médio": 1.1,
    "Alto": 1.25,
    "Muito Alto": 1.4
  }'::jsonb,

  -- Coeficientes de Plano
  plano_coeficientes jsonb not null default '{
    "Essencial": 1.0,
    "Premium": 1.18,
    "Profissional": 1.35
  }'::jsonb,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- Um registro de parâmetros por tenant
  constraint uq_precificacao_parametros_tenant unique (tenant_id)
);

-- Índice para busca por tenant_id
create index if not exists idx_precificacao_parametros_tenant
  on public.precificacao_parametros (tenant_id);

-- Trigger updated_at automático
create trigger trg_precificacao_parametros_updated_at
  before update on public.precificacao_parametros
  for each row execute function public.set_updated_at();

-- ===================== RLS =====================

alter table public.precificacao_parametros enable row level security;

do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where tablename = 'precificacao_parametros' and policyname = 'precificacao_parametros_select'
  ) then
    create policy precificacao_parametros_select on public.precificacao_parametros
      for select using (tenant_id in (select public.get_my_tenant_ids()));
  end if;

  -- INSERT
  if not exists (
    select 1 from pg_policies
    where tablename = 'precificacao_parametros' and policyname = 'precificacao_parametros_insert'
  ) then
    create policy precificacao_parametros_insert on public.precificacao_parametros
      for insert with check (tenant_id in (select public.get_my_tenant_ids()));
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where tablename = 'precificacao_parametros' and policyname = 'precificacao_parametros_update'
  ) then
    create policy precificacao_parametros_update on public.precificacao_parametros
      for update using (tenant_id in (select public.get_my_tenant_ids()));
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies
    where tablename = 'precificacao_parametros' and policyname = 'precificacao_parametros_delete'
  ) then
    create policy precificacao_parametros_delete on public.precificacao_parametros
      for delete using (tenant_id in (select public.get_my_tenant_ids()));
  end if;
end $$;

-- ===================== SEED: 1 registro default por tenant existente =====================

insert into public.precificacao_parametros (tenant_id)
select t.id
from public.tenants t
where not exists (
  select 1 from public.precificacao_parametros pp where pp.tenant_id = t.id
);
