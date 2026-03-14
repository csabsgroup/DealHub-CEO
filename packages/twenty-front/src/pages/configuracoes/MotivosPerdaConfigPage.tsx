import {
    useCreateMotivoPerda,
    useMotivosPerda,
    useUpdateMotivoPerda,
} from '@/crm/hooks/useMotivosPerda';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconCheck, IconPencil, IconPlus, IconX } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { MotivoPerda } from '~/types/supabase';

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

const StyledAddForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
`;

const StyledInput = styled.input`
  flex: 1;
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledActionButton = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[3]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid transparent;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
  background: ${({ variant }) =>
    variant === 'primary'
      ? themeCssVariables.accent.primary
      : variant === 'danger'
        ? 'transparent'
        : 'transparent'};
  color: ${({ variant }) =>
    variant === 'primary'
      ? themeCssVariables.font.color.inverted
      : variant === 'danger'
        ? themeCssVariables.font.color.danger
        : themeCssVariables.font.color.secondary};
  border-color: ${({ variant }) =>
    variant === 'ghost' || variant === 'danger'
      ? themeCssVariables.border.color.medium
      : 'transparent'};

  &:hover:not(:disabled) {
    opacity: 0.85;
    background: ${({ variant }) =>
      variant === 'ghost'
        ? themeCssVariables.background.tertiary
        : variant === 'danger'
          ? themeCssVariables.background.danger
          : undefined};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledTableWrapper = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
  background: ${themeCssVariables.background.primary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTHead = styled.thead`
  background: ${themeCssVariables.background.secondary};
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  white-space: nowrap;
`;

const StyledTr = styled.tr`
  transition: background 0.1s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
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

const StyledStatusBadge = styled.span<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: 999px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${({ active }) =>
    active
      ? `color-mix(in srgb, ${themeCssVariables.font.color.success} 15%, transparent)`
      : `color-mix(in srgb, ${themeCssVariables.font.color.secondary} 15%, transparent)`};
  color: ${({ active }) =>
    active
      ? themeCssVariables.font.color.success
      : themeCssVariables.font.color.secondary};
`;

const StyledActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: transparent;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledToggleButton = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[2]};
  height: 24px;
  border-radius: 999px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
  background: ${({ active }) =>
    active
      ? `color-mix(in srgb, ${themeCssVariables.font.color.danger} 15%, transparent)`
      : `color-mix(in srgb, ${themeCssVariables.font.color.success} 15%, transparent)`};
  color: ${({ active }) =>
    active
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.success};

  &:hover {
    opacity: 0.8;
  }
`;

const StyledEmptyState = styled.div`
  padding: ${themeCssVariables.spacing[12]};
  text-align: center;
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// --------------- Component ---------------

export const MotivosPerdaConfigPage = () => {
  const { data: motivos, isLoading } = useMotivosPerda({ includeInativos: true });
  const createMutation = useCreateMotivoPerda();
  const updateMutation = useUpdateMotivoPerda();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');

  const handleAdd = () => {
    const trimmed = newNome.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { nome: trimmed },
      {
        onSuccess: () => {
          setNewNome('');
          setShowAddForm(false);
        },
      },
    );
  };

  const handleEditStart = (motivo: MotivoPerda) => {
    setEditingId(motivo.id);
    setEditNome(motivo.nome);
  };

  const handleEditSave = () => {
    const trimmed = editNome.trim();
    if (!trimmed || !editingId) return;
    updateMutation.mutate(
      { id: editingId, nome: trimmed },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditNome('');
  };

  const handleToggleActive = (motivo: MotivoPerda) => {
    updateMutation.mutate({ id: motivo.id, is_active: !motivo.is_active });
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Motivos de Perda</StyledPageTitle>
          <StyledPageSubtitle>
            Gerencie os motivos que justificam negócios perdidos
          </StyledPageSubtitle>
        </StyledHeaderText>
        {!showAddForm && (
          <StyledAddButton
            type="button"
            onClick={() => setShowAddForm(true)}
          >
            <IconPlus size={16} />
            Novo Motivo
          </StyledAddButton>
        )}
      </StyledPageHeader>

      <StyledPageBody>
        {showAddForm && (
          <StyledAddForm>
            <StyledInput
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Ex: Preço muito alto"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setShowAddForm(false);
                  setNewNome('');
                }
              }}
              autoFocus
            />
            <StyledActionButton
              variant="primary"
              onClick={handleAdd}
              disabled={!newNome.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Adicionar'}
            </StyledActionButton>
            <StyledActionButton
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewNome('');
              }}
            >
              Cancelar
            </StyledActionButton>
          </StyledAddForm>
        )}

        <StyledTableWrapper>
          <StyledTable>
            <StyledTHead>
              <tr>
                <StyledTh>Motivo</StyledTh>
                <StyledTh>Status</StyledTh>
                <StyledTh>Ações</StyledTh>
              </tr>
            </StyledTHead>
            <tbody>
              {isLoading && (
                <tr>
                  <StyledTd colSpan={3}>
                    <StyledEmptyState>Carregando...</StyledEmptyState>
                  </StyledTd>
                </tr>
              )}
              {!isLoading && (!motivos || motivos.length === 0) && (
                <tr>
                  <StyledTd colSpan={3}>
                    <StyledEmptyState>
                      Nenhum motivo cadastrado. Clique em "Novo Motivo" para
                      adicionar.
                    </StyledEmptyState>
                  </StyledTd>
                </tr>
              )}
              {motivos?.map((motivo) => (
                <StyledTr key={motivo.id}>
                  <StyledTd>
                    {editingId === motivo.id ? (
                      <StyledInput
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        autoFocus
                        style={{ maxWidth: '320px' }}
                      />
                    ) : (
                      motivo.nome
                    )}
                  </StyledTd>
                  <StyledTd>
                    <StyledStatusBadge active={motivo.is_active}>
                      {motivo.is_active ? 'Ativo' : 'Inativo'}
                    </StyledStatusBadge>
                  </StyledTd>
                  <StyledTd>
                    <StyledActionsCell>
                      {editingId === motivo.id ? (
                        <>
                          <StyledIconButton
                            title="Salvar"
                            onClick={handleEditSave}
                            disabled={updateMutation.isPending}
                          >
                            <IconCheck size={14} />
                          </StyledIconButton>
                          <StyledIconButton
                            title="Cancelar"
                            onClick={handleEditCancel}
                          >
                            <IconX size={14} />
                          </StyledIconButton>
                        </>
                      ) : (
                        <>
                          <StyledIconButton
                            title="Editar nome"
                            onClick={() => handleEditStart(motivo)}
                          >
                            <IconPencil size={14} />
                          </StyledIconButton>
                          <StyledToggleButton
                            active={motivo.is_active}
                            onClick={() => handleToggleActive(motivo)}
                            disabled={updateMutation.isPending}
                          >
                            {motivo.is_active ? 'Inativar' : 'Reativar'}
                          </StyledToggleButton>
                        </>
                      )}
                    </StyledActionsCell>
                  </StyledTd>
                </StyledTr>
              ))}
            </tbody>
          </StyledTable>
        </StyledTableWrapper>
      </StyledPageBody>
    </StyledPageContainer>
  );
};
