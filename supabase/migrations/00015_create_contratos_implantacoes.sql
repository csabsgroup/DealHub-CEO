-- ============================================================
-- Migration 00015: Contratos e Implantações (Onboarding)
-- ============================================================
-- Cria as tabelas contratos e implantacoes com RLS completo,
-- triggers de updated_at e soft-delete (deleted_at).
-- Depende de: 00001 (tenants), 00008 (empresas), 00015 proposta opcional.
-- ============================================================

-- ==================== ENUM TYPES ====================

create type public.contrato_status as enum (
  'Minuta',
  'Enviado',
  'Assinado',
  'Cancelado'
);

create type public.implantacao_status as enum (
  'Pendente',
  'Em Andamento',
  'Concluída',
  'Pausada'
);

create type public.implantacao_risco as enum (
  'Baixo',
  'Médio',
  'Alto'
);

-- ==================== CONTRATOS ====================

create table if not exists public.contratos (
  id                  uuid          primary key default gen_random_uuid(),
  tenant_id           uuid          not null references public.tenants(id) on delete cascade,
  empresa_id          uuid          not null references public.empresas(id) on delete restrict,
  proposta_id         uuid          references public.propostas(id) on delete set null,
  numero              text          not null,
  status              public.contrato_status not null default 'Minuta',
  data_inicio         date          null,
  data_fim            date          null,
  valor_mensalidade   numeric(12,2) not null default 0,
  valor_setup         numeric(12,2) not null default 0,
  indice_reajuste     text          null,   -- ex: 'IGPM', 'IPCA', 'INPC'
  periodicidade_reajuste text       null,   -- ex: 'Anual', 'Semestral'
  clausulas           text          null,   -- texto livre ou JSON com cláusulas especiais
  assinado_por        text          null,   -- nome do signatário
  data_assinatura     date          null,
  responsavel_id      uuid          references auth.users(id) on delete set null,
  observacoes         text          null,
  tags                text[]        not null default '{}',
  created_by          uuid          references auth.users(id) on delete set null,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  deleted_at          timestamptz   null
);

-- Unicidade: número do contrato por tenant
create unique index contratos_numero_tenant_idx
  on public.contratos (tenant_id, numero)
  where deleted_at is null;

-- ==================== IMPLANTAÇÕES ====================

create table if not exists public.implantacoes (
  id                  uuid          primary key default gen_random_uuid(),
  tenant_id           uuid          not null references public.tenants(id) on delete cascade,
  empresa_id          uuid          not null references public.empresas(id) on delete restrict,
  contrato_id         uuid          references public.contratos(id) on delete set null,
  nome                text          not null,
  status              public.implantacao_status not null default 'Pendente',
  risco               public.implantacao_risco  not null default 'Baixo',
  data_kickoff        date          null,
  prazo_alvo          date          null,
  data_handoff        date          null,   -- data em que passou para operação
  responsavel_id      uuid          references auth.users(id) on delete set null,
  checklist_concluido boolean       not null default false,
  checklist_json      jsonb         null,   -- checklist detalhado com itens e status
  observacoes         text          null,
  created_by          uuid          references auth.users(id) on delete set null,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  deleted_at          timestamptz   null
);

-- ==================== TRIGGER updated_at ====================

-- Reutiliza a função trigger de updated_at já existente no banco
-- (criada nas migrations anteriores como mostra a função set_updated_at ou similar).
-- Se não existir, criamos aqui de forma segura:
create or replace function public.set_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contratos_set_updated_at
  before update on public.contratos
  for each row execute function public.set_updated_at();

create trigger implantacoes_set_updated_at
  before update on public.implantacoes
  for each row execute function public.set_updated_at();

-- ==================== TRIGGER tenant_id AUTO-INJECT ====================
-- Injeta automaticamente o tenant_id ativo do usuário no INSERT,
-- garantindo que nunca se possa inserir no tenant errado.

create or replace function public.set_tenant_id_from_active()
  returns trigger language plpgsql security definer as $$
declare
  v_tenant_id uuid;
begin
  -- Usa a função get_active_tenant_id() já existente
  v_tenant_id := public.get_active_tenant_id();
  if v_tenant_id is null then
    raise exception 'Nenhum tenant ativo. Impossível inserir registro.';
  end if;
  new.tenant_id = v_tenant_id;
  return new;
end;
$$;

create trigger contratos_set_tenant_id
  before insert on public.contratos
  for each row execute function public.set_tenant_id_from_active();

create trigger implantacoes_set_tenant_id
  before insert on public.implantacoes
  for each row execute function public.set_tenant_id_from_active();

-- ==================== RLS: CONTRATOS ====================

alter table public.contratos enable row level security;

create policy "contratos_select"
  on public.contratos for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "contratos_insert"
  on public.contratos for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "contratos_update"
  on public.contratos for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "contratos_delete"
  on public.contratos for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ==================== RLS: IMPLANTAÇÕES ====================

alter table public.implantacoes enable row level security;

create policy "implantacoes_select"
  on public.implantacoes for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "implantacoes_insert"
  on public.implantacoes for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "implantacoes_update"
  on public.implantacoes for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "implantacoes_delete"
  on public.implantacoes for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ==================== INDEXES ====================

create index contratos_empresa_id_idx on public.contratos (empresa_id) where deleted_at is null;
create index contratos_proposta_id_idx on public.contratos (proposta_id) where proposta_id is not null;
create index contratos_status_idx on public.contratos (tenant_id, status) where deleted_at is null;

create index implantacoes_empresa_id_idx on public.implantacoes (empresa_id) where deleted_at is null;
create index implantacoes_contrato_id_idx on public.implantacoes (contrato_id) where contrato_id is not null;
create index implantacoes_status_idx on public.implantacoes (tenant_id, status) where deleted_at is null;
