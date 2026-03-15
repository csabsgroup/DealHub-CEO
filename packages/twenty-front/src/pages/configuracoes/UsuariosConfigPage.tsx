import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { EditarUsuarioModal } from '@/crm/components/EditarUsuarioModal';
import { NovoUsuarioModal } from '@/crm/components/NovoUsuarioModal';
import { useUsuarios } from '@/crm/hooks/useUsuarios';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconPencil, IconPlus, IconUsers } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { PerfilCRM, UsuarioCRM } from '~/types/supabase';

// --------------- Styled Components ---------------

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPageSubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledAddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: ${themeCssVariables.accent.primary};
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledThead = styled.thead`
  background: ${themeCssVariables.background.secondary};
`;

const StyledTh = styled.th`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-align: left;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTr = styled.tr`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.secondary};
  }
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  vertical-align: middle;
`;

const StyledUserCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${themeCssVariables.accent.primary};
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
`;

const StyledUserName = styled.span`
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledEmailText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

// Badges de perfil e status via data-* (Linaria não suporta props dinâmicas)
const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;

  &[data-perfil='admin'] {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &[data-perfil='vendedor'] {
    background: #dcfce7;
    color: #15803d;
  }

  &[data-perfil='sdr'] {
    background: #ffedd5;
    color: #c2410c;
  }
`;

const StyledStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;

  &[data-active='true'] {
    background: #dcfce7;
    color: #15803d;
  }

  &[data-active='false'] {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const editButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--t-border-radius-sm);
  color: var(--t-font-color-tertiary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--t-background-tertiary);
    color: var(--t-font-color-primary);
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[16]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledEmptyTitle = styled.p`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 500;
  margin: 0;
`;

// --------------- Helpers ---------------

const PERFIL_LABEL: Record<PerfilCRM, string> = {
  admin: 'Admin',
  vendedor: 'Vendedor',
  sdr: 'SDR',
};

const getInitials = (name: string | null, email: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
};

// --------------- Component ---------------

export const UsuariosConfigPage = () => {
  const { userTenant } = useAuthContext();
  const { data: usuarios, isLoading } = useUsuarios();

  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UsuarioCRM | null>(null);

  // Apenas owner/admin pode gerenciar usuários
  const isAdmin =
    userTenant?.role === 'owner' || userTenant?.role === 'admin';

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Usuários e Equipes</StyledPageTitle>
          <StyledPageSubtitle>
            Gerencie os membros da sua equipe e seus níveis de acesso.
          </StyledPageSubtitle>
        </StyledHeaderText>

        {isAdmin && (
          <StyledAddButton onClick={() => setNovoModalOpen(true)}>
            <IconPlus size={16} />
            Novo Usuário
          </StyledAddButton>
        )}
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading ? (
          <p style={{ color: 'var(--t-font-color-tertiary)', fontSize: '14px' }}>
            Carregando usuários...
          </p>
        ) : !usuarios || usuarios.length === 0 ? (
          <StyledEmptyState>
            <IconUsers size={40} />
            <StyledEmptyTitle>Nenhum usuário encontrado</StyledEmptyTitle>
          </StyledEmptyState>
        ) : (
          <StyledTable>
            <StyledThead>
              <tr>
                <StyledTh>Usuário</StyledTh>
                <StyledTh>E-mail</StyledTh>
                <StyledTh>Perfil</StyledTh>
                <StyledTh>Status</StyledTh>
                {isAdmin && <StyledTh style={{ width: 48 }} />}
              </tr>
            </StyledThead>
            <tbody>
              {usuarios.map((u) => (
                <StyledTr key={u.id}>
                  <StyledTd>
                    <StyledUserCell>
                      <StyledAvatar>
                        {getInitials(u.full_name, u.email)}
                      </StyledAvatar>
                      <StyledUserName>
                        {u.full_name || u.email.split('@')[0]}
                      </StyledUserName>
                    </StyledUserCell>
                  </StyledTd>
                  <StyledTd>
                    <StyledEmailText>{u.email}</StyledEmailText>
                  </StyledTd>
                  <StyledTd>
                    <StyledBadge data-perfil={u.perfil_crm}>
                      {PERFIL_LABEL[u.perfil_crm]}
                    </StyledBadge>
                  </StyledTd>
                  <StyledTd>
                    <StyledStatusBadge
                      data-active={String(u.is_active)}
                    >
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </StyledStatusBadge>
                  </StyledTd>
                  {isAdmin && (
                    <StyledTd>
                      <button
                        className={editButtonStyle}
                        title="Editar usuário"
                        onClick={() => setEditTarget(u)}
                      >
                        <IconPencil size={14} />
                      </button>
                    </StyledTd>
                  )}
                </StyledTr>
              ))}
            </tbody>
          </StyledTable>
        )}
      </StyledPageBody>

      <NovoUsuarioModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
      />

      {editTarget && (
        <EditarUsuarioModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          usuario={editTarget}
        />
      )}
    </StyledPageContainer>
  );
};
