import { useCreateServico } from '@/crm/hooks/useServicos';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovoServicoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ServicoFormData = {
  nome: string;
  categoria: string;
  descricao_comercial: string;
  preco_minimo: string;
  preco_sugerido: string;
  tipo_cobranca: string;
};

const EMPTY_FORM: ServicoFormData = {
  nome: '',
  categoria: '',
  descricao_comercial: '',
  preco_minimo: '',
  preco_sugerido: '',
  tipo_cobranca: 'Recorrente',
};

const CATEGORIAS = [
  'Contabilidade',
  'Fiscal',
  'Folha de Pagamento',
  'Societário',
  'Consultoria',
  'Financeiro',
  'Legalização',
  'Auditoria',
  'Outro',
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

export const NovoServicoModal = ({ isOpen, onClose }: NovoServicoModalProps) => {
  const [formData, setFormData] = useState<ServicoFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createServico, isPending } = useCreateServico();

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
      setErrorMessage('Nome do serviço é obrigatório.');
      return;
    }

    try {
      await createServico({
        nome: formData.nome.trim(),
        categoria: (formData.categoria as 'Contabilidade' | 'Fiscal' | 'Folha de Pagamento' | 'Societário' | 'Consultoria' | 'Financeiro' | 'Legalização' | 'Auditoria' | 'Outro') || null,
        descricao_comercial: formData.descricao_comercial.trim() || null,
        preco_minimo: parseFloat(formData.preco_minimo) || 0,
        preco_sugerido: parseFloat(formData.preco_sugerido) || 0,
        tipo_cobranca: (formData.tipo_cobranca as 'Recorrente' | 'Avulso') || 'Recorrente',
        is_active: true,
        created_by: null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar serviço.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Novo Serviço</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="novo-servico-form" ref={formRef}>
          {/* Nome */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="servico-nome">
              Nome<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="servico-nome"
              name="nome"
              type="text"
              placeholder="Ex: Escrituração Contábil"
              value={formData.nome}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Categoria + Tipo de Cobrança */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="servico-categoria">Categoria</StyledLabel>
              <StyledSelect
                id="servico-categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="servico-tipo">Tipo de Cobrança</StyledLabel>
              <StyledSelect
                id="servico-tipo"
                name="tipo_cobranca"
                value={formData.tipo_cobranca}
                onChange={handleChange}
              >
                <option value="Recorrente">Recorrente</option>
                <option value="Avulso">Avulso</option>
              </StyledSelect>
            </StyledFieldGroup>
          </StyledField>

          {/* Preço Mínimo + Preço Sugerido */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="servico-preco-min">Preço Mínimo (R$)</StyledLabel>
              <StyledInput
                id="servico-preco-min"
                name="preco_minimo"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.preco_minimo}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="servico-preco-sug">Preço Sugerido (R$)</StyledLabel>
              <StyledInput
                id="servico-preco-sug"
                name="preco_sugerido"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.preco_sugerido}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Descrição Comercial */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="servico-descricao">Descrição Comercial</StyledLabel>
            <StyledTextArea
              id="servico-descricao"
              name="descricao_comercial"
              placeholder="Descreva o serviço para propostas comerciais..."
              value={formData.descricao_comercial}
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
            title={isPending ? 'Salvando...' : 'Criar Serviço'}
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isPending}
          />
        </StyledFooter>
      </ModalFooter>
      </div>
    </Modal>
  );
};
