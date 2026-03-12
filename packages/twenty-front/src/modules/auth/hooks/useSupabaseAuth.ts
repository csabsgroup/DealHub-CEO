import { type Session, type User as SupabaseUser } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    type Profile,
    type Tenant,
    type UserTenant,
} from '@/auth/types/auth.types';
import { supabase } from '@/lib/supabase';

// Hook principal de autenticação via Supabase
export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [userTenant, setUserTenant] = useState<UserTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega o perfil do usuário a partir da tabela profiles
  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao carregar perfil:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // Carrega os tenants do usuário
  const loadUserTenants = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_tenants')
      .select('*, tenants(*)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao carregar tenants:', error.message);
      return [];
    }
    return data;
  }, []);

  // Define o tenant ativo
  const setActiveTenant = useCallback(
    async (tenantId: string) => {
      if (!user) return;

      const { data: ut, error: utError } = await supabase
        .from('user_tenants')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (utError) {
        console.error('Erro ao buscar vínculo:', utError.message);
        return;
      }

      const { data: tenant, error: tError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tError) {
        console.error('Erro ao buscar tenant:', tError.message);
        return;
      }

      setUserTenant(ut as UserTenant);
      setActiveTenantState(tenant as Tenant);

      // Persiste no localStorage para recarregar na próxima sessão
      localStorage.setItem('activeTenantId', tenantId);
    },
    [user],
  );

  // Carrega sessão + dados do usuário ao iniciar
  const loadUserData = useCallback(
    async (currentSession: Session) => {
      const userId = currentSession.user.id;
      setUser(currentSession.user);

      const userProfile = await loadProfile(userId);
      setProfile(userProfile);

      const userTenantsData = await loadUserTenants(userId);

      if (userTenantsData.length > 0) {
        // Tenta recuperar o tenant ativo do localStorage
        const savedTenantId = localStorage.getItem('activeTenantId');
        const matchingTenant = savedTenantId
          ? userTenantsData.find(
              (ut: { tenant_id: string }) => ut.tenant_id === savedTenantId,
            )
          : null;

        const activeTenantData = matchingTenant || userTenantsData[0];

        setUserTenant({
          id: activeTenantData.id,
          user_id: activeTenantData.user_id,
          tenant_id: activeTenantData.tenant_id,
          role: activeTenantData.role,
          scope: activeTenantData.scope,
          manager_id: activeTenantData.manager_id,
          business_unit: activeTenantData.business_unit,
          is_active: activeTenantData.is_active,
          created_at: activeTenantData.created_at,
          updated_at: activeTenantData.updated_at,
        } as UserTenant);

        if (activeTenantData.tenants) {
          setActiveTenantState(activeTenantData.tenants as Tenant);
        }
      }
    },
    [loadProfile, loadUserTenants],
  );

  // Sign In com email/senha
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    // O onAuthStateChange tratará o resto
  }, []);

  // Sign Up com email/senha
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      // O trigger handle_new_user criará o profile automaticamente
    },
    [],
  );

  // Sign Out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    setActiveTenantState(null);
    setUserTenant(null);
    localStorage.removeItem('activeTenantId');
  }, []);

  // Inicialização: escuta mudanças de sessão
  useEffect(() => {
    // Recupera sessão existente
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        loadUserData(currentSession).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listener de mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadUserData(newSession).finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setActiveTenantState(null);
        setUserTenant(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  return useMemo(
    () => ({
      session,
      user,
      profile,
      activeTenant,
      userTenant,
      isLoading,
      signIn,
      signUp,
      signOut,
      setActiveTenant,
    }),
    [
      session,
      user,
      profile,
      activeTenant,
      userTenant,
      isLoading,
      signIn,
      signUp,
      signOut,
      setActiveTenant,
    ],
  );
};
