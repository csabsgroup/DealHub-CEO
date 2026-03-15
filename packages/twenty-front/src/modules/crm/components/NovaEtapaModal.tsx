import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCreatePipelineEtapaConfig } from '~/modules/crm/hooks/usePipelinesConfig';
import type { PipelineEtapaInsert, PipelineEtapaTipo } from '~/types/supabase';

// --------------- Types ---------------

type NovaEtapaModalProps = {
  isOpen: boolean;
  pipelineId: string;
  nextPosicao: number;
  onClose: () => void;
};

// --------------- Constants ---------------

const COR_PRESETS = [
  '#6b7280', // cinza
  '#3b82f6', // azul
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#22c55e', // verde
  '#f59e0b', // âmbar
  '#ef4444', // vermelho
  '#14b8a6', // teal
];

const TIPO_OPTIONS: { value: PipelineEtapaTipo; label: string }[] = [
  { value: 'aberto', label: 'Aberto (em andamento)' },
  { value: 'ganho', label: 'Ganho (negócio fechado)' },
  { value: 'perdido', label: 'Perdido (negócio encerrado)' },
];

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

const StyledSelect = styled.select`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledColorGrid = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
`;

// Color swatch - selected state via data-selected attribute (Linaria constraint)
const StyledColorSwatch = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  padding: 0;

  &[data-selected='true'] {
    border-color: ${themeCssVariables.font.color.primary};
    transform: scale(1.15);
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const StyledError = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

const StyledHint = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
`;

// Percentage suffix wrapper
const inputGroupClass = css`
  display: flex;
  align-items: center;
  gap: 0;

  input {
    border-radius: ${themeCssVariables.border.radius.sm} 0 0
      ${themeCssVariables.border.radius.sm};
    flex: 1;
  }
`;

const StyledInputSuffix = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: none;
  border-radius: 0 ${themeCssVariables.border.radius.sm}
    ${themeCssVariables.border.radius.sm} 0;
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  flex-shrink: 0;
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

export const NovaEtapaModal = ({
  isOpen,
  pipelineId,
  nextPosicao,
  onClose,
}: NovaEtapaModalProps) => {
  const [nome, setNome] = useState('');
  const [probabilidade, setProbabilidade] = useState(50);
  const [tipo, setTipo] = useState<PipelineEtapaTipo>('aberto');
  const [cor, setCor] = useState(COR_PRESETS[0]);
  const [error, setError] = useState('');

  const createEtapa = useCreatePipelineEtapaConfig();

  const handleClose = () => {
    setNome('');
    setProbabilidade(50);
    setTipo('aberto');
    setCor(COR_PRESETS[0]);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('O nome da etapa é obrigatório.');
      return;
    }
    const prob = Number(probabilidade);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      setError('Probabilidade deve ser entre 0 e 100.');
      return;
    }
    setError('');

    const payload: PipelineEtapaInsert = {
      pipeline_id: pipelineId,
      nome: nome.trim(),
      posicao: nextPosicao,
      probabilidade: prob,
      tipo,
      cor,
      is_active: true,
    };

    try {
      await createEtapa.mutateAsync(payload);
      handleClose();
    } catch (err) {
      console.error('Erro Supabase:', err);
      setError('Erro ao salvar etapa. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <StyledOverlay onClick={handleClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Nova Etapa</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
        <StyledForm id="nova-etapa-form" onSubmit={(e) => { e.preventDefault(); }}>
          <StyledFieldGroup>
            <StyledLabel htmlFor="ne-nome">
              Nome da etapa <StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="ne-nome"
              type="text"
              placeholder="Ex: Proposta enviada"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </StyledFieldGroup>

          <StyledRow>
            <StyledFieldGroup style={{ flex: 1 }}>
              <StyledLabel htmlFor="ne-prob">Probabilidade de ganho</StyledLabel>
              <div className={inputGroupClass}>
                <StyledInput
                  id="ne-prob"
                  type="number"
                  min={0}
                  max={100}
                  value={probabilidade}
                  onChange={(e) => setProbabilidade(Number(e.target.value))}
                />
                <StyledInputSuffix>%</StyledInputSuffix>
              </div>
            </StyledFieldGroup>

            <StyledFieldGroup style={{ flex: 1 }}>
              <StyledLabel htmlFor="ne-tipo">Tipo da etapa</StyledLabel>
              <StyledSelect
                id="ne-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as PipelineEtapaTipo)}
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>
          </StyledRow>

          <StyledFieldGroup>
            <StyledLabel>Cor da etapa no Kanban</StyledLabel>
            <StyledColorGrid>
              {COR_PRESETS.map((c) => (
                <StyledColorSwatch
                  key={c}
                  type="button"
                  data-selected={String(c === cor)}
                  style={{ background: c }}
                  onClick={() => setCor(c)}
                  title={c}
                />
              ))}
            </StyledColorGrid>
            <StyledHint>
              Cor exibida no cabeçalho da coluna do Kanban
            </StyledHint>
          </StyledFieldGroup>

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
            title="Criar Etapa"
            onClick={handleSubmit}
            disabled={createEtapa.isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  );
};
