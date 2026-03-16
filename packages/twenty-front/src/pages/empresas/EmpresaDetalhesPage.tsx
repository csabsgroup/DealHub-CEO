import { useAtividades } from '@/crm/hooks/useAtividades';
import { useContatosByEmpresa } from '@/crm/hooks/useContatos';
import { useContratos } from '@/crm/hooks/useContratos';
import { useEmpresa } from '@/crm/hooks/useEmpresas';
import { useNegociosByEmpresa } from '@/crm/hooks/useNegocios';
import { usePropostas } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    IconArrowLeft,
    IconBriefcase,
    IconCalendar,
    IconCheck,
    IconTag,
    IconUser
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Contrato, Negocio, Proposta } from '~/types/supabase';

// ─── Extended types for Supabase joined data ─────────────────────────────────

type NegocioComRelacoes = Negocio & {
  pipeline_etapas?: { nome: string; cor: string | null; posicao: number };
  pipelines?: { nome: string };
};

type PropostaComRelacoes = Proposta & {
  negocios?: { titulo: string; empresa_id: string | null; valor_estimado: number };
};

type ContratoComRelacoes = Contrato & {
  negocios?: { id: string; titulo: string; empresa_id: string | null } | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCNPJ = (cnpj: string | null): string => {
  if (!cnpj) return '—';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
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

const StyledCompanyName = styled.h1`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: 700;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
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

const StyledBadgePrimary = styled(StyledBadge)`
  background: ${themeCssVariables.background.transparent.blue};
  color: ${themeCssVariables.accent.primary};
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

const StyledSection = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 ${themeCssVariables.spacing[3]};
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

const StyledPrincipalBadge = styled(StyledStatusBadge)`
  background: ${themeCssVariables.background.transparent.blue};
  color: ${themeCssVariables.accent.primary};
  margin-left: 6px;
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

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[12]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledNegocioLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.accent.primary};
  text-align: left;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

// ─── Tab type ────────────────────────────────────────────────────────────────

type TabId = 'contatos' | 'negocios' | 'atividades' | 'contratos';

// ─── Component ───────────────────────────────────────────────────────────────

export const EmpresaDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('contatos');

  const empresaId = id ?? null;

  const { data: empresa, isLoading: loadingEmpresa, isError } = useEmpresa(empresaId);
  const { data: contatos, isLoading: loadingContatos } = useContatosByEmpresa(empresaId);
  const { data: negocios, isLoading: loadingNegocios } = useNegociosByEmpresa(empresaId);
  const { data: atividades, isLoading: loadingAtividades } = useAtividades(
    empresaId ? { empresaId } : undefined,
  );
  const { data: todasPropostas } = usePropostas();
  const { data: todosContratos } = useContratos();

  // Filter propostas for this empresa via the negocios join (empresa_id is available via JOIN)
  const propostas = ((todasPropostas as PropostaComRelacoes[] | undefined) ?? []).filter(
    (p) => p.negocios?.empresa_id === id,
  );

  // Filter contratos via negocios join (same pattern as propostas)
  const contratos = ((todosContratos as ContratoComRelacoes[] | undefined) ?? []).filter(
    (c) => c.negocios?.empresa_id === id,
  );

  const negociosComRelacoes = (negocios ?? []) as NegocioComRelacoes[];

  if (!id) {
    return <StyledLoadingState>ID de empresa inválido.</StyledLoadingState>;
  }

  if (loadingEmpresa) {
    return <StyledLoadingState>Carregando empresa...</StyledLoadingState>;
  }

  if (isError || !empresa) {
    return <StyledLoadingState>Empresa não encontrada.</StyledLoadingState>;
  }

  return (
    <StyledContainer>
      {/* ──── HEADER ──── */}
      <StyledHeader>
        <StyledBackRow>
          <StyledBackButton onClick={() => navigate('/empresas')}>
            <IconArrowLeft size={14} />
            Empresas
          </StyledBackButton>
        </StyledBackRow>

        <StyledCompanyName>
          {empresa.nome_fantasia ?? empresa.razao_social}
        </StyledCompanyName>

        <StyledBadgeRow>
          {empresa.nome_fantasia && empresa.nome_fantasia !== empresa.razao_social && (
            <span
              style={{
                fontSize: 'var(--t-font-size-sm)',
                color: 'var(--t-font-color-tertiary)',
              }}
            >
              {empresa.razao_social}
            </span>
          )}
          {empresa.cnpj && (
            <StyledBadge>
              {formatCNPJ(empresa.cnpj)}
            </StyledBadge>
          )}
          {empresa.segmento && (
            <StyledBadgePrimary>
              <IconTag size={11} />
              {empresa.segmento}
            </StyledBadgePrimary>
          )}
          {empresa.regime_tributario && (
            <StyledBadge>{empresa.regime_tributario}</StyledBadge>
          )}
          {empresa.cidade && (
            <StyledBadge>
              {empresa.cidade}
              {empresa.uf ? ` / ${empresa.uf}` : ''}
            </StyledBadge>
          )}
        </StyledBadgeRow>

        <StyledStatsRow>
          <StyledStat>
            <IconUser size={14} />
            <StyledStatNumber>{contatos?.length ?? '—'}</StyledStatNumber>
            &nbsp;contato{(contatos?.length ?? 0) !== 1 ? 's' : ''}
          </StyledStat>
          <StyledStat>
            <IconBriefcase size={14} />
            <StyledStatNumber>{negocios?.length ?? '—'}</StyledStatNumber>
            &nbsp;negócio{(negocios?.length ?? 0) !== 1 ? 's' : ''}
          </StyledStat>
          <StyledStat>
            <IconCalendar size={14} />
            <StyledStatNumber>{atividades?.length ?? '—'}</StyledStatNumber>
            &nbsp;atividade{(atividades?.length ?? 0) !== 1 ? 's' : ''}
          </StyledStat>
          <StyledStat>
            <IconCheck size={14} />
            <StyledStatNumber>{propostas.length}</StyledStatNumber>
            &nbsp;proposta{propostas.length !== 1 ? 's' : ''}
          </StyledStat>
          <StyledStat>
            <IconCheck size={14} />
            <StyledStatNumber>{contratos.length}</StyledStatNumber>
            &nbsp;contrato{contratos.length !== 1 ? 's' : ''}
          </StyledStat>
        </StyledStatsRow>
      </StyledHeader>

      {/* ──── TABS ──── */}
      <StyledTabBar>
        <StyledTab
          data-active={activeTab === 'contatos' ? 'true' : 'false'}
          onClick={() => setActiveTab('contatos')}
        >
          Contatos{contatos ? ` (${contatos.length})` : ''}
        </StyledTab>
        <StyledTab
          data-active={activeTab === 'negocios' ? 'true' : 'false'}
          onClick={() => setActiveTab('negocios')}
        >
          Negócios & Propostas{negocios ? ` (${negocios.length})` : ''}
        </StyledTab>
        <StyledTab
          data-active={activeTab === 'atividades' ? 'true' : 'false'}
          onClick={() => setActiveTab('atividades')}
        >
          Atividades{atividades ? ` (${atividades.length})` : ''}
        </StyledTab>
        <StyledTab
          data-active={activeTab === 'contratos' ? 'true' : 'false'}
          onClick={() => setActiveTab('contratos')}
        >
          Contratos{contratos.length > 0 ? ` (${contratos.length})` : ''}
        </StyledTab>
      </StyledTabBar>

      {/* ──── TAB CONTENT ──── */}
      <StyledContent>

        {/* ── TAB 1: CONTATOS ── */}
        {activeTab === 'contatos' && (
          <>
            {loadingContatos && (
              <StyledLoadingState>Carregando contatos...</StyledLoadingState>
            )}
            {!loadingContatos && (!contatos || contatos.length === 0) && (
              <StyledEmptyState>
                Nenhum contato vinculado a esta empresa.
              </StyledEmptyState>
            )}
            {!loadingContatos && contatos && contatos.length > 0 && (
              <StyledTableWrapper>
                <StyledTable>
                  <StyledTHead>
                    <tr>
                      <StyledTh>Nome</StyledTh>
                      <StyledTh>Cargo</StyledTh>
                      <StyledTh>Email</StyledTh>
                      <StyledTh>Telefone</StyledTh>
                      <StyledTh>Papel Decisão</StyledTh>
                      <StyledTh>Canal Preferido</StyledTh>
                    </tr>
                  </StyledTHead>
                  <tbody>
                    {contatos.map((c) => (
                      <StyledTr key={c.id}>
                        <StyledTd>
                          {c.nome}
                          {c.is_principal && (
                            <StyledPrincipalBadge>Principal</StyledPrincipalBadge>
                          )}
                        </StyledTd>
                        <StyledTdSecondary>{c.cargo ?? '—'}</StyledTdSecondary>
                        <StyledTdSecondary>{c.email ?? '—'}</StyledTdSecondary>
                        <StyledTdSecondary>
                          {c.telefone ?? c.whatsapp ?? '—'}
                        </StyledTdSecondary>
                        <StyledTdSecondary>{c.papel_decisao ?? '—'}</StyledTdSecondary>
                        <StyledTdSecondary>{c.canal_preferido ?? '—'}</StyledTdSecondary>
                      </StyledTr>
                    ))}
                  </tbody>
                </StyledTable>
              </StyledTableWrapper>
            )}
          </>
        )}

        {/* ── TAB 2: NEGÓCIOS & PROPOSTAS ── */}
        {activeTab === 'negocios' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Negócios</StyledSectionTitle>
              {loadingNegocios && (
                <StyledLoadingState>Carregando negócios...</StyledLoadingState>
              )}
              {!loadingNegocios && negociosComRelacoes.length === 0 && (
                <StyledEmptyState>
                  Nenhum negócio vinculado a esta empresa.
                </StyledEmptyState>
              )}
              {!loadingNegocios && negociosComRelacoes.length > 0 && (
                <StyledTableWrapper>
                  <StyledTable>
                    <StyledTHead>
                      <tr>
                        <StyledTh>Título</StyledTh>
                        <StyledTh>Valor Estimado</StyledTh>
                        <StyledTh>Etapa</StyledTh>
                        <StyledTh>Status</StyledTh>
                        <StyledTh>Prev. Fechamento</StyledTh>
                      </tr>
                    </StyledTHead>
                    <tbody>
                      {negociosComRelacoes.map((n) => (
                        <StyledTr key={n.id}>
                          <StyledTd>
                            <StyledNegocioLink onClick={() => navigate(`/negocios/${n.id}`)}>
                              {n.titulo}
                            </StyledNegocioLink>
                          </StyledTd>
                          <StyledTdSecondary>
                            {formatCurrency(n.valor_estimado)}
                          </StyledTdSecondary>
                          <StyledTd>
                            {n.pipeline_etapas?.nome ? (
                              <StyledStatusBadge>
                                {n.pipeline_etapas.nome}
                              </StyledStatusBadge>
                            ) : (
                              '—'
                            )}
                          </StyledTd>
                          <StyledTd>
                            <StyledStatusBadge>
                              {n.status_final ?? 'Em Aberto'}
                            </StyledStatusBadge>
                          </StyledTd>
                          <StyledTdSecondary>
                            {formatDate(n.data_prevista_fechamento)}
                          </StyledTdSecondary>
                        </StyledTr>
                      ))}
                    </tbody>
                  </StyledTable>
                </StyledTableWrapper>
              )}
            </StyledSection>

            <StyledSection>
              <StyledSectionTitle>Propostas</StyledSectionTitle>
              {propostas.length === 0 && (
                <StyledEmptyState>
                  Nenhuma proposta gerada para esta empresa.
                </StyledEmptyState>
              )}
              {propostas.length > 0 && (
                <StyledTableWrapper>
                  <StyledTable>
                    <StyledTHead>
                      <tr>
                        <StyledTh>Número</StyledTh>
                        <StyledTh>Versão</StyledTh>
                        <StyledTh>Negócio</StyledTh>
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
                          <StyledTdSecondary>
                            {p.negocios?.titulo ?? '—'}
                          </StyledTdSecondary>
                          <StyledTdSecondary>
                            {formatCurrency(p.valor_total)}
                          </StyledTdSecondary>
                          <StyledTd>
                            <StyledStatusBadge>{p.status}</StyledStatusBadge>
                          </StyledTd>
                          <StyledTdSecondary>
                            {formatDate(p.data_validade)}
                          </StyledTdSecondary>
                        </StyledTr>
                      ))}
                    </tbody>
                  </StyledTable>
                </StyledTableWrapper>
              )}
            </StyledSection>
          </>
        )}

        {/* ── TAB 3: ATIVIDADES ── */}
        {activeTab === 'atividades' && (
          <>
            {loadingAtividades && (
              <StyledLoadingState>Carregando atividades...</StyledLoadingState>
            )}
            {!loadingAtividades && (!atividades || atividades.length === 0) && (
              <StyledEmptyState>
                Nenhuma atividade registrada para esta empresa.
              </StyledEmptyState>
            )}
            {!loadingAtividades && atividades && atividades.length > 0 && (
              <StyledTableWrapper>
                <StyledTable>
                  <StyledTHead>
                    <tr>
                      <StyledTh>Tipo</StyledTh>
                      <StyledTh>Título</StyledTh>
                      <StyledTh>Data</StyledTh>
                      <StyledTh>Status</StyledTh>
                      <StyledTh>Prioridade</StyledTh>
                    </tr>
                  </StyledTHead>
                  <tbody>
                    {atividades.map((a) => (
                      <StyledTr key={a.id}>
                        <StyledTd>
                          <StyledStatusBadge>{a.tipo}</StyledStatusBadge>
                        </StyledTd>
                        <StyledTd>{a.titulo}</StyledTd>
                        <StyledTdSecondary>
                          {formatDate(a.data_vencimento)}
                        </StyledTdSecondary>
                        <StyledTd>
                          <StyledStatusBadge>{a.status}</StyledStatusBadge>
                        </StyledTd>
                        <StyledTdSecondary>{a.prioridade}</StyledTdSecondary>
                      </StyledTr>
                    ))}
                  </tbody>
                </StyledTable>
              </StyledTableWrapper>
            )}
          </>
        )}

        {/* ── TAB 4: CONTRATOS ── */}
        {activeTab === 'contratos' && (
          <>
            {contratos.length === 0 && (
              <StyledEmptyState>
                Nenhum contrato vinculado a esta empresa.
              </StyledEmptyState>
            )}
            {contratos.length > 0 && (
              <StyledTableWrapper>
                <StyledTable>
                  <StyledTHead>
                    <tr>
                      <StyledTh>Status</StyledTh>
                      <StyledTh>Negócio</StyledTh>
                      <StyledTh>Início Vigência</StyledTh>
                      <StyledTh>Fim Vigência</StyledTh>
                      <StyledTh>Índice Reajuste</StyledTh>
                    </tr>
                  </StyledTHead>
                  <tbody>
                    {contratos.map((c) => (
                      <StyledTr key={c.id}>
                        <StyledTd>
                          <StyledStatusBadge>{c.status_contrato}</StyledStatusBadge>
                        </StyledTd>
                        <StyledTdSecondary>
                          {c.negocios ? (
                            <StyledNegocioLink onClick={() => navigate(`/negocios/${c.negocios!.id}`)}>
                              {c.negocios.titulo}
                            </StyledNegocioLink>
                          ) : '—'}
                        </StyledTdSecondary>
                        <StyledTdSecondary>{formatDate(c.inicio_vigencia)}</StyledTdSecondary>
                        <StyledTdSecondary>{formatDate(c.fim_vigencia)}</StyledTdSecondary>
                        <StyledTdSecondary>{c.indice_reajuste ?? '—'}</StyledTdSecondary>
                      </StyledTr>
                    ))}
                  </tbody>
                </StyledTable>
              </StyledTableWrapper>
            )}
          </>
        )}
      </StyledContent>
    </StyledContainer>
  );
};
