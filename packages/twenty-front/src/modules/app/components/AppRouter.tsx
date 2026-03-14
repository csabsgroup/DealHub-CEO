import { AppLayout } from '@/app/components/AppLayout';
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

const EmpresasPage = lazy(() =>
  import('~/pages/empresas/EmpresasPage').then((m) => ({
    default: m.EmpresasPage,
  })),
);

const EmpresaDetalhesPage = lazy(() =>
  import('~/pages/empresas/EmpresaDetalhesPage').then((m) => ({
    default: m.EmpresaDetalhesPage,
  })),
);

const LeadsPage = lazy(() =>
  import('~/pages/leads/LeadsPage').then((m) => ({
    default: m.LeadsPage,
  })),
);

const PipelinePage = lazy(() =>
  import('~/pages/pipeline/PipelinePage').then((m) => ({
    default: m.PipelinePage,
  })),
);

const ContatosPage = lazy(() =>
  import('~/pages/contatos/ContatosPage').then((m) => ({
    default: m.ContatosPage,
  })),
);

const AtividadesPage = lazy(() =>
  import('~/pages/atividades/AtividadesPage').then((m) => ({
    default: m.AtividadesPage,
  })),
);

const CatalogoPage = lazy(() =>
  import('~/pages/catalogo/CatalogoPage').then((m) => ({
    default: m.CatalogoPage,
  })),
);

const PropostasPage = lazy(() =>
  import('~/pages/propostas/PropostasPage').then((m) => ({
    default: m.PropostasPage,
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
            {/* Criar escritório (sem sidebar — usuário ainda não tem tenant) */}
            <Route path="/create-tenant" element={<CreateTenantPage />} />

            {/* App principal com sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/empresas/:id" element={<EmpresaDetalhesPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/negocios" element={<PipelinePage />} />
              <Route path="/contatos" element={<ContatosPage />} />
              <Route path="/atividades" element={<AtividadesPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/propostas" element={<PropostasPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
