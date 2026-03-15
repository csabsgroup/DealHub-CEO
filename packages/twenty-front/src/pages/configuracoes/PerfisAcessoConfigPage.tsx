import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { EditarPerfilModal } from '@/crm/components/EditarPerfilModal';
import { NovoPerfilModal } from '@/crm/components/NovoPerfilModal';
import {
    useDeleteTenantRole,
    useTenantRoles,
} from '@/crm/hooks/useTenantRoles';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconKey, IconPencil, IconPlus, IconShield, IconTrash } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { TenantRole } from '~/types/supabase';

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

const StyledRoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledRoleCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const StyledCardIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledCardTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSystemBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
`;

const StyledCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
`;

const iconButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--t-border-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  color: var(--t-font-color-tertiary);

  &:hover {
    background: var(--t-background-tertiary);
    color: var(--t-font-color-primary);
  }
`;

const deleteButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: var(--t-border-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  color: var(--t-font-color-tertiary);

  &:hover {
    background: #fef2f2;
    color: var(--t-font-color-danger);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const StyledCardDesc = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
  line-height: 1.5;
`;

const StyledPermissoesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPermLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 2px;
`;

const StyledPermTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

// data-active via Linaria
const StyledPermTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: 11px;
  font-weight: 500;

  &[data-active='true'] {
    background: #dcfce7;
    color: #15803d;
  }

  &[data-active='false'] {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.tertiary};
    text-decoration: line-through;
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

// --------------- Constante de labels para permissões ---------------

const PERM_LABELS: Record<string, string> = {
  can_view_all_deals:    'Ver todos os negócios',
  can_delete_deals:      'Excluir negócios',
  can_access_settings:   'Configurações',
  can_manage_financials: 'Financeiro',
  can_export_data:       'Exportar dados',
};

// --------------- Component ---------------

export const PerfisAcessoConfigPage = () => {
  const { userTenant } = useAuthContext();
  const { data: perfis, isLoading } = useTenantRoles();
  const { mutate: deletarPerfil } = useDeleteTenantRole();

  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantRole | null>(null);

  const isAdmin =
    userTenant?.role === 'owner' || userTenant?.role === 'admin';

  const handleDelete = (perfil: TenantRole) => {
    if (perfil.is_system_default) return;
    if (!window.confirm(`Excluir o perfil "${perfil.nome}"? Esta ação não pode ser desfeita.`)) return;
    deletarPerfil(perfil.id);
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Perfis de Acesso</StyledPageTitle>
          <StyledPageSubtitle>
            Crie perfis customizados com permissões granulares para cada tipo de usuário.
          </StyledPageSubtitle>
        </StyledHeaderText>

        {isAdmin && (
          <StyledAddButton onClick={() => setNovoModalOpen(true)}>
            <IconPlus size={16} />
            Novo Perfil
          </StyledAddButton>
        )}
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading ? (
          <p style={{ color: 'var(--t-font-color-tertiary)', fontSize: '14px' }}>
            Carregando perfis...
          </p>
        ) : !perfis || perfis.length === 0 ? (
          <StyledEmptyState>
            <IconKey size={40} />
            <StyledEmptyTitle>Nenhum perfil de acesso encontrado</StyledEmptyTitle>
          </StyledEmptyState>
        ) : (
          <StyledRoleGrid>
            {perfis.map((perfil) => (
              <StyledRoleCard key={perfil.id}>
                <StyledCardHeader>
                  <StyledCardTitleRow>
                    <StyledCardIcon>
                      <IconShield size={16} />
                    </StyledCardIcon>
                    <StyledCardTitle title={perfil.nome}>{perfil.nome}</StyledCardTitle>
                    {perfil.is_system_default && (
                      <StyledSystemBadge>Padrão</StyledSystemBadge>
                    )}
                  </StyledCardTitleRow>

                  {isAdmin && (
                    <StyledCardActions>
                      <button
                        className={iconButtonStyle}
                        title="Editar perfil"
                        onClick={() => setEditTarget(perfil)}
                      >
                        <IconPencil size={14} />
                      </button>
                      <button
                        className={deleteButtonStyle}
                        title={
                          perfil.is_system_default
                            ? 'Perfis padrão não podem ser excluídos'
                            : 'Excluir perfil'
                        }
                        disabled={perfil.is_system_default}
                        onClick={() => handleDelete(perfil)}
                      >
                        <IconTrash size={14} />
                      </button>
                    </StyledCardActions>
                  )}
                </StyledCardHeader>

                {perfil.descricao && (
                  <StyledCardDesc>{perfil.descricao}</StyledCardDesc>
                )}

                <StyledPermissoesGrid>
                  <StyledPermLabel>Permissões</StyledPermLabel>
                  <StyledPermTagRow>
                    {(Object.entries(perfil.permissoes) as Array<[string, boolean]>).map(
                      ([key, value]) => (
                        <StyledPermTag key={key} data-active={String(value)}>
                          {PERM_LABELS[key] ?? key}
                        </StyledPermTag>
                      ),
                    )}
                  </StyledPermTagRow>
                </StyledPermissoesGrid>
              </StyledRoleCard>
            ))}
          </StyledRoleGrid>
        )}
      </StyledPageBody>

      <NovoPerfilModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
      />

      {editTarget && (
        <EditarPerfilModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          perfil={editTarget}
        />
      )}
    </StyledPageContainer>
  );
};
