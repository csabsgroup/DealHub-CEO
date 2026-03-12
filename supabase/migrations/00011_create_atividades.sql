-- ============================================================
-- Migration 00011: Tabela ATIVIDADES
-- ============================================================
-- Atividades = Tarefas, Reuniões, Chamadas, E-mails, Notas
-- Polimórfica: pode se vincular a Lead, Empresa, Contato ou
-- Negócio através de colunas dedicadas.
-- ============================================================

create table if not exists public.atividades (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,

  -- Tipo
  tipo              text not null check (tipo in (
    'Tarefa','Reunião','Chamada','Email','WhatsApp','Nota','Visita','Outro'
  )),

  -- Conteúdo
  titulo            text not null,
  descricao         text,

  -- Vinculação polimórfica (ao menos um deve ser preenchido)
  lead_id           uuid references public.leads(id) on delete cascade,
  empresa_id        uuid references public.empresas(id) on delete cascade,
  contato_id        uuid references public.contatos(id) on delete cascade,
  negocio_id        uuid references public.negocios(id) on delete cascade,

  -- Responsável e participantes
  responsavel_id    uuid references auth.users(id),
  criado_por_id     uuid references auth.users(id),

  -- Agendamento
  data_inicio       timestamptz,
  data_fim          timestamptz,
  dia_inteiro       boolean not null default false,
  duracao_minutos   integer,

  -- Status
  status            text not null default 'Pendente' check (status in (
    'Pendente','Em andamento','Concluída','Cancelada'
  )),
  prioridade        text not null default 'Normal' check (prioridade in (
    'Baixa','Normal','Alta','Urgente'
  )),

  -- Resultado (para chamadas/reuniões)
  resultado         text,

  -- Lembrete
  lembrete_minutos  integer,  -- minutos antes para lembrar (null = sem lembrete)

  -- Recorrência (simples)
  recorrencia       text check (recorrencia in (
    'Nenhuma','Diária','Semanal','Quinzenal','Mensal'
  )) default 'Nenhuma',

  -- Observações
  observacoes       text,
  tags              text[] default '{}',

  -- Auditoria
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz  -- soft delete
);

-- Índices
create index idx_atividades_tenant on public.atividades(tenant_id);
create index idx_atividades_responsavel on public.atividades(tenant_id, responsavel_id);
create index idx_atividades_lead on public.atividades(tenant_id, lead_id) where lead_id is not null;
create index idx_atividades_empresa on public.atividades(tenant_id, empresa_id) where empresa_id is not null;
create index idx_atividades_contato on public.atividades(tenant_id, contato_id) where contato_id is not null;
create index idx_atividades_negocio on public.atividades(tenant_id, negocio_id) where negocio_id is not null;
create index idx_atividades_status on public.atividades(tenant_id, status) where status in ('Pendente','Em andamento');
create index idx_atividades_data on public.atividades(tenant_id, data_inicio);
create index idx_atividades_deleted on public.atividades(tenant_id, deleted_at) where deleted_at is null;

create trigger trg_atividades_updated_at
  before update on public.atividades
  for each row execute function public.set_updated_at();

comment on table public.atividades is 'Atividades: tarefas, reuniões, chamadas, emails, notas vinculadas a entidades';
