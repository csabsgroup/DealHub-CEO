import { useUpdateAtividade } from '@/crm/hooks/useAtividades';
import { useTiposAtividade } from '@/crm/hooks/useTiposAtividade';
import { useUsuarios } from '@/crm/hooks/useUsuarios';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
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
  responsavel_id: string;
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

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const StyledModalBox = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  border: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[6]};
  width: 560px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledModalContent = styled.div`
  flex: 1;
`;

const StyledModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
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
    responsavel_id: '',
    data_inicio: '',
    descricao: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: updateAtividade, isPending } = useUpdateAtividade();
  const { data: tipos } = useTiposAtividade();
  const { data: usuarios } = useUsuarios();

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo ?? '',
        tipo: initialData.tipo ?? 'Tarefa',
        status: initialData.status ?? 'Pendente',
        prioridade: initialData.prioridade ?? 'Normal',
        responsavel_id: initialData.responsavel_id ?? '',
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

  const handleSubmit = async () => {
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
        responsavel_id: formData.responsavel_id || null,
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

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
    <StyledOverlay onClick={handleClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Editar Atividade</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledForm onSubmit={(e) => e.preventDefault()}>
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

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-responsavel">Responsável</StyledLabel>
                <StyledSelect
                  id="edit-responsavel"
                  name="responsavel_id"
                  value={formData.responsavel_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {(usuarios ?? []).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name ?? u.email}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-data_inicio">Data e Hora</StyledLabel>
                <StyledInput
                  id="edit-data_inicio"
                  name="data_inicio"
                  type="datetime-local"
                  value={formData.data_inicio}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

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
        </StyledModalContent>

        <StyledModalFooter>
          <Button
            size="small"
            variant="secondary"
            title="Cancelar"
            onClick={handleClose}
          />
          <Button
            size="small"
            variant="primary"
            title={isPending ? 'Salvando...' : 'Salvar'}
            onClick={handleSubmit}
            disabled={isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  )}
    </>
  );
};
