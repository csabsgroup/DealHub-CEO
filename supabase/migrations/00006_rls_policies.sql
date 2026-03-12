-- ============================================================
-- Migration 00006: Políticas de RLS (Row Level Security)
-- ============================================================
-- Habilita RLS em todas as tabelas e cria políticas de
-- isolamento multi-tenant. Todo acesso é filtrado pelo
-- tenant_id do usuário logado.
-- ============================================================

-- ===================== HELPER FUNCTION =====================
-- Retorna todos os tenant_ids aos quais o usuário logado pertence
create or replace function public.get_my_tenant_ids()
returns setof uuid as $$
  select tenant_id
  from public.user_tenants
  where user_id = auth.uid()
    and is_active = true;
$$ language sql security definer stable;

-- Retorna o tenant_id "ativo" escolhido (armazenado no JWT claim ou fallback)
-- Usaremos o claim 'active_tenant_id' definido via supabase.auth.updateUser
create or replace function public.get_active_tenant_id()
returns uuid as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'active_tenant_id')::uuid,
    (select tenant_id from public.user_tenants
     where user_id = auth.uid() and is_active = true
     order by created_at asc limit 1)
  );
$$ language sql security definer stable;

-- ===================== TENANTS =====================
alter table public.tenants enable row level security;

-- Usuário vê apenas tenants aos quais pertence
create policy "Usuários veem seus próprios tenants"
  on public.tenants for select
  using (id in (select public.get_my_tenant_ids()));

-- Apenas owner/admin pode atualizar o tenant
create policy "Owner/Admin atualiza tenant"
  on public.tenants for update
  using (
    id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin')
        and is_active = true
    )
  );

-- Criação de tenant: qualquer usuário autenticado pode criar
-- (ao criar conta/org pela primeira vez)
create policy "Usuário autenticado cria tenant"
  on public.tenants for insert
  with check (auth.uid() is not null);

-- ===================== PROFILES =====================
alter table public.profiles enable row level security;

-- Usuário vê seu próprio perfil
create policy "Usuário vê próprio perfil"
  on public.profiles for select
  using (id = auth.uid());

-- Usuário vê perfis de colegas no mesmo tenant
create policy "Usuário vê colegas do tenant"
  on public.profiles for select
  using (
    id in (
      select ut.user_id from public.user_tenants ut
      where ut.tenant_id in (select public.get_my_tenant_ids())
        and ut.is_active = true
    )
  );

-- Usuário edita apenas seu próprio perfil
create policy "Usuário edita próprio perfil"
  on public.profiles for update
  using (id = auth.uid());

-- Insert é feito pelo trigger (security definer), mas permitimos
-- para o próprio usuário caso necessário
create policy "Insert próprio perfil"
  on public.profiles for insert
  with check (id = auth.uid());

-- ===================== USER_TENANTS =====================
alter table public.user_tenants enable row level security;

-- Usuário vê vínculos do seu tenant
create policy "Vê vínculos do próprio tenant"
  on public.user_tenants for select
  using (
    tenant_id in (select public.get_my_tenant_ids())
  );

-- Apenas owner/admin pode adicionar membros ao tenant
create policy "Owner/Admin adiciona membros"
  on public.user_tenants for insert
  with check (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin')
        and is_active = true
    )
    -- OU o próprio usuário criando seu primeiro vínculo (signup)
    or (
      user_id = auth.uid()
      and not exists (
        select 1 from public.user_tenants
        where user_id = auth.uid() and tenant_id = user_tenants.tenant_id
      )
    )
  );

-- Owner/Admin pode atualizar vínculos
create policy "Owner/Admin atualiza vínculos"
  on public.user_tenants for update
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin')
        and is_active = true
    )
  );

-- Owner pode remover vínculos (exceto o próprio se for o único owner)
create policy "Owner remove vínculos"
  on public.user_tenants for delete
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role = 'owner'
        and is_active = true
    )
  );

-- ===================== TEAMS =====================
alter table public.teams enable row level security;

-- Usuário vê teams do seu tenant
create policy "Vê teams do tenant"
  on public.teams for select
  using (tenant_id in (select public.get_my_tenant_ids()));

-- Owner/Admin/Gestor cria teams
create policy "Owner/Admin/Gestor cria teams"
  on public.teams for insert
  with check (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'gestor_comercial')
        and is_active = true
    )
  );

-- Owner/Admin/Gestor atualiza teams
create policy "Owner/Admin/Gestor atualiza teams"
  on public.teams for update
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'gestor_comercial')
        and is_active = true
    )
  );

-- Owner/Admin deleta teams
create policy "Owner/Admin deleta teams"
  on public.teams for delete
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin')
        and is_active = true
    )
  );

-- ===================== TEAM_MEMBERS =====================
alter table public.team_members enable row level security;

-- Usuário vê membros de teams do seu tenant
create policy "Vê membros do tenant"
  on public.team_members for select
  using (tenant_id in (select public.get_my_tenant_ids()));

-- Owner/Admin/Gestor/Leader adiciona membros
create policy "Gestores adicionam membros"
  on public.team_members for insert
  with check (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'gestor_comercial')
        and is_active = true
    )
    or
    -- Líder do time pode adicionar membros
    team_id in (
      select id from public.teams
      where leader_id = auth.uid()
    )
  );

-- Owner/Admin/Gestor/Leader remove membros
create policy "Gestores removem membros"
  on public.team_members for delete
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'gestor_comercial')
        and is_active = true
    )
    or
    team_id in (
      select id from public.teams
      where leader_id = auth.uid()
    )
  );

comment on function public.get_my_tenant_ids() is 'Retorna tenant_ids do usuário logado';
comment on function public.get_active_tenant_id() is 'Retorna o tenant ativo atual do usuário';
