import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { profile, activeTenant, userTenant, signOut } = useAuthContext();
  const navigate = useNavigate();

  // Se o usuário não tem tenant, redireciona para criação
  if (!activeTenant) {
    navigate('/create-tenant', { replace: true });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fafafa',
        padding: '32px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>
            CRM Contábil
          </h1>
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Sair
          </button>
        </div>

        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ color: '#166534', fontWeight: 500, marginBottom: '4px' }}>
            Autenticação funcionando!
          </p>
          <p style={{ color: '#15803d', fontSize: '14px' }}>
            Fase 1 do MVP concluída com sucesso.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h3
              style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}
            >
              Usuário
            </h3>
            <p style={{ fontSize: '16px', color: '#1a1a1a' }}>
              {profile?.full_name ?? profile?.email ?? '—'}
            </p>
          </div>
          <div>
            <h3
              style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}
            >
              E-mail
            </h3>
            <p style={{ fontSize: '16px', color: '#1a1a1a' }}>
              {profile?.email ?? '—'}
            </p>
          </div>
          <div>
            <h3
              style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}
            >
              Organização
            </h3>
            <p style={{ fontSize: '16px', color: '#1a1a1a' }}>
              {activeTenant?.name ?? '—'}
            </p>
          </div>
          <div>
            <h3
              style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}
            >
              Papel
            </h3>
            <p style={{ fontSize: '16px', color: '#1a1a1a' }}>
              {userTenant?.role ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
