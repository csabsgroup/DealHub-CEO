-- Migration 00020: Gestão de Usuários e Perfis — módulo CRM
-- Adiciona coluna perfil_crm (Admin, Vendedor, SDR) ao user_tenants já existente
-- e cria as políticas de RLS necessárias para o painel de configurações.

-- ============================================================
-- 1. Coluna perfil_crm em user_tenants
-- ============================================================

ALTER TABLE public.user_tenants
  ADD COLUMN IF NOT EXISTS perfil_crm VARCHAR(20)
    DEFAULT 'vendedor'
    CHECK (perfil_crm IN ('admin', 'vendedor', 'sdr'));

COMMENT ON COLUMN public.user_tenants.perfil_crm IS
  'Papel funcional no CRM: admin (gestor), vendedor (closer/executivo), sdr (pré-vendas)';

-- Semente: registros owner/admin existentes já são admin no CRM
UPDATE public.user_tenants
SET    perfil_crm = 'admin'
WHERE  role IN ('owner', 'admin')
  AND  (perfil_crm IS DISTINCT FROM 'admin');

-- ============================================================
-- 2. Função auxiliar — encontra UUID de usuário pelo e-mail
--    (SECURITY DEFINER: bypassa RLS para permitir o fluxo de convite)
-- ============================================================

CREATE OR REPLACE FUNCTION public.find_user_id_by_email(p_email TEXT)
RETURNS UUID AS $$
  SELECT id
  FROM   public.profiles
  WHERE  email = LOWER(TRIM(p_email))
  LIMIT  1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.find_user_id_by_email(TEXT) IS
  'Retorna o UUID do perfil para um e-mail informado. Usado no convite de usuários pelo admin do tenant.';

-- ============================================================
-- 3. Políticas RLS adicionais
--    (as existentes cobrem owner/admin; estas cobrem perfil_crm=''admin'')
-- ============================================================

-- 3a. perfil_crm='admin' pode adicionar membros ao tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'user_tenants'
      AND  policyname = 'CRM Admin adiciona membros'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "CRM Admin adiciona membros"
        ON public.user_tenants FOR INSERT
        WITH CHECK (
          tenant_id IN (
            SELECT tenant_id FROM public.user_tenants
            WHERE  user_id    = auth.uid()
              AND  perfil_crm = 'admin'
              AND  is_active  = true
          )
        )
    $pol$;
  END IF;
END $$;

-- 3b. perfil_crm='admin' pode atualizar vínculos do tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'user_tenants'
      AND  policyname = 'CRM Admin atualiza vínculos'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "CRM Admin atualiza vínculos"
        ON public.user_tenants FOR UPDATE
        USING (
          tenant_id IN (
            SELECT tenant_id FROM public.user_tenants
            WHERE  user_id    = auth.uid()
              AND  perfil_crm = 'admin'
              AND  is_active  = true
          )
        )
    $pol$;
  END IF;
END $$;

-- 3c. perfil_crm='admin' pode ver todos os profiles do tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'profiles'
      AND  policyname = 'CRM Admin vê perfis do tenant'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "CRM Admin vê perfis do tenant"
        ON public.profiles FOR SELECT
        USING (
          id IN (
            SELECT ut.user_id
            FROM   public.user_tenants ut
            WHERE  ut.tenant_id = public.get_active_tenant_id()
              AND  ut.is_active = true
          )
          AND EXISTS (
            SELECT 1 FROM public.user_tenants ac
            WHERE  ac.user_id    = auth.uid()
              AND  ac.tenant_id  = public.get_active_tenant_id()
              AND  ac.perfil_crm = 'admin'
              AND  ac.is_active  = true
          )
        )
    $pol$;
  END IF;
END $$;

-- 3d. perfil_crm='admin' pode atualizar full_name de colegas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'profiles'
      AND  policyname = 'CRM Admin atualiza perfis do tenant'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "CRM Admin atualiza perfis do tenant"
        ON public.profiles FOR UPDATE
        USING (
          id IN (
            SELECT ut.user_id
            FROM   public.user_tenants ut
            WHERE  ut.tenant_id = public.get_active_tenant_id()
              AND  ut.is_active = true
          )
          AND EXISTS (
            SELECT 1 FROM public.user_tenants ac
            WHERE  ac.user_id    = auth.uid()
              AND  ac.tenant_id  = public.get_active_tenant_id()
              AND  ac.perfil_crm = 'admin'
              AND  ac.is_active  = true
          )
        )
    $pol$;
  END IF;
END $$;

-- ============================================================
-- 4. Índice para buscas por perfil_crm
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_tenants_perfil_crm
  ON public.user_tenants (tenant_id, perfil_crm)
  WHERE is_active = true;
