import { useCreateAtividade } from '@/crm/hooks/useAtividades';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovaAtividadeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AtividadeFormData = {
  titulo: string;
  tipo: string;
  descricao: string;
  data_inicio: string;
  prioridade: string;
};

const EMPTY_FORM: AtividadeFormData = {
  titulo: '',
  tipo: 'Tarefa',
  descricao: '',
  data_inicio: '',
  prioridade: 'Normal',
};

const TIPOS = [
  'Tarefa',
  'Reunião',
  'Chamada',
  'Email',
  'WhatsApp',
  'Nota',
  'Visita',
  'Outro',
];

const PRIORIDADES = ['Baixa', 'Normal', 'Alta', 'Urgente'];

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

export const NovaAtividadeModal = ({ isOpen, onClose }: NovaAtividadeModalProps) => {
  const [formData, setFormData] = useState<AtividadeFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createAtividade, isPending } = useCreateAtividade();

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

    if (!formData.titulo.trim()) {
      setErrorMessage('Título é obrigatório.');
      return;
    }

    try {
      await createAtividade({
        titulo: formData.titulo.trim(),
        tipo: formData.tipo as
          | 'Tarefa'
          | 'Reunião'
          | 'Chamada'
          | 'Email'
          | 'WhatsApp'
          | 'Nota'
          | 'Visita'
          | 'Outro',
        descricao: formData.descricao.trim() || null,
        data_inicio: formData.data_inicio || null,
        data_fim: null,
        dia_inteiro: false,
        duracao_minutos: null,
        status: 'Pendente',
        prioridade: formData.prioridade as 'Baixa' | 'Normal' | 'Alta' | 'Urgente',
        resultado: null,
        lembrete_minutos: null,
        recorrencia: 'Nenhuma',
        observacoes: null,
        tags: [],
        completed_at: null,
        lead_id: null,
        empresa_id: null,
        contato_id: null,
        negocio_id: null,
        responsavel_id: null,
        criado_por_id: null,
      });

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar atividade.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Nova Atividade</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="nova-atividade-form" ref={formRef}>
          {/* Título - full width */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="atividade-titulo">
              O que precisa ser feito?<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="atividade-titulo"
              name="titulo"
              type="text"
              placeholder="Ex: Ligar para cliente sobre proposta"
              value={formData.titulo}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Tipo + Prioridade */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="atividade-tipo">Tipo</StyledLabel>
              <StyledSelect
                id="atividade-tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="atividade-prioridade">Prioridade</StyledLabel>
              <StyledSelect
                id="atividade-prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>
          </StyledField>

          {/* Data de início */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="atividade-data">Data de Início</StyledLabel>
            <StyledInput
              id="atividade-data"
              name="data_inicio"
              type="datetime-local"
              value={formData.data_inicio}
              onChange={handleChange}
            />
          </StyledFieldGroup>

          {/* Descrição */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="atividade-descricao">Descrição</StyledLabel>
            <StyledTextarea
              id="atividade-descricao"
              name="descricao"
              placeholder="Descreva os detalhes desta atividade..."
              value={formData.descricao}
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
            title="Criar Atividade"
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
