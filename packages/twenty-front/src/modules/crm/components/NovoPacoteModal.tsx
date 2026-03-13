import { useCreatePacote } from '@/crm/hooks/usePacotes';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovoPacoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PacoteFormData = {
  nome: string;
  descricao: string;
  preco_sugerido: string;
};

const EMPTY_FORM: PacoteFormData = {
  nome: '',
  descricao: '',
  preco_sugerido: '',
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
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
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

export const NovoPacoteModal = ({ isOpen, onClose }: NovoPacoteModalProps) => {
  const [formData, setFormData] = useState<PacoteFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createPacote, isPending } = useCreatePacote();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      setErrorMessage('Nome do pacote é obrigatório.');
      return;
    }

    try {
      await createPacote({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        preco_sugerido: parseFloat(formData.preco_sugerido) || 0,
        is_active: true,
        created_by: null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar pacote.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Novo Pacote</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="novo-pacote-form" ref={formRef}>
          {/* Nome */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="pacote-nome">
              Nome<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="pacote-nome"
              name="nome"
              type="text"
              placeholder="Ex: Contabilidade + Folha"
              value={formData.nome}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Preço Sugerido */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="pacote-preco">Preço Sugerido (R$)</StyledLabel>
            <StyledInput
              id="pacote-preco"
              name="preco_sugerido"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.preco_sugerido}
              onChange={handleChange}
            />
          </StyledFieldGroup>

          {/* Descrição */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="pacote-descricao">Descrição</StyledLabel>
            <StyledTextArea
              id="pacote-descricao"
              name="descricao"
              placeholder="Descreva o pacote e os serviços inclusos..."
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
            />
          </StyledFieldGroup>

          {errorMessage && <StyledErrorMessage>{errorMessage}</StyledErrorMessage>}
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
            title={isPending ? 'Salvando...' : 'Criar Pacote'}
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isPending}
          />
        </StyledFooter>
      </ModalFooter>
      </div>
    </Modal>
  );
};
