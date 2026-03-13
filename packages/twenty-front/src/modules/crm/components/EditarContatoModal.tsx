import { useUpdateContato } from '@/crm/hooks/useContatos';
import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Contato } from '~/types/supabase';

// --------------- Types ---------------

type EditarContatoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Contato;
};

type ContatoFormData = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  empresa_id: string;
  canal_preferido: string;
  papel_decisao: string;
  observacoes: string;
};

const CANAIS = [
  'Email',
  'Telefone',
  'WhatsApp',
  'Presencial',
  'Videoconferência',
];

const PAPEIS = [
  'Decisor',
  'Influenciador',
  'Aprovador',
  'Usuario',
  'Comprador',
  'Gatekeeper',
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

export const EditarContatoModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarContatoModalProps) => {
  const [formData, setFormData] = useState<ContatoFormData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    empresa_id: '',
    canal_preferido: '',
    papel_decisao: '',
    observacoes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: empresas } = useEmpresas();
  const { mutateAsync: updateContato, isPending } = useUpdateContato();

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome ?? '',
        email: initialData.email ?? '',
        telefone: initialData.telefone ?? '',
        cargo: initialData.cargo ?? '',
        empresa_id: initialData.empresa_id ?? '',
        canal_preferido: initialData.canal_preferido ?? '',
        papel_decisao: initialData.papel_decisao ?? '',
        observacoes: initialData.observacoes ?? '',
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

    if (!formData.nome.trim()) {
      setErrorMessage('Nome é obrigatório.');
      return;
    }

    try {
      await updateContato({
        id: initialData.id,
        nome: formData.nome.trim(),
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim() || null,
        cargo: formData.cargo.trim() || null,
        empresa_id: formData.empresa_id || null,
        canal_preferido:
          (formData.canal_preferido as Contato['canal_preferido']) || null,
        papel_decisao:
          (formData.papel_decisao as Contato['papel_decisao']) || null,
        observacoes: formData.observacoes.trim() || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar contato.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Contato</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-contato-form"
            ref={formRef}
          >
            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-nome">
                  Nome<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledInput
                  id="edit-nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  autoFocus
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-cargo">Cargo</StyledLabel>
                <StyledInput
                  id="edit-cargo"
                  name="cargo"
                  type="text"
                  placeholder="Ex: Diretor Financeiro"
                  value={formData.cargo}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-email">E-mail</StyledLabel>
                <StyledInput
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Ex: joao@empresa.com.br"
                  value={formData.email}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-telefone">Telefone</StyledLabel>
                <StyledInput
                  id="edit-telefone"
                  name="telefone"
                  type="text"
                  placeholder="Ex: (11) 99999-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-empresa_id">Empresa</StyledLabel>
                <StyledSelect
                  id="edit-empresa_id"
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                >
                  <option value="">Sem empresa</option>
                  {empresas?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome_fantasia || emp.razao_social}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-papel_decisao">
                  Papel na Decisão
                </StyledLabel>
                <StyledSelect
                  id="edit-papel_decisao"
                  name="papel_decisao"
                  value={formData.papel_decisao}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {PAPEIS.map((papel) => (
                    <option key={papel} value={papel}>
                      {papel}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-canal_preferido">
                Canal Preferido
              </StyledLabel>
              <StyledSelect
                id="edit-canal_preferido"
                name="canal_preferido"
                value={formData.canal_preferido}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {CANAIS.map((canal) => (
                  <option key={canal} value={canal}>
                    {canal}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-observacoes">Observações</StyledLabel>
              <StyledTextarea
                id="edit-observacoes"
                name="observacoes"
                placeholder="Observações sobre o contato..."
                value={formData.observacoes}
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
              form="editar-contato-form"
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
