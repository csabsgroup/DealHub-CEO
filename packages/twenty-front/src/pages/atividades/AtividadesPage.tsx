import { EditarAtividadeModal } from '@/crm/components/EditarAtividadeModal';
import { NovaAtividadeModal } from '@/crm/components/NovaAtividadeModal';
import { useTodasAtividades, useUpdateAtividade } from '@/crm/hooks/useAtividades';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Atividade, AtividadeComDetalhesGlobal } from '~/types/supabase';

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
  margin: 2px 0 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  color: ${themeCssVariables.font.color.secondary};

  &[data-variant='danger'] {
    color: ${themeCssVariables.color.red};
  }

  &[data-variant='today'] {
    color: ${themeCssVariables.accent.primary};
  }
`;

const StyledSectionCount = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 10px;
  background: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    border-color: ${themeCssVariables.border.color.medium};
  }

  &[data-overdue='true'] {
    border-left: 3px solid ${themeCssVariables.color.red};
  }

  &[data-done='true'] {
    opacity: 0.55;
  }
`;

const StyledColorDot = styled.span`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
`;

const StyledCardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledCardTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledCardMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMetaText = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledNegocioLink = styled.button`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.accent.primary};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledCardActions = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const StyledToggleButton = styled.button`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  background: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.quaternary};
  }

  &[data-done='true'] {
    background: rgba(34, 197, 94, 0.1);
    color: rgb(22, 163, 74);
    border-color: rgba(34, 197, 94, 0.25);
  }
