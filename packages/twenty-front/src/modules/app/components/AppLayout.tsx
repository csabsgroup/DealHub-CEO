import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { useTenant } from '@/auth/hooks/useTenant';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import {
    IconBuildingSkyscraper,
    IconLayoutDashboard,
    IconLayoutKanban,
    IconLogout,
    IconSettings,
    IconTarget,
    IconUsers,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Styled Components ---------------

const StyledAppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${themeCssVariables.background.primary};
`;

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[4]} 0;
  overflow: hidden;
`;

const StyledLogoSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
  gap: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledLogoMark = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.accent.accent9};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: ${themeCssVariables.font.color.inverted};
  flex-shrink: 0;
`;

const StyledAppName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledNavSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]};
  overflow-y: auto;
`;

// NavLink styling via css tag (Linaria doesn't support styled(Component))
const navLinkStyle = css`
  display: flex;
  align-items: center;
  gap: var(--t-spacing-2);
  padding: var(--t-spacing-2);
  border-radius: var(--t-border-radius-sm);
  text-decoration: none;
  font-size: var(--t-font-size-sm);
  font-weight: 500;
  color: var(--t-font-color-secondary);
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;

  &:hover {
    background: var(--t-background-tertiary);
    color: var(--t-font-color-primary);
  }

  &.active {
    background: var(--t-background-tertiary);
    color: var(--t-font-color-primary);
    font-weight: 600;
  }
`;

const StyledNavIconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
`;

const StyledSidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]} 0;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledTenantName = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
`;

const StyledTenantLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledTenantTitle = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTenantSubtitle = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledLogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
  width: 100%;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.danger};
    color: ${themeCssVariables.font.color.danger};
  }
`;

const StyledMainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${themeCssVariables.background.primary};
`;

// --------------- Nav items definition ---------------

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: IconLayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', Icon: IconTarget, end: false },
  {
    to: '/empresas',
    label: 'Empresas',
    Icon: IconBuildingSkyscraper,
    end: false,
  },
  { to: '/contatos', label: 'Contatos', Icon: IconUsers, end: false },
  { to: '/negocios', label: 'Negócios', Icon: IconLayoutKanban, end: false },
  { to: '/configuracoes', label: 'Configurações', Icon: IconSettings, end: false },
] as const;

// --------------- Component ---------------

export const AppLayout = () => {
  const { signOut, isLoading } = useAuthContext();
  const { tenantId, tenantName } = useTenant();

  // Se ainda está carregando dados de auth, mostra loading
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

  // Se o usuário não tem tenant vinculado, redireciona para criação
  if (!tenantId) {
    return <Navigate to="/create-tenant" replace />;
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <StyledAppContainer>
      <StyledSidebar>
        <StyledLogoSection>
          <StyledLogoMark>C</StyledLogoMark>
          <StyledAppName>CRM Contábil</StyledAppName>
        </StyledLogoSection>

        <StyledNavSection>
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${navLinkStyle}${isActive ? ' active' : ''}`
              }
            >
              <StyledNavIconWrapper>
                <Icon size={16} />
              </StyledNavIconWrapper>
              {label}
            </NavLink>
          ))}
        </StyledNavSection>

        <StyledSidebarFooter>
          <StyledTenantName>
            <StyledTenantLabel>
              <StyledTenantTitle>{tenantName ?? 'Escritório'}</StyledTenantTitle>
              <StyledTenantSubtitle>Plano atual</StyledTenantSubtitle>
            </StyledTenantLabel>
          </StyledTenantName>

          <StyledLogoutButton onClick={handleSignOut} type="button">
            <IconLogout size={16} />
            Sair
          </StyledLogoutButton>
        </StyledSidebarFooter>
      </StyledSidebar>

      <StyledMainContent>
        <Outlet />
      </StyledMainContent>
    </StyledAppContainer>
  );
};
