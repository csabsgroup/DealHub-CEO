import { styled } from '@linaria/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCreatePipelineConfig } from '~/modules/crm/hooks/usePipelinesConfig';
import type { PipelineInsert } from '~/types/supabase';

// --------------- Types ---------------

type NovoPipelineModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// --------------- Styled Components ---------------

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRequired = styled.span`
  color: ${themeCssVariables.font.color.danger};
  margin-left: 2px;
`;

const StyledInput = styled.input`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledTextarea = styled.textarea`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  resize: none;
  font-family: inherit;
  min-height: 64px;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledCheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledError = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledModalBox = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  width: 480px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const StyledModalHeader = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledModalContent = styled.div`
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledModalFooter = styled.div`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
`;

// --------------- Component ---------------

const EMPTY_NOME = '';

export const NovoPipelineModal = ({ isOpen, onClose }: NovoPipelineModalProps) => {
  const [nome, setNome] = useState(EMPTY_NOME);
  const [descricao, setDescricao] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  const createPipeline = useCreatePipelineConfig();

  const handleClose = () => {
    setNome(EMPTY_NOME);
    setDescricao('');
    setIsDefault(false);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('O nome do pipeline é obrigatório.');
      return;
    }
    setError('');

    const payload: PipelineInsert = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      is_default: isDefault,
      is_active: true,
    };

    try {
      await createPipeline.mutateAsync(payload);
      handleClose();
    } catch (err) {
      console.error('Erro Supabase:', err);
      setError('Erro ao salvar pipeline. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <StyledOverlay onClick={handleClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Novo Pipeline</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
        <StyledForm id="novo-pipeline-form" onSubmit={(e) => { e.preventDefault(); }}>
          <StyledFieldGroup>
            <StyledLabel htmlFor="np-nome">
              Nome <StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="np-nome"
              type="text"
              placeholder="Ex: Pipeline Comercial"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="np-descricao">Descrição</StyledLabel>
            <StyledTextarea
              id="np-descricao"
              placeholder="Descreva o objetivo deste pipeline (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </StyledFieldGroup>

          <StyledCheckboxRow>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            Pipeline padrão do workspace
          </StyledCheckboxRow>

          {error && <StyledError>{error}</StyledError>}
        </StyledForm>
        </StyledModalContent>

        <StyledModalFooter>
          <Button
            size="small"
            variant="secondary"
            title="Cancelar"
            onClick={handleClose}
          />
          <Button
            size="small"
            variant="primary"
            title="Criar Pipeline"
            onClick={handleSubmit}
            disabled={createPipeline.isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  );
};