`;

const StyledEmptySection = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

// --------------- Helpers ---------------

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

type Section = {
  key: string;
  label: string;
  variant: 'danger' | 'today' | 'default';
  items: AtividadeComDetalhesGlobal[];
};

const buildSections = (
  atividades: AtividadeComDetalhesGlobal[],
): Section[] => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = startOfDay(new Date(now.getTime() + 86400000));

  const atrasadas: AtividadeComDetalhesGlobal[] = [];
  const hoje: AtividadeComDetalhesGlobal[] = [];
  const proximas: AtividadeComDetalhesGlobal[] = [];
  const semData: AtividadeComDetalhesGlobal[] = [];
  const concluidas: AtividadeComDetalhesGlobal[] = [];

  for (const a of atividades) {
    if (a.status === 'Concluída' || a.status === 'Cancelada') {
      concluidas.push(a);
      continue;
    }
    if (!a.data_inicio) {
      semData.push(a);
      continue;
    }
    const d = new Date(a.data_inicio);
    if (d < todayStart) {
      atrasadas.push(a);
    } else if (d < tomorrowStart) {
      hoje.push(a);
    } else {
      proximas.push(a);
    }
  }

  return [
    { key: 'atrasadas', label: 'Atrasadas', variant: 'danger', items: atrasadas },
    { key: 'hoje', label: 'Hoje', variant: 'today', items: hoje },
    { key: 'proximas', label: 'Próximas', variant: 'default', items: proximas },
    { key: 'sem-data', label: 'Sem data agendada', variant: 'default', items: semData },
    { key: 'concluidas', label: 'Concluídas', variant: 'default', items: concluidas },
  ];
};

// --------------- Sub-component: Card ---------------

type AtividadeCardProps = {
  atividade: AtividadeComDetalhesGlobal;
  onEdit: (a: AtividadeComDetalhesGlobal) => void;
  onToggle: (a: AtividadeComDetalhesGlobal) => void;
  onNegocioClick: (negocioId: string) => void;
};

const AtividadeCard = ({
  atividade,
  onEdit,
  onToggle,
  onNegocioClick,
}: AtividadeCardProps) => {
  const isDone = atividade.status === 'Concluída';
  const isOverdue =
    !isDone &&
    !!atividade.data_inicio &&
    new Date(atividade.data_inicio) < new Date();

  return (
    <StyledCard
      data-done={isDone ? 'true' : 'false'}
      data-overdue={isOverdue ? 'true' : 'false'}
      onClick={() => onEdit(atividade)}
    >
      <StyledColorDot
        style={{
          backgroundColor: atividade.tipos_atividade?.cor ?? '#9ca3af',
        }}
      />
      <StyledCardBody>
        <StyledCardTitle>{atividade.titulo}</StyledCardTitle>
        <StyledCardMeta>
          {atividade.tipos_atividade && (
            <StyledMetaText>{atividade.tipos_atividade.nome}</StyledMetaText>
          )}
          {atividade.data_inicio && (
            <StyledMetaText>{formatDateTime(atividade.data_inicio)}</StyledMetaText>
          )}
          {atividade.profiles?.full_name && (
            <StyledMetaText>{atividade.profiles.full_name}</StyledMetaText>
          )}
          {atividade.negocios && (
            <StyledNegocioLink
              onClick={(e) => {
                e.stopPropagation();
                onNegocioClick(atividade.negocios!.id);
              }}
            >
              {atividade.negocios.titulo}
            </StyledNegocioLink>
          )}
        </StyledCardMeta>
      </StyledCardBody>
      <StyledCardActions>
        <StyledToggleButton
          data-done={isDone ? 'true' : 'false'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(atividade);
          }}
        >
          {isDone ? '✓ Concluída' : 'Concluir'}
        </StyledToggleButton>
      </StyledCardActions>
    </StyledCard>
  );
};

// --------------- Page ---------------

export const AtividadesPage = () => {
  const [isNovaOpen, setIsNovaOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AtividadeComDetalhesGlobal | null>(null);

  const { data: atividades, isLoading, isError } = useTodasAtividades();
  const { mutateAsync: updateAtividade } = useUpdateAtividade();
  const navigate = useNavigate();

  const sections = useMemo(
    () => buildSections(atividades ?? []),
    [atividades],
  );

  const total = atividades?.length ?? 0;
  const pendentes = (atividades ?? []).filter(
    (a) => a.status !== 'Concluída' && a.status !== 'Cancelada',
  ).length;

  const handleToggle = async (a: AtividadeComDetalhesGlobal) => {
    const novoConcluida = a.status !== 'Concluída';
    await updateAtividade({
      id: a.id,
      status: novoConcluida ? 'Concluída' : 'Pendente',
      completed_at: novoConcluida ? new Date().toISOString() : null,
    });
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <div>
          <StyledPageTitle>Agenda de Atividades</StyledPageTitle>
          {!isLoading && (
            <StyledPageSubtitle>
              {pendentes} pendente{pendentes !== 1 ? 's' : ''} · {total} no total
            </StyledPageSubtitle>
          )}
        </div>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Nova Atividade"
          Icon={IconPlus}
          onClick={() => setIsNovaOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingState>Carregando atividades...</StyledLoadingState>
        )}

        {isError && (
          <StyledLoadingState>
            Erro ao carregar. Tente novamente.
          </StyledLoadingState>
        )}

        {!isLoading &&
          !isError &&
          sections.map((section) => {
            if (section.items.length === 0) return null;
            return (
              <StyledSection key={section.key}>
                <StyledSectionHeader>
                  <StyledSectionTitle data-variant={section.variant}>
                    {section.label}
                  </StyledSectionTitle>
                  <StyledSectionCount>{section.items.length}</StyledSectionCount>
                </StyledSectionHeader>
                <StyledCardList>
                  {section.items.map((a) => (
                    <AtividadeCard
                      key={a.id}
                      atividade={a}
                      onEdit={(x) => setEditTarget(x)}
                      onToggle={handleToggle}
                      onNegocioClick={(id) => navigate(`/negocios/${id}`)}
                    />
                  ))}
                </StyledCardList>
              </StyledSection>
            );
          })}

        {!isLoading && !isError && total === 0 && (
          <StyledLoadingState>
            Nenhuma atividade encontrada. Clique em &quot;Nova Atividade&quot; para começar.
          </StyledLoadingState>
        )}
      </StyledPageBody>

      <NovaAtividadeModal
        isOpen={isNovaOpen}
        onClose={() => setIsNovaOpen(false)}
      />

      {editTarget !== null && (
        <EditarAtividadeModal
          isOpen={true}
          initialData={editTarget as Atividade}
          onClose={() => setEditTarget(null)}
        />
      )}
    </StyledPageContainer>
  );
};


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
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);
  const [deletingAtividade, setDeletingAtividade] = useState<Atividade | null>(null);

  const { data: atividades, isLoading, isError } = useAtividades();
  const { mutateAsync: deleteAtividade, isPending: isDeleting } = useDeleteAtividade();

  const handleDelete = useCallback(async () => {
    if (!deletingAtividade) return;
    try {
      await deleteAtividade({ id: deletingAtividade.id });
      setDeletingAtividade(null);
    } catch {
      // error handled by mutation
    }
  }, [deletingAtividade, deleteAtividade]);

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
                  <StyledTh style={{ textAlign: 'center' }}>Ações</StyledTh>
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
                    <StyledActionsCell>
                      <StyledActionsRow>
                        <IconButton
                          Icon={IconPencil}
                          size="small"
                          variant="tertiary"
                          onClick={() => setEditingAtividade(atividade)}
                        />
                        <IconButton
                          Icon={IconTrash}
                          size="small"
                          variant="tertiary"
                          accent="danger"
                          onClick={() => setDeletingAtividade(atividade)}
                        />
                      </StyledActionsRow>
                    </StyledActionsCell>
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

      {editingAtividade && (
        <EditarAtividadeModal
          isOpen={!!editingAtividade}
          onClose={() => setEditingAtividade(null)}
          initialData={editingAtividade}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingAtividade}
        onClose={() => setDeletingAtividade(null)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        entityName="atividade"
        entityLabel={deletingAtividade?.titulo}
      />
    </StyledPageContainer>
  );
};
