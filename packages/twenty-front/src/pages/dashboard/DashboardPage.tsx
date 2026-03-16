import { useAtividades } from '@/crm/hooks/useAtividades';
import { useContatos } from '@/crm/hooks/useContatos';
import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { useLeads } from '@/crm/hooks/useLeads';
import { useNegocios } from '@/crm/hooks/useNegocios';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconBuildingSkyscraper,
    IconLayoutKanban,
    IconListCheck,
    IconTarget,
    IconUsers,
} from 'twenty-ui/display';
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

const StyledPageSubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 4px 0 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${themeCssVariables.spacing[5]};
  margin-bottom: ${themeCssVariables.spacing[8]};
`;

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[6]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledCardLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StyledCardIconWrapper = styled.div<{ accentColor?: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.accentColor || themeCssVariables.background.transparent.blue};
  color: ${(p) => p.accentColor ? 'white' : themeCssVariables.accent.primary};
  flex-shrink: 0;
`;

const StyledCardValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${themeCssVariables.font.color.primary};
  line-height: 1;
`;

const StyledCardFooter = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0 0 ${themeCssVariables.spacing[4]};
`;

const StyledRecentList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
  background: ${themeCssVariables.background.primary};
`;

const StyledRecentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }

  &:hover {
    background: ${themeCssVariables.background.secondary};
  }
`;

const StyledRecentTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  font-weight: 500;
`;

const StyledRecentMeta = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
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

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledTwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[6]};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// --------------- Helpers ---------------

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

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
    case 'Pendente':
      return 'orange';
    case 'Em andamento':
      return 'blue';
    case 'Concluída':
      return 'green';
    default:
      return 'gray';
  }
};

// --------------- Component ---------------

export const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: leads, isLoading: loadingLeads } = useLeads();
  const { data: empresas, isLoading: loadingEmpresas } = useEmpresas();
  const { data: negocios, isLoading: loadingNegocios } = useNegocios();
  const { data: atividades, isLoading: loadingAtividades } = useAtividades();
  const { data: contatos, isLoading: loadingContatos } = useContatos();

  const isLoading = loadingLeads || loadingEmpresas || loadingNegocios || loadingAtividades || loadingContatos;

  // Métricas calculadas
  const leadsAbertos = useMemo(() => {
    if (!leads) return 0;
    return leads.filter(
      (l) => l.status !== 'Convertido' && l.status !== 'Desqualificado',
    ).length;
  }, [leads]);

  const totalEmpresas = empresas?.length ?? 0;
  const totalContatos = contatos?.length ?? 0;

  const valorFunil = useMemo(() => {
    if (!negocios) return 0;
    return negocios.reduce((acc, n) => acc + (n.valor_estimado ?? 0), 0);
  }, [negocios]);

  const atividadesPendentes = useMemo(() => {
    if (!atividades) return 0;
    return atividades.filter(
      (a) => a.status === 'Pendente' || a.status === 'Em andamento',
    ).length;
  }, [atividades]);

  // Últimos leads (5)
  const recentLeads = useMemo(() => {
    if (!leads) return [];
    return [...leads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [leads]);

  // Próximas atividades (5)
  const proximasAtividades = useMemo(() => {
    if (!atividades) return [];
    return atividades
      .filter((a) => a.status === 'Pendente' || a.status === 'Em andamento')
      .sort((a, b) => {
        const dateA = a.data_vencimento ? new Date(a.data_vencimento).getTime() : Infinity;
        const dateB = b.data_vencimento ? new Date(b.data_vencimento).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [atividades]);

  if (isLoading) {
    return (
      <StyledPageContainer>
        <StyledLoadingState>Carregando painel...</StyledLoadingState>
      </StyledPageContainer>
    );
  }

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <div>
          <StyledPageTitle>Painel de Controle</StyledPageTitle>
          <StyledPageSubtitle>
            Visão geral do seu CRM Contábil
          </StyledPageSubtitle>
        </div>
      </StyledPageHeader>

      <StyledPageBody>
        {/* Metric Cards */}
        <StyledCardsGrid>
          <StyledCard onClick={() => navigate('/leads')}>
            <StyledCardHeader>
              <StyledCardLabel>Leads Abertos</StyledCardLabel>
              <StyledCardIconWrapper>
                <IconTarget size={18} />
              </StyledCardIconWrapper>
            </StyledCardHeader>
            <StyledCardValue>{leadsAbertos}</StyledCardValue>
            <StyledCardFooter>
              {leads?.length ?? 0} leads no total
            </StyledCardFooter>
          </StyledCard>

          <StyledCard onClick={() => navigate('/empresas')}>
            <StyledCardHeader>
              <StyledCardLabel>Empresas Cadastradas</StyledCardLabel>
              <StyledCardIconWrapper>
                <IconBuildingSkyscraper size={18} />
              </StyledCardIconWrapper>
            </StyledCardHeader>
            <StyledCardValue>{totalEmpresas}</StyledCardValue>
            <StyledCardFooter>clientes e prospects</StyledCardFooter>
          </StyledCard>

          <StyledCard onClick={() => navigate('/negocios')}>
            <StyledCardHeader>
              <StyledCardLabel>Valor Estimado no Funil</StyledCardLabel>
              <StyledCardIconWrapper>
                <IconLayoutKanban size={18} />
              </StyledCardIconWrapper>
            </StyledCardHeader>
            <StyledCardValue>{formatCurrency(valorFunil)}</StyledCardValue>
            <StyledCardFooter>
              {negocios?.length ?? 0} negócios ativos
            </StyledCardFooter>
          </StyledCard>

          <StyledCard onClick={() => navigate('/contatos')}>
            <StyledCardHeader>
              <StyledCardLabel>Contatos</StyledCardLabel>
              <StyledCardIconWrapper>
                <IconUsers size={18} />
              </StyledCardIconWrapper>
            </StyledCardHeader>
            <StyledCardValue>{totalContatos}</StyledCardValue>
            <StyledCardFooter>pessoas de contato</StyledCardFooter>
          </StyledCard>

          <StyledCard onClick={() => navigate('/atividades')}>
            <StyledCardHeader>
              <StyledCardLabel>Atividades Pendentes</StyledCardLabel>
              <StyledCardIconWrapper>
                <IconListCheck size={18} />
              </StyledCardIconWrapper>
            </StyledCardHeader>
            <StyledCardValue>{atividadesPendentes}</StyledCardValue>
            <StyledCardFooter>
              {atividades?.length ?? 0} atividades no total
            </StyledCardFooter>
          </StyledCard>
        </StyledCardsGrid>

        {/* Recent activity sections */}
        <StyledTwoColumns>
          <div>
            <StyledSectionTitle>Últimos Leads</StyledSectionTitle>
            <StyledRecentList>
              {recentLeads.length === 0 && (
                <StyledRecentItem>
                  <StyledRecentMeta>Nenhum lead registrado</StyledRecentMeta>
                </StyledRecentItem>
              )}
              {recentLeads.map((lead) => (
                <StyledRecentItem key={lead.id}>
                  <div>
                    <StyledRecentTitle>{lead.nome}</StyledRecentTitle>
                    <div>
                      <StyledRecentMeta>
                        {lead.email || 'Sem e-mail'}
                      </StyledRecentMeta>
                    </div>
                  </div>
                  <StyledBadge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </StyledBadge>
                </StyledRecentItem>
              ))}
            </StyledRecentList>
          </div>

          <div>
            <StyledSectionTitle>Próximas Atividades</StyledSectionTitle>
            <StyledRecentList>
              {proximasAtividades.length === 0 && (
                <StyledRecentItem>
                  <StyledRecentMeta>Nenhuma atividade pendente</StyledRecentMeta>
                </StyledRecentItem>
              )}
              {proximasAtividades.map((atv) => (
                <StyledRecentItem key={atv.id}>
                  <div>
                    <StyledRecentTitle>{atv.titulo}</StyledRecentTitle>
                    <div>
                      <StyledRecentMeta>
                        {atv.data_vencimento
                          ? new Intl.DateTimeFormat('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(atv.data_vencimento))
                          : 'Sem data'}
                      </StyledRecentMeta>
                    </div>
                  </div>
                  <StyledBadge variant={getStatusBadgeVariant(atv.status)}>
                    {atv.status}
                  </StyledBadge>
                </StyledRecentItem>
              ))}
            </StyledRecentList>
          </div>
        </StyledTwoColumns>
      </StyledPageBody>
    </StyledPageContainer>
  );
};
