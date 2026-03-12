-- ============================================================
-- Migration 00002: Tabela PROFILES (perfil de usuário)
-- ============================================================
-- Estende auth.users do Supabase. Cada registro de auth.users
-- ganha um profile com dados adicionais.
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  status      text not null default 'active'
                check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Índices
create unique index if not exists idx_profiles_email on public.profiles (email);

-- Trigger updated_at
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table public.profiles is 'Perfil estendido dos usuários (vinculado a auth.users)';
