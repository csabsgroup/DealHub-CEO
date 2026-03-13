import { useOrigensLead, useUpdateLead } from '@/crm/hooks/useLeads';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Lead } from '~/types/supabase';

// --------------- Types ---------------

type EditarLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Lead;
};

type LeadFormData = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  origem_id: string;
  temperatura: string;
  status_triagem: string;
  interesse_principal: string;
  descricao_dor: string;
};

const TEMPERATURAS = ['Frio', 'Morno', 'Quente'];
const STATUS_OPTIONS = [
  'Novo',
  'Contatado',
  'Qualificado',
  'Desqualificado',
  'Convertido',
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

const StyledTextArea = styled.textarea`
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
  min-height: 64px;
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

export const EditarLeadModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarLeadModalProps) => {
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    origem_id: '',
    temperatura: '',
    status_triagem: '',
    interesse_principal: '',
    descricao_dor: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: updateLead, isPending } = useUpdateLead();
  const { data: origens } = useOrigensLead();

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome ?? '',
        empresa: initialData.empresa ?? '',
        email: initialData.email ?? '',
        telefone: initialData.telefone ?? '',
        origem_id: initialData.origem_id ?? '',
        temperatura: initialData.temperatura ?? '',
        status_triagem: initialData.status_triagem ?? 'Novo',
        interesse_principal: initialData.interesse_principal ?? '',
        descricao_dor: initialData.descricao_dor ?? '',
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
      setErrorMessage('Nome do lead é obrigatório.');
      return;
    }

    try {
      await updateLead({
        id: initialData.id,
        nome: formData.nome.trim(),
        empresa: formData.empresa.trim() || null,
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim() || null,
        origem_id: formData.origem_id || null,
        temperatura:
          (formData.temperatura as 'Frio' | 'Morno' | 'Quente') || null,
        status_triagem:
          (formData.status_triagem as
            | 'Novo'
            | 'Contatado'
            | 'Qualificado'
            | 'Desqualificado'
            | 'Convertido') || 'Novo',
        interesse_principal: formData.interesse_principal.trim() || null,
        descricao_dor: formData.descricao_dor.trim() || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar lead.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Lead</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-lead-form"
            ref={formRef}
          >
            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-lead-nome">
                Nome<StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="edit-lead-nome"
                name="nome"
                type="text"
                placeholder="Nome do lead ou contato"
                value={formData.nome}
                onChange={handleChange}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-empresa">Empresa</StyledLabel>
                <StyledInput
                  id="edit-lead-empresa"
                  name="empresa"
                  type="text"
                  placeholder="Nome da empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-email">E-mail</StyledLabel>
                <StyledInput
                  id="edit-lead-email"
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-telefone">Telefone</StyledLabel>
                <StyledInput
                  id="edit-lead-telefone"
                  name="telefone"
                  type="text"
                  placeholder="(11) 99999-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-origem">Origem</StyledLabel>
                <StyledSelect
                  id="edit-lead-origem"
                  name="origem_id"
                  value={formData.origem_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {origens?.map((origem) => (
                    <option key={origem.id} value={origem.id}>
                      {origem.nome}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-temperatura">
                  Temperatura
                </StyledLabel>
                <StyledSelect
                  id="edit-lead-temperatura"
                  name="temperatura"
                  value={formData.temperatura}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {TEMPERATURAS.map((temp) => (
                    <option key={temp} value={temp}>
                      {temp}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-lead-status">Status</StyledLabel>
                <StyledSelect
                  id="edit-lead-status"
                  name="status_triagem"
                  value={formData.status_triagem}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-lead-interesse">
                Interesse Principal
              </StyledLabel>
              <StyledInput
                id="edit-lead-interesse"
                name="interesse_principal"
                type="text"
                placeholder="Ex: BPO Fiscal, Contabilidade..."
                value={formData.interesse_principal}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-lead-dor">
                Descrição da Dor
              </StyledLabel>
              <StyledTextArea
                id="edit-lead-dor"
                name="descricao_dor"
                placeholder="O que o lead precisa resolver?"
                value={formData.descricao_dor}
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
              type="button"
            />
            <Button
              variant="primary"
              accent="blue"
              size="medium"
              title="Salvar Alterações"
              isLoading={isPending}
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
