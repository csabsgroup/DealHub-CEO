-- Migration 00021: RBAC Dinâmico Multi-Tenant
-- Cria a tabela tenant_roles com permissoes JSONB e migra user_tenants para tenant_role_id.

-- ============================================================
-- 1. Tabela tenant_roles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenant_roles (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome              VARCHAR(100) NOT NULL,
  descricao         TEXT,
  is_system_default BOOLEAN     NOT NULL DEFAULT FALSE,
  permissoes        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_tenant_role_nome UNIQUE (tenant_id, nome)
);

COMMENT ON TABLE public.tenant_roles IS
  'Perfis de acesso customizáveis por tenant — motor RBAC dinâmico.';

COMMENT ON COLUMN public.tenant_roles.permissoes IS
  'Flags booleanas de permissão: can_view_all_deals, can_delete_deals, can_access_settings, can_manage_financials, can_export_data.';

-- ============================================================
-- 2. RLS em tenant_roles
-- ============================================================

ALTER TABLE public.tenant_roles ENABLE ROW LEVEL SECURITY;

-- Qualquer membro ativo do tenant pode ler os perfis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenant_roles'
      AND policyname = 'Membros lêem perfis de acesso do tenant'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Membros lêem perfis de acesso do tenant"
        ON public.tenant_roles FOR SELECT
        USING (
          tenant_id IN (
            SELECT ut.tenant_id FROM public.user_tenants ut
            WHERE ut.user_id = auth.uid() AND ut.is_active = true
          )
        )
    $pol$;
  END IF;
END $$;

-- Apenas admins (owner/admin ou perfil_crm='admin') gerenciam perfis de acesso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenant_roles'
      AND policyname = 'CRM Admin gerencia perfis de acesso'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "CRM Admin gerencia perfis de acesso"
        ON public.tenant_roles FOR ALL
        USING (
          tenant_id IN (
            SELECT ut.tenant_id FROM public.user_tenants ut
            WHERE  ut.user_id   = auth.uid()
              AND  ut.is_active  = true
              AND  (ut.role IN ('owner', 'admin') OR ut.perfil_crm = 'admin')
          )
        )
        WITH CHECK (
          tenant_id IN (
            SELECT ut.tenant_id FROM public.user_tenants ut
            WHERE  ut.user_id   = auth.uid()
              AND  ut.is_active  = true
              AND  (ut.role IN ('owner', 'admin') OR ut.perfil_crm = 'admin')
          )
        )
    $pol$;
  END IF;
END $$;

-- ============================================================
-- 3. Coluna tenant_role_id em user_tenants
-- ============================================================

ALTER TABLE public.user_tenants
  ADD COLUMN IF NOT EXISTS tenant_role_id UUID
    REFERENCES public.tenant_roles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_tenants.tenant_role_id IS
  'FK para o perfil de acesso dinâmico do RBAC (tenant_roles.id).';

-- ============================================================
-- 4. Trigger updated_at para tenant_roles
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_tenant_roles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tenant_roles_updated_at ON public.tenant_roles;
CREATE TRIGGER trg_tenant_roles_updated_at
  BEFORE UPDATE ON public.tenant_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_roles_updated_at();

-- ============================================================
-- 5. Seed — perfis padrão para cada tenant existente
-- ============================================================

-- 5a. Admin Master (todas as permissões ativas)
INSERT INTO public.tenant_roles (tenant_id, nome, descricao, is_system_default, permissoes)
SELECT
  t.id,
  'Admin Master',
  'Acesso total com todas as permissões habilitadas. Perfil de sistema, não pode ser excluído.',
  true,
  '{
    "can_view_all_deals":   true,
    "can_delete_deals":     true,
    "can_access_settings":  true,
    "can_manage_financials": true,
    "can_export_data":       true
  }'::jsonb
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_roles tr
  WHERE tr.tenant_id = t.id AND tr.nome = 'Admin Master'
);

-- 5b. Vendedor padrão (somente operações básicas de vendas)
INSERT INTO public.tenant_roles (tenant_id, nome, descricao, is_system_default, permissoes)
SELECT
  t.id,
  'Vendedor',
  'Acesso padrão para executivos de vendas. Gerencia seus próprios negócios e propostas.',
  true,
  '{
    "can_view_all_deals":    false,
    "can_delete_deals":      false,
    "can_access_settings":   false,
    "can_manage_financials": false,
    "can_export_data":       false
  }'::jsonb
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_roles tr
  WHERE tr.tenant_id = t.id AND tr.nome = 'Vendedor'
);

-- 5c. SDR padrão (qualificação de leads)
INSERT INTO public.tenant_roles (tenant_id, nome, descricao, is_system_default, permissoes)
SELECT
  t.id,
  'SDR',
  'Acesso para pré-vendas e qualificação de leads.',
  true,
  '{
    "can_view_all_deals":    false,
    "can_delete_deals":      false,
    "can_access_settings":   false,
    "can_manage_financials": false,
    "can_export_data":       false
  }'::jsonb
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_roles tr
  WHERE tr.tenant_id = t.id AND tr.nome = 'SDR'
);

-- ============================================================
-- 6. Atualiza donos (owner/admin) para o perfil Admin Master
-- ============================================================

UPDATE public.user_tenants ut
SET    tenant_role_id = tr.id
FROM   public.tenant_roles tr
WHERE  tr.tenant_id        = ut.tenant_id
  AND  tr.nome             = 'Admin Master'
  AND  tr.is_system_default = true
  AND  ut.role             IN ('owner', 'admin')
  AND  ut.tenant_role_id   IS NULL;

-- ============================================================
-- 7. Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tenant_roles_tenant_id
  ON public.tenant_roles(tenant_id);

CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_role_id
  ON public.user_tenants(tenant_role_id);
