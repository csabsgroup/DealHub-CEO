import { styled } from '@linaria/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCreateTipoAtividade } from '~/modules/crm/hooks/useTiposAtividade';
import type { TipoAtividadeInsert } from '~/types/supabase';

// --------------- Types ---------------

type NovoTipoAtividadeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// --------------- Constants ---------------

export const COR_OPTIONS = [
  { label: 'Azul',         value: '#3b82f6' },
  { label: 'Verde',        value: '#22c55e' },
  { label: 'Verde-claro',  value: '#25d366' },
  { label: 'Âmbar',        value: '#f59e0b' },
  { label: 'Roxo',         value: '#8b5cf6' },
  { label: 'Rosa',         value: '#ec4899' },
  { label: 'Vermelho',     value: '#ef4444' },
  { label: 'Teal',         value: '#14b8a6' },
  { label: 'Cinza',        value: '#6b7280' },
  { label: 'Laranja',      value: '#f97316' },
];

export const ICONE_OPTIONS = [
  'IconPhone',
  'IconMail',
  'IconCalendarEvent',
  'IconBrandWhatsapp',
  'IconMapPin',
  'IconCheck',
  'IconVideo',
  'IconMessage',
  'IconClipboard',
  'IconUsers',
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

export const NovoTipoAtividadeModal = ({
  isOpen,
  onClose,
}: NovoTipoAtividadeModalProps) => {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(COR_OPTIONS[0].value);
  const [icone, setIcone] = useState(ICONE_OPTIONS[0]);
  const [error, setError] = useState('');

  const createTipo = useCreateTipoAtividade();

  const handleClose = () => {
    setNome('');
    setCor(COR_OPTIONS[0].value);
    setIcone(ICONE_OPTIONS[0]);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('O nome do tipo é obrigatório.');
      return;
    }
    setError('');

    const payload: TipoAtividadeInsert = {
      nome: nome.trim(),
      cor,
      icone,
      is_active: true,
    };

    try {
      await createTipo.mutateAsync(payload);
      handleClose();
    } catch (err) {
      console.error('Erro Supabase:', err);
      setError('Erro ao salvar. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <StyledOverlay onClick={handleClose}>
      <StyledModalBox onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <StyledTitle>Novo Tipo de Atividade</StyledTitle>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledForm
            id="novo-tipo-atividade-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <StyledFieldGroup>
              <StyledLabel htmlFor="nta-nome">
                Nome <StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="nta-nome"
                type="text"
                placeholder="Ex: Ligação, Reunião, E-mail"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="nta-cor">Cor</StyledLabel>
              <StyledSelect
                id="nta-cor"
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
              <StyledLabel htmlFor="nta-icone">Ícone</StyledLabel>
              <StyledSelect
                id="nta-icone"
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
            onClick={handleClose}
          />
          <Button
            size="small"
            variant="primary"
            title="Criar Tipo"
            onClick={handleSubmit}
            disabled={createTipo.isPending}
          />
        </StyledModalFooter>
      </StyledModalBox>
    </StyledOverlay>,
    document.body,
  );
};
