import { MarcarGanhoModal } from '@/crm/components/MarcarGanhoModal';
import { MarcarPerdaModal } from '@/crm/components/MarcarPerdaModal';
import { NegocioAtividadesTab } from '@/crm/components/NegocioAtividadesTab';
import { useAtividadesPorNegocio } from '@/crm/hooks/useAtividades';
import { useContratosByDeal } from '@/crm/hooks/useContratos';
import { useNegocio } from '@/crm/hooks/useNegocios';
import { usePropostasByNegocio } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    IconAlertTriangle,
    IconArrowLeft,
    IconBriefcase,
    IconCalendar,
    IconCheck,
    IconStar,
    IconTag,
    IconUser,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Contrato, Negocio, Proposta } from '~/types/supabase';

// ─── Extended types for Supabase joined data ─────────────────────────────────

type NegocioDetalhes = Negocio & {
  empresas?: { razao_social: string; nome_fantasia: string | null } | null;
  pipelines?: { nome: string } | null;
  pipeline_etapas?: { nome: string; cor: string | null; posicao: number } | null;
};

type PropostaDetalhes = Proposta & {
  negocios?: { titulo: string; empresa_id: string | null; valor_estimado: number } | null;
};

type ContratoDetalhes = Contrato & {
  negocios?: { id: string; titulo: string; empresa_id: string | null } | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
};

// ─── Styled Components ───────────────────────────────────────────────────────

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[8]};
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledBackRow = styled.div`
  display: flex;
  align-items: center;
`;

const StyledBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  background: none;
  border: none;
  cursor: pointer;
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  flex-wrap: wrap;
`;

const StyledDealTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: 700;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledStatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
`;

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledCompanyLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${themeCssVariables.background.transparent.blue};
  color: ${themeCssVariables.accent.primary};
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledEtapaBadge = styled.span<{ accentColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${(props) =>
    props.accentColor ? `${props.accentColor}22` : themeCssVariables.background.secondary};
  color: ${(props) => props.accentColor ?? themeCssVariables.font.color.secondary};
`;

const StyledStatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[5]};
  flex-wrap: wrap;
`;

const StyledStat = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledStatNumber = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-weight: 600;
`;

const StyledStatDivider = styled.span`
  color: ${themeCssVariables.border.color.medium};
  margin: 0 ${themeCssVariables.spacing[1]};
`;

const StyledActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
`;

const StyledGanhoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 34px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: #22c55e;
  color: #ffffff;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledPerdaBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 34px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: ${themeCssVariables.font.color.danger};
  color: #ffffff;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledStatusFinalBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 700;
  background: ${(props) =>
    props.status === 'Ganho' ? '#dcfce7' : '#fee2e2'};
  color: ${(props) => (props.status === 'Ganho' ? '#15803d' : '#b91c1c')};
  letter-spacing: 0.02em;
`;

// ─── Tabs ────────────────────────────────────────────────────────────────────

const StyledTabBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[8]};
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledTab = styled.button`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 400;
  color: ${themeCssVariables.font.color.secondary};
  transition: all 0.15s ease;
  white-space: nowrap;
  margin-bottom: -1px;

  &[data-active='true'] {
    border-bottom-color: ${themeCssVariables.accent.primary};
    color: ${themeCssVariables.font.color.primary};
    font-weight: 600;
  }

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

// ─── Content ─────────────────────────────────────────────────────────────────

const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[12]};
  gap: ${themeCssVariables.spacing[2]};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// ─── Table ───────────────────────────────────────────────────────────────────

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

const StyledStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.secondary};
`;

// ─── Tab type ────────────────────────────────────────────────────────────────

type TabId = 'propostas' | 'contratos' | 'atividades';

// ─── Component ───────────────────────────────────────────────────────────────

export const NegocioDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('propostas');
  const [ganhoModalOpen, setGanhoModalOpen] = useState(false);
  const [perdaModalOpen, setPerdaModalOpen] = useState(false);

  const negocioId = id ?? null;

  const { data: negocioRaw, isLoading: loadingNegocio, isError } = useNegocio(negocioId);
  const { data: propostasRaw, isLoading: loadingPropostas } = usePropostasByNegocio(negocioId);
  const { data: contratosRaw, isLoading: loadingContratos } = useContratosByDeal(negocioId);
  const { data: atividades } = useAtividadesPorNegocio(negocioId);

  const negocio = negocioRaw as NegocioDetalhes | undefined;
  const propostas = (propostasRaw ?? []) as PropostaDetalhes[];
  const contratos = (contratosRaw ?? []) as ContratoDetalhes[];

  if (!id) {
    return <StyledLoadingState>ID de negócio inválido.</StyledLoadingState>;
  }

  if (loadingNegocio) {
    return <StyledLoadingState>Carregando negócio...</StyledLoadingState>;
  }

  if (isError || !negocio) {
    return <StyledLoadingState>Negócio não encontrado.</StyledLoadingState>;
  }

  const empresaNome =
    negocio.empresas?.nome_fantasia ?? negocio.empresas?.razao_social ?? '—';

  return (
    <StyledContainer>
      {/* ──── HEADER ──── */}
      <StyledHeader>
        <StyledBackRow>
          <StyledBackButton onClick={() => navigate('/negocios')}>
            <IconArrowLeft size={14} />
            Pipeline
          </StyledBackButton>
        </StyledBackRow>

        <StyledTitleRow>
          <StyledDealTitle>{negocio.titulo}</StyledDealTitle>
          {!negocio.status_final || negocio.status_final === 'Aberto' ? (
            <StyledStatusPill>Em Aberto</StyledStatusPill>
          ) : (
            <StyledStatusFinalBadge status={negocio.status_final}>
              {negocio.status_final === 'Ganho' ? (
                <IconStar size={14} />
              ) : (
                <IconAlertTriangle size={14} />
              )}
              {negocio.status_final}
            </StyledStatusFinalBadge>
          )}
        </StyledTitleRow>

        <StyledBadgeRow>
          {negocio.empresa_id && (
            <StyledCompanyLink
              onClick={() => navigate(`/empresas/${negocio.empresa_id}`)}
            >
              <IconBriefcase size={12} />
              {empresaNome}
            </StyledCompanyLink>
          )}
          {negocio.pipelines && (
            <StyledBadge>
              <IconTag size={11} />
              {negocio.pipelines.nome}
            </StyledBadge>
          )}
          {negocio.pipeline_etapas && (
            <StyledEtapaBadge accentColor={negocio.pipeline_etapas.cor ?? undefined}>
              {negocio.pipeline_etapas.nome}
            </StyledEtapaBadge>
          )}
          {negocio.responsavel_id && (
            <StyledBadge>
              <IconUser size={11} />
              Responsável
            </StyledBadge>
          )}
        </StyledBadgeRow>

        {(!negocio.status_final || negocio.status_final === 'Aberto') && (
          <StyledActionButtons>
            <StyledGanhoBtn onClick={() => setGanhoModalOpen(true)}>
              <IconCheck size={14} />
              Marcar como Ganho
            </StyledGanhoBtn>
            <StyledPerdaBtn onClick={() => setPerdaModalOpen(true)}>
              <IconAlertTriangle size={14} />
              Marcar como Perdido
            </StyledPerdaBtn>
          </StyledActionButtons>
        )}

        <StyledStatsRow>
          <StyledStat>
            <span>Setup</span>
            <StyledStatNumber>{formatCurrency(negocio.valor_setup)}</StyledStatNumber>
          </StyledStat>
          <StyledStatDivider>|</StyledStatDivider>
          <StyledStat>
            <span>Recorrente</span>
            <StyledStatNumber>{formatCurrency(negocio.valor_mensalidade)}</StyledStatNumber>
          </StyledStat>
          <StyledStatDivider>|</StyledStatDivider>
          <StyledStat>
            <span>Probabilidade</span>
            <StyledStatNumber>{negocio.probabilidade}%</StyledStatNumber>
          </StyledStat>
          {negocio.data_prevista_fechamento && (
            <>
              <StyledStatDivider>|</StyledStatDivider>
              <StyledStat>
                <IconCalendar size={14} />
                <span>Fechamento prev.</span>
                <StyledStatNumber>
                  {formatDate(negocio.data_prevista_fechamento)}
                </StyledStatNumber>
              </StyledStat>
            </>
          )}
        </StyledStatsRow>
      </StyledHeader>

      {/* ──── TABS ──── */}
      <StyledTabBar>
        <StyledTab
          data-active={activeTab === 'propostas' ? 'true' : 'false'}
          onClick={() => setActiveTab('propostas')}
        >
          Propostas{propostas.length > 0 ? ` (${propostas.length})` : ''}
        </StyledTab>
        <StyledTab
          data-active={activeTab === 'contratos' ? 'true' : 'false'}
          onClick={() => setActiveTab('contratos')}
        >
          Contratos{contratos.length > 0 ? ` (${contratos.length})` : ''}
        </StyledTab>
        <StyledTab
          data-active={activeTab === 'atividades' ? 'true' : 'false'}
          onClick={() => setActiveTab('atividades')}
        >
          Atividades{atividades ? ` (${atividades.length})` : ''}
        </StyledTab>
      </StyledTabBar>

      {/* ──── TAB CONTENT ──── */}
      <StyledContent>

        {/* ── TAB 1: PROPOSTAS ── */}
        {activeTab === 'propostas' && (
          <>
            {loadingPropostas && (
              <StyledEmptyState>Carregando propostas...</StyledEmptyState>
            )}
            {!loadingPropostas && propostas.length === 0 && (
              <StyledEmptyState>
                Nenhuma proposta gerada para este negócio.
              </StyledEmptyState>
            )}
            {!loadingPropostas && propostas.length > 0 && (
              <StyledTableWrapper>
                <StyledTable>
                  <StyledTHead>
                    <tr>
                      <StyledTh>Número</StyledTh>
                      <StyledTh>Versão</StyledTh>
                      <StyledTh>Valor Setup</StyledTh>
                      <StyledTh>Valor Recorrente</StyledTh>
                      <StyledTh>Valor Total</StyledTh>
                      <StyledTh>Status</StyledTh>
                      <StyledTh>Validade</StyledTh>
                    </tr>
                  </StyledTHead>
                  <tbody>
                    {propostas.map((p) => (
                      <StyledTr key={p.id}>
                        <StyledTd>{p.numero}</StyledTd>
                        <StyledTdSecondary>v{p.versao}</StyledTdSecondary>
                        <StyledTdSecondary>{formatCurrency(p.valor_setup)}</StyledTdSecondary>
                        <StyledTdSecondary>
                          {formatCurrency(p.valor_mensalidade)}
                        </StyledTdSecondary>
                        <StyledTdSecondary>{formatCurrency(p.valor_total)}</StyledTdSecondary>
                        <StyledTd>
                          <StyledStatusBadge>{p.status}</StyledStatusBadge>
                        </StyledTd>
                        <StyledTdSecondary>{formatDate(p.data_validade)}</StyledTdSecondary>
                      </StyledTr>
                    ))}
                  </tbody>
                </StyledTable>
              </StyledTableWrapper>
            )}
          </>
        )}

        {/* ── TAB 2: CONTRATOS ── */}
        {activeTab === 'contratos' && (
          <>
            {loadingContratos && (
              <StyledEmptyState>Carregando contratos...</StyledEmptyState>
            )}
            {!loadingContratos && contratos.length === 0 && (
              <StyledEmptyState>
                Nenhum contrato gerado para este negócio.
              </StyledEmptyState>
            )}
            {!loadingContratos && contratos.length > 0 && (
              <StyledTableWrapper>
                <StyledTable>
                  <StyledTHead>
                    <tr>
                      <StyledTh>Status</StyledTh>
                      <StyledTh>Início Vigência</StyledTh>
                      <StyledTh>Fim Vigência</StyledTh>
                      <StyledTh>Índice Reajuste</StyledTh>
                      <StyledTh>Periodicidade</StyledTh>
                    </tr>
                  </StyledTHead>
                  <tbody>
                    {contratos.map((c) => (
                      <StyledTr key={c.id}>
                        <StyledTd>
                          <StyledStatusBadge>{c.status_contrato}</StyledStatusBadge>
                        </StyledTd>
                        <StyledTdSecondary>{formatDate(c.inicio_vigencia)}</StyledTdSecondary>
                        <StyledTdSecondary>{formatDate(c.fim_vigencia)}</StyledTdSecondary>
                        <StyledTdSecondary>{c.indice_reajuste ?? '—'}</StyledTdSecondary>
                        <StyledTdSecondary>
                          {c.periodicidade_reajuste ?? '—'}
                        </StyledTdSecondary>
                      </StyledTr>
                    ))}
                  </tbody>
                </StyledTable>
              </StyledTableWrapper>
            )}
          </>
        )}

        {/* ── TAB 3: ATIVIDADES ── */}
        {activeTab === 'atividades' && <NegocioAtividadesTab negocioId={id} />}
      </StyledContent>
      {ganhoModalOpen && (
        <MarcarGanhoModal
          isOpen={ganhoModalOpen}
          onClose={() => setGanhoModalOpen(false)}
          negocio={negocio as Negocio}
        />
      )}

      {perdaModalOpen && (
        <MarcarPerdaModal
          isOpen={perdaModalOpen}
          onClose={() => setPerdaModalOpen(false)}
          negocio={negocio as Negocio}
        />
      )}
    </StyledContainer>
  );
};
