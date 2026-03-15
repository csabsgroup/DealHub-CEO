import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  COR_OPTIONS,
  ICONE_OPTIONS,
} from '~/modules/crm/components/NovoTipoAtividadeModal';
import { useUpdateTipoAtividade } from '~/modules/crm/hooks/useTiposAtividade';
import type { TipoAtividade, TipoAtividadeUpdate } from '~/types/supabase';

// --------------- Types ---------------

type EditarTipoAtividadeModalProps = {
  isOpen: boolean;
  tipo: TipoAtividade;
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

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
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
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledColorPreview = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
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
  width: 420px;
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

export const EditarTipoAtividadeModal = ({
  isOpen,
  tipo,
  onClose,
}: EditarTipoAtividadeModalProps) => {
  const [nome, setNome] = useState(tipo.nome);
  const [cor, setCor] = useState(tipo.cor);
  const [icone, setIcone] = useState(tipo.icone);
  const [error, setError] = useState('');

  const updateTipo = useUpdateTipoAtividade();

  // Sync when a different tipo is opened
  useEffect(() => {
    setNome(tipo.nome);
    setCor(tipo.cor);
    setIcone(tipo.icone);
    setError('');
  }, [tipo]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('O nome do tipo é obrigatório.');
      return;
    }
    setError('');

    const payload: TipoAtividadeUpdate & { id: string } = {
      id: tipo.id,
      nome: nome.trim(),
      cor,
      icone,
    };

    try {
      await updateTipo.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error('Erro Supabase:', err);
      setError('Erro ao salvar. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <StyledOverlay onClick={onClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Editar Tipo de Atividade</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledForm
            id="editar-tipo-atividade-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <StyledFieldGroup>
              <StyledLabel htmlFor="eta-nome">
                Nome <StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="eta-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="eta-cor">Cor</StyledLabel>
              <StyledSelect
                id="eta-cor"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
              >
                {COR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </StyledSelect>
              <span style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                <StyledColorPreview style={{ background: cor }} />
                <span style={{ fontSize: 12, color: 'var(--t-font-color-tertiary)' }}>
                  {cor}
                </span>
              </span>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="eta-icone">Ícone</StyledLabel>
              <StyledSelect
                id="eta-icone"
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
              >
                {ICONE_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            {error && <StyledError>{error}</StyledError>}
          </StyledForm>
        </StyledModalContent>

        <StyledModalFooter>
          <Button
            size="small"
            variant="secondary"
            title="Cancelar"
            onClick={onClose}
          />
          <Button
            size="small"
            variant="primary"
            title="Salvar"
            onClick={handleSubmit}
            disabled={updateTipo.isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  );
};
