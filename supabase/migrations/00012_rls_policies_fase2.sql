-- ============================================================
-- Migration 00012: Políticas RLS para entidades da Fase 2
-- ============================================================
-- Aplica RLS em todas as tabelas de negócio criadas nas
-- migrations 00008-00011. Usa as funções get_my_tenant_ids()
-- e get_active_tenant_id() criadas na Fase 1.
--
-- Regra: todo SELECT/INSERT/UPDATE/DELETE é filtrado pelo
-- tenant_id do usuário autenticado.
-- ============================================================

-- ===================== EMPRESAS =====================
alter table public.empresas enable row level security;

create policy "empresas_select"
  on public.empresas for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "empresas_insert"
  on public.empresas for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "empresas_update"
  on public.empresas for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "empresas_delete"
  on public.empresas for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== CONTATOS =====================
alter table public.contatos enable row level security;

create policy "contatos_select"
  on public.contatos for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "contatos_insert"
  on public.contatos for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "contatos_update"
  on public.contatos for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "contatos_delete"
  on public.contatos for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== ORIGENS_LEAD =====================
alter table public.origens_lead enable row level security;

create policy "origens_lead_select"
  on public.origens_lead for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "origens_lead_insert"
  on public.origens_lead for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "origens_lead_update"
  on public.origens_lead for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "origens_lead_delete"
  on public.origens_lead for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== LEADS =====================
alter table public.leads enable row level security;

create policy "leads_select"
  on public.leads for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "leads_insert"
  on public.leads for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "leads_update"
  on public.leads for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "leads_delete"
  on public.leads for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PIPELINES =====================
alter table public.pipelines enable row level security;

create policy "pipelines_select"
  on public.pipelines for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pipelines_insert"
  on public.pipelines for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "pipelines_update"
  on public.pipelines for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pipelines_delete"
  on public.pipelines for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== PIPELINE_ETAPAS =====================
alter table public.pipeline_etapas enable row level security;

create policy "pipeline_etapas_select"
  on public.pipeline_etapas for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pipeline_etapas_insert"
  on public.pipeline_etapas for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "pipeline_etapas_update"
  on public.pipeline_etapas for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "pipeline_etapas_delete"
  on public.pipeline_etapas for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== MOTIVOS_PERDA =====================
alter table public.motivos_perda enable row level security;

create policy "motivos_perda_select"
  on public.motivos_perda for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "motivos_perda_insert"
  on public.motivos_perda for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "motivos_perda_update"
  on public.motivos_perda for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "motivos_perda_delete"
  on public.motivos_perda for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== NEGOCIOS =====================
alter table public.negocios enable row level security;

create policy "negocios_select"
  on public.negocios for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "negocios_insert"
  on public.negocios for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "negocios_update"
  on public.negocios for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "negocios_delete"
  on public.negocios for delete
  using (tenant_id in (select public.get_my_tenant_ids()));

-- ===================== ATIVIDADES =====================
alter table public.atividades enable row level security;

create policy "atividades_select"
  on public.atividades for select
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "atividades_insert"
  on public.atividades for insert
  with check (
    tenant_id in (select public.get_my_tenant_ids())
    and auth.uid() is not null
  );

create policy "atividades_update"
  on public.atividades for update
  using (tenant_id in (select public.get_my_tenant_ids()));

create policy "atividades_delete"
  on public.atividades for delete
  using (tenant_id in (select public.get_my_tenant_ids()));
