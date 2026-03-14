import { useUpdateNegocio } from '@/crm/hooks/useNegocios';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconCheck } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Negocio } from '~/types/supabase';

// --------------- Types ---------------

type MarcarGanhoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  negocio: Negocio;
};

// --------------- Styled Components ---------------

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconWrapper = styled.span`
  display: inline-flex;
  color: #22c55e;
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[4]} 0;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMessage = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  line-height: 1.5;
`;

const StyledFieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[4]};
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

const StyledInput = styled.input`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledGanhoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: #22c55e;
  color: #ffffff;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// --------------- Component ---------------

export const MarcarGanhoModal = ({
  isOpen,
  onClose,
  negocio,
}: MarcarGanhoModalProps) => {
  const [valorSetup, setValorSetup] = useState(
    String(negocio.valor_setup ?? ''),
  );
  const [valorRecorrente, setValorRecorrente] = useState(
    String(negocio.valor_mensalidade ?? ''),
  );

  const { mutate: updateNegocio, isPending } = useUpdateNegocio();

  const handleConfirm = () => {
    updateNegocio(
      {
        id: negocio.id,
        status_final: 'Ganho',
        data_fechamento_real: new Date().toISOString(),
        valor_setup: valorSetup !== '' ? Number(valorSetup) : null,
        valor_mensalidade: valorRecorrente !== '' ? Number(valorRecorrente) : null,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Modal isOpen={isOpen} size="small" onBackdropMouseDown={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>
            <StyledIconWrapper>
              <IconCheck size={20} />
            </StyledIconWrapper>
            Marcar como Ganho
          </StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledBody>
            <StyledMessage>
              Confirma o fechamento de{' '}
              <strong>&ldquo;{negocio.titulo}&rdquo;</strong> como{' '}
              <strong>GANHO</strong>? Revise os valores finais antes de
              confirmar.
            </StyledMessage>

            <StyledFieldGrid>
              <StyledFieldGroup>
                <StyledLabel>Valor Setup (R$)</StyledLabel>
                <StyledInput
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={valorSetup}
                  onChange={(e) => setValorSetup(e.target.value)}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel>Valor Recorrente / Mês (R$)</StyledLabel>
                <StyledInput
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={valorRecorrente}
                  onChange={(e) => setValorRecorrente(e.target.value)}
                />
              </StyledFieldGroup>
            </StyledFieldGrid>
          </StyledBody>
        </ModalContent>

        <ModalFooter>
          <StyledFooter>
            <Button
              title="Cancelar"
              variant="tertiary"
              size="small"
              onClick={onClose}
              disabled={isPending}
            />
            <StyledGanhoButton onClick={handleConfirm} disabled={isPending}>
              <IconCheck size={14} />
              {isPending ? 'Salvando...' : 'Confirmar Ganho'}
            </StyledGanhoButton>
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
