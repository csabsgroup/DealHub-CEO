import { NovoNegocioModal } from '@/crm/components/NovoNegocioModal';
import { useNegociosByPipeline } from '@/crm/hooks/useNegocios';
import { usePipelineEtapas, usePipelines } from '@/crm/hooks/usePipelines';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Negocio, PipelineEtapa } from '~/types/supabase';

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

const StyledHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPipelineSelect = styled.select`
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  cursor: pointer;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
    outline: none;
  }
`;

const StyledKanbanContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]};
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  align-items: flex-start;
`;

const StyledKanbanColumn = styled.div`
  flex: 0 0 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledColumnHeader = styled.div<{ accentColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  border-bottom: 2px solid ${(props) => props.accentColor || themeCssVariables.accent.primary};
  flex-shrink: 0;
`;

const StyledColumnTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledColumnName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledColumnCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${themeCssVariables.border.radius.pill};
  background: ${themeCssVariables.background.transparent.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledColumnTotal = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledColumnBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const StyledCardTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
  margin-bottom: ${themeCssVariables.spacing[2]};
  line-height: 1.3;
`;

const StyledCardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledCardValue = styled.span`
  font-weight: 600;
  color: ${themeCssVariables.color.green};
`;

const StyledCardBadge = styled.span<{ color?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 1px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: 10px;
  font-weight: 500;
  background: ${(props) => props.color ? `${props.color}18` : themeCssVariables.background.transparent.blue};
  color: ${(props) => props.color || themeCssVariables.accent.primary};
`;

const StyledEmptyColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-align: center;
`;

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

// --------------- Helpers ---------------

const formatCurrency = (value: number | null): string => {
  if (value === null || value === 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

type NegocioWithRelations = Negocio & {
  empresas?: { razao_social: string; nome_fantasia: string | null } | null;
  pipeline_etapas?: { nome: string; cor: string; posicao: number } | null;
};

const groupNegociosByEtapa = (
  negocios: NegocioWithRelations[],
  etapas: PipelineEtapa[],
): Map<string, NegocioWithRelations[]> => {
  const grouped = new Map<string, NegocioWithRelations[]>();

  // Initialize all etapas
  for (const etapa of etapas) {
    grouped.set(etapa.id, []);
  }

  // Group negocios into their etapas
  for (const negocio of negocios) {
    const list = grouped.get(negocio.etapa_id);
    if (list) {
      list.push(negocio);
    }
  }

  return grouped;
};

// --------------- Component ---------------

export const PipelinePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null,
  );

  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();

  // Auto-select default pipeline
  const activePipelineId = useMemo(() => {
    if (selectedPipelineId) return selectedPipelineId;
    if (pipelines && pipelines.length > 0) {
      const defaultPipeline =
        pipelines.find((p) => p.is_default) ?? pipelines[0];
      return defaultPipeline.id;
    }
    return null;
  }, [selectedPipelineId, pipelines]);

  const { data: etapas, isLoading: loadingEtapas } =
    usePipelineEtapas(activePipelineId);
  const { data: negocios, isLoading: loadingNegocios } =
    useNegociosByPipeline(activePipelineId);

  const isLoading = loadingPipelines || loadingEtapas || loadingNegocios;
  const hasNoPipelines = !loadingPipelines && (!pipelines || pipelines.length === 0);

  const groupedNegocios = useMemo((): Map<string, NegocioWithRelations[]> => {
    if (!etapas || !negocios) return new Map<string, NegocioWithRelations[]>();
    return groupNegociosByEtapa(negocios as NegocioWithRelations[], etapas);
  }, [etapas, negocios]);

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderLeft>
          <StyledPageTitle>Funil de Vendas</StyledPageTitle>
          {pipelines && pipelines.length > 1 && (
            <StyledPipelineSelect
              value={activePipelineId ?? ''}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </StyledPipelineSelect>
          )}
        </StyledHeaderLeft>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Novo Negócio"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      {isLoading && (
        <StyledLoadingState>Carregando pipeline...</StyledLoadingState>
      )}

      {!isLoading && hasNoPipelines && (
        <StyledEmptyState>
          <StyledEmptyTitle>Nenhum pipeline configurado</StyledEmptyTitle>
          <StyledEmptySubtitle>
            Configure um pipeline com etapas para visualizar o funil de vendas.
          </StyledEmptySubtitle>
        </StyledEmptyState>
      )}

      {!isLoading && etapas && etapas.length > 0 && (
        <StyledKanbanContainer>
          {etapas.map((etapa) => {
            const columnNegocios = groupedNegocios.get(etapa.id) ?? [];
            const totalValue = columnNegocios.reduce(
              (sum: number, n: NegocioWithRelations) => sum + (n.valor_estimado || 0),
              0,
            );

            return (
              <StyledKanbanColumn key={etapa.id}>
                <StyledColumnHeader accentColor={etapa.cor}>
                  <StyledColumnTitle>
                    <StyledColumnName>{etapa.nome}</StyledColumnName>
                    <StyledColumnCount>{columnNegocios.length}</StyledColumnCount>
                  </StyledColumnTitle>
                  {totalValue > 0 && (
                    <StyledColumnTotal>
                      {formatCurrency(totalValue)}
                    </StyledColumnTotal>
                  )}
                </StyledColumnHeader>

                <StyledColumnBody>
                  {columnNegocios.length === 0 && (
                    <StyledEmptyColumn>
                      Nenhum negócio nesta etapa
                    </StyledEmptyColumn>
                  )}
                  {columnNegocios.map((negocio) => (
                    <StyledCard key={negocio.id}>
                      <StyledCardTitle>{negocio.titulo}</StyledCardTitle>
                      <StyledCardMeta>
                        {negocio.empresas && (
                          <StyledCardRow>
                            <span>
                              {negocio.empresas.nome_fantasia ??
                                negocio.empresas.razao_social}
                            </span>
                          </StyledCardRow>
                        )}
                        <StyledCardRow>
                          <span>Valor</span>
                          <StyledCardValue>
                            {formatCurrency(negocio.valor_estimado)}
                          </StyledCardValue>
                        </StyledCardRow>
                        {negocio.servico && (
                          <StyledCardRow>
                            <StyledCardBadge color={etapa.cor}>
                              {negocio.servico}
                            </StyledCardBadge>
                          </StyledCardRow>
                        )}
                      </StyledCardMeta>
                    </StyledCard>
                  ))}
                </StyledColumnBody>
              </StyledKanbanColumn>
            );
          })}
        </StyledKanbanContainer>
      )}

      <NovoNegocioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
