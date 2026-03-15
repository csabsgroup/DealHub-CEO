-- ============================================================
-- Migration 00024: Tabela TIPOS_ATIVIDADE
-- ============================================================
-- Adiciona uma tabela de tipos de atividade configurável por
-- tenant (ex: Ligação, Reunião, E-mail, WhatsApp personalizados).
-- As atividades já existem na tabela atividades (migration 00011)
-- com tipo como text check constraint. Esta migration adiciona
-- a tabela de tipos personalizados e uma FK opcional.
-- ============================================================

-- ===================== TIPOS_ATIVIDADE =====================

create table if not exists public.tipos_atividade (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,

  nome        text not null,
  cor         text not null default '#6b7280',  -- hex color
  icone       text not null default 'IconPhone', -- nome do ícone (ex: IconPhone, IconMail)
  is_active   boolean not null default true,

  -- Auditoria
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz  -- soft delete
);

create index idx_tipos_atividade_tenant
  on public.tipos_atividade (tenant_id);
create unique index idx_tipos_atividade_nome
  on public.tipos_atividade (tenant_id, nome)
  where deleted_at is null;
create index idx_tipos_atividade_deleted
  on public.tipos_atividade (tenant_id, deleted_at)
  where deleted_at is null;

create trigger trg_tipos_atividade_updated_at
  before update on public.tipos_atividade
  for each row execute function public.set_updated_at();

comment on table public.tipos_atividade is 'Tipos de atividade configuráveis por tenant (Ligação, Reunião, E-mail, etc.)';

-- ===================== RLS =====================

alter table public.tipos_atividade enable row level security;

create policy "tipos_atividade_select"
  on public.tipos_atividade for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "tipos_atividade_insert"
  on public.tipos_atividade for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "tipos_atividade_update"
  on public.tipos_atividade for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "tipos_atividade_delete"
  on public.tipos_atividade for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== SEED: Tipos padrão por tenant =====================
-- Insere tipos padrão para todos os tenants existentes no momento
-- da migration. Novos tenants deverão executar seed via aplicação.

INSERT INTO public.tipos_atividade (tenant_id, nome, cor, icone, is_active)
SELECT
  t.id,
  d.nome,
  d.cor,
  d.icone,
  true
FROM public.tenants t
CROSS JOIN (VALUES
  ('Ligação',   '#3b82f6', 'IconPhone'),
  ('Reunião',   '#22c55e', 'IconCalendarEvent'),
  ('E-mail',    '#f59e0b', 'IconMail'),
  ('WhatsApp',  '#25d366', 'IconBrandWhatsapp'),
  ('Visita',    '#8b5cf6', 'IconMapPin'),
  ('Tarefa',    '#6b7280', 'IconCheck')
) AS d(nome, cor, icone)
ON CONFLICT DO NOTHING;
