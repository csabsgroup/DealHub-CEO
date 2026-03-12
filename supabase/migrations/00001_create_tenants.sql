-- ============================================================
-- Migration 00001: Tabela TENANTS (organização/escritório)
-- ============================================================
-- Cada tenant representa um escritório de contabilidade
-- que usa a plataforma. É a raiz do isolamento multi-tenant.
-- ============================================================

create table if not exists public.tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  cnpj        text unique,
  logo_url    text,
  domain      text,
  currency    text not null default 'BRL',
  timezone    text not null default 'America/Sao_Paulo',
  language    text not null default 'pt-BR',
  primary_color text not null default '#1a73e8',
  preferences jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices
create index if not exists idx_tenants_cnpj on public.tenants (cnpj);

-- Trigger para atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

comment on table public.tenants is 'Organizações (escritórios de contabilidade) que usam a plataforma';
