import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { NavLink, Outlet } from 'react-router-dom';
import { IconBriefcase, IconCalendarEvent, IconCurrencyDollar, IconLayoutKanban, IconShield, IconTag, IconUsers } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MASTER_EMAIL = 'matheus.leme@absgroup.com.br';

// --------------- Styled Components ---------------

const StyledConfigContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const StyledConfigSidebar = styled.nav`
  width: 200px;
  min-width: 200px;
  height: 100%;
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[6]} 0 ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

const StyledSidebarTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]};
  margin: 0;
`;

const StyledNavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

// NavLink styling via css tag (Linaria doesn't support styled(Component))
const navItemStyle = css`
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

const StyledConfigContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

// --------------- Nav items definition ---------------

const CONFIG_NAV_ITEMS_BASE = [
  { to: '/configuracoes/workspace', label: 'Workspace', Icon: IconBriefcase },
  {
    to: '/configuracoes/pipelines',
    label: 'Pipelines e Etapas',
    Icon: IconLayoutKanban,
  },
  {
    to: '/configuracoes/motivos-perda',
    label: 'Motivos de Perda',
    Icon: IconTag,
  },
  {
    to: '/configuracoes/usuarios',
    label: 'Usuários e Equipes',
    Icon: IconUsers,
  },
  {
    to: '/configuracoes/perfis-acesso',
    label: 'Perfis de Acesso',
    Icon: IconShield,
  },
  {
    to: '/configuracoes/tipos-atividade',
    label: 'Tipos de Atividade',
    Icon: IconCalendarEvent,
  },
] as const;

const PRECIFICACAO_NAV_ITEM = {
  to: '/configuracoes/precificacao' as const,
  label: 'Precificação',
  Icon: IconCurrencyDollar,
};

// --------------- Component ---------------

export const ConfiguracoesLayout = () => {
  const { user } = useAuthContext();
  const navItems = user?.email === MASTER_EMAIL
    ? [...CONFIG_NAV_ITEMS_BASE, PRECIFICACAO_NAV_ITEM]
    : CONFIG_NAV_ITEMS_BASE;

  return (
    <StyledConfigContainer>
      <StyledConfigSidebar>
        <StyledSidebarTitle>Configurações</StyledSidebarTitle>
        <StyledNavItems>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${navItemStyle}${isActive ? ' active' : ''}`
              }
            >
              <StyledNavIconWrapper>
                <Icon size={16} />
              </StyledNavIconWrapper>
              {label}
            </NavLink>
          ))}
        </StyledNavItems>
      </StyledConfigSidebar>

      <StyledConfigContent>
        <Outlet />
      </StyledConfigContent>
    </StyledConfigContainer>
  );
};
