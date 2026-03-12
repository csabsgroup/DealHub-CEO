-- ============================================================
-- Migration 00010: PIPELINES, PIPELINE_ETAPAS, MOTIVOS_PERDA
--                  e NEGOCIOS
-- ============================================================
-- Pipelines e etapas configuráveis por tenant.
-- Negócios (oportunidades) com relacionamento a pipeline,
-- empresa, contato e responsável.
-- ============================================================

-- ===================== PIPELINES =====================
create table if not exists public.pipelines (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,

  nome        text not null,
  descricao   text,
  is_default  boolean not null default false,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_pipelines_tenant on public.pipelines(tenant_id);
create unique index idx_pipelines_nome on public.pipelines(tenant_id, nome);

create trigger trg_pipelines_updated_at
  before update on public.pipelines
  for each row execute function public.set_updated_at();

comment on table public.pipelines is 'Pipelines comerciais configuráveis por tenant';

-- ===================== PIPELINE_ETAPAS =====================
create table if not exists public.pipeline_etapas (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  pipeline_id   uuid not null references public.pipelines(id) on delete cascade,

  nome          text not null,
  posicao       integer not null default 0,  -- ordem na visualização
  cor           text default '#6b7280',      -- cor hex para Kanban
  probabilidade integer default 0 check (probabilidade >= 0 and probabilidade <= 100),

  -- Tipo da etapa (para lógica de sistema)
  tipo          text not null default 'aberto' check (tipo in (
    'aberto','ganho','perdido'
  )),

  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_pipeline_etapas_tenant on public.pipeline_etapas(tenant_id);
create index idx_pipeline_etapas_pipeline on public.pipeline_etapas(pipeline_id, posicao);
create unique index idx_pipeline_etapas_nome on public.pipeline_etapas(pipeline_id, nome);

create trigger trg_pipeline_etapas_updated_at
  before update on public.pipeline_etapas
  for each row execute function public.set_updated_at();

comment on table public.pipeline_etapas is 'Etapas dos pipelines (colunas do Kanban)';

-- ===================== MOTIVOS_PERDA =====================
create table if not exists public.motivos_perda (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,

  nome        text not null,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_motivos_perda_tenant on public.motivos_perda(tenant_id);
create unique index idx_motivos_perda_nome on public.motivos_perda(tenant_id, nome);

create trigger trg_motivos_perda_updated_at
  before update on public.motivos_perda
  for each row execute function public.set_updated_at();

comment on table public.motivos_perda is 'Catálogo de motivos de perda por tenant';

-- ===================== NEGOCIOS =====================
create table if not exists public.negocios (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,

  -- Identificação
  titulo                  text not null,
  empresa_id              uuid references public.empresas(id),
  contato_principal_id    uuid references public.contatos(id),
  lead_id                 uuid references public.leads(id),  -- origem se veio de lead

  -- Pipeline
  pipeline_id             uuid not null references public.pipelines(id),
  etapa_id                uuid not null references public.pipeline_etapas(id),

  -- Responsável
  responsavel_id          uuid references auth.users(id),
  unidade_negocio         text,

  -- Valores
  valor_estimado          numeric(15,2) default 0,
  valor_mensalidade       numeric(15,2),
  valor_setup             numeric(15,2),
  probabilidade           integer default 0 check (probabilidade >= 0 and probabilidade <= 100),

  -- Classificação
  origem                  text,
  servico                 text,       -- serviço principal
  pacote                  text,       -- pacote/plano
  temperatura             text check (temperatura in ('Frio','Morno','Quente')),

  -- Datas
  data_prevista_fechamento date,
  data_fechamento          timestamptz,  -- quando realmente fechou

  -- Status final
  status_final            text check (status_final in ('Aberto','Ganho','Perdido')),
  motivo_perda_id         uuid references public.motivos_perda(id),
  motivo_perda_detalhe    text,

  -- Próxima atividade (desnormalizado para performance nas listas)
  proxima_atividade       text,
  proxima_atividade_data  timestamptz,

  -- Observações
  observacoes             text,
  tags                    text[] default '{}',

  -- Auditoria
  created_by              uuid references auth.users(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz  -- soft delete
);

-- Índices
create index idx_negocios_tenant on public.negocios(tenant_id);
create index idx_negocios_pipeline on public.negocios(tenant_id, pipeline_id);
create index idx_negocios_etapa on public.negocios(tenant_id, etapa_id);
create index idx_negocios_empresa on public.negocios(tenant_id, empresa_id);
create index idx_negocios_responsavel on public.negocios(tenant_id, responsavel_id);
create index idx_negocios_status on public.negocios(tenant_id, status_final);
create index idx_negocios_fechamento on public.negocios(tenant_id, data_prevista_fechamento)
  where status_final = 'Aberto';
create index idx_negocios_deleted on public.negocios(tenant_id, deleted_at) where deleted_at is null;

create trigger trg_negocios_updated_at
  before update on public.negocios
  for each row execute function public.set_updated_at();

comment on table public.negocios is 'Oportunidades/Negócios comerciais vinculados a pipelines';
