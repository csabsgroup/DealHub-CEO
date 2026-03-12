import { ProtectedRoute } from '@/auth/components/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const SignInUpPage = lazy(() =>
  import('@/auth/sign-in-up/components/SignInUpPage').then((m) => ({
    default: m.SignInUpPage,
  })),
);

const CreateTenantPage = lazy(() =>
  import('@/auth/sign-in-up/components/CreateTenantPage').then((m) => ({
    default: m.CreateTenantPage,
  })),
);

const DashboardPage = lazy(() =>
  import('~/pages/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);

const Loading = () => (
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

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/auth" element={<SignInUpPage />} />

          {/* Rotas protegidas (requer sessão ativa) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-tenant" element={<CreateTenantPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
