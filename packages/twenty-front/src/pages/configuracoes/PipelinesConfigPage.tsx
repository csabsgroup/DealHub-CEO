import { EditarEtapaModal } from '@/crm/components/EditarEtapaModal';
import { EditarPipelineModal } from '@/crm/components/EditarPipelineModal';
import { NovaEtapaModal } from '@/crm/components/NovaEtapaModal';
import { NovoPipelineModal } from '@/crm/components/NovoPipelineModal';
import { usePipelineEtapasConfig, usePipelinesConfig, useReorderEtapas, useUpdatePipelineEtapaConfig } from '@/crm/hooks/usePipelinesConfig';
import { styled } from '@linaria/react';
import { useState } from 'react';
import {
    IconArrowDown,
    IconArrowUp,
    IconLayoutKanban,
    IconPencil,
    IconPlus,
    IconTrash
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Pipeline, PipelineEtapa } from '~/types/supabase';

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

// Master-detail layout
const StyledMasterDetail = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// ---- Left sidebar ----

const StyledSidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledSidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledSidebarTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledPipelineList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPipelineItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  gap: ${themeCssVariables.spacing[2]};
  transition: background 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
  }

  &[data-selected='true'] {
    background: color-mix(
      in srgb,
      ${themeCssVariables.accent.primary} 12%,
      transparent
    );
  }
`;

const StyledPipelineItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const StyledPipelineItemName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledPipelineItemMeta = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: color-mix(
    in srgb,
    ${themeCssVariables.accent.primary} 15%,
    transparent
  );
  color: ${themeCssVariables.accent.primary};
`;

// Generic icon button (used for edit, delete, move up/down)
const StyledIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }

  &[data-variant='danger']:hover {
    background: color-mix(
      in srgb,
      ${themeCssVariables.font.color.danger} 12%,
      transparent
    );
    color: ${themeCssVariables.font.color.danger};
  }

  &[data-disabled='true'] {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }
`;

// ---- Right panel ----

const StyledDetailPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledPanelTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[12]};
  color: ${themeCssVariables.font.color.secondary};
  text-align: center;
  height: 100%;
`;

const StyledEmptyIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledEmptyText = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
`;

const StyledEtapaTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

// Header row for column labels
const StyledEtapaTableHeader = styled.div`
  display: grid;
  grid-template-columns: 14px 1fr 72px 80px auto;
  gap: ${themeCssVariables.spacing[3]};
  padding: 0 ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledColLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StyledEtapaRow = styled.div`
  display: grid;
  grid-template-columns: 14px 1fr 72px 80px auto;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledCorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const StyledEtapaNome = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledProbBadge = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
  text-align: right;
`;

const StyledTipoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;

  &[data-tipo='aberto'] {
    background: color-mix(in srgb, #3b82f6 15%, transparent);
    color: #3b82f6;
  }

  &[data-tipo='ganho'] {
    background: color-mix(in srgb, #22c55e 15%, transparent);
    color: #22c55e;
  }

  &[data-tipo='perdido'] {
    background: color-mix(in srgb, #ef4444 15%, transparent);
    color: #ef4444;
  }
`;

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

// --------------- Component ---------------

const TIPO_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export const PipelinesConfigPage = () => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null,
  );
  const [novoPipelineOpen, setNovoPipelineOpen] = useState(false);
  const [editarPipelineOpen, setEditarPipelineOpen] = useState(false);
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [novaEtapaOpen, setNovaEtapaOpen] = useState(false);
  const [editarEtapaOpen, setEditarEtapaOpen] = useState(false);
  const [etapaToEdit, setEtapaToEdit] = useState<PipelineEtapa | null>(null);

  const { data: pipelines = [], isLoading: loadingPipelines } =
    usePipelinesConfig();
  const { data: etapas = [], isLoading: loadingEtapas } =
    usePipelineEtapasConfig(selectedPipelineId);

  const updateEtapa = useUpdatePipelineEtapaConfig();
  const reorderEtapas = useReorderEtapas();

  const selectedPipeline =
    pipelines.find((p) => p.id === selectedPipelineId) ?? null;

  const handleMoveUp = (etapa: PipelineEtapa) => {
    const idx = etapas.findIndex((e) => e.id === etapa.id);
    if (idx <= 0) return;
    const newOrder = [...etapas];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    reorderEtapas.mutate(newOrder.map((e, i) => ({ id: e.id, posicao: i })));
  };

  const handleMoveDown = (etapa: PipelineEtapa) => {
    const idx = etapas.findIndex((e) => e.id === etapa.id);
    if (idx === -1 || idx === etapas.length - 1) return;
    const newOrder = [...etapas];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    reorderEtapas.mutate(newOrder.map((e, i) => ({ id: e.id, posicao: i })));
  };

  const handleDeleteEtapa = (etapa: PipelineEtapa) => {
    if (
      !window.confirm(
        `Excluir a etapa "${etapa.nome}"?\nNegócios nesta etapa permanecerão no sistema mas sem etapa vinculada.`,
      )
    )
      return;
    updateEtapa.mutate({ id: etapa.id, is_active: false });
  };

  const handleEditPipeline = (
    pipeline: Pipeline,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setPipelineToEdit(pipeline);
    setEditarPipelineOpen(true);
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Pipelines e Etapas</StyledPageTitle>
          <StyledPageSubtitle>
            Gerencie seus funis de vendas e configure as etapas de cada pipeline
          </StyledPageSubtitle>
        </StyledHeaderText>
      </StyledPageHeader>

      <StyledMasterDetail>
        {/* ── Left sidebar: pipeline list ── */}
        <StyledSidebar>
          <StyledSidebarHeader>
            <StyledSidebarTitle>Pipelines</StyledSidebarTitle>
            <Button
              size="small"
              variant="tertiary"
              Icon={IconPlus}
              title="Novo"
              onClick={() => setNovoPipelineOpen(true)}
            />
          </StyledSidebarHeader>

          <StyledPipelineList>
            {loadingPipelines && (
              <StyledEmptyText style={{ padding: '16px', textAlign: 'center' }}>
                Carregando...
              </StyledEmptyText>
            )}
            {!loadingPipelines && pipelines.length === 0 && (
              <StyledEmptyText style={{ padding: '16px', textAlign: 'center' }}>
                Nenhum pipeline cadastrado
              </StyledEmptyText>
            )}
            {pipelines.map((pipeline) => (
              <StyledPipelineItem
                key={pipeline.id}
                data-selected={String(pipeline.id === selectedPipelineId)}
                onClick={() => setSelectedPipelineId(pipeline.id)}
              >
                <StyledPipelineItemInfo>
                  <StyledPipelineItemName>
                    {pipeline.nome}
                    {pipeline.is_default && (
                      <>
                        {' '}
                        <StyledBadge>Padrão</StyledBadge>
                      </>
                    )}
                  </StyledPipelineItemName>
                  {!pipeline.is_active && (
                    <StyledPipelineItemMeta>Inativo</StyledPipelineItemMeta>
                  )}
                </StyledPipelineItemInfo>
                <StyledIconBtn
                  onClick={(e) => handleEditPipeline(pipeline, e)}
                  title="Editar pipeline"
                >
                  <IconPencil size={14} />
                </StyledIconBtn>
              </StyledPipelineItem>
            ))}
          </StyledPipelineList>
        </StyledSidebar>

        {/* ── Right panel: etapas ── */}
        <StyledDetailPanel>
          {!selectedPipeline ? (
            <StyledEmptyState>
              <StyledEmptyIcon>
                <IconLayoutKanban size={40} />
              </StyledEmptyIcon>
              <StyledEmptyText>
                Selecione um pipeline à esquerda para gerenciar suas etapas.
              </StyledEmptyText>
            </StyledEmptyState>
          ) : (
            <>
              <StyledPanelHeader>
                <StyledPanelTitle>{selectedPipeline.nome}</StyledPanelTitle>
                <Button
                  size="small"
                  variant="primary"
                  Icon={IconPlus}
                  title="Nova Etapa"
                  onClick={() => setNovaEtapaOpen(true)}
                />
              </StyledPanelHeader>

              <StyledPanelBody>
                {loadingEtapas && (
                  <StyledEmptyState>
                    <StyledEmptyText>Carregando etapas...</StyledEmptyText>
                  </StyledEmptyState>
                )}

                {!loadingEtapas && etapas.length === 0 && (
                  <StyledEmptyState>
                    <StyledEmptyIcon>
                      <IconLayoutKanban size={32} />
                    </StyledEmptyIcon>
                    <StyledEmptyText>
                      Nenhuma etapa cadastrada para este pipeline.
                      <br />
                      Clique em "Nova Etapa" para começar.
                    </StyledEmptyText>
                    <Button
                      size="small"
                      variant="secondary"
                      Icon={IconPlus}
                      title="Criar primeira etapa"
                      onClick={() => setNovaEtapaOpen(true)}
                    />
                  </StyledEmptyState>
                )}

                {!loadingEtapas && etapas.length > 0 && (
                  <StyledEtapaTable>
                    <StyledEtapaTableHeader>
                      <StyledColLabel />
                      <StyledColLabel>Nome</StyledColLabel>
                      <StyledColLabel>Prob.</StyledColLabel>
                      <StyledColLabel>Tipo</StyledColLabel>
                      <StyledColLabel>Ações</StyledColLabel>
                    </StyledEtapaTableHeader>

                    {etapas.map((etapa, idx) => (
                      <StyledEtapaRow key={etapa.id}>
                        <StyledCorDot style={{ background: etapa.cor }} />
                        <StyledEtapaNome>{etapa.nome}</StyledEtapaNome>
                        <StyledProbBadge>
                          {etapa.probabilidade}%
                        </StyledProbBadge>
                        <StyledTipoBadge data-tipo={etapa.tipo}>
                          {TIPO_LABELS[etapa.tipo] ?? etapa.tipo}
                        </StyledTipoBadge>
                        <StyledActions>
                          <StyledIconBtn
                            data-disabled={String(idx === 0)}
                            onClick={() => handleMoveUp(etapa)}
                            title="Mover para cima"
                          >
                            <IconArrowUp size={14} />
                          </StyledIconBtn>
                          <StyledIconBtn
                            data-disabled={String(
                              idx === etapas.length - 1,
                            )}
                            onClick={() => handleMoveDown(etapa)}
                            title="Mover para baixo"
                          >
                            <IconArrowDown size={14} />
                          </StyledIconBtn>
                          <StyledIconBtn
                            onClick={() => {
                              setEtapaToEdit(etapa);
                              setEditarEtapaOpen(true);
                            }}
                            title="Editar etapa"
                          >
                            <IconPencil size={14} />
                          </StyledIconBtn>
                          <StyledIconBtn
                            data-variant="danger"
                            onClick={() => handleDeleteEtapa(etapa)}
                            title="Excluir etapa"
                          >
                            <IconTrash size={14} />
                          </StyledIconBtn>
                        </StyledActions>
                      </StyledEtapaRow>
                    ))}
                  </StyledEtapaTable>
                )}
              </StyledPanelBody>
            </>
          )}
        </StyledDetailPanel>
      </StyledMasterDetail>

      {/* ── Modals ── */}
      <NovoPipelineModal
        isOpen={novoPipelineOpen}
        onClose={() => setNovoPipelineOpen(false)}
      />

      {pipelineToEdit !== null && (
        <EditarPipelineModal
          isOpen={editarPipelineOpen}
          pipeline={pipelineToEdit}
          onClose={() => {
            setEditarPipelineOpen(false);
            setPipelineToEdit(null);
          }}
        />
      )}

      {selectedPipelineId !== null && (
        <NovaEtapaModal
          isOpen={novaEtapaOpen}
          pipelineId={selectedPipelineId}
          nextPosicao={etapas.length}
          onClose={() => setNovaEtapaOpen(false)}
        />
      )}

      {etapaToEdit !== null && (
        <EditarEtapaModal
          isOpen={editarEtapaOpen}
          etapa={etapaToEdit}
          onClose={() => {
            setEditarEtapaOpen(false);
            setEtapaToEdit(null);
          }}
        />
      )}
    </StyledPageContainer>
  );
};
