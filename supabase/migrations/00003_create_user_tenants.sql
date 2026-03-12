-- ============================================================
-- Migration 00003: Tabela USER_TENANTS (vínculo usuário ↔ tenant)
-- ============================================================
-- Relacionamento N:N entre profiles e tenants.
-- Cada registro define o papel (role) e escopo de visibilidade
-- que o usuário possui naquele tenant específico.
-- ============================================================

create table if not exists public.user_tenants (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  role          text not null default 'viewer'
                  check (role in (
                    'owner',
                    'admin',
                    'gestor_comercial',
                    'sdr_bdr',
                    'closer',
                    'executivo_contas',
                    'onboarding',
                    'financeiro',
                    'atendimento',
                    'viewer',
                    'custom'
                  )),
  scope         text not null default 'own'
                  check (scope in ('own', 'team', 'business_unit', 'all')),
  manager_id    uuid references public.profiles(id),
  business_unit text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint uq_user_tenant unique (user_id, tenant_id)
);

-- Índices para buscas frequentes
create index if not exists idx_user_tenants_user    on public.user_tenants (user_id);
create index if not exists idx_user_tenants_tenant  on public.user_tenants (tenant_id);
create index if not exists idx_user_tenants_role    on public.user_tenants (role);

-- Trigger updated_at
create trigger trg_user_tenants_updated_at
  before update on public.user_tenants
  for each row execute function public.set_updated_at();

comment on table public.user_tenants is 'Vínculo entre usuários e tenants, com papel e escopo de acesso';
