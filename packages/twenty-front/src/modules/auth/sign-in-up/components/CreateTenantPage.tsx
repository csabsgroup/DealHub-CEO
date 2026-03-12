import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { supabase } from '@/lib/supabase';
import styles from './SignInUpPage.module.css';

// Página de onboarding: o usuário cria seu primeiro tenant (escritório)
export const CreateTenantPage = () => {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user, setActiveTenant } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ name, cnpj: cnpj || null })
        .select()
        .single();

      if (tenantError) throw new Error(tenantError.message);

      const { error: utError } = await supabase.from('user_tenants').insert({
        user_id: user.id,
        tenant_id: tenant.id,
        role: 'owner',
        scope: 'all',
      });

      if (utError) throw new Error(utError.message);

      await setActiveTenant(tenant.id);
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao criar organização. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar organização</h1>
        <p className={styles.subtitle}>
          Configure o escritório que usará o CRM. Você será o proprietário.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="tenantName">
              Nome do escritório
            </label>
            <input
              className={styles.input}
              id="tenantName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contabilidade Silva & Associados"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="cnpj">
              CNPJ (opcional)
            </label>
            <input
              className={styles.input}
              id="cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar organização'}
          </button>
        </form>
      </div>
    </div>
  );
};
