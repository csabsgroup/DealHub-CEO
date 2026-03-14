import { ConfirmDeleteModal } from '@/crm/components/ConfirmDeleteModal';
import { NovoContratoModal } from '@/crm/components/NovoContratoModal';
import { useContratos, useDeleteContrato } from '@/crm/hooks/useContratos';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';
import { IconPencil, IconPlus, IconTrash } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Contrato, ContratoStatus } from '~/types/supabase';

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

const StyledBadge = styled.span<{
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple';
}>`
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
      case 'purple':
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
      case 'purple':
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

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const getStatusBadgeVariant = (
  status: ContratoStatus,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' => {
  switch (status) {
    case 'Rascunho':
      return 'gray';
    case 'enviado':
      return 'blue';
    case 'assinado parcial':
      return 'orange';
    case 'assinado':
      return 'green';
    case 'recusado':
      return 'red';
    case 'expirado':
      return 'purple';
    case 'cancelado':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusLabel = (status: ContratoStatus): string => {
  switch (status) {
    case 'Rascunho':
      return 'Rascunho';
    case 'enviado':
      return 'Enviado';
    case 'assinado parcial':
      return 'Assinado Parcial';
    case 'assinado':
      return 'Assinado';
    case 'recusado':
      return 'Recusado';
    case 'expirado':
      return 'Expirado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
};

// --------------- Component ---------------

export const ContratosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingContrato, setDeletingContrato] = useState<Contrato | null>(null);

  const { data: contratos, isLoading, isError } = useContratos();
  const { mutateAsync: deleteContrato, isPending: isDeleting } = useDeleteContrato();

  const handleDelete = useCallback(async () => {
    if (!deletingContrato) return;
    try {
      await deleteContrato({ id: deletingContrato.id });
      setDeletingContrato(null);
    } catch {
      // error handled by mutation
    }
  }, [deletingContrato, deleteContrato]);

  const renderContent = () => {
    if (isLoading) {
      return <StyledLoadingState>Carregando contratos...</StyledLoadingState>;
    }
    if (isError) {
      return <StyledLoadingState>Erro ao carregar contratos.</StyledLoadingState>;
    }

    const items = contratos ?? [];

    if (items.length === 0) {
      return (
        <StyledEmptyState>
          <StyledEmptyTitle>Nenhum contrato cadastrado</StyledEmptyTitle>
          <StyledEmptySubtitle>
            Gere contratos vinculados aos seus negócios para formalizar
            e acompanhar o status contratual dos clientes.
          </StyledEmptySubtitle>
          <Button
            variant="secondary"
            accent="blue"
            size="medium"
            title="Criar Primeiro Contrato"
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
              <StyledTh>Negócio Vinculado</StyledTh>
              <StyledTh>Proposta de Origem</StyledTh>
              <StyledTh>Status</StyledTh>
              <StyledTh>Início Vigência</StyledTh>
              <StyledTh>Fim Vigência</StyledTh>
              <StyledTh>Índice Reajuste</StyledTh>
              <StyledTh>Periodicidade</StyledTh>
              <StyledTh style={{ textAlign: 'center' }}>Ações</StyledTh>
            </tr>
          </StyledTHead>
          <tbody>
            {items.map((contrato) => {
              const negocio = (contrato as Record<string, unknown>).negocios as
                | { titulo: string }
                | null;
              const proposta = (contrato as Record<string, unknown>).propostas as
                | { numero: string }
                | null;

              return (
                <StyledTr key={contrato.id}>
                  <StyledTd>{negocio?.titulo ?? '—'}</StyledTd>
                  <StyledTdSecondary>{proposta?.numero ?? '—'}</StyledTdSecondary>
                  <StyledTd>
                    <StyledBadge
                      variant={getStatusBadgeVariant(contrato.status_contrato)}
                    >
                      {getStatusLabel(contrato.status_contrato)}
                    </StyledBadge>
                  </StyledTd>
                  <StyledTdSecondary>
                    {formatDate(contrato.inicio_vigencia)}
                  </StyledTdSecondary>
                  <StyledTdSecondary>
                    {formatDate(contrato.fim_vigencia)}
                  </StyledTdSecondary>
                  <StyledTdSecondary>
                    {contrato.indice_reajuste ?? '—'}
                  </StyledTdSecondary>
                  <StyledTdSecondary>
                    {contrato.periodicidade_reajuste ?? '—'}
                  </StyledTdSecondary>
                  <StyledActionsCell>
                    <StyledActionsRow>
                      <IconButton
                        Icon={IconPencil}
                        size="small"
                        variant="tertiary"
                        onClick={() => {
                          // TODO: EditarContratoModal (fase seguinte)
                        }}
                      />
                      <IconButton
                        Icon={IconTrash}
                        size="small"
                        variant="tertiary"
                        accent="danger"
                        onClick={() => setDeletingContrato(contrato)}
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
        <StyledPageTitle>Contratos</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Novo Contrato"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>{renderContent()}</StyledPageBody>

      <NovoContratoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {deletingContrato && (
        <ConfirmDeleteModal
          isOpen={!!deletingContrato}
          onClose={() => setDeletingContrato(null)}
          onConfirm={handleDelete}
          isPending={isDeleting}
          entityName="contrato"
        />
      )}
    </StyledPageContainer>
  );
};
