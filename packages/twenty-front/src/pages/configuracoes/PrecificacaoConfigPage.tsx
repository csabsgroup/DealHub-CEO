import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { IconCheck, IconCurrencyDollar } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
    usePrecificacaoParametros,
    useUpdatePrecificacaoParametros,
} from '~/modules/crm/hooks/usePrecificacaoParametros';
import {
    calcularHonorarios,
    formatarMoeda,
    formatarPercentual,
    PARAMETROS_DEFAULT,
    type CoeficientesEscolhidos,
    type PrecificacaoParametrosData,
    type RegimeTributario,
} from '~/utils/pricingEngine';

// ===================== STYLED COMPONENTS =====================

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledPageHeader = styled.div`
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0 0 ${themeCssVariables.spacing[1]};
`;

const StyledPageSubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0 0 ${themeCssVariables.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[8]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledCardHeader = styled.div`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledInput = styled.input`
  width: 90px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.primary};
  text-align: right;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.primary};

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.color.blue};
  color: #fff;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledDivider = styled.hr`
  border: none;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  margin: ${themeCssVariables.spacing[6]} 0;
`;

// Simulador

const StyledSimuladorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[6]};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSimuladorInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StyledFullInput = styled.input`
  width: 100%;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.primary};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledResultCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledResultLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledResultValue = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${themeCssVariables.spacing[3]};
  border-top: 2px solid ${themeCssVariables.border.color.medium};
`;

const StyledTotalLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 700;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledTotalValue = styled.span`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: 700;
  color: ${themeCssVariables.color.blue};
`;

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
`;

const StyledDetailItem = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  line-height: 1.5;
`;

const StyledSuccessMsg = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.color.blue};
  font-weight: 500;
`;

// ===================== HELPERS =====================

const jsonToEntries = (obj: Record<string, number>): [string, number][] =>
  Object.entries(obj);

// ===================== COMPONENT =====================

