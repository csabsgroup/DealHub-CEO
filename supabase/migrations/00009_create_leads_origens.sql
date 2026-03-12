-- ============================================================
-- Migration 00009: Tabelas ORIGENS_LEAD e LEADS
-- ============================================================
-- Origens = Catálogo de fontes/canais de captação por tenant
-- Leads = Registro inicial de interesse comercial
-- ============================================================

-- ===================== ORIGENS_LEAD =====================
create table if not exists public.origens_lead (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,

  nome        text not null,
  tipo        text check (tipo in (
    'Inbound','Outbound','Indicação','Evento','Parceria','Mídia Paga','Orgânico','Outro'
  )),
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_origens_lead_tenant on public.origens_lead(tenant_id);
create unique index idx_origens_lead_nome on public.origens_lead(tenant_id, nome);

create trigger trg_origens_lead_updated_at
  before update on public.origens_lead
  for each row execute function public.set_updated_at();

comment on table public.origens_lead is 'Catálogo de fontes/origens de leads por tenant';

-- ===================== LEADS =====================
create table if not exists public.leads (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references public.tenants(id) on delete cascade,

  -- Identificação
  nome                  text not null,
  empresa               text,
  email                 text,
  telefone              text,
  cnpj                  text,

  -- Origem e campanha
  origem_id             uuid references public.origens_lead(id),
  origem_detalhe        text,       -- detalhe livre (nome da campanha, landing page, etc.)
  canal                 text,       -- WhatsApp, Formulário, Telefone, LinkedIn...
  campanha              text,

  -- Qualificação
  interesse_principal   text,
  descricao_dor         text,
  score                 integer default 0 check (score >= 0 and score <= 100),
  temperatura           text check (temperatura in ('Frio','Morno','Quente')),

  -- Status
  status_triagem        text not null default 'Novo' check (status_triagem in (
    'Novo','Contatado','Qualificado','Desqualificado','Convertido'
  )),

  -- Responsável
  responsavel_id        uuid references auth.users(id),
  unidade_negocio       text,

  -- Datas
  data_primeiro_contato timestamptz,
  data_qualificacao     timestamptz,

  -- Conversão
  convertido_empresa_id uuid references public.empresas(id),
  convertido_contato_id uuid references public.contatos(id),
  data_conversao        timestamptz,

  -- Observações
  observacoes           text,
  tags                  text[] default '{}',

  -- Auditoria
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz  -- soft delete
);

-- Índices
create index idx_leads_tenant on public.leads(tenant_id);
create index idx_leads_status on public.leads(tenant_id, status_triagem);
create index idx_leads_responsavel on public.leads(tenant_id, responsavel_id);
create index idx_leads_origem on public.leads(tenant_id, origem_id);
create index idx_leads_score on public.leads(tenant_id, score desc);
create index idx_leads_deleted on public.leads(tenant_id, deleted_at) where deleted_at is null;
create index idx_leads_cnpj on public.leads(tenant_id, cnpj) where cnpj is not null;

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

comment on table public.leads is 'Leads/Prospects - registro inicial de interesse comercial';
