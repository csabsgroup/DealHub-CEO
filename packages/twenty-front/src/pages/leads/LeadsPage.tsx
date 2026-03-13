import { NovoLeadModal } from '@/crm/components/NovoLeadModal';
import { useLeads, useOrigensLead } from '@/crm/hooks/useLeads';
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

const StyledTemperatura = styled.span<{ temp?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${(props) => {
    switch (props.temp) {
      case 'Quente':
        return themeCssVariables.color.red;
      case 'Morno':
        return themeCssVariables.color.orange;
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

const getStatusBadgeVariant = (
  status: string,
): 'blue' | 'green' | 'orange' | 'red' | 'gray' => {
  switch (status) {
    case 'Novo':
      return 'blue';
    case 'Contatado':
      return 'orange';
    case 'Qualificado':
      return 'green';
    case 'Desqualificado':
      return 'red';
    case 'Convertido':
      return 'green';
    default:
      return 'gray';
  }
};

const getTemperaturaEmoji = (temp: string | null): string => {
  switch (temp) {
    case 'Quente':
      return '🔥';
    case 'Morno':
      return '🌤️';
    case 'Frio':
      return '❄️';
    default:
      return '';
  }
};

// --------------- Component ---------------

export const LeadsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: leads, isLoading, isError } = useLeads();
  const { data: _origens } = useOrigensLead();

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Leads</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Novo Lead"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingState>Carregando leads...</StyledLoadingState>
        )}

        {isError && (
          <StyledLoadingState>
            Erro ao carregar leads. Tente novamente.
          </StyledLoadingState>
        )}

        {!isLoading && !isError && (!leads || leads.length === 0) && (
          <StyledEmptyState>
            <StyledEmptyTitle>Nenhum lead na caixa de entrada</StyledEmptyTitle>
            <StyledEmptySubtitle>
              Clique em &quot;Novo Lead&quot; para registrar seu primeiro
              prospecto.
            </StyledEmptySubtitle>
            <Button
              variant="secondary"
              accent="blue"
              size="medium"
              title="Novo Lead"
              Icon={IconPlus}
              onClick={() => setIsModalOpen(true)}
            />
          </StyledEmptyState>
        )}

        {!isLoading && !isError && leads && leads.length > 0 && (
          <StyledTableWrapper>
            <StyledTable>
              <StyledTHead>
                <tr>
                  <StyledTh>Nome</StyledTh>
                  <StyledTh>Empresa</StyledTh>
                  <StyledTh>E-mail</StyledTh>
                  <StyledTh>Origem</StyledTh>
                  <StyledTh>Temperatura</StyledTh>
                  <StyledTh>Status</StyledTh>
                </tr>
              </StyledTHead>
              <tbody>
                {leads.map((lead) => (
                  <StyledTr key={lead.id}>
                    <StyledTd>
                      <div>
                        <span>{lead.nome}</span>
                        {lead.interesse_principal && (
                          <div
                            style={{
                              fontSize: 'var(--t-font-size-xs)',
                              color: 'var(--t-font-color-tertiary)',
                              marginTop: 2,
                            }}
                          >
                            {lead.interesse_principal}
                          </div>
                        )}
                      </div>
                    </StyledTd>
                    <StyledTdSecondary>
                      {lead.empresa ?? '—'}
                    </StyledTdSecondary>
                    <StyledTdSecondary>
                      {lead.email ?? '—'}
                    </StyledTdSecondary>
                    <StyledTdSecondary>
                      {(lead as Record<string, unknown>).origens_lead
                        ? ((lead as Record<string, unknown>).origens_lead as { nome: string }).nome
                        : '—'}
                    </StyledTdSecondary>
                    <StyledTd>
                      {lead.temperatura ? (
                        <StyledTemperatura temp={lead.temperatura}>
                          {getTemperaturaEmoji(lead.temperatura)}{' '}
                          {lead.temperatura}
                        </StyledTemperatura>
                      ) : (
                        <StyledTdSecondary as="span">—</StyledTdSecondary>
                      )}
                    </StyledTd>
                    <StyledTd>
                      <StyledBadge
                        variant={getStatusBadgeVariant(lead.status_triagem)}
                      >
                        {lead.status_triagem}
                      </StyledBadge>
                    </StyledTd>
                  </StyledTr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </StyledPageBody>

      <NovoLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
