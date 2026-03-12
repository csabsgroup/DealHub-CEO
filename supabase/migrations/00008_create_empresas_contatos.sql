-- ============================================================
-- Migration 00008: Tabelas EMPRESAS e CONTATOS
-- ============================================================
-- Empresa = Conta B2B (escritório, clínica, e-commerce, etc.)
-- Contato = Pessoa vinculada a uma empresa
-- ============================================================

-- ===================== EMPRESAS =====================
create table if not exists public.empresas (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,

  -- Identificação
  razao_social    text not null,
  nome_fantasia   text,
  cnpj            text,
  cnae_principal  text,

  -- Classificação
  porte           text check (porte in ('MEI','ME','EPP','Médio','Grande')),
  regime_tributario text check (regime_tributario in (
    'Simples Nacional','Lucro Presumido','Lucro Real','Imune/Isento'
  )),
  segmento        text,
  nicho           text,

  -- Financeiro
  faturamento_estimado numeric(15,2),
  colaboradores   integer,

  -- Localização
  endereco        text,
  cidade          text,
  uf              text,
  cep             text,

  -- Contato
  site            text,
  email_principal text,
  telefone        text,

  -- Operacional
  dono_conta_id   uuid references auth.users(id),
  unidade_negocio text,
  tags            text[] default '{}',

  -- Observações
  observacoes     text,

  -- Auditoria
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz  -- soft delete
);

-- Índices
create index idx_empresas_tenant on public.empresas(tenant_id);
create index idx_empresas_cnpj on public.empresas(tenant_id, cnpj);
create index idx_empresas_dono on public.empresas(tenant_id, dono_conta_id);
create index idx_empresas_segmento on public.empresas(tenant_id, segmento);
create index idx_empresas_deleted on public.empresas(tenant_id, deleted_at) where deleted_at is null;

-- Trigger updated_at
create trigger trg_empresas_updated_at
  before update on public.empresas
  for each row execute function public.set_updated_at();

comment on table public.empresas is 'Contas/Empresas B2B vinculadas ao tenant';

-- ===================== CONTATOS =====================
create table if not exists public.contatos (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  empresa_id          uuid references public.empresas(id) on delete set null,

  -- Identificação
  nome                text not null,
  cargo               text,
  email               text,
  telefone            text,
  whatsapp            text,

  -- Papel
  papel_decisao       text check (papel_decisao in (
    'Decisor','Influenciador','Aprovador','Usuario','Comprador','Gatekeeper'
  )),
  canal_preferido     text check (canal_preferido in (
    'Email','Telefone','WhatsApp','Presencial','Videoconferência'
  )),
  is_principal        boolean not null default false,

  -- LGPD
  consentimento       boolean not null default false,
  consentimento_data  timestamptz,

  -- Histórico
  data_ultimo_contato timestamptz,
  observacoes         text,

  -- Auditoria
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz  -- soft delete
);

-- Índices
create index idx_contatos_tenant on public.contatos(tenant_id);
create index idx_contatos_empresa on public.contatos(tenant_id, empresa_id);
create index idx_contatos_email on public.contatos(tenant_id, email);
create index idx_contatos_deleted on public.contatos(tenant_id, deleted_at) where deleted_at is null;

-- Trigger updated_at
create trigger trg_contatos_updated_at
  before update on public.contatos
  for each row execute function public.set_updated_at();

comment on table public.contatos is 'Contatos/Pessoas vinculados a empresas dentro do tenant';
