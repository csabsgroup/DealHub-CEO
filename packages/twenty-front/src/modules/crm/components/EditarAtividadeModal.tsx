import { useUpdateAtividade } from '@/crm/hooks/useAtividades';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Atividade, AtividadePrioridade, AtividadeStatus, AtividadeTipo } from '~/types/supabase';

// --------------- Types ---------------

type EditarAtividadeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Atividade;
};

type AtividadeFormData = {
  titulo: string;
  tipo: string;
  status: string;
  prioridade: string;
  data_inicio: string;
  descricao: string;
};

const TIPOS: AtividadeTipo[] = [
  'Tarefa',
  'Reunião',
  'Chamada',
  'Email',
  'WhatsApp',
  'Nota',
  'Visita',
  'Outro',
];

const STATUS_LIST: AtividadeStatus[] = [
  'Pendente',
  'Em andamento',
  'Concluída',
  'Cancelada',
];

const PRIORIDADES: AtividadePrioridade[] = ['Baixa', 'Normal', 'Alta', 'Urgente'];

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

// --------------- Helpers ---------------

const toInputDatetimeLocal = (dateStr: string | null): string => {
  if (!dateStr) return '';
  // Format: "YYYY-MM-DDTHH:MM"
  return dateStr.slice(0, 16);
};

// --------------- Component ---------------

export const EditarAtividadeModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarAtividadeModalProps) => {
  const [formData, setFormData] = useState<AtividadeFormData>({
    titulo: '',
    tipo: 'Tarefa',
    status: 'Pendente',
    prioridade: 'Normal',
    data_inicio: '',
    descricao: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: updateAtividade, isPending } = useUpdateAtividade();

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo ?? '',
        tipo: initialData.tipo ?? 'Tarefa',
        status: initialData.status ?? 'Pendente',
        prioridade: initialData.prioridade ?? 'Normal',
        data_inicio: toInputDatetimeLocal(initialData.data_inicio),
        descricao: initialData.descricao ?? '',
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

    if (!formData.titulo.trim()) {
      setErrorMessage('Título é obrigatório.');
      return;
    }

    try {
      await updateAtividade({
        id: initialData.id,
        titulo: formData.titulo.trim(),
        tipo: formData.tipo as AtividadeTipo,
        status: formData.status as AtividadeStatus,
        prioridade: formData.prioridade as AtividadePrioridade,
        data_inicio: formData.data_inicio || null,
        descricao: formData.descricao.trim() || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar atividade.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Atividade</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-atividade-form"
            ref={formRef}
          >
            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-titulo">
                Título<StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="edit-titulo"
                name="titulo"
                type="text"
                placeholder="Ex: Reunião de apresentação"
                value={formData.titulo}
                onChange={handleChange}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledFieldTriple>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-tipo">Tipo</StyledLabel>
                <StyledSelect
                  id="edit-tipo"
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

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-prioridade">Prioridade</StyledLabel>
                <StyledSelect
                  id="edit-prioridade"
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
            </StyledFieldTriple>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-data_inicio">
                Data e Hora
              </StyledLabel>
              <StyledInput
                id="edit-data_inicio"
                name="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-descricao">Descrição</StyledLabel>
              <StyledTextarea
                id="edit-descricao"
                name="descricao"
                placeholder="Descreva a atividade..."
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
              disabled={isPending}
            />
            <Button
              variant="primary"
              accent="blue"
              size="medium"
              title={isPending ? 'Salvando...' : 'Salvar Alterações'}
              type="submit"
              form="editar-atividade-form"
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
