import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
    useCreateTenantRole,
} from '~/modules/crm/hooks/useTenantRoles';
import {
    DEFAULT_PERMISSOES,
    PERMISSAO_LABELS,
    type RbacPermissoes,
    type TenantRoleInsert,
} from '~/types/supabase';

// --------------- Types ---------------

type NovoPerfilModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = {
  nome: string;
  descricao: string;
  permissoes: RbacPermissoes;
};

const EMPTY_FORM: FormData = {
  nome: '',
  descricao: '',
  permissoes: { ...DEFAULT_PERMISSOES },
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
  gap: ${themeCssVariables.spacing[5]};
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

const StyledTextarea = styled.textarea`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  resize: none;
  font-family: inherit;
  transition: border-color 0.15s ease;
  min-height: 60px;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

// Seção de permissões
const StyledPermissoesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionLabel = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const StyledPermissaoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledPermissaoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  padding-right: ${themeCssVariables.spacing[3]};
`;

const StyledPermissaoLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledPermissaoDesc = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Toggle switch via CSS nativo + data-active
const toggleTrackStyle = css`
  width: 40px;
  height: 22px;
  appearance: none;
  background: var(--t-border-color-medium);
  border-radius: 11px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: 3px;
    transition: left 0.2s ease;
  }

  &:checked {
    background: var(--t-accent-primary);
  }

  &:checked::after {
    left: 21px;
  }
`;

const StyledError = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  background: #fef2f2;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid #fecaca;
`;

// --------------- Component ---------------

export const NovoPerfilModal = ({ isOpen, onClose }: NovoPerfilModalProps) => {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errorMsg, setErrorMsg] = useState('');

  const { mutateAsync: criar, isPending } = useCreateTenantRole();

  const togglePermissao = (key: keyof RbacPermissoes) => {
    setFormData((prev) => ({
      ...prev,
      permissoes: { ...prev.permissoes, [key]: !prev.permissoes[key] },
    }));
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setErrorMsg('');
    try {
      const payload: TenantRoleInsert = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        is_system_default: false,
        permissoes: formData.permissoes,
      };
      await criar(payload);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao criar perfil de acesso.');
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      <ModalHeader>
        <StyledTitle>Novo Perfil de Acesso</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm id="novo-perfil-form" onSubmit={handleSubmit}>
          {/* Nome */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="np-nome">
              Nome do Perfil<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="np-nome"
              name="nome"
              type="text"
              placeholder="Ex: Gerente Comercial"
              value={formData.nome}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, nome: e.target.value }));
                if (errorMsg) setErrorMsg('');
              }}
              required
              autoFocus
            />
          </StyledFieldGroup>

          {/* Descrição */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="np-descricao">Descrição (opcional)</StyledLabel>
            <StyledTextarea
              id="np-descricao"
              name="descricao"
              placeholder="Descreva as responsabilidades deste perfil..."
              value={formData.descricao}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, descricao: e.target.value }))
              }
              rows={2}
            />
          </StyledFieldGroup>

          {/* Permissões */}
          <StyledPermissoesSection>
            <StyledSectionLabel>Permissões</StyledSectionLabel>

            {(Object.keys(formData.permissoes) as Array<keyof RbacPermissoes>).map(
              (key) => {
                const { label, descricao } = PERMISSAO_LABELS[key];
                return (
                  <StyledPermissaoRow
                    key={key}
                    onClick={() => togglePermissao(key)}
                  >
                    <StyledPermissaoInfo>
                      <StyledPermissaoLabel>{label}</StyledPermissaoLabel>
                      <StyledPermissaoDesc title={descricao}>
                        {descricao}
                      </StyledPermissaoDesc>
                    </StyledPermissaoInfo>
                    <input
                      type="checkbox"
                      className={toggleTrackStyle}
                      checked={formData.permissoes[key]}
                      onChange={() => togglePermissao(key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </StyledPermissaoRow>
                );
              },
            )}
          </StyledPermissoesSection>

          {errorMsg && <StyledError>{errorMsg}</StyledError>}
        </StyledForm>
      </ModalContent>

      <ModalFooter>
        <Button
          variant="tertiary"
          title="Cancelar"
          onClick={handleClose}
          disabled={isPending}
        />
        <Button
          variant="primary"
          title={isPending ? 'Criando...' : 'Criar Perfil'}
          onClick={handleSubmit}
          disabled={isPending || !formData.nome.trim()}
        />
      </ModalFooter>
    </Modal>
  );
};
