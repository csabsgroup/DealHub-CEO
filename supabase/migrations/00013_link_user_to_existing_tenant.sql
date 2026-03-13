-- ============================================================
-- Migration 00013: Função para vincular usuário a tenant existente
-- ============================================================
-- Quando o CNPJ já existe, permite vincular o usuário ao
-- tenant existente em vez de criar um novo.
-- ============================================================

create or replace function public.link_user_to_existing_tenant(
  p_cnpj text
)
returns jsonb as $$
declare
  v_user_id uuid;
  v_tenant  public.tenants;
begin
  -- Garante que o usuário está autenticado
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  -- Busca o tenant pelo CNPJ
  select * into v_tenant
  from public.tenants
  where cnpj = p_cnpj;

  if v_tenant.id is null then
    raise exception 'Nenhuma organização encontrada com este CNPJ';
  end if;

  -- Verifica se o vínculo já existe
  if exists (
    select 1 from public.user_tenants
    where user_id = v_user_id and tenant_id = v_tenant.id
  ) then
    -- Vínculo já existe, apenas atualiza para ativo
    update public.user_tenants
    set is_active = true, updated_at = now()
    where user_id = v_user_id and tenant_id = v_tenant.id;
  else
    -- Cria vínculo como membro (não owner)
    insert into public.user_tenants (user_id, tenant_id, role, scope)
    values (v_user_id, v_tenant.id, 'member', 'own');
  end if;

  return jsonb_build_object(
    'tenant_id', v_tenant.id,
    'tenant_name', v_tenant.name
  );
end;
$$ language plpgsql security definer;

revoke execute on function public.link_user_to_existing_tenant(text) from anon;
grant execute on function public.link_user_to_existing_tenant(text) to authenticated;
