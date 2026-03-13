import { NovaAtividadeModal } from '@/crm/components/NovaAtividadeModal';
import { useAtividades } from '@/crm/hooks/useAtividades';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
        return themeCssVariables.color.red;
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

// --------------- Helpers ---------------

const getTipoBadgeVariant = (
  tipo: string,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' => {
  switch (tipo) {
    case 'Reunião':
      return 'blue';
    case 'Chamada':
      return 'green';
    case 'Email':
      return 'orange';
    case 'WhatsApp':
      return 'green';
    case 'Visita':
      return 'blue';
    default:
      return 'gray';
  }
};

const getStatusBadgeVariant = (
  status: string,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' => {
  switch (status) {
    case 'Pendente':
      return 'orange';
    case 'Em andamento':
      return 'blue';
    case 'Concluída':
      return 'green';
    case 'Cancelada':
      return 'red';
    default:
      return 'gray';
  }
};

const getPrioridadeBadgeVariant = (
  prioridade: string,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' => {
  switch (prioridade) {
    case 'Urgente':
      return 'red';
    case 'Alta':
      return 'orange';
    case 'Normal':
      return 'blue';
    case 'Baixa':
      return 'gray';
    default:
      return 'gray';
  }
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getTipoEmoji = (tipo: string): string => {
  switch (tipo) {
    case 'Tarefa':
      return '📋';
    case 'Reunião':
      return '🤝';
    case 'Chamada':
      return '📞';
    case 'Email':
      return '✉️';
    case 'WhatsApp':
      return '💬';
    case 'Nota':
      return '📝';
    case 'Visita':
      return '🏢';
    default:
      return '📌';
  }
};

// --------------- Component ---------------

export const AtividadesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: atividades, isLoading, isError } = useAtividades();

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Atividades</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Nova Atividade"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingState>Carregando atividades...</StyledLoadingState>
        )}

        {isError && (
          <StyledLoadingState>
            Erro ao carregar atividades. Tente novamente.
          </StyledLoadingState>
        )}

        {!isLoading && !isError && (!atividades || atividades.length === 0) && (
          <StyledEmptyState>
            <StyledEmptyTitle>Nenhuma atividade registrada</StyledEmptyTitle>
            <StyledEmptySubtitle>
              Clique em &quot;Nova Atividade&quot; para registrar tarefas, reuniões e interações.
            </StyledEmptySubtitle>
            <Button
              variant="secondary"
              accent="blue"
              size="medium"
              title="Nova Atividade"
              Icon={IconPlus}
              onClick={() => setIsModalOpen(true)}
            />
          </StyledEmptyState>
        )}

        {!isLoading && !isError && atividades && atividades.length > 0 && (
          <StyledTableWrapper>
            <StyledTable>
              <StyledTHead>
                <tr>
                  <StyledTh>Título</StyledTh>
                  <StyledTh>Tipo</StyledTh>
                  <StyledTh>Status</StyledTh>
                  <StyledTh>Prioridade</StyledTh>
                  <StyledTh>Data</StyledTh>
                </tr>
              </StyledTHead>
              <tbody>
                {atividades.map((atividade) => (
                  <StyledTr key={atividade.id}>
                    <StyledTd>
                      <div>
                        <span>
                          {getTipoEmoji(atividade.tipo)} {atividade.titulo}
                        </span>
                        {atividade.descricao && (
                          <div
                            style={{
                              fontSize: 'var(--t-font-size-xs)',
                              color: 'var(--t-font-color-tertiary)',
                              marginTop: 2,
                              maxWidth: 320,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {atividade.descricao}
                          </div>
                        )}
                      </div>
                    </StyledTd>
                    <StyledTd>
                      <StyledBadge variant={getTipoBadgeVariant(atividade.tipo)}>
                        {atividade.tipo}
                      </StyledBadge>
                    </StyledTd>
                    <StyledTd>
                      <StyledBadge variant={getStatusBadgeVariant(atividade.status)}>
                        {atividade.status}
                      </StyledBadge>
                    </StyledTd>
                    <StyledTd>
                      <StyledBadge variant={getPrioridadeBadgeVariant(atividade.prioridade)}>
                        {atividade.prioridade}
                      </StyledBadge>
                    </StyledTd>
                    <StyledTdSecondary>
                      {formatDate(atividade.data_inicio)}
                    </StyledTdSecondary>
                  </StyledTr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </StyledPageBody>

      <NovaAtividadeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
