import { useNegocios } from '@/crm/hooks/useNegocios';
import { useUpdateProposta } from '@/crm/hooks/usePropostas';
import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { usePrecificacaoParametros } from '~/modules/crm/hooks/usePrecificacaoParametros';
import type { Proposta, PropostaStatus } from '~/types/supabase';
import { calcularHonorarios, formatarMoeda, PARAMETROS_DEFAULT, type CoeficientesEscolhidos, type PrecificacaoParametrosData, type RegimeTributario } from '~/utils/pricingEngine';

// --------------- Types ---------------

type EditarPropostaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Proposta;
};

type PropostaFormData = {
  numero: string;
  negocio_id: string;
  status: PropostaStatus;
  valor_setup: string;
  valor_mensalidade: string;
  validade_dias: string;
  observacoes: string;
  // Diagnóstico — Cálculo Inteligente
  faturamento_anual: string;
  numero_funcionarios: string;
  regime_tributario: string;
  fator_operacoes: string;
  fator_filiais: string;
  fator_automacao: string;
  fator_risco: string;
  pacote_escolhido: string;
};

const STATUS_LIST: PropostaStatus[] = [
  'Rascunho',
  'Enviada',
  'Aceita',
  'Recusada',
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

const StyledFieldTriple = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

// Styled components — Cálculo Inteligente
const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  padding-top: ${themeCssVariables.spacing[2]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledPricingSection = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPlanCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPlanCard = styled.div`
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};

  &:hover {
    border-color: ${themeCssVariables.accent.primary};
  }

  &[data-selected='true'] {
    border-color: ${themeCssVariables.accent.primary};
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledPlanName = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 700;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledPlanDetail = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledPlanTotal = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 700;
  color: ${themeCssVariables.accent.primary};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledPlanBadge = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: #fff;
  background: ${themeCssVariables.accent.primary};
  border-radius: 10px;
  padding: 2px 8px;
  display: inline-block;
  margin-top: ${themeCssVariables.spacing[1]};
`;

// --------------- Component ---------------

export const EditarPropostaModal = ({
  isOpen,
  onClose,
  initialData,
}: EditarPropostaModalProps) => {
  const [formData, setFormData] = useState<PropostaFormData>({
    numero: '',
    negocio_id: '',
    status: 'Rascunho',
    valor_setup: '',
    valor_mensalidade: '',
    validade_dias: '30',
    observacoes: '',
    faturamento_anual: '',
    numero_funcionarios: '',
    regime_tributario: 'simples',
    fator_operacoes: 'Serviços',
    fator_filiais: '1-3',
    fator_automacao: 'Sistema Básico',
    fator_risco: 'Baixo',
    pacote_escolhido: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: negocios } = useNegocios();
  const { mutateAsync: updateProposta, isPending } = useUpdateProposta();
  const { data: parametrosDb } = usePrecificacaoParametros();

  const parametros: PrecificacaoParametrosData = useMemo(
    () =>
      parametrosDb
        ? (parametrosDb as unknown as PrecificacaoParametrosData)
        : PARAMETROS_DEFAULT,
    [parametrosDb],
  );

  const planosCalculados = useMemo(() => {
    const fat = parseFloat(formData.faturamento_anual) || 0;
    if (fat === 0) return null;
    const regime = (formData.regime_tributario as RegimeTributario) || 'simples';
    const func = parseInt(formData.numero_funcionarios, 10) || 0;
    const nomesPlanos = Object.keys(parametros.plano_coeficientes);
    const baseCoefs: Omit<CoeficientesEscolhidos, 'plano'> = {
      operacoes: formData.fator_operacoes || 'Serviços',
      filiais: formData.fator_filiais || '1-3',
      automacao: formData.fator_automacao || 'Sistema Básico',
      riscoFiscal: formData.fator_risco || 'Baixo',
    };
    return nomesPlanos.map((plano) => ({
      plano,
      result: calcularHonorarios({
        faturamentoAnual: fat,
        regime,
        funcionarios: func,
        coeficientes: { ...baseCoefs, plano },
        parametros,
      }),
    }));
  }, [
    formData.faturamento_anual,
    formData.numero_funcionarios,
    formData.regime_tributario,
    formData.fator_operacoes,
    formData.fator_filiais,
    formData.fator_automacao,
    formData.fator_risco,
    parametros,
  ]);

  const handleSelectPlano = (planoNome: string, total: number) => {
    setFormData((prev) => ({
      ...prev,
      pacote_escolhido: planoNome,
      valor_mensalidade: total.toFixed(2),
    }));
  };

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        numero: initialData.numero ?? '',
        negocio_id: initialData.negocio_id ?? '',
        status: initialData.status ?? 'Rascunho',
        valor_setup: initialData.valor_setup != null
          ? String(initialData.valor_setup)
          : '',
        valor_mensalidade: initialData.valor_mensalidade != null
          ? String(initialData.valor_mensalidade)
          : '',
        validade_dias: initialData.validade_dias != null
          ? String(initialData.validade_dias)
          : '30',
        observacoes: initialData.observacoes ?? '',
        faturamento_anual:
          initialData.faturamento_anual != null
            ? String(initialData.faturamento_anual)
            : '',
        numero_funcionarios:
          initialData.numero_funcionarios != null
            ? String(initialData.numero_funcionarios)
            : '',
        regime_tributario: initialData.regime_tributario ?? 'simples',
        fator_operacoes: initialData.fator_operacoes ?? 'Serviços',
        fator_filiais: initialData.fator_filiais ?? '1-3',
        fator_automacao: initialData.fator_automacao ?? 'Sistema Básico',
        fator_risco: initialData.fator_risco ?? 'Baixo',
        pacote_escolhido: initialData.pacote_escolhido ?? '',
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

    if (!formData.numero.trim()) {
      setErrorMessage('Número da proposta é obrigatório.');
      return;
    }

    const valorSetup = parseFloat(formData.valor_setup) || 0;
    const valorMensalidade = parseFloat(formData.valor_mensalidade) || 0;
    const validadeDias = parseInt(formData.validade_dias) || 30;

    try {
      await updateProposta({
        id: initialData.id,
        numero: formData.numero.trim(),
        negocio_id: formData.negocio_id || null,
        status: formData.status,
        valor_setup: valorSetup,
        valor_mensalidade: valorMensalidade,
        valor_total: valorSetup + valorMensalidade,
        validade_dias: validadeDias,
        observacoes: formData.observacoes.trim() || null,
        faturamento_anual: parseFloat(formData.faturamento_anual) || null,
        numero_funcionarios:
          parseInt(formData.numero_funcionarios, 10) || null,
        regime_tributario: formData.regime_tributario || null,
        fator_operacoes: formData.fator_operacoes || null,
        fator_filiais: formData.fator_filiais || null,
        fator_automacao: formData.fator_automacao || null,
        fator_risco: formData.fator_risco || null,
        pacote_escolhido: formData.pacote_escolhido || null,
      });

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar proposta.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Editar Proposta</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="editar-proposta-form"
            ref={formRef}
          >
            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-numero">
                  Número<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledInput
                  id="edit-numero"
                  name="numero"
                  type="text"
                  placeholder="Ex: PROP-2025-001"
                  value={formData.numero}
                  onChange={handleChange}
                  autoFocus
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-status">Status</StyledLabel>
                <StyledSelect
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>
            </StyledField>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-negocio_id">
                Negócio Vinculado
              </StyledLabel>
              <StyledSelect
                id="edit-negocio_id"
                name="negocio_id"
                value={formData.negocio_id}
                onChange={handleChange}
              >
                <option value="">Sem negócio</option>
                {negocios?.map((neg) => (
                  <option key={neg.id} value={neg.id}>
                    {neg.titulo}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldTriple>
              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-valor_setup">
                  Valor Setup (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-valor_setup"
                  name="valor_setup"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_setup}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-valor_mensalidade">
                  Mensalidade (R$)
                </StyledLabel>
                <StyledInput
                  id="edit-valor_mensalidade"
                  name="valor_mensalidade"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_mensalidade}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="edit-validade_dias">
                  Validade (dias)
                </StyledLabel>
                <StyledInput
                  id="edit-validade_dias"
                  name="validade_dias"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.validade_dias}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledFieldTriple>

            {/* Cálculo Inteligente */}
            <StyledPricingSection>
              <StyledSectionTitle>
                Cálculo Inteligente de Honorários
              </StyledSectionTitle>

              <StyledFieldTriple>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-faturamento">
                    Faturamento Anual (R$)
                  </StyledLabel>
                  <StyledInput
                    id="edit-faturamento"
                    name="faturamento_anual"
                    type="number"
                    step="100000"
                    min="0"
                    placeholder="Ex: 3000000"
                    value={formData.faturamento_anual}
                    onChange={handleChange}
                  />
                </StyledFieldGroup>

                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-func">
                    Nº Funcionários
                  </StyledLabel>
                  <StyledInput
                    id="edit-func"
                    name="numero_funcionarios"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 10"
                    value={formData.numero_funcionarios}
                    onChange={handleChange}
                  />
                </StyledFieldGroup>

                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-regime">
                    Regime Tributário
                  </StyledLabel>
                  <StyledSelect
                    id="edit-regime"
                    name="regime_tributario"
                    value={formData.regime_tributario}
                    onChange={handleChange}
                  >
                    <option value="simples">Simples Nacional</option>
                    <option value="presumido">Lucro Presumido</option>
                    <option value="real">Lucro Real</option>
                  </StyledSelect>
                </StyledFieldGroup>
              </StyledFieldTriple>

              <StyledField>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-op">Operações</StyledLabel>
                  <StyledSelect
                    id="edit-op"
                    name="fator_operacoes"
                    value={formData.fator_operacoes}
                    onChange={handleChange}
                  >
                    {Object.entries(parametros.operacoes_coeficientes).map(
                      ([k, v]) => (
                        <option key={k} value={k}>
                          {k} ({v})
                        </option>
                      ),
                    )}
                  </StyledSelect>
                </StyledFieldGroup>

                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-filiais">Filiais</StyledLabel>
                  <StyledSelect
                    id="edit-filiais"
                    name="fator_filiais"
                    value={formData.fator_filiais}
                    onChange={handleChange}
                  >
                    {Object.entries(parametros.filiais_coeficientes).map(
                      ([k, v]) => (
                        <option key={k} value={k}>
                          {k} ({v})
                        </option>
                      ),
                    )}
                  </StyledSelect>
                </StyledFieldGroup>
              </StyledField>

              <StyledField>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-auto">Automação</StyledLabel>
                  <StyledSelect
                    id="edit-auto"
                    name="fator_automacao"
                    value={formData.fator_automacao}
                    onChange={handleChange}
                  >
                    {Object.entries(parametros.automacao_coeficientes).map(
                      ([k, v]) => (
                        <option key={k} value={k}>
                          {k} ({v})
                        </option>
                      ),
                    )}
                  </StyledSelect>
                </StyledFieldGroup>

                <StyledFieldGroup>
                  <StyledLabel htmlFor="edit-risco">Risco Fiscal</StyledLabel>
                  <StyledSelect
                    id="edit-risco"
                    name="fator_risco"
                    value={formData.fator_risco}
                    onChange={handleChange}
                  >
                    {Object.entries(parametros.risco_fiscal_coeficientes).map(
                      ([k, v]) => (
                        <option key={k} value={k}>
                          {k} ({v})
                        </option>
                      ),
                    )}
                  </StyledSelect>
                </StyledFieldGroup>
              </StyledField>

              {planosCalculados !== null && (
                <>
                  <StyledSectionTitle>
                    Escolha o Pacote (clique para preencher Mensalidade)
                  </StyledSectionTitle>
                  <StyledPlanCards>
                    {planosCalculados.map(({ plano, result }) => (
                      <StyledPlanCard
                        key={plano}
                        data-selected={
                          formData.pacote_escolhido === plano ? 'true' : 'false'
                        }
                        onClick={() =>
                          handleSelectPlano(plano, result.honorarioTotal)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handleSelectPlano(plano, result.honorarioTotal);
                        }}
                      >
                        <StyledPlanName>{plano}</StyledPlanName>
                        <StyledPlanDetail>
                          HRM: {formatarMoeda(result.hrmComCoeficientes)}
                        </StyledPlanDetail>
                        <StyledPlanDetail>
                          Folha: {formatarMoeda(result.honorarioFolha)}
                        </StyledPlanDetail>
                        <StyledPlanTotal>
                          {formatarMoeda(result.honorarioTotal)}/mês
                        </StyledPlanTotal>
                        {formData.pacote_escolhido === plano && (
                          <StyledPlanBadge>Selecionado</StyledPlanBadge>
                        )}
                      </StyledPlanCard>
                    ))}
                  </StyledPlanCards>
                </>
              )}
            </StyledPricingSection>

            <StyledFieldGroup>
              <StyledLabel htmlFor="edit-observacoes">Observações</StyledLabel>
              <StyledTextarea
                id="edit-observacoes"
                name="observacoes"
                placeholder="Condições especiais, descontos, observações..."
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
              form="editar-proposta-form"
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
