-- ============================================================
-- Migration 00014: SERVICOS, PACOTES, PACOTE_SERVICOS,
--                  PROPOSTAS e PROPOSTA_ITENS
-- ============================================================
-- Fase 5 — Módulo de Serviços, Pacotes e Propostas.
-- Catálogo de serviços contábeis, agrupamento em pacotes,
-- e propostas comerciais vinculadas a negócios.
-- Todas as tabelas com tenant_id + RLS rigoroso.
-- ============================================================

-- ===================== SERVICOS =====================
-- Catálogo de serviços contábeis oferecidos pelo escritório
create table if not exists public.servicos (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,

  nome                text not null,
  categoria           text check (categoria in (
    'Contabilidade',
    'Fiscal',
    'Folha de Pagamento',
    'Societário',
    'Consultoria',
    'Financeiro',
    'Legalização',
    'Auditoria',
    'Outro'
  )),
  descricao_comercial text,
  preco_minimo        numeric(15,2) default 0,
  preco_sugerido      numeric(15,2) default 0,
  tipo_cobranca       text not null default 'Recorrente' check (tipo_cobranca in (
    'Recorrente',
    'Avulso'
  )),
  is_active           boolean not null default true,

  -- Auditoria
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz  -- soft delete
);

-- Índices
create index idx_servicos_tenant on public.servicos(tenant_id);
create index idx_servicos_categoria on public.servicos(tenant_id, categoria);
create unique index idx_servicos_nome on public.servicos(tenant_id, nome)
  where deleted_at is null;
create index idx_servicos_deleted on public.servicos(tenant_id, deleted_at)
  where deleted_at is null;

-- Trigger updated_at
create trigger trg_servicos_updated_at
  before update on public.servicos
  for each row execute function public.set_updated_at();

comment on table public.servicos is 'Catálogo de serviços contábeis por tenant';

-- ===================== PACOTES =====================
-- Agrupadores de serviços (ex: "Contabilidade + Folha")
create table if not exists public.pacotes (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,

  nome              text not null,
  descricao         text,
  preco_sugerido    numeric(15,2) default 0,
  is_active         boolean not null default true,

  -- Auditoria
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz  -- soft delete
);

-- Índices
create index idx_pacotes_tenant on public.pacotes(tenant_id);
create unique index idx_pacotes_nome on public.pacotes(tenant_id, nome)
  where deleted_at is null;
create index idx_pacotes_deleted on public.pacotes(tenant_id, deleted_at)
  where deleted_at is null;

-- Trigger updated_at
create trigger trg_pacotes_updated_at
  before update on public.pacotes
  for each row execute function public.set_updated_at();

comment on table public.pacotes is 'Pacotes agrupadores de serviços por tenant';

-- ===================== PACOTE_SERVICOS =====================
-- Tabela de ligação N:N entre pacotes e serviços
create table if not exists public.pacote_servicos (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  pacote_id               uuid not null references public.pacotes(id) on delete cascade,
  servico_id              uuid not null references public.servicos(id) on delete cascade,

  quantidade              integer not null default 1,
  preco_unitario_override numeric(15,2),  -- permite sobrescrever o preço do serviço no pacote

  created_at              timestamptz not null default now()
);

-- Índices
create index idx_pacote_servicos_tenant on public.pacote_servicos(tenant_id);
create index idx_pacote_servicos_pacote on public.pacote_servicos(pacote_id);
create index idx_pacote_servicos_servico on public.pacote_servicos(servico_id);
create unique index idx_pacote_servicos_unico on public.pacote_servicos(pacote_id, servico_id);

comment on table public.pacote_servicos is 'Ligação N:N entre pacotes e serviços';

