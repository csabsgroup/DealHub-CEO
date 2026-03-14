import { useUpdateNegocio } from '@/crm/hooks/useNegocios';
import { useMotivosPerda } from '@/crm/hooks/usePipelines';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconAlertTriangle } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Negocio } from '~/types/supabase';

// --------------- Types ---------------

type MarcarPerdaModalProps = {
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
  color: ${themeCssVariables.font.color.danger};
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

const StyledSelect = styled.select`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;
  cursor: pointer;

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
  resize: vertical;
  min-height: 72px;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;

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

const StyledPerdaButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: ${themeCssVariables.font.color.danger};
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

export const MarcarPerdaModal = ({
  isOpen,
  onClose,
  negocio,
}: MarcarPerdaModalProps) => {
  const [motivoId, setMotivoId] = useState('');
  const [detalhe, setDetalhe] = useState('');

  const { data: motivosRaw, isLoading: loadingMotivos } = useMotivosPerda();
  const { mutate: updateNegocio, isPending } = useUpdateNegocio();

  const motivos = motivosRaw ?? [];

  const handleConfirm = () => {
    if (!motivoId) return;

    updateNegocio(
      {
        id: negocio.id,
        status_final: 'Perdido',
        data_fechamento_real: new Date().toISOString(),
        motivo_perda_id: motivoId,
        motivo_perda_detalhe: detalhe.trim() || null,
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
              <IconAlertTriangle size={20} />
            </StyledIconWrapper>
            Marcar como Perdido
          </StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledBody>
            <StyledMessage>
              Registre o motivo pelo qual{' '}
              <strong>&ldquo;{negocio.titulo}&rdquo;</strong> foi{' '}
              <strong>PERDIDO</strong>. Essa informação é essencial para análise
              comercial.
            </StyledMessage>

            <StyledFieldGroup>
              <StyledLabel>
                Motivo da Perda
                <StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledSelect
                value={motivoId}
                onChange={(e) => setMotivoId(e.target.value)}
                disabled={loadingMotivos}
              >
                <option value="">
                  {loadingMotivos ? 'Carregando...' : 'Selecione o motivo...'}
                </option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel>Observação adicional (opcional)</StyledLabel>
              <StyledTextarea
                placeholder="Descreva o contexto da perda, se necessário..."
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                maxLength={500}
              />
            </StyledFieldGroup>
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
            <StyledPerdaButton
              onClick={handleConfirm}
              disabled={isPending || !motivoId}
            >
              <IconAlertTriangle size={14} />
              {isPending ? 'Salvando...' : 'Confirmar Perda'}
            </StyledPerdaButton>
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
