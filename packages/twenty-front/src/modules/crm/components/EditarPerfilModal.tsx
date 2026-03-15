import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
    useUpdateTenantRole,
} from '~/modules/crm/hooks/useTenantRoles';
import {
    PERMISSAO_LABELS,
    type RbacPermissoes,
    type TenantRole,
} from '~/types/supabase';

// --------------- Types ---------------

type EditarPerfilModalProps = {
  isOpen: boolean;
  onClose: () => void;
  perfil: TenantRole;
};

type FormData = {
  nome: string;
  descricao: string;
  permissoes: RbacPermissoes;
};

// --------------- Styled Components ---------------

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledSystemBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
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

  &:disabled {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.tertiary};
    cursor: not-allowed;
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

export const EditarPerfilModal = ({
  isOpen,
  onClose,
  perfil,
}: EditarPerfilModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    nome: perfil.nome,
    descricao: perfil.descricao ?? '',
    permissoes: { ...perfil.permissoes },
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { mutateAsync: atualizar, isPending } = useUpdateTenantRole();

  useEffect(() => {
    setFormData({
      nome: perfil.nome,
      descricao: perfil.descricao ?? '',
      permissoes: { ...perfil.permissoes },
    });
    setErrorMsg('');
  }, [perfil]);

  const togglePermissao = (key: keyof RbacPermissoes) => {
    setFormData((prev) => ({
      ...prev,
      permissoes: { ...prev.permissoes, [key]: !prev.permissoes[key] },
    }));
  };

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    setErrorMsg('');
    try {
      await atualizar({
        id: perfil.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        permissoes: formData.permissoes,
      });
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar perfil de acesso.');
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      <ModalHeader>
        <StyledTitle>
          Editar Perfil{' '}
          {perfil.is_system_default && (
            <StyledSystemBadge>Padrão do sistema</StyledSystemBadge>
          )}
        </StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm id="editar-perfil-form" onSubmit={handleSubmit}>
          {/* Nome */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="ep-nome">Nome do Perfil</StyledLabel>
            <StyledInput
              id="ep-nome"
              name="nome"
              type="text"
              value={formData.nome}
              disabled={perfil.is_system_default}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </StyledFieldGroup>

          {/* Descrição */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="ep-descricao">Descrição</StyledLabel>
            <StyledTextarea
              id="ep-descricao"
              name="descricao"
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
          title={isPending ? 'Salvando...' : 'Salvar Alterações'}
          onClick={handleSubmit}
          disabled={isPending || !formData.nome.trim()}
        />
      </ModalFooter>
    </Modal>
  );
};
