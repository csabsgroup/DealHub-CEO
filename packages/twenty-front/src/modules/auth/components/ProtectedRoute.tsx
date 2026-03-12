import { Navigate, Outlet } from 'react-router-dom';

import { useAuthContext } from '@/auth/hooks/useAuthContext';

// Componente que protege rotas autenticadas.
// Redireciona para /auth se não houver sessão ativa.
export const ProtectedRoute = () => {
  const { session, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
