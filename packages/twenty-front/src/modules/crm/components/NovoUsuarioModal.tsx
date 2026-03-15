import { useTenantRoles } from '@/crm/hooks/useTenantRoles';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
    useConvidarUsuario,
    type ConvidarInput,
} from '~/modules/crm/hooks/useUsuarios';

// --------------- Types ---------------

type NovoUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = {
  email: string;
  full_name: string;
  tenant_role_id: string;
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

const StyledHint = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
  line-height: 1.5;
`;

const StyledRoleDesc = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid ${themeCssVariables.border.color.light};
  line-height: 1.5;
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

export const NovoUsuarioModal = ({ isOpen, onClose }: NovoUsuarioModalProps) => {
  const { data: roles, isLoading: loadingRoles } = useTenantRoles();
  const defaultRoleId = roles?.find((r) => r.nome === 'Vendedor')?.id ?? roles?.[1]?.id ?? roles?.[0]?.id ?? '';

  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    tenant_role_id: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { mutateAsync: convidar, isPending } = useConvidarUsuario();

  const effectiveRoleId = formData.tenant_role_id || defaultRoleId;
  const selectedRole = roles?.find((r) => r.id === effectiveRoleId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleClose = () => {
    setFormData({ email: '', full_name: '', tenant_role_id: '' });
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setErrorMsg('');
    try {
      const payload: ConvidarInput = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        tenant_role_id: effectiveRoleId,
      };
      await convidar(payload);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao adicionar usuário.');
    }
  };

  return (
    <Modal isOpen={isOpen} size="small" onBackdropMouseDown={handleClose}>
      <ModalHeader>
        <StyledTitle>Adicionar Usuário à Equipe</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm id="novo-usuario-form" onSubmit={handleSubmit}>
          <StyledFieldGroup>
            <StyledLabel htmlFor="nu-email">
              E-mail<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="nu-email"
              name="email"
              type="email"
              placeholder="usuario@exemplo.com.br"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
            <StyledHint>
              O usuário já deve ter uma conta criada na plataforma.
            </StyledHint>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="nu-full-name">Nome Completo</StyledLabel>
            <StyledInput
              id="nu-full-name"
              name="full_name"
              type="text"
              placeholder="Nome do colaborador"
              value={formData.full_name}
              onChange={handleChange}
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="nu-role">
              Perfil de Acesso<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledSelect
              id="nu-role"
              name="tenant_role_id"
              value={formData.tenant_role_id || effectiveRoleId}
              onChange={handleChange}
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
              <StyledRoleDesc>{selectedRole.descricao}</StyledRoleDesc>
            )}
          </StyledFieldGroup>

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
          title={isPending ? 'Adicionando...' : 'Adicionar'}
          onClick={handleSubmit}
          disabled={isPending || !formData.email.trim() || !effectiveRoleId}
        />
      </ModalFooter>
    </Modal>
  );
};
