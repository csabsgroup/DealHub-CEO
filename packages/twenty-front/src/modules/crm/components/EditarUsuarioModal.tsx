import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useTenantRoles } from '~/modules/crm/hooks/useTenantRoles';
import {
    useUpdateUsuarioCRM,
    type UpdateUsuarioInput,
} from '~/modules/crm/hooks/useUsuarios';
import type { UsuarioCRM } from '~/types/supabase';

// --------------- Types ---------------

type EditarUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioCRM;
};

type FormData = {
  full_name: string;
  tenant_role_id: string | null;
  is_active: boolean;
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

const StyledReadonlyField = styled.div`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  display: flex;
  align-items: center;
`;

const StyledToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.secondary};
`;

const StyledToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledTogglePrimary = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledToggleSub = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

// Native checkbox styled as toggle via data attribute
const StyledToggleInput = styled.input`
  width: 40px;
  height: 22px;
  appearance: none;
  background: ${themeCssVariables.border.color.medium};
  border-radius: 11px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;

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
    background: ${themeCssVariables.accent.primary};
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

export const EditarUsuarioModal = ({
  isOpen,
  onClose,
  usuario,
}: EditarUsuarioModalProps) => {
  const { data: roles, isLoading: loadingRoles } = useTenantRoles();

  const [formData, setFormData] = useState<FormData>({
    full_name: usuario.full_name ?? '',
    tenant_role_id: usuario.tenant_role_id,
    is_active: usuario.is_active,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { mutateAsync: update, isPending } = useUpdateUsuarioCRM();

  const selectedRole = roles?.find((r) => r.id === formData.tenant_role_id);

  // Sync form when usuario changes
  useEffect(() => {
    setFormData({
      full_name: usuario.full_name ?? '',
      tenant_role_id: usuario.tenant_role_id,
      is_active: usuario.is_active,
    });
    setErrorMsg('');
  }, [usuario]);

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const payload: UpdateUsuarioInput = {
        id: usuario.id,
        user_id: usuario.user_id,
        tenant_role_id: formData.tenant_role_id,
        is_active: formData.is_active,
        full_name: formData.full_name.trim() || undefined,
      };
      await update(payload);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
    }
  };

  return (
    <Modal isOpen={isOpen} size="small" onBackdropMouseDown={handleClose}>
      <ModalHeader>
        <StyledTitle>Editar Usuário</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm id="editar-usuario-form" onSubmit={handleSubmit}>
          {/* E-mail (readonly) */}
          <StyledFieldGroup>
            <StyledLabel>E-mail</StyledLabel>
            <StyledReadonlyField>{usuario.email}</StyledReadonlyField>
          </StyledFieldGroup>

          {/* Nome Completo */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="eu-full-name">Nome Completo</StyledLabel>
            <StyledInput
              id="eu-full-name"
              name="full_name"
              type="text"
              placeholder="Nome do colaborador"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
          </StyledFieldGroup>

          {/* Perfil de Acesso dinâmico */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="eu-role">Perfil de Acesso</StyledLabel>
            <StyledSelect
              id="eu-role"
              name="tenant_role_id"
              value={formData.tenant_role_id ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tenant_role_id: e.target.value || null,
                }))
              }
              disabled={loadingRoles || !roles?.length}
            >
              {loadingRoles && <option>Carregando perfis...</option>}
              {!loadingRoles && !roles?.length && (
                <option>Nenhum perfil disponível</option>
              )}
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nome}
                </option>
              ))}
            </StyledSelect>
            {selectedRole?.descricao && (
              <p style={{ fontSize: '11px', color: 'var(--t-font-color-tertiary)', margin: 0, lineHeight: 1.5 }}>
                {selectedRole.descricao}
              </p>
            )}
          </StyledFieldGroup>

          {/* Ativo/Inativo */}
          <StyledToggleRow>
            <StyledToggleLabel>
              <StyledTogglePrimary>
                {formData.is_active ? 'Usuário Ativo' : 'Usuário Inativo'}
              </StyledTogglePrimary>
              <StyledToggleSub>
                {formData.is_active
                  ? 'Desative para bloquear o acesso sem excluir.'
                  : 'Reative para restaurar o acesso deste usuário.'}
              </StyledToggleSub>
            </StyledToggleLabel>
            <StyledToggleInput
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
            />
          </StyledToggleRow>

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
          title={isPending ? 'Salvando...' : 'Salvar'}
          onClick={handleSubmit}
          disabled={isPending}
        />
      </ModalFooter>
    </Modal>
  );
};
