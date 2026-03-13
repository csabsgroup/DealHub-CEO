import { ConfirmDeleteModal } from '@/crm/components/ConfirmDeleteModal';
import { EditarPropostaModal } from '@/crm/components/EditarPropostaModal';
import { NovaPropostaModal } from '@/crm/components/NovaPropostaModal';
import { useDeleteProposta, usePropostas } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';
import { IconPencil, IconPlus, IconTrash } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Proposta } from '~/types/supabase';

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

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
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

const StyledTdSecondary = styled(StyledTd)`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadge = styled.span<{ variant?: 'blue' | 'green' | 'orange' | 'red' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  white-space: nowrap;
  background: ${(props) => {
    switch (props.variant) {
      case 'green':
        return themeCssVariables.background.transparent.success;
      case 'orange':
        return themeCssVariables.background.transparent.orange;
      case 'red':
        return themeCssVariables.background.transparent.danger;
      case 'gray':
        return themeCssVariables.background.transparent.light;
      default:
        return themeCssVariables.background.transparent.blue;
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case 'green':
        return themeCssVariables.color.green;
      case 'orange':
        return themeCssVariables.color.orange;
      case 'red':
        return themeCssVariables.font.color.danger;
      case 'gray':
        return themeCssVariables.font.color.secondary;
      default:
        return themeCssVariables.accent.primary;
    }
  }};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyTitle = styled.p`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledEmptySubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
  text-align: center;
`;

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledActionsCell = styled(StyledTd)`
  width: 80px;
  text-align: center;
`;

const StyledActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

// --------------- Helpers ---------------

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadgeVariant = (
  status: string,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' => {
  switch (status) {
    case 'Rascunho':
      return 'gray';
    case 'Enviada':
      return 'blue';
    case 'Aceita':
      return 'green';
    case 'Recusada':
      return 'red';
    default:
      return 'gray';
  }
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

// --------------- Component ---------------

export const PropostasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [deletingProposta, setDeletingProposta] = useState<Proposta | null>(null);

  const { data: propostas, isLoading, isError } = usePropostas();
  const { mutateAsync: deleteProposta, isPending: isDeleting } = useDeleteProposta();

  const handleDelete = useCallback(async () => {
    if (!deletingProposta) return;
    try {
      await deleteProposta({ id: deletingProposta.id });
      setDeletingProposta(null);
    } catch {
      // error handled by mutation
    }
  }, [deletingProposta, deleteProposta]);

  const renderContent = () => {
    if (isLoading) {
      return <StyledLoadingState>Carregando propostas...</StyledLoadingState>;
    }
    if (isError) {
      return <StyledLoadingState>Erro ao carregar propostas.</StyledLoadingState>;
    }

    const items = propostas ?? [];

    if (items.length === 0) {
      return (
        <StyledEmptyState>
          <StyledEmptyTitle>Nenhuma proposta cadastrada</StyledEmptyTitle>
          <StyledEmptySubtitle>
            Crie propostas comerciais vinculadas aos seus negócios para
            formalizar e acompanhar ofertas.
          </StyledEmptySubtitle>
          <Button
            variant="secondary"
            accent="blue"
            size="medium"
            title="Criar Primeira Proposta"
            Icon={IconPlus}
            onClick={() => setIsModalOpen(true)}
          />
        </StyledEmptyState>
      );
    }

    return (
      <StyledTableWrapper>
        <StyledTable>
          <StyledTHead>
            <tr>
              <StyledTh>Número / Versão</StyledTh>
              <StyledTh>Negócio Vinculado</StyledTh>
              <StyledTh>Valor Total</StyledTh>
              <StyledTh>Status</StyledTh>
              <StyledTh>Validade</StyledTh>
              <StyledTh>Criado em</StyledTh>
              <StyledTh style={{ textAlign: 'center' }}>Ações</StyledTh>
            </tr>
          </StyledTHead>
          <tbody>
            {items.map((proposta) => {
              // negocios join result
              const negocio = (proposta as Record<string, unknown>).negocios as
                | { titulo: string }
                | null;

              return (
                <StyledTr key={proposta.id}>
                  <StyledTd>
                    {proposta.numero}{' '}
                    <StyledBadge variant="gray">v{proposta.versao}</StyledBadge>
                  </StyledTd>
                  <StyledTdSecondary>
                    {negocio?.titulo ?? '—'}
                  </StyledTdSecondary>
                  <StyledTd>{formatCurrency(proposta.valor_total)}</StyledTd>
                  <StyledTd>
                    <StyledBadge variant={getStatusBadgeVariant(proposta.status)}>
                      {proposta.status}
                    </StyledBadge>
                  </StyledTd>
                  <StyledTdSecondary>
                    {proposta.data_validade
                      ? formatDate(proposta.data_validade)
                      : `${proposta.validade_dias} dias`}
                  </StyledTdSecondary>
                  <StyledTdSecondary>
                    {formatDate(proposta.created_at)}
                  </StyledTdSecondary>
                  <StyledActionsCell>
                    <StyledActionsRow>
                      <IconButton
                        Icon={IconPencil}
                        size="small"
                        variant="tertiary"
                        onClick={() => setEditingProposta(proposta)}
                      />
                      <IconButton
                        Icon={IconTrash}
                        size="small"
                        variant="tertiary"
                        accent="danger"
                        onClick={() => setDeletingProposta(proposta)}
                      />
                    </StyledActionsRow>
                  </StyledActionsCell>
                </StyledTr>
              );
            })}
          </tbody>
        </StyledTable>
      </StyledTableWrapper>
    );
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Propostas</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Nova Proposta"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>{renderContent()}</StyledPageBody>

      <NovaPropostaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {editingProposta && (
        <EditarPropostaModal
          isOpen={!!editingProposta}
          onClose={() => setEditingProposta(null)}
          initialData={editingProposta}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingProposta}
        onClose={() => setDeletingProposta(null)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        entityName="proposta"
        entityLabel={deletingProposta?.numero}
      />
    </StyledPageContainer>
  );
};