-- ===================== PROPOSTAS =====================
-- Propostas comerciais vinculadas a negócios
create table if not exists public.propostas (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,

  negocio_id        uuid references public.negocios(id),
  numero            text not null,
  versao            integer not null default 1,
  valor_total       numeric(15,2) default 0,
  valor_setup       numeric(15,2) default 0,
  valor_mensalidade numeric(15,2) default 0,
  validade_dias     integer default 30,
  data_validade     date,
  status            text not null default 'Rascunho' check (status in (
    'Rascunho',
    'Enviada',
    'Aceita',
    'Recusada'
  )),
  observacoes       text,

  -- Responsável
  criado_por_id     uuid references auth.users(id),

  -- Auditoria
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz  -- soft delete
);

-- Índices
create index idx_propostas_tenant on public.propostas(tenant_id);
create index idx_propostas_negocio on public.propostas(tenant_id, negocio_id);
create index idx_propostas_status on public.propostas(tenant_id, status);
create unique index idx_propostas_numero on public.propostas(tenant_id, numero, versao)
  where deleted_at is null;
create index idx_propostas_deleted on public.propostas(tenant_id, deleted_at)
  where deleted_at is null;

-- Trigger updated_at
create trigger trg_propostas_updated_at
  before update on public.propostas
  for each row execute function public.set_updated_at();

comment on table public.propostas is 'Propostas comerciais vinculadas a negócios';

-- ===================== PROPOSTA_ITENS =====================
-- Itens individuais de uma proposta
create table if not exists public.proposta_itens (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,

  proposta_id       uuid not null references public.propostas(id) on delete cascade,
  servico_id        uuid references public.servicos(id),  -- nullable para itens customizados
  descricao         text not null,
  quantidade        integer not null default 1,
  valor_unitario    numeric(15,2) not null default 0,
  valor_total       numeric(15,2) not null default 0,
  tipo_cobranca     text not null default 'Recorrente' check (tipo_cobranca in (
    'Recorrente',
    'Avulso'
  )),
  posicao           integer not null default 0,

  created_at        timestamptz not null default now()
);

-- Índices
create index idx_proposta_itens_tenant on public.proposta_itens(tenant_id);
create index idx_proposta_itens_proposta on public.proposta_itens(proposta_id, posicao);
create index idx_proposta_itens_servico on public.proposta_itens(servico_id)
  where servico_id is not null;

comment on table public.proposta_itens is 'Itens individuais de uma proposta comercial';


-- ============================================================
-- RLS: Políticas de isolamento por tenant para as 5 tabelas
-- ============================================================
-- Usa a função get_my_tenant_ids() criada na migration 00006.
-- Padrão: 4 políticas (Select, Insert, Update, Delete) por tabela.
-- ============================================================

-- ===================== SERVICOS RLS =====================
alter table public.servicos enable row level security;

create policy "servicos_select"
  on public.servicos for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "servicos_insert"
  on public.servicos for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "servicos_update"
  on public.servicos for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "servicos_delete"
  on public.servicos for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PACOTES RLS =====================
alter table public.pacotes enable row level security;

create policy "pacotes_select"
  on public.pacotes for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pacotes_insert"
  on public.pacotes for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "pacotes_update"
  on public.pacotes for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pacotes_delete"
  on public.pacotes for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PACOTE_SERVICOS RLS =====================
alter table public.pacote_servicos enable row level security;

create policy "pacote_servicos_select"
  on public.pacote_servicos for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pacote_servicos_insert"
  on public.pacote_servicos for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "pacote_servicos_update"
  on public.pacote_servicos for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pacote_servicos_delete"
  on public.pacote_servicos for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PROPOSTAS RLS =====================
alter table public.propostas enable row level security;

create policy "propostas_select"
  on public.propostas for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "propostas_insert"
  on public.propostas for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "propostas_update"
  on public.propostas for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "propostas_delete"
  on public.propostas for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PROPOSTA_ITENS RLS =====================
alter table public.proposta_itens enable row level security;

create policy "proposta_itens_select"
  on public.proposta_itens for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "proposta_itens_insert"
  on public.proposta_itens for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "proposta_itens_update"
  on public.proposta_itens for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "proposta_itens_delete"
  on public.proposta_itens for delete
  using (tenant_id in (select public.get_my_tenant_ids()));
