import { useCreateContrato } from '@/crm/hooks/useContratos';
import { useNegocios } from '@/crm/hooks/useNegocios';
import { usePropostas } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { ContratoStatus, IndiceReajuste, PeriodicidadeReajuste } from '~/types/supabase';

// --------------- Types ---------------

type NovoContratoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ContratoFormData = {
  deal_id: string;
  proposal_id: string;
  template_id: string;
  status_contrato: ContratoStatus;
  inicio_vigencia: string;
  fim_vigencia: string;
  indice_reajuste: IndiceReajuste | '';
  periodicidade_reajuste: PeriodicidadeReajuste | '';
  assinatura_provider: string;
  link_assinatura: string;
  observacoes: string;
};

const EMPTY_FORM: ContratoFormData = {
  deal_id: '',
  proposal_id: '',
  template_id: '',
  status_contrato: 'Rascunho',
  inicio_vigencia: '',
  fim_vigencia: '',
  indice_reajuste: '',
  periodicidade_reajuste: '',
  assinatura_provider: '',
  link_assinatura: '',
  observacoes: '',
};

const STATUS_OPTIONS: { value: ContratoStatus; label: string }[] = [
  { value: 'Rascunho', label: 'Rascunho' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'assinado parcial', label: 'Assinado Parcial' },
  { value: 'assinado', label: 'Assinado' },
  { value: 'recusado', label: 'Recusado' },
  { value: 'expirado', label: 'Expirado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const INDICE_OPTIONS: { value: IndiceReajuste; label: string }[] = [
  { value: 'IPCA', label: 'IPCA' },
  { value: 'IGPM', label: 'IGP-M' },
  { value: 'INPC', label: 'INPC' },
  { value: 'Custom', label: 'Customizado' },
];

const PERIODICIDADE_OPTIONS: { value: PeriodicidadeReajuste; label: string }[] = [
  { value: 'Mensal', label: 'Mensal' },
  { value: 'Trimestral', label: 'Trimestral' },
  { value: 'Semestral', label: 'Semestral' },
  { value: 'Anual', label: 'Anual' },
  { value: 'Custom', label: 'Customizado' },
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

const StyledTextArea = styled.textarea`
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
  min-height: 80px;
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

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  padding-top: ${themeCssVariables.spacing[2]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

// --------------- Component ---------------

export const NovoContratoModal = ({
  isOpen,
  onClose,
}: NovoContratoModalProps) => {
  const [formData, setFormData] = useState<ContratoFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const { data: negocios } = useNegocios();
  const { data: propostas } = usePropostas();
  const { mutateAsync: createContrato, isPending } = useCreateContrato();

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
    setFormData(EMPTY_FORM);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deal_id) {
      setErrorMessage('Negócio vinculado é obrigatório.');
      return;
    }

    try {
      await createContrato({
        deal_id: formData.deal_id,
        proposal_id: formData.proposal_id || null,
        template_id: formData.template_id.trim() || null,
        status_contrato: formData.status_contrato,
        inicio_vigencia: formData.inicio_vigencia || null,
        fim_vigencia: formData.fim_vigencia || null,
        indice_reajuste: formData.indice_reajuste || null,
        periodicidade_reajuste: formData.periodicidade_reajuste || null,
        assinatura_provider: formData.assinatura_provider.trim() || null,
        link_assinatura: formData.link_assinatura.trim() || null,
        observacoes: formData.observacoes.trim() || null,
      });

      handleClose();
    } catch {
      setErrorMessage('Erro ao criar contrato. Tente novamente.');
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Novo Contrato</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm id="novo-contrato-form" onSubmit={handleSubmit} ref={formRef}>

          {/* Seção: Vínculos */}
          <StyledSectionTitle>Vínculos</StyledSectionTitle>

          {/* Negócio — obrigatório */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="deal_id">
              Negócio<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledSelect
              id="deal_id"
              name="deal_id"
              value={formData.deal_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um negócio...</option>
              {(negocios ?? []).map((negocio) => (
                <option key={negocio.id} value={negocio.id}>
                  {negocio.titulo}
                </option>
              ))}
            </StyledSelect>
          </StyledFieldGroup>

          {/* Proposta de origem — opcional */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="proposal_id">Proposta de Origem</StyledLabel>
            <StyledSelect
              id="proposal_id"
              name="proposal_id"
              value={formData.proposal_id}
              onChange={handleChange}
            >
              <option value="">Nenhuma proposta vinculada</option>
              {(propostas ?? []).map((proposta) => (
                <option key={proposta.id} value={proposta.id}>
                  {proposta.numero}
                </option>
              ))}
            </StyledSelect>
          </StyledFieldGroup>

          {/* Template — opcional */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="template_id">Template</StyledLabel>
            <StyledInput
              id="template_id"
              name="template_id"
              type="text"
              value={formData.template_id}
              onChange={handleChange}
              placeholder="Identificador do template (ex: CONTRATO_PADRAO_BPO)"
            />
          </StyledFieldGroup>

          {/* Seção: Status e Vigência */}
          <StyledSectionTitle>Status e Vigência</StyledSectionTitle>

          {/* Status contrato — obrigatório */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="status_contrato">
              Status<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledSelect
              id="status_contrato"
              name="status_contrato"
              value={formData.status_contrato}
              onChange={handleChange}
              required
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </StyledSelect>
          </StyledFieldGroup>

          {/* Vigência: início e fim */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="inicio_vigencia">Início de Vigência</StyledLabel>
              <StyledInput
                id="inicio_vigencia"
                name="inicio_vigencia"
                type="date"
                value={formData.inicio_vigencia}
                onChange={handleChange}
              />
            </StyledFieldGroup>
            <StyledFieldGroup>
              <StyledLabel htmlFor="fim_vigencia">Fim de Vigência</StyledLabel>
              <StyledInput
                id="fim_vigencia"
                name="fim_vigencia"
                type="date"
                value={formData.fim_vigencia}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Seção: Reajuste */}
          <StyledSectionTitle>Reajuste Contratual</StyledSectionTitle>

          <StyledField>
            {/* Índice de reajuste */}
            <StyledFieldGroup>
              <StyledLabel htmlFor="indice_reajuste">Índice de Reajuste</StyledLabel>
              <StyledSelect
                id="indice_reajuste"
                name="indice_reajuste"
                value={formData.indice_reajuste}
                onChange={handleChange}
              >
                <option value="">Não definido</option>
                {INDICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            {/* Periodicidade de reajuste */}
            <StyledFieldGroup>
              <StyledLabel htmlFor="periodicidade_reajuste">Periodicidade de Reajuste</StyledLabel>
              <StyledSelect
                id="periodicidade_reajuste"
                name="periodicidade_reajuste"
                value={formData.periodicidade_reajuste}
                onChange={handleChange}
              >
                <option value="">Não definida</option>
                {PERIODICIDADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>
          </StyledField>

          {/* Seção: Assinatura Digital */}
          <StyledSectionTitle>Assinatura Digital</StyledSectionTitle>

          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="assinatura_provider">Provedor de Assinatura</StyledLabel>
              <StyledInput
                id="assinatura_provider"
                name="assinatura_provider"
                type="text"
                value={formData.assinatura_provider}
                onChange={handleChange}
                placeholder="Ex: DocuSign, ClickSign, D4Sign"
              />
            </StyledFieldGroup>
            <StyledFieldGroup>
              <StyledLabel htmlFor="link_assinatura">Link de Assinatura</StyledLabel>
              <StyledInput
                id="link_assinatura"
                name="link_assinatura"
                type="url"
                value={formData.link_assinatura}
                onChange={handleChange}
                placeholder="https://..."
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Observações */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="observacoes">Observações</StyledLabel>
            <StyledTextArea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Notas contratuais, cláusulas especiais, informações adicionais..."
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
              title={isPending ? 'Salvando...' : 'Criar Contrato'}
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
