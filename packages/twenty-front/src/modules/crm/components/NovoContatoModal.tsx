import { useCreateContato } from '@/crm/hooks/useContatos';
import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovoContatoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ContatoFormData = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  empresa_id: string;
  canal_preferido: string;
  observacoes: string;
};

const EMPTY_FORM: ContatoFormData = {
  nome: '',
  email: '',
  telefone: '',
  cargo: '',
  empresa_id: '',
  canal_preferido: '',
  observacoes: '',
};

const CANAIS = [
  'Email',
  'Telefone',
  'WhatsApp',
  'Presencial',
  'Videoconferência',
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

export const NovoContatoModal = ({ isOpen, onClose }: NovoContatoModalProps) => {
  const [formData, setFormData] = useState<ContatoFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: empresas } = useEmpresas();
  const { mutateAsync: createContato, isPending } = useCreateContato();

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
      setErrorMessage('Nome é obrigatório.');
      return;
    }

    try {
      await createContato({
        nome: formData.nome.trim(),
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim() || null,
        cargo: formData.cargo.trim() || null,
        empresa_id: formData.empresa_id || null,
        canal_preferido:
          (formData.canal_preferido as
            | 'Email'
            | 'Telefone'
            | 'WhatsApp'
            | 'Presencial'
            | 'Videoconferência') || null,
        observacoes: formData.observacoes.trim() || null,
        whatsapp: null,
        papel_decisao: null,
        is_principal: false,
        consentimento: false,
        consentimento_data: null,
        data_ultimo_contato: null,
        created_by: null,
      });

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar contato.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Novo Contato</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="novo-contato-form" ref={formRef}>
          {/* Nome - full width */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="contato-nome">
              Nome<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="contato-nome"
              name="nome"
              type="text"
              placeholder="Nome completo do contato"
              value={formData.nome}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Email + Telefone */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="contato-email">E-mail</StyledLabel>
              <StyledInput
                id="contato-email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="contato-telefone">Telefone</StyledLabel>
              <StyledInput
                id="contato-telefone"
                name="telefone"
                type="tel"
                placeholder="(11) 99999-0000"
                value={formData.telefone}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Cargo + Empresa */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="contato-cargo">Cargo</StyledLabel>
              <StyledInput
                id="contato-cargo"
                name="cargo"
                type="text"
                placeholder="Ex: Diretor Financeiro"
                value={formData.cargo}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="contato-empresa">Empresa</StyledLabel>
              <StyledSelect
                id="contato-empresa"
                name="empresa_id"
                value={formData.empresa_id}
                onChange={handleChange}
              >
                <option value="">Sem vínculo</option>
                {empresas?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.razao_social}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>
          </StyledField>

          {/* Canal preferido */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="contato-canal">Canal Preferido</StyledLabel>
            <StyledSelect
              id="contato-canal"
              name="canal_preferido"
              value={formData.canal_preferido}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              {CANAIS.map((canal) => (
                <option key={canal} value={canal}>
                  {canal}
                </option>
              ))}
            </StyledSelect>
          </StyledFieldGroup>

          {/* Observações */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="contato-obs">Observações</StyledLabel>
            <StyledTextarea
              id="contato-obs"
              name="observacoes"
              placeholder="Notas adicionais sobre o contato..."
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
            type="button"
          />
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title="Salvar Contato"
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
