import { EditarAtividadeModal } from '@/crm/components/EditarAtividadeModal';
import { NovaAtividadeModal } from '@/crm/components/NovaAtividadeModal';
import {
    useAtividadesPorNegocio,
    useUpdateAtividade,
} from '@/crm/hooks/useAtividades';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Atividade, AtividadeComDetalhes } from '~/types/supabase';

// --------------- Types ---------------

type NegocioAtividadesTabProps = {
  negocioId: string;
};

// --------------- Helpers ---------------

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --------------- Styled Components ---------------

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledHeading = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledEmptyState = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  text-align: center;
  padding: ${themeCssVariables.spacing[8]} 0;
  margin: 0;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    border-color: ${themeCssVariables.border.color.medium};
  }

  &[data-done='true'] {
    opacity: 0.6;
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
  gap: ${themeCssVariables.spacing[1]};
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
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
`;

const StyledMetaText = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledBadge = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 1px 6px;
  border-radius: 10px;
  background: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.secondary};
  font-weight: 500;
`;

const StyledCardActions = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const StyledToggleButton = styled.button`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  background: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.quaternary};
  }

  &[data-done='true'] {
    background: rgba(34, 197, 94, 0.12);
    color: rgb(22, 163, 74);
    border-color: rgba(34, 197, 94, 0.2);
  }
`;

// --------------- Component ---------------

export const NegocioAtividadesTab = ({
  negocioId,
}: NegocioAtividadesTabProps) => {
  const [showNova, setShowNova] = useState(false);
  const [editTarget, setEditTarget] = useState<AtividadeComDetalhes | null>(
    null,
  );

  const { data: atividades, isLoading } = useAtividadesPorNegocio(negocioId);
  const { mutateAsync: updateAtividade } = useUpdateAtividade();

  const handleToggle = async (
    a: AtividadeComDetalhes,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const novoConcluida = a.status !== 'Concluída';
    await updateAtividade({
      id: a.id,
      status: novoConcluida ? 'Concluída' : 'Pendente',
      completed_at: novoConcluida ? new Date().toISOString() : null,
    });
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeading>Atividades</StyledHeading>
        <Button
          size="small"
          variant="primary"
          title="+ Nova Atividade"
          onClick={() => setShowNova(true)}
        />
      </StyledHeader>

      {isLoading && (
        <StyledEmptyState>Carregando atividades...</StyledEmptyState>
      )}

      {!isLoading && (!atividades || atividades.length === 0) && (
        <StyledEmptyState>
          Nenhuma atividade registrada para este negócio.
        </StyledEmptyState>
      )}

      {!isLoading && atividades && atividades.length > 0 && (
        <StyledList>
          {atividades.map((a) => (
            <StyledCard
              key={a.id}
              data-done={a.status === 'Concluída' ? 'true' : 'false'}
              onClick={() => setEditTarget(a)}
            >
              <StyledColorDot
                style={{
                  backgroundColor: a.tipos_atividade?.cor ?? '#888888',
                }}
              />
              <StyledCardBody>
                <StyledCardTitle>{a.titulo}</StyledCardTitle>
                <StyledCardMeta>
                  {a.tipos_atividade && (
                    <StyledBadge>{a.tipos_atividade.nome}</StyledBadge>
                  )}
                  {a.profiles?.full_name && (
                    <StyledMetaText>{a.profiles.full_name}</StyledMetaText>
                  )}
                  {a.data_vencimento && (
                    <StyledMetaText>{formatDate(a.data_vencimento)}</StyledMetaText>
                  )}
                </StyledCardMeta>
              </StyledCardBody>
              <StyledCardActions>
                <StyledToggleButton
                  data-done={a.status === 'Concluída' ? 'true' : 'false'}
                  onClick={(e) => handleToggle(a, e)}
                >
                  {a.status === 'Concluída' ? 'Concluída' : 'Pendente'}
                </StyledToggleButton>
              </StyledCardActions>
            </StyledCard>
          ))}
        </StyledList>
      )}

      <NovaAtividadeModal
        isOpen={showNova}
        negocioId={negocioId}
        onClose={() => setShowNova(false)}
      />

      {editTarget !== null && (
        <EditarAtividadeModal
          isOpen={true}
          initialData={editTarget as Atividade}
          onClose={() => setEditTarget(null)}
        />
      )}
    </StyledContainer>
  );
};
