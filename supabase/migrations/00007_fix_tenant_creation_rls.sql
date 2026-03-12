-- ============================================================
-- Migration 00007: Corrige RLS para criação de tenant
-- ============================================================
-- Problema: "ovo e galinha" — o usuário não consegue inserir
-- em tenants porque a política de user_tenants impede criar
-- o vínculo owner, e vice-versa.
--
-- Solução: criar uma função SECURITY DEFINER que executa ambos
-- os inserts (tenant + user_tenants) de forma atômica,
-- contornando o RLS. Remover a necessidade de INSERT direto
-- nas tabelas pelo frontend.
-- ============================================================

-- 1) Função SECURITY DEFINER que cria tenant + vínculo owner
--    Executa com permissão do owner da função (bypassa RLS)
create or replace function public.create_tenant_with_owner(
  p_name text,
  p_cnpj text default null
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

  -- Cria o tenant
  insert into public.tenants (name, cnpj)
  values (p_name, p_cnpj)
  returning * into v_tenant;

  -- Cria o vínculo owner na user_tenants
  insert into public.user_tenants (user_id, tenant_id, role, scope)
  values (v_user_id, v_tenant.id, 'owner', 'all');

  -- Retorna o tenant criado como JSON
  return jsonb_build_object(
    'id', v_tenant.id,
    'name', v_tenant.name,
    'cnpj', v_tenant.cnpj,
    'created_at', v_tenant.created_at
  );
end;
$$ language plpgsql security definer;

-- Garante que a função só pode ser chamada por usuários autenticados
revoke execute on function public.create_tenant_with_owner(text, text) from anon;
grant execute on function public.create_tenant_with_owner(text, text) to authenticated;

-- 2) Opcional: manter a política de INSERT em tenants para
--    compatibilidade futura, mas a criação agora vai pela função.
--    (A política existente já está correta: auth.uid() is not null)
