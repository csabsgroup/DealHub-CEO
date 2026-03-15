import { useNegocios } from '@/crm/hooks/useNegocios';
import { useCreateProposta, useCreatePropostaItem } from '@/crm/hooks/usePropostas';
import { useServicos } from '@/crm/hooks/useServicos';
import { styled } from '@linaria/react';
import { useMemo, useRef, useState } from 'react';
import { IconPlus, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { usePrecificacaoParametros } from '~/modules/crm/hooks/usePrecificacaoParametros';
import type { PropostaStatus, ServicoTipoCobranca } from '~/types/supabase';
import { calcularHonorarios, formatarMoeda, PARAMETROS_DEFAULT, type CoeficientesEscolhidos, type PrecificacaoParametrosData, type RegimeTributario } from '~/utils/pricingEngine';

// --------------- Types ---------------

type NovaPropostaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PropostaFormData = {
  negocio_id: string;
  numero: string;
  valor_setup: string;
  valor_mensalidade: string;
  validade_dias: string;
  status: PropostaStatus;
  observacoes: string;
  // Campos do Diagnóstico — Cálculo Inteligente
  faturamento_anual: string;
  numero_funcionarios: string;
  regime_tributario: string;
  fator_operacoes: string;
  fator_filiais: string;
  fator_automacao: string;
  fator_risco: string;
  pacote_escolhido: string;
};

type ItemLine = {
  servico_id: string;
  descricao: string;
  quantidade: string;
  valor_unitario: string;
  tipo_cobranca: ServicoTipoCobranca;
};

const EMPTY_FORM: PropostaFormData = {
  negocio_id: '',
  numero: '',
  valor_setup: '',
  valor_mensalidade: '',
  validade_dias: '30',
  status: 'Rascunho',
  observacoes: '',
  faturamento_anual: '',
  numero_funcionarios: '',
  regime_tributario: 'simples',
  fator_operacoes: 'Serviços',
  fator_filiais: '1-3',
  fator_automacao: 'Sistema Básico',
  fator_risco: 'Baixo',
  pacote_escolhido: '',
};

const EMPTY_ITEM: ItemLine = {
  servico_id: '',
  descricao: '',
  quantidade: '1',
  valor_unitario: '',
  tipo_cobranca: 'Recorrente',
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

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  padding-top: ${themeCssVariables.spacing[2]};
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: ${themeCssVariables.spacing[2]};
  align-items: end;
`;

const StyledRemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: transparent;
  cursor: pointer;
  color: ${themeCssVariables.font.color.secondary};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${themeCssVariables.background.danger};
    color: ${themeCssVariables.font.color.danger};
  }
`;

const StyledItemsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Styled components — Cálculo Inteligente
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

// --------------- Helpers ---------------

const generateNumero = (): string => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `PROP-${y}${m}-${seq}`;
};

// --------------- Component ---------------

export const NovaPropostaModal = ({
  isOpen,
  onClose,
}: NovaPropostaModalProps) => {
  const [formData, setFormData] = useState<PropostaFormData>({
    ...EMPTY_FORM,
    numero: generateNumero(),
  });
  const [items, setItems] = useState<ItemLine[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSelectPlano = (planoNome: string, total: number) => {
    setFormData((prev) => ({
      ...prev,
      pacote_escolhido: planoNome,
      valor_mensalidade: total.toFixed(2),
    }));
  };

  const { data: negocios } = useNegocios();
  const { data: servicos } = useServicos({ isActive: true });
  const { data: parametrosDb } = usePrecificacaoParametros();
  const { mutateAsync: createProposta, isPending: creatingProposta } =
    useCreateProposta();
  const { mutateAsync: createItem, isPending: creatingItem } =
    useCreatePropostaItem();

  const isPending = creatingProposta || creatingItem;

  // Monta PrecificacaoParametrosData a partir do DB ou usa defaults
  const parametros: PrecificacaoParametrosData = useMemo(
    () =>
      parametrosDb
        ? (parametrosDb as unknown as PrecificacaoParametrosData)
        : PARAMETROS_DEFAULT,
    [parametrosDb],
  );

  // Cálcula os 3 planos em tempo real
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
    setFormData({ ...EMPTY_FORM, numero: generateNumero() });
    setItems([]);
    setErrorMessage(null);
    onClose();
  };

  // Item management
  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ItemLine,
    value: string,
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill from service catalog
      if (field === 'servico_id' && value) {
        const svc = servicos?.find((s) => s.id === value);
        if (svc) {
          updated[index].descricao = svc.nome;
          updated[index].valor_unitario = String(svc.preco_sugerido);
          updated[index].tipo_cobranca = svc.tipo_cobranca;
        }
      }

      return updated;
    });
  };

  // Calculate totals from items
  const calcTotalFromItems = (): number => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantidade) || 0;
      const price = parseFloat(item.valor_unitario) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      setErrorMessage('Número da proposta é obrigatório.');
      return;
    }

    const valorSetup = parseFloat(formData.valor_setup) || 0;
    const valorMensalidade = parseFloat(formData.valor_mensalidade) || 0;
    const itemsTotal = calcTotalFromItems();
    const valorTotal = valorSetup + valorMensalidade + itemsTotal;

    try {
      const result = await createProposta({
        negocio_id: formData.negocio_id || null,
        numero: formData.numero.trim(),
        versao: 1,
        valor_total: valorTotal,
        valor_setup: valorSetup,
        valor_mensalidade: valorMensalidade,
        validade_dias: parseInt(formData.validade_dias, 10) || 30,
        data_validade: null,
        status: formData.status,
        observacoes: formData.observacoes.trim() || null,
        criado_por_id: null,
        // Campos do Cálculo Inteligente
        faturamento_anual: parseFloat(formData.faturamento_anual) || null,
        numero_funcionarios: parseInt(formData.numero_funcionarios, 10) || null,
        regime_tributario: formData.regime_tributario || null,
        fator_operacoes: formData.fator_operacoes || null,
        fator_filiais: formData.fator_filiais || null,
        fator_automacao: formData.fator_automacao || null,
        fator_risco: formData.fator_risco || null,
        pacote_escolhido: formData.pacote_escolhido || null,
      });

      // Create proposal items
      const propostaId = (result as Record<string, unknown>)?.id as
        | string
        | undefined;
      if (propostaId && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const qty = parseFloat(item.quantidade) || 1;
          const unitPrice = parseFloat(item.valor_unitario) || 0;
          await createItem({
            proposta_id: propostaId,
            servico_id: item.servico_id || null,
            descricao: item.descricao || 'Item',
            quantidade: qty,
            valor_unitario: unitPrice,
            valor_total: qty * unitPrice,
            tipo_cobranca: item.tipo_cobranca,
            posicao: i,
          });
        }
      }

      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar proposta.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="large" onBackdropMouseDown={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>Nova Proposta</StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledForm
            onSubmit={handleSubmit}
            id="nova-proposta-form"
            ref={formRef}
          >
            {/* Negócio + Número */}
            <StyledField>
              <StyledFieldGroup>
                <StyledLabel htmlFor="proposta-negocio">
                  Negócio Vinculado
                </StyledLabel>
                <StyledSelect
                  id="proposta-negocio"
                  name="negocio_id"
                  value={formData.negocio_id}
                  onChange={handleChange}
                >
                  <option value="">Nenhum (avulsa)</option>
                  {(negocios ?? []).map((neg) => (
                    <option key={neg.id} value={neg.id}>
                      {neg.titulo}
                    </option>
                  ))}
                </StyledSelect>
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="proposta-numero">
                  Número<StyledRequired>*</StyledRequired>
                </StyledLabel>
                <StyledInput
                  id="proposta-numero"
                  name="numero"
                  type="text"
                  placeholder="PROP-2503-0001"
                  value={formData.numero}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledField>

            {/* Valor Setup + Valor Mensalidade + Validade */}
            <StyledFieldTriple>
              <StyledFieldGroup>
                <StyledLabel htmlFor="proposta-setup">
                  Valor Setup (R$)
                </StyledLabel>
                <StyledInput
                  id="proposta-setup"
                  name="valor_setup"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor_setup}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="proposta-mensalidade">
                  Valor Mensalidade (R$)
                </StyledLabel>
                <StyledInput
                  id="proposta-mensalidade"
                  name="valor_mensalidade"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor_mensalidade}
                  onChange={handleChange}
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel htmlFor="proposta-validade">
                  Validade (dias)
                </StyledLabel>
                <StyledInput
                  id="proposta-validade"
                  name="validade_dias"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.validade_dias}
                  onChange={handleChange}
                />
              </StyledFieldGroup>
            </StyledFieldTriple>

            {/* Status */}
            <StyledFieldGroup>
              <StyledLabel htmlFor="proposta-status">Status</StyledLabel>
              <StyledSelect
                id="proposta-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Rascunho">Rascunho</option>
                <option value="Enviada">Enviada</option>
                <option value="Aceita">Aceita</option>
                <option value="Recusada">Recusada</option>
              </StyledSelect>
            </StyledFieldGroup>

            {/* Cálculo Inteligente */}
            <StyledPricingSection>
              <StyledSectionTitle>
                Cálculo Inteligente de Honorários
              </StyledSectionTitle>

              {/* Linha 1: Faturamento + Funcionários + Regime */}
              <StyledFieldTriple>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="p-faturamento">
                    Faturamento Anual (R$)
                  </StyledLabel>
                  <StyledInput
                    id="p-faturamento"
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
                  <StyledLabel htmlFor="p-func">Nº Funcionários</StyledLabel>
                  <StyledInput
                    id="p-func"
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
                  <StyledLabel htmlFor="p-regime">Regime Tributário</StyledLabel>
                  <StyledSelect
                    id="p-regime"
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

              {/* Linha 2: Operações + Filiais */}
              <StyledField>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="p-op">Operações</StyledLabel>
                  <StyledSelect
                    id="p-op"
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
                  <StyledLabel htmlFor="p-filiais">Filiais</StyledLabel>
                  <StyledSelect
                    id="p-filiais"
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

              {/* Linha 3: Automação + Risco */}
              <StyledField>
                <StyledFieldGroup>
                  <StyledLabel htmlFor="p-auto">Automação</StyledLabel>
                  <StyledSelect
                    id="p-auto"
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
                  <StyledLabel htmlFor="p-risco">Risco Fiscal</StyledLabel>
                  <StyledSelect
                    id="p-risco"
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

              {/* Cards de Plano — só aparecem quando há faturamento */}
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

            {/* Itens da Proposta */}
            <StyledSectionTitle>
              <StyledItemsHeader>
                <span>Itens da Proposta</span>
                <Button
                  variant="secondary"
                  accent="blue"
                  size="small"
                  title="Adicionar Item"
                  Icon={IconPlus}
                  onClick={addItem}
                  type="button"
                />
              </StyledItemsHeader>
            </StyledSectionTitle>

            {items.map((item, index) => (
              <StyledItemRow key={index}>
                <StyledFieldGroup>
                  {index === 0 && <StyledLabel>Serviço</StyledLabel>}
                  <StyledSelect
                    value={item.servico_id}
                    onChange={(e) =>
                      updateItem(index, 'servico_id', e.target.value)
                    }
                  >
                    <option value="">Selecione um serviço...</option>
                    {(servicos ?? []).map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.nome} ({svc.tipo_cobranca})
                      </option>
                    ))}
                  </StyledSelect>
                </StyledFieldGroup>

                <StyledFieldGroup>
                  {index === 0 && <StyledLabel>Qtde</StyledLabel>}
                  <StyledInput
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      updateItem(index, 'quantidade', e.target.value)
                    }
                  />
                </StyledFieldGroup>

                <StyledFieldGroup>
                  {index === 0 && <StyledLabel>Valor Unit. (R$)</StyledLabel>}
                  <StyledInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.valor_unitario}
                    onChange={(e) =>
                      updateItem(index, 'valor_unitario', e.target.value)
                    }
                  />
                </StyledFieldGroup>

                <StyledRemoveButton
                  type="button"
                  onClick={() => removeItem(index)}
                  title="Remover item"
                >
                  <IconTrash size={14} />
                </StyledRemoveButton>
              </StyledItemRow>
            ))}

            {/* Observações */}
            <StyledFieldGroup>
              <StyledLabel htmlFor="proposta-obs">Observações</StyledLabel>
              <StyledTextArea
                id="proposta-obs"
                name="observacoes"
                placeholder="Condições especiais, observações..."
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
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
              title={isPending ? 'Salvando...' : 'Criar Proposta'}
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isPending}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