export const PrecificacaoConfigPage = () => {
  const { data: parametrosDb, isLoading } = usePrecificacaoParametros();
  const updateMutation = useUpdatePrecificacaoParametros();

  // Coeficientes editáveis (inicializa com DB ou defaults)
  const [editState, setEditState] = useState<PrecificacaoParametrosData | null>(
    null,
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializa editState quando os dados carregam
  const parametros: PrecificacaoParametrosData = useMemo(() => {
    if (editState) return editState;
    if (parametrosDb) {
      const initial: PrecificacaoParametrosData = {
        regime_coeficientes: parametrosDb.regime_coeficientes as Record<string, number>,
        folha_valores: parametrosDb.folha_valores as Record<string, number>,
        operacoes_coeficientes: parametrosDb.operacoes_coeficientes,
        filiais_coeficientes: parametrosDb.filiais_coeficientes,
        automacao_coeficientes: parametrosDb.automacao_coeficientes,
        risco_fiscal_coeficientes: parametrosDb.risco_fiscal_coeficientes,
        plano_coeficientes: parametrosDb.plano_coeficientes,
      };
      setEditState(initial);
      return initial;
    }
    return PARAMETROS_DEFAULT;
  }, [parametrosDb, editState]);

  // Simulador state
  const [simFaturamento, setSimFaturamento] = useState(3_000_000);
  const [simFuncionarios, setSimFuncionarios] = useState(10);
  const [simRegime, setSimRegime] = useState<RegimeTributario>('presumido');
  const [simCoefs, setSimCoefs] = useState<CoeficientesEscolhidos>({
    operacoes: 'Serviços',
    filiais: '1-3',
    automacao: 'Sistema Básico',
    riscoFiscal: 'Baixo',
    plano: 'Essencial',
  });

  // Cálculo em tempo real
  const resultado = useMemo(
    () =>
      calcularHonorarios({
        faturamentoAnual: simFaturamento,
        regime: simRegime,
        funcionarios: simFuncionarios,
        coeficientes: simCoefs,
        parametros,
      }),
    [simFaturamento, simRegime, simFuncionarios, simCoefs, parametros],
  );

  // Handlers de edição de coeficientes
  const updateCoeficiente = (
    grupo: keyof PrecificacaoParametrosData,
    key: string,
    valor: number,
  ) => {
    setEditState((prev) => {
      const base = prev ?? parametros;
      return {
        ...base,
        [grupo]: {
          ...(base[grupo] as Record<string, number>),
          [key]: valor,
        },
      };
    });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!parametrosDb || !editState) return;
    updateMutation.mutate(
      {
        id: parametrosDb.id,
        regime_coeficientes: editState.regime_coeficientes,
        folha_valores: editState.folha_valores,
        operacoes_coeficientes: editState.operacoes_coeficientes,
        filiais_coeficientes: editState.filiais_coeficientes,
        automacao_coeficientes: editState.automacao_coeficientes,
        risco_fiscal_coeficientes: editState.risco_fiscal_coeficientes,
        plano_coeficientes: editState.plano_coeficientes,
      },
      { onSuccess: () => setSaveSuccess(true) },
    );
  };

  if (isLoading) {
    return (
      <StyledPageContainer>
        <StyledPageHeader>
          <StyledPageTitle>Precificação</StyledPageTitle>
          <StyledPageSubtitle>Carregando parâmetros...</StyledPageSubtitle>
        </StyledPageHeader>
      </StyledPageContainer>
    );
  }

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Precificação de Honorários</StyledPageTitle>
        <StyledPageSubtitle>
          Metodologia Contador CEO — Configure os coeficientes base e simule
          honorários em tempo real.
        </StyledPageSubtitle>
      </StyledPageHeader>

      <StyledPageBody>
        {/* ======= SEÇÃO 1: COEFICIENTES ======= */}
        <StyledSectionTitle>
          <IconCurrencyDollar size={20} />
          Coeficientes Base
        </StyledSectionTitle>

        <StyledGrid>
          {/* Regime Tributário */}
          <CoeficienteCard
            titulo="Regime Tributário (Multiplicador)"
            dados={parametros.regime_coeficientes}
            grupo="regime_coeficientes"
            onUpdate={updateCoeficiente}
            formatValue={(v) => formatarPercentual(v)}
            step={0.0001}
          />

          {/* Folha de Pagamento */}
          <CoeficienteCard
            titulo="Folha de Pagamento (R$/funcionário)"
            dados={parametros.folha_valores}
            grupo="folha_valores"
            onUpdate={updateCoeficiente}
            formatValue={(v) => `R$ ${v.toFixed(2)}`}
            step={1}
          />

          {/* Operações */}
          <CoeficienteCard
            titulo="Operações"
            dados={parametros.operacoes_coeficientes}
            grupo="operacoes_coeficientes"
            onUpdate={updateCoeficiente}
          />

          {/* Filiais */}
          <CoeficienteCard
            titulo="Filiais"
            dados={parametros.filiais_coeficientes}
            grupo="filiais_coeficientes"
            onUpdate={updateCoeficiente}
          />

          {/* Automação */}
          <CoeficienteCard
            titulo="Automação"
            dados={parametros.automacao_coeficientes}
            grupo="automacao_coeficientes"
            onUpdate={updateCoeficiente}
          />

          {/* Risco Fiscal */}
          <CoeficienteCard
            titulo="Risco Fiscal"
            dados={parametros.risco_fiscal_coeficientes}
            grupo="risco_fiscal_coeficientes"
            onUpdate={updateCoeficiente}
          />

          {/* Plano */}
          <CoeficienteCard
            titulo="Plano"
            dados={parametros.plano_coeficientes}
            grupo="plano_coeficientes"
            onUpdate={updateCoeficiente}
          />
        </StyledGrid>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <StyledButton
            onClick={handleSave}
            disabled={updateMutation.isPending || !editState}
          >
            <IconCheck size={16} />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </StyledButton>
          {saveSuccess && (
            <StyledSuccessMsg>Parâmetros atualizados!</StyledSuccessMsg>
          )}
        </div>

        <StyledDivider />

        {/* ======= SEÇÃO 2: SIMULADOR ======= */}
        <StyledSectionTitle>Simulador de Honorários</StyledSectionTitle>

        <StyledSimuladorContainer>
          <StyledSimuladorInputs>
            <StyledFormGroup>
              <StyledLabel>Faturamento Anual (R$)</StyledLabel>
              <StyledFullInput
                type="number"
                min={0}
                step={100000}
                value={simFaturamento}
                onChange={(e) =>
                  setSimFaturamento(Math.max(0, Number(e.target.value)))
                }
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Número de Funcionários</StyledLabel>
              <StyledFullInput
                type="number"
                min={0}
                step={1}
                value={simFuncionarios}
                onChange={(e) =>
                  setSimFuncionarios(Math.max(0, Math.floor(Number(e.target.value))))
                }
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Regime Tributário</StyledLabel>
              <StyledSelect
                value={simRegime}
                onChange={(e) =>
                  setSimRegime(e.target.value as RegimeTributario)
                }
              >
                <option value="simples">Simples Nacional</option>
                <option value="presumido">Lucro Presumido</option>
                <option value="real">Lucro Real</option>
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Operações</StyledLabel>
              <StyledSelect
                value={simCoefs.operacoes}
                onChange={(e) =>
                  setSimCoefs((p) => ({ ...p, operacoes: e.target.value }))
                }
              >
                {Object.keys(parametros.operacoes_coeficientes).map((k) => (
                  <option key={k} value={k}>
                    {k} ({parametros.operacoes_coeficientes[k]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Filiais</StyledLabel>
              <StyledSelect
                value={simCoefs.filiais}
                onChange={(e) =>
                  setSimCoefs((p) => ({ ...p, filiais: e.target.value }))
                }
              >
                {Object.keys(parametros.filiais_coeficientes).map((k) => (
                  <option key={k} value={k}>
                    {k} ({parametros.filiais_coeficientes[k]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Automação</StyledLabel>
              <StyledSelect
                value={simCoefs.automacao}
                onChange={(e) =>
                  setSimCoefs((p) => ({ ...p, automacao: e.target.value }))
                }
              >
                {Object.keys(parametros.automacao_coeficientes).map((k) => (
                  <option key={k} value={k}>
                    {k} ({parametros.automacao_coeficientes[k]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Risco Fiscal</StyledLabel>
              <StyledSelect
                value={simCoefs.riscoFiscal}
                onChange={(e) =>
                  setSimCoefs((p) => ({ ...p, riscoFiscal: e.target.value }))
                }
              >
                {Object.keys(parametros.risco_fiscal_coeficientes).map((k) => (
                  <option key={k} value={k}>
                    {k} ({parametros.risco_fiscal_coeficientes[k]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Plano</StyledLabel>
              <StyledSelect
                value={simCoefs.plano}
                onChange={(e) =>
                  setSimCoefs((p) => ({ ...p, plano: e.target.value }))
                }
              >
                {Object.keys(parametros.plano_coeficientes).map((k) => (
                  <option key={k} value={k}>
                    {k} ({parametros.plano_coeficientes[k]})
                  </option>
                ))}
              </StyledSelect>
            </StyledFormGroup>
          </StyledSimuladorInputs>

          {/* RESULTADO */}
          <StyledResultCard>
            <StyledSectionTitle style={{ margin: 0 }}>
              Resultado
            </StyledSectionTitle>

            <StyledResultRow>
              <StyledResultLabel>HRM Base (Fat. × Mult.)</StyledResultLabel>
              <StyledResultValue>
                {formatarMoeda(resultado.hrmBase)}
              </StyledResultValue>
            </StyledResultRow>

            <StyledResultRow>
              <StyledResultLabel>HRM c/ Coeficientes</StyledResultLabel>
              <StyledResultValue>
                {formatarMoeda(resultado.hrmComCoeficientes)}
              </StyledResultValue>
            </StyledResultRow>

            <StyledResultRow>
              <StyledResultLabel>
                Honorário Folha ({simFuncionarios} func.)
              </StyledResultLabel>
              <StyledResultValue>
                {formatarMoeda(resultado.honorarioFolha)}
              </StyledResultValue>
            </StyledResultRow>

            <StyledTotalRow>
              <StyledTotalLabel>Honorário Total Sugerido</StyledTotalLabel>
              <StyledTotalValue>
                {formatarMoeda(resultado.honorarioTotal)}
              </StyledTotalValue>
            </StyledTotalRow>

            <StyledDivider />

            <StyledDetailItem>
              <strong>Faturamento Mensal:</strong>{' '}
              {formatarMoeda(resultado.detalhesCalculo.faturamentoMensal)}
            </StyledDetailItem>
            <StyledDetailItem>
              <strong>Multiplicador Original:</strong>{' '}
              {formatarPercentual(resultado.multiplicadorOriginal)}
            </StyledDetailItem>
            <StyledDetailItem>
              <strong>Multiplicador Ajustado:</strong>{' '}
              {formatarPercentual(resultado.multiplicadorAjustado)}
              {resultado.detalhesCalculo.reducaoAplicada > 0 && (
                <>
                  {' '}
                  (redução de{' '}
                  {formatarPercentual(
                    resultado.detalhesCalculo.reducaoAplicada,
                  )}
                  )
                </>
              )}
            </StyledDetailItem>
            <StyledDetailItem>
              <strong>Faixa:</strong> {resultado.faixaAtual}
            </StyledDetailItem>
            {resultado.detalhesCalculo.regraDeOuroAplicada && (
              <StyledBadge>
                Regra de Ouro aplicada (piso protegido)
              </StyledBadge>
            )}
          </StyledResultCard>
        </StyledSimuladorContainer>
      </StyledPageBody>
    </StyledPageContainer>
  );
};

// ===================== SUB-COMPONENT: CoeficienteCard =====================

type CoeficienteCardProps = {
  titulo: string;
  dados: Record<string, number>;
  grupo: keyof PrecificacaoParametrosData;
  onUpdate: (
    grupo: keyof PrecificacaoParametrosData,
    key: string,
    valor: number,
  ) => void;
  formatValue?: (v: number) => string;
  step?: number;
};

const CoeficienteCard = ({
  titulo,
  dados,
  grupo,
  onUpdate,
  formatValue,
  step = 0.01,
}: CoeficienteCardProps) => {
  return (
    <StyledCard>
      <StyledCardHeader>{titulo}</StyledCardHeader>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>Critério</StyledTh>
            <StyledTh>Valor</StyledTh>
          </tr>
        </thead>
        <tbody>
          {jsonToEntries(dados).map(([key, valor]) => (
            <tr key={key}>
              <StyledTd>{key}</StyledTd>
              <StyledTd>
                <StyledInput
                  type="number"
                  step={step}
                  value={valor}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) {
                      onUpdate(grupo, key, v);
                    }
                  }}
                />
                {formatValue && (
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      color: 'var(--t-font-color-tertiary)',
                    }}
                  >
                    {formatValue(valor)}
                  </span>
                )}
              </StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledCard>
  );
};
