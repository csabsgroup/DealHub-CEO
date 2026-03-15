import {
  useDeleteTipoAtividade,
  useTiposAtividade,
} from '@/crm/hooks/useTiposAtividade';
import { EditarTipoAtividadeModal } from '@/crm/components/EditarTipoAtividadeModal';
import { NovoTipoAtividadeModal } from '@/crm/components/NovoTipoAtividadeModal';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconPencil, IconPlus, IconTrash } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { TipoAtividade } from '~/types/supabase';

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

const StyledAddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: ${themeCssVariables.accent.primary};
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 600px;
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledColorDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledNome = styled.span`
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledIconeTag = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: 2px 8px;
`;

const StyledActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: transparent;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.primary};
  }

  &[data-danger='true']:hover {
    background: rgba(239, 68, 68, 0.1);
    color: ${themeCssVariables.font.color.danger};
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[12]};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 600px;
`;

const StyledLoadingText = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[6]} 0;
`;

// --------------- Component ---------------

export const TiposAtividadeConfigPage = () => {
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [editandoTipo, setEditandoTipo] = useState<TipoAtividade | null>(null);

  const { data: tipos, isLoading } = useTiposAtividade({ includeInativos: true });
  const deleteTipo = useDeleteTipoAtividade();

  const handleDelete = async (tipo: TipoAtividade) => {
    if (!confirm(`Desativar o tipo "${tipo.nome}"? Ele não aparecerá mais nas opções.`)) return;
    try {
      await deleteTipo.mutateAsync({
        id: tipo.id,
        deleted_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erro Supabase:', err);
      alert('Erro ao desativar tipo. Tente novamente.');
    }
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Tipos de Atividade</StyledPageTitle>
          <StyledPageSubtitle>
            Configure os tipos de atividade disponíveis para sua equipe (ligação, reunião, e-mail, etc.)
          </StyledPageSubtitle>
        </StyledHeaderText>

        <StyledAddButton onClick={() => setIsNovoModalOpen(true)}>
          <IconPlus size={16} />
          Novo Tipo
        </StyledAddButton>
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingText>Carregando tipos de atividade...</StyledLoadingText>
        )}

        {!isLoading && (!tipos || tipos.length === 0) && (
          <StyledEmptyState>
            <span>Nenhum tipo de atividade cadastrado.</span>
            <span>Clique em "Novo Tipo" para adicionar o primeiro.</span>
          </StyledEmptyState>
        )}

        {!isLoading && tipos && tipos.length > 0 && (
          <StyledList>
            {tipos.map((tipo) => (
              <StyledRow key={tipo.id}>
                <StyledColorDot style={{ background: tipo.cor }} />
                <StyledNome>{tipo.nome}</StyledNome>
                <StyledIconeTag>{tipo.icone}</StyledIconeTag>

                <StyledActionButton
                  title="Editar"
                  onClick={() => setEditandoTipo(tipo)}
                >
                  <IconPencil size={14} />
                </StyledActionButton>

                <StyledActionButton
                  data-danger="true"
                  title="Desativar"
                  onClick={() => handleDelete(tipo)}
                >
                  <IconTrash size={14} />
                </StyledActionButton>
              </StyledRow>
            ))}
          </StyledList>
        )}
      </StyledPageBody>

      <NovoTipoAtividadeModal
        isOpen={isNovoModalOpen}
        onClose={() => setIsNovoModalOpen(false)}
      />

      {editandoTipo && (
        <EditarTipoAtividadeModal
          isOpen={true}
          tipo={editandoTipo}
          onClose={() => setEditandoTipo(null)}
        />
      )}
    </StyledPageContainer>
  );
};
