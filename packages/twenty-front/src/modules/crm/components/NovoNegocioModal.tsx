import { useEmpresas } from '@/crm/hooks/useEmpresas';
import {
    useCreateNegocio,
} from '@/crm/hooks/useNegocios';
import { usePipelineEtapas, usePipelines } from '@/crm/hooks/usePipelines';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovoNegocioModalProps = {
  isOpen: boolean;
  onClose: () => void;
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

const EMPTY_FORM: NegocioFormData = {
  titulo: '',
  empresa_id: '',
  pipeline_id: '',
  etapa_id: '',
  valor_estimado: '',
  valor_mensalidade: '',
  servico: '',
  observacoes: '',
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

export const NovoNegocioModal = ({ isOpen, onClose }: NovoNegocioModalProps) => {
  const [formData, setFormData] = useState<NegocioFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createNegocio, isPending } = useCreateNegocio();
  const { data: pipelines } = usePipelines();
  const { data: empresas } = useEmpresas();

  // Auto-seleciona o pipeline default ao abrir
  useEffect(() => {
    if (pipelines && pipelines.length > 0 && !formData.pipeline_id) {
      const defaultPipeline =
        pipelines.find((p) => p.is_default) ?? pipelines[0];
      setFormData((prev) => ({ ...prev, pipeline_id: defaultPipeline.id }));
    }
  }, [pipelines, formData.pipeline_id]);

  const selectedPipelineId = formData.pipeline_id || null;
  const { data: etapas } = usePipelineEtapas(selectedPipelineId);

  // Auto-seleciona primeira etapa quando etapas carregam
  useEffect(() => {
    if (etapas && etapas.length > 0 && !formData.etapa_id) {
      setFormData((prev) => ({ ...prev, etapa_id: etapas[0].id }));
    }
  }, [etapas, formData.etapa_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset etapa quando pipeline muda
      if (name === 'pipeline_id') {
        next.etapa_id = '';
      }
      return next;
    });
    setErrorMessage(null);
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
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
      await createNegocio({
        titulo: formData.titulo.trim(),
        empresa_id: formData.empresa_id || null,
        contato_principal_id: null,
        lead_id: null,
        pipeline_id: formData.pipeline_id,
        etapa_id: formData.etapa_id,
        responsavel_id: null,
        unidade_negocio: null,
        valor_estimado: formData.valor_estimado
          ? Number(formData.valor_estimado)
          : 0,
        valor_mensalidade: formData.valor_mensalidade
          ? Number(formData.valor_mensalidade)
          : null,
        valor_setup: null,
        probabilidade: 0,
        origem: null,
        servico: formData.servico.trim() || null,
        pacote: null,
        temperatura: null,
        data_prevista_fechamento: null,
        data_fechamento: null,
        status_final: null,
        motivo_perda_id: null,
        motivo_perda_detalhe: null,
        proxima_atividade: null,
        proxima_atividade_data: null,
        observacoes: formData.observacoes.trim() || null,
        tags: [],
        created_by: null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar negócio.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
      <ModalHeader>
        <StyledTitle>Novo Negócio</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="novo-negocio-form" ref={formRef}>
          {/* Título - full width */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="negocio-titulo">
              Título<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="negocio-titulo"
              name="titulo"
              type="text"
              placeholder="Ex: BPO Fiscal - Empresa ABC"
              value={formData.titulo}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Empresa + Serviço */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="negocio-empresa">Empresa</StyledLabel>
              <StyledSelect
                id="negocio-empresa"
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
              <StyledLabel htmlFor="negocio-servico">Serviço</StyledLabel>
              <StyledInput
                id="negocio-servico"
                name="servico"
                type="text"
                placeholder="Ex: BPO Fiscal, Contabilidade..."
                value={formData.servico}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Pipeline + Etapa */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="negocio-pipeline">
                Pipeline<StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledSelect
                id="negocio-pipeline"
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
              <StyledLabel htmlFor="negocio-etapa">
                Etapa<StyledRequired>*</StyledRequired>
              </StyledLabel>
              <StyledSelect
                id="negocio-etapa"
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

          {/* Valor Estimado + Mensalidade */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="negocio-valor">
                Valor Estimado (R$)
              </StyledLabel>
              <StyledInput
                id="negocio-valor"
                name="valor_estimado"
                type="number"
                placeholder="0"
                value={formData.valor_estimado}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="negocio-mensalidade">
                Mensalidade (R$)
              </StyledLabel>
              <StyledInput
                id="negocio-mensalidade"
                name="valor_mensalidade"
                type="number"
                placeholder="0"
                value={formData.valor_mensalidade}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Observações */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="negocio-obs">Observações</StyledLabel>
            <StyledTextArea
              id="negocio-obs"
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
            title="Salvar Negócio"
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
