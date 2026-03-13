import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { useUpdateNegocio } from '@/crm/hooks/useNegocios';
import { usePipelineEtapas, usePipelines } from '@/crm/hooks/usePipelines';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import type { Negocio } from '~/types/supabase';

// --------------- Types ---------------

type EditarNegocioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Negocio;
};

type NegocioFormData = {
  titulo: string;
  empresa_id: string;
  pipeline_id: string;
  etapa_id: string;
  valor_estimado: string;
  valor_mensalidade: string;
  servico: string;
  observacoes: string;
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

export const EditarNegocioModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarNegocioModalProps) => {
  const [formData, setFormData] = useState<NegocioFormData>({
    titulo: '',
    empresa_id: '',
    pipeline_id: '',
    etapa_id: '',
    valor_estimado: '',
    valor_mensalidade: '',
    servico: '',
    observacoes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: updateNegocio, isPending } = useUpdateNegocio();
  const { data: pipelines } = usePipelines();
  const { data: empresas } = useEmpresas();

  const selectedPipelineId = formData.pipeline_id || null;
  const { data: etapas } = usePipelineEtapas(selectedPipelineId);

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo ?? '',
        empresa_id: initialData.empresa_id ?? '',
        pipeline_id: initialData.pipeline_id ?? '',
        etapa_id: initialData.etapa_id ?? '',
        valor_estimado: initialData.valor_estimado
          ? String(initialData.valor_estimado)
          : '',
        valor_mensalidade: initialData.valor_mensalidade
          ? String(initialData.valor_mensalidade)
          : '',
        servico: initialData.servico ?? '',
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'pipeline_id') {
        next.etapa_id = '';
      }
      return next;
    });
    setErrorMessage(null);
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      setErrorMessage('Título do negócio é obrigatório.');
      return;
    }
    if (!formData.pipeline_id) {
      setErrorMessage('Selecione um pipeline.');
      return;
    }
    if (!formData.etapa_id) {
      setErrorMessage('Selecione uma etapa.');
      return;
    }

    try {
      await updateNegocio({
        id: initialData.id,
        titulo: formData.titulo.trim(),
        empresa_id: formData.empresa_id || null,
        pipeline_id: formData.pipeline_id,
        etapa_id: formData.etapa_id,
        valor_estimado: formData.valor_estimado
          ? Number(formData.valor_estimado)
          : 0,
        valor_mensalidade: formData.valor_mensalidade
          ? Number(formData.valor_mensalidade)
          : null,
        servico: formData.servico.trim() || null,
        observacoes: formData.observacoes.trim() || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar negócio.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Negócio</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-negocio-form"
            ref={formRef}
          >
            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-negocio-titulo">
                Título<StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledInput
                id="edit-negocio-titulo"
                name="titulo"
                type="text"
                placeholder="Ex: BPO Fiscal - Empresa ABC"
                value={formData.titulo}
                onChange={handleChange}
                autoFocus
              />
            </StyledFieldGroup>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-empresa">
                  Empresa
                </StyledLabel>
                <StyledSelect
                  id="edit-negocio-empresa"
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {empresas?.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.razao_social}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-servico">
                  Serviço
                </StyledLabel>
                <StyledInput
                  id="edit-negocio-servico"
                  name="servico"
                  type="text"
                  placeholder="Ex: BPO Fiscal, Contabilidade..."
                  value={formData.servico}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-pipeline">
                  Pipeline<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledSelect
                  id="edit-negocio-pipeline"
                  name="pipeline_id"
                  value={formData.pipeline_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {pipelines?.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.nome}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-etapa">
                  Etapa<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledSelect
                  id="edit-negocio-etapa"
                  name="etapa_id"
                  value={formData.etapa_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {etapas?.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.nome}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-valor">
                  Valor Estimado (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-negocio-valor"
                  name="valor_estimado"
                  type="number"
                  placeholder="0"
                  value={formData.valor_estimado}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-negocio-mensalidade">
                  Mensalidade (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-negocio-mensalidade"
                  name="valor_mensalidade"
                  type="number"
                  placeholder="0"
                  value={formData.valor_mensalidade}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-negocio-obs">Observações</StyledLabel>
              <StyledTextArea
                id="edit-negocio-obs"
                name="observacoes"
                placeholder="Detalhes sobre o negócio..."
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
