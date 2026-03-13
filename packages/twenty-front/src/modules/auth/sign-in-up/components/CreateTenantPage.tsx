import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { supabase } from '~/lib/supabase';
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
      // Usa função SECURITY DEFINER que cria tenant + vínculo owner
      // de forma atômica, contornando o RLS
      const { data, error: rpcError } = await supabase.rpc(
        'create_tenant_with_owner',
        { p_name: name, p_cnpj: cnpj || null },
      );

      if (rpcError) {
        // Se o CNPJ já existe, tenta vincular ao tenant existente
        if (rpcError.message.includes('tenants_cnpj_key')) {
          const { data: linkData, error: linkError } = await supabase.rpc(
            'link_user_to_existing_tenant',
            { p_cnpj: cnpj },
          );

          if (linkError) throw new Error(linkError.message);

          await setActiveTenant(linkData.tenant_id);
          navigate('/');
          return;
        }
        throw new Error(rpcError.message);
      }

      await setActiveTenant(data.id);
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
