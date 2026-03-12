-- ============================================================
-- Migration 00004: Tabelas TEAMS e TEAM_MEMBERS
-- ============================================================
-- Equipes dentro de um tenant. Um usuário pode pertencer
-- a múltiplas equipes.
-- ============================================================

-- ---- TEAMS ----
create table if not exists public.teams (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  description     text,
  leader_id       uuid references public.profiles(id),
  business_unit   text,
  status          text not null default 'active'
                    check (status in ('active', 'inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_teams_tenant on public.teams (tenant_id);

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

-- ---- TEAM_MEMBERS ----
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  created_at  timestamptz not null default now(),

  constraint uq_team_member unique (team_id, user_id)
);

create index if not exists idx_team_members_team   on public.team_members (team_id);
create index if not exists idx_team_members_user   on public.team_members (user_id);
create index if not exists idx_team_members_tenant on public.team_members (tenant_id);

comment on table public.teams is 'Equipes de trabalho dentro de um tenant';
comment on table public.team_members is 'Membros das equipes (N:N entre profiles e teams)';
