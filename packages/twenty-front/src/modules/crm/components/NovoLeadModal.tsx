import { useCreateLead, useOrigensLead } from '@/crm/hooks/useLeads';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovoLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LeadFormData = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  origem_id: string;
  temperatura: string;
  interesse_principal: string;
  descricao_dor: string;
};

const EMPTY_FORM: LeadFormData = {
  nome: '',
  empresa: '',
  email: '',
  telefone: '',
  origem_id: '',
  temperatura: '',
  interesse_principal: '',
  descricao_dor: '',
};

const TEMPERATURAS = ['Frio', 'Morno', 'Quente'];

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
  min-height: 64px;
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

export const NovoLeadModal = ({ isOpen, onClose }: NovoLeadModalProps) => {
  const [formData, setFormData] = useState<LeadFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createLead, isPending } = useCreateLead();
  const { data: origens } = useOrigensLead();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

    if (!formData.nome.trim()) {
      setErrorMessage('Nome do lead é obrigatório.');
      return;
    }

    try {
      await createLead({
        nome: formData.nome.trim(),
        empresa: formData.empresa.trim() || null,
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim() || null,
        origem_id: formData.origem_id || null,
        origem_detalhe: null,
        canal: null,
        campanha: null,
        interesse_principal: formData.interesse_principal.trim() || null,
        descricao_dor: formData.descricao_dor.trim() || null,
        cnpj: null,
        score: 0,
        temperatura:
          (formData.temperatura as 'Frio' | 'Morno' | 'Quente') || null,
        status_triagem: 'Novo',
        responsavel_id: null,
        unidade_negocio: null,
        data_primeiro_contato: null,
        data_qualificacao: null,
        convertido_empresa_id: null,
        convertido_contato_id: null,
        data_conversao: null,
        observacoes: null,
        tags: [],
        created_by: null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar lead.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Novo Lead</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="novo-lead-form" ref={formRef}>
          {/* Nome - full width */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="lead-nome">
              Nome<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="lead-nome"
              name="nome"
              type="text"
              placeholder="Nome do lead ou contato"
              value={formData.nome}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Empresa + E-mail */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-empresa">Empresa</StyledLabel>
              <StyledInput
                id="lead-empresa"
                name="empresa"
                type="text"
                placeholder="Nome da empresa"
                value={formData.empresa}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-email">E-mail</StyledLabel>
              <StyledInput
                id="lead-email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Telefone + Origem */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-telefone">Telefone</StyledLabel>
              <StyledInput
                id="lead-telefone"
                name="telefone"
                type="text"
                placeholder="(11) 99999-0000"
                value={formData.telefone}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-origem">Origem</StyledLabel>
              <StyledSelect
                id="lead-origem"
                name="origem_id"
                value={formData.origem_id}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {origens?.map((origem) => (
                  <option key={origem.id} value={origem.id}>
                    {origem.nome}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>
          </StyledField>

          {/* Temperatura + Interesse */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-temperatura">Temperatura</StyledLabel>
              <StyledSelect
                id="lead-temperatura"
                name="temperatura"
                value={formData.temperatura}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {TEMPERATURAS.map((temp) => (
                  <option key={temp} value={temp}>
                    {temp}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="lead-interesse">
                Interesse Principal
              </StyledLabel>
              <StyledInput
                id="lead-interesse"
                name="interesse_principal"
                type="text"
                placeholder="Ex: BPO Fiscal, Contabilidade..."
                value={formData.interesse_principal}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Descrição da Dor */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="lead-dor">Descrição da Dor</StyledLabel>
            <StyledTextArea
              id="lead-dor"
              name="descricao_dor"
              placeholder="O que o lead precisa resolver?"
              value={formData.descricao_dor}
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
            type="button"
          />
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title="Salvar Lead"
            isLoading={isPending}
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
          />
        </StyledFooter>
      </ModalFooter>
      </div>
    </Modal>
  );
};
