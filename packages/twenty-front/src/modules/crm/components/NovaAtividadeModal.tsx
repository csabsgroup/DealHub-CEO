import { useCreateAtividade } from '@/crm/hooks/useAtividades';
import { useNegocios } from '@/crm/hooks/useNegocios';
import { useTiposAtividade } from '@/crm/hooks/useTiposAtividade';
import { useUsuarios } from '@/crm/hooks/useUsuarios';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { AtividadeInsert } from '~/types/supabase';

// --------------- Types ---------------

type NovaAtividadeModalProps = {
  isOpen: boolean;
  negocioId?: string;
  onClose: () => void;
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

const StyledRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[3]};
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
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

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
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

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
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledError = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledModalBox = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  width: 520px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const StyledModalHeader = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledModalContent = styled.div`
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledModalFooter = styled.div`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
`;

// --------------- Component ---------------

export const NovaAtividadeModal = ({
  isOpen,
  negocioId,
  onClose,
}: NovaAtividadeModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoAtividadeId, setTipoAtividadeId] = useState('');
  const [selectedNegocioId, setSelectedNegocioId] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [error, setError] = useState('');

  const createAtividade = useCreateAtividade();
  const { data: tipos } = useTiposAtividade();
  const { data: usuarios } = useUsuarios();
  const { data: negocios } = useNegocios();

  const handleClose = () => {
    setTitulo('');
    setDescricao('');
    setTipoAtividadeId('');
    setResponsavelId('');
    setDataVencimento('');
    setSelectedNegocioId('');
    setError('');
    onClose();
  };

  const resolvedNegocioId = negocioId ?? selectedNegocioId;

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setError('');

    const payload: AtividadeInsert = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      tipo: 'Outro',
      negocio_id: resolvedNegocioId || null,
      responsavel_id: responsavelId || null,
      data_inicio: dataVencimento ? new Date(dataVencimento).toISOString() : null,
      data_fim: dataVencimento ? new Date(dataVencimento).toISOString() : null,
      dia_inteiro: false,
      duracao_minutos: null,
      status: 'Pendente',
      prioridade: 'Normal',
      resultado: null,
      lembrete_minutos: null,
      recorrencia: 'Nenhuma',
      observacoes: null,
      tags: [],
      completed_at: null,
      lead_id: null,
      empresa_id: null,
      contato_id: null,
      criado_por_id: null,
    };

    try {
      await createAtividade.mutateAsync(payload);
      handleClose();
    } catch (err) {
      console.error('Erro Supabase:', err);
      setError('Erro ao salvar atividade. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
    <StyledOverlay onClick={handleClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Nova Atividade</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledForm id="nova-atividade-form" onSubmit={(e) => e.preventDefault()}>
            <StyledFieldGroup>
              <StyledLabel htmlFor="na-titulo">
                Título <StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="na-titulo"
                type="text"
                placeholder="Ex: Call de apresentação, Reunião de fechamento"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="na-descricao">Descrição</StyledLabel>
              <StyledTextarea
                id="na-descricao"
                placeholder="Detalhes da atividade (opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </StyledFieldGroup>

            {!negocioId && (
              <StyledFieldGroup>
                <StyledLabel htmlFor="na-negocio">Negócio</StyledLabel>
                <StyledSelect
                  id="na-negocio"
                  value={selectedNegocioId}
                  onChange={(e) => setSelectedNegocioId(e.target.value)}
                >
                  <option value="">— Sem negócio —</option>
                  {(negocios ?? []).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.titulo}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            )}

            <StyledRow>
              <StyledFieldGroup>
                <StyledLabel htmlFor="na-tipo">Tipo de Atividade</StyledLabel>
                <StyledSelect
                  id="na-tipo"
                  value={tipoAtividadeId}
                  onChange={(e) => setTipoAtividadeId(e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  {(tipos ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="na-responsavel">Responsável</StyledLabel>
                <StyledSelect
                  id="na-responsavel"
                  value={responsavelId}
                  onChange={(e) => setResponsavelId(e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  {(usuarios ?? []).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name ?? u.email}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledRow>

            <StyledFieldGroup>
              <StyledLabel htmlFor="na-data">Data e Hora de Vencimento</StyledLabel>
              <StyledInput
                id="na-data"
                type="datetime-local"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </StyledFieldGroup>

            {error && <StyledError>{error}</StyledError>}
          </StyledForm>
        </StyledModalContent>

        <StyledModalFooter>
          <Button size="small" variant="secondary" title="Cancelar" onClick={handleClose} />
          <Button
            size="small"
            variant="primary"
            title="Criar Atividade"
            onClick={handleSubmit}
            disabled={createAtividade.isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  )}
    </>
  );
};
