import { useNegocios } from '@/crm/hooks/useNegocios';
import { useUpdateProposta } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Proposta, PropostaStatus } from '~/types/supabase';

// --------------- Types ---------------

type EditarPropostaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Proposta;
};

type PropostaFormData = {
  numero: string;
  negocio_id: string;
  status: PropostaStatus;
  valor_setup: string;
  valor_mensalidade: string;
  validade_dias: string;
  observacoes: string;
};

const STATUS_LIST: PropostaStatus[] = [
  'Rascunho',
  'Enviada',
  'Aceita',
  'Recusada',
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

const StyledField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledFieldTriple = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${themeCssVariables.spacing[4]};
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
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
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
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledTextarea = styled.textarea`
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledErrorMessage = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

// --------------- Component ---------------

export const EditarPropostaModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarPropostaModalProps) => {
  const [formData, setFormData] = useState<PropostaFormData>({
    numero: '',
    negocio_id: '',
    status: 'Rascunho',
    valor_setup: '',
    valor_mensalidade: '',
    validade_dias: '30',
    observacoes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: negocios } = useNegocios();
  const { mutateAsync: updateProposta, isPending } = useUpdateProposta();

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        numero: initialData.numero ?? '',
        negocio_id: initialData.negocio_id ?? '',
        status: initialData.status ?? 'Rascunho',
        valor_setup: initialData.valor_setup != null
          ? String(initialData.valor_setup)
          : '',
        valor_mensalidade: initialData.valor_mensalidade != null
          ? String(initialData.valor_mensalidade)
          : '',
        validade_dias: initialData.validade_dias != null
          ? String(initialData.validade_dias)
          : '30',
        observacoes: initialData.observacoes ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      setErrorMessage('Número da proposta é obrigatório.');
      return;
    }

    const valorSetup = parseFloat(formData.valor_setup) || 0;
    const valorMensalidade = parseFloat(formData.valor_mensalidade) || 0;
    const validadeDias = parseInt(formData.validade_dias) || 30;

    try {
      await updateProposta({
        id: initialData.id,
        numero: formData.numero.trim(),
        negocio_id: formData.negocio_id || null,
        status: formData.status,
        valor_setup: valorSetup,
        valor_mensalidade: valorMensalidade,
        valor_total: valorSetup + valorMensalidade,
        validade_dias: validadeDias,
        observacoes: formData.observacoes.trim() || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar proposta.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Proposta</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-proposta-form"
            ref={formRef}
          >
            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-numero">
                  Número<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledInput
                  id="edit-numero"
                  name="numero"
                  type="text"
                  placeholder="Ex: PROP-2025-001"
                  value={formData.numero}
                  onChange={handleChange}
                  autoFocus
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-status">Status</StyledLabel>
                <StyledSelect
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-negocio_id">
                Negócio Vinculado
              </StyledLabel>
              <StyledSelect
                id="edit-negocio_id"
                name="negocio_id"
                value={formData.negocio_id}
                onChange={handleChange}
              >
                <option value="">Sem negócio</option>
                {negocios?.map((neg) => (
                  <option key={neg.id} value={neg.id}>
                    {neg.titulo}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldTriple>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-valor_setup">
                  Valor Setup (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-valor_setup"
                  name="valor_setup"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_setup}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-valor_mensalidade">
                  Mensalidade (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-valor_mensalidade"
                  name="valor_mensalidade"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_mensalidade}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-validade_dias">
                  Validade (dias)
                </StyledLabel>
                <StyledInput
                  id="edit-validade_dias"
                  name="validade_dias"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.validade_dias}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledFieldTriple>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-observacoes">Observações</StyledLabel>
              <StyledTextarea
                id="edit-observacoes"
                name="observacoes"
                placeholder="Condições especiais, descontos, observações..."
                value={formData.observacoes}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            {errorMessage && (
              <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
            )}
          </StyledForm>
        </ModalContent>

        <ModalFooter>
          <StyledFooter>
            <Button
              variant="secondary"
              accent="default"
              size="medium"
              title="Cancelar"
              onClick={handleClose}
              disabled={isPending}
            />
            <Button
              variant="primary"
              accent="blue"
              size="medium"
              title={isPending ? 'Salvando...' : 'Salvar Alterações'}
              type="submit"
              form="editar-proposta-form"
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
