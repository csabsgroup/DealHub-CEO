// Motor de Precificação — Metodologia Contador CEO
// Função pura TypeScript (zero dependências React) para cálculo de honorários contábeis

// ===================== TYPES =====================

export type RegimeTributario = 'simples' | 'presumido' | 'real';

export type RegimeCoeficientes = Record<RegimeTributario, number>;
export type FolhaValores = Record<RegimeTributario, number>;

export type OperacoesCoeficientes = Record<string, number>;
export type FiliaisCoeficientes = Record<string, number>;
export type AutomacaoCoeficientes = Record<string, number>;
export type RiscoFiscalCoeficientes = Record<string, number>;
export type PlanoCoeficientes = Record<string, number>;

export type PrecificacaoParametrosData = {
  regime_coeficientes: RegimeCoeficientes;
  folha_valores: FolhaValores;
  operacoes_coeficientes: OperacoesCoeficientes;
  filiais_coeficientes: FiliaisCoeficientes;
  automacao_coeficientes: AutomacaoCoeficientes;
  risco_fiscal_coeficientes: RiscoFiscalCoeficientes;
  plano_coeficientes: PlanoCoeficientes;
};

export type CoeficientesEscolhidos = {
  operacoes: string;
  filiais: string;
  automacao: string;
  riscoFiscal: string;
  plano: string;
};

export type CalculoInput = {
  faturamentoAnual: number;
  regime: RegimeTributario;
  funcionarios: number;
  coeficientes: CoeficientesEscolhidos;
  parametros: PrecificacaoParametrosData;
};

export type CalculoResult = {
  hrmBase: number;
  hrmComCoeficientes: number;
  honorarioFolha: number;
  honorarioTotal: number;
  multiplicadorOriginal: number;
  multiplicadorAjustado: number;
  faixaAtual: string;
  detalhesCalculo: DetalhesCalculo;
};

export type DetalhesCalculo = {
  faturamentoMensal: number;
  regime: RegimeTributario;
  multiplicadorBase: number;
  reducaoAplicada: number;
  cicloAtual: number;
  faseReducao: string;
  coeficientesAplicados: {
    operacoes: { label: string; valor: number };
    filiais: { label: string; valor: number };
    automacao: { label: string; valor: number };
    riscoFiscal: { label: string; valor: number };
    plano: { label: string; valor: number };
  };
  folhaPorFuncionario: number;
  regraDeOuroAplicada: boolean;
};

// ===================== DEFAULTS =====================

export const PARAMETROS_DEFAULT: PrecificacaoParametrosData = {
  regime_coeficientes: { simples: 0.0035, presumido: 0.005, real: 0.0075 },
  folha_valores: { simples: 45, presumido: 55, real: 65 },
  operacoes_coeficientes: {
    'Serviços': 1.0,
    'Comércio': 1.1,
    'Terceiro Setor': 1.1,
    'Comércio + Serviços': 1.2,
    'Serv. Regulamentado': 1.35,
    'Indústria': 1.4,
    'Internacional': 1.5,
  },
  filiais_coeficientes: {
    '1-3': 1.0,
    '4-10': 1.1,
    '10+': 1.3,
  },
  automacao_coeficientes: {
    'ERP + BI Avançado': 0.85,
    'ERP Integrado': 0.9,
    'Sistema Básico': 1.0,
    'Planilhas': 1.05,
    'Sem Sistema': 1.15,
  },
  risco_fiscal_coeficientes: {
    'Baixo': 1.0,
    'Médio': 1.1,
    'Alto': 1.25,
    'Muito Alto': 1.4,
  },
  plano_coeficientes: {
    'Essencial': 1.0,
    'Premium': 1.18,
    'Profissional': 1.35,
  },
};

// ===================== BREAKPOINTS DE FATURAMENTO =====================

// Fase 1: 9M → 29M em ciclos de 5M
// Dentro de cada ciclo de 5M, redução progressiva:
//   +1M → -0.0001, +3M → -0.0003, +5M → -0.0005

// Fase 2: 29M → 57M em ciclos de 7M
// Primeiros 5M → mesma sub-redução progressiva
// Últimos 2M → estável (consolidação)

type Breakpoint = {
  faturamento: number;
  reducaoAcumulada: number;
  fase: string;
  ciclo: number;
};

const buildBreakpoints = (): Breakpoint[] => {
  const breakpoints: Breakpoint[] = [];
  let reducaoAcumulada = 0;

  // Base: até 9M — sem redução
  breakpoints.push({
    faturamento: 0,
    reducaoAcumulada: 0,
    fase: 'Base',
    ciclo: 0,
  });
  breakpoints.push({
    faturamento: 9_000_000,
    reducaoAcumulada: 0,
    fase: 'Base',
    ciclo: 0,
  });

  // Fase 1: 9M → 29M — 4 ciclos de 5M
  for (let ciclo = 1; ciclo <= 4; ciclo++) {
    const inicioFaixa = 9_000_000 + (ciclo - 1) * 5_000_000;

    // +1M no ciclo → -0.0001
    breakpoints.push({
      faturamento: inicioFaixa + 1_000_000,
      reducaoAcumulada: reducaoAcumulada + 0.0001,
      fase: 'Fase 1 (9M-29M)',
      ciclo,
    });

    // +3M no ciclo → -0.0003
    breakpoints.push({
      faturamento: inicioFaixa + 3_000_000,
      reducaoAcumulada: reducaoAcumulada + 0.0003,
      fase: 'Fase 1 (9M-29M)',
      ciclo,
    });

    // +5M (fim do ciclo) → -0.0005
    reducaoAcumulada += 0.0005;
    breakpoints.push({
      faturamento: inicioFaixa + 5_000_000,
      reducaoAcumulada,
      fase: 'Fase 1 (9M-29M)',
      ciclo,
    });
  }

  // Fase 2: 29M → 57M — 4 ciclos de 7M
  for (let ciclo = 1; ciclo <= 4; ciclo++) {
    const inicioFaixa = 29_000_000 + (ciclo - 1) * 7_000_000;

    // Primeiros 5M do ciclo: redução progressiva
    // +1M → -0.0001
    breakpoints.push({
      faturamento: inicioFaixa + 1_000_000,
      reducaoAcumulada: reducaoAcumulada + 0.0001,
      fase: 'Fase 2 (29M-57M)',
      ciclo,
    });

    // +3M → -0.0003
    breakpoints.push({
      faturamento: inicioFaixa + 3_000_000,
      reducaoAcumulada: reducaoAcumulada + 0.0003,
      fase: 'Fase 2 (29M-57M)',
      ciclo,
    });

    // +5M → -0.0005
    reducaoAcumulada += 0.0005;
    breakpoints.push({
      faturamento: inicioFaixa + 5_000_000,
      reducaoAcumulada,
      fase: 'Fase 2 (29M-57M)',
      ciclo,
    });

    // Últimos 2M: estável (consolidação — sem redução adicional)
    breakpoints.push({
      faturamento: inicioFaixa + 7_000_000,
      reducaoAcumulada,
      fase: 'Fase 2 (29M-57M) - Consolidação',
      ciclo,
    });
  }

  return breakpoints;
};

const BREAKPOINTS = buildBreakpoints();

// ===================== CORE: Multiplicador Ajustado =====================

type MultiplicadorInfo = {
  multiplicadorAjustado: number;
  reducaoAplicada: number;
  faixaAtual: string;
  cicloAtual: number;
  faseReducao: string;
};

const calcularMultiplicadorAjustado = (
  faturamentoAnual: number,
  multiplicadorBase: number,
): MultiplicadorInfo => {
  if (faturamentoAnual <= 9_000_000) {
    return {
      multiplicadorAjustado: multiplicadorBase,
      reducaoAplicada: 0,
      faixaAtual: 'Até R$ 9M (Base)',
      cicloAtual: 0,
      faseReducao: 'Sem redução',
    };
  }

  // Encontra o breakpoint aplicável (o maior faturamento <= faturamento do cliente)
  let breakpointAtual = BREAKPOINTS[0];
  for (const bp of BREAKPOINTS) {
    if (bp.faturamento <= faturamentoAnual) {
      breakpointAtual = bp;
    } else {
      break;
    }
  }

  // Interpolação linear entre breakpoints para valores intermediários
  let reducaoFinal = breakpointAtual.reducaoAcumulada;

  // Encontra o próximo breakpoint para interpolar
  const idxAtual = BREAKPOINTS.indexOf(breakpointAtual);
  if (idxAtual < BREAKPOINTS.length - 1) {
    const proximoBp = BREAKPOINTS[idxAtual + 1];
    const faixaSize = proximoBp.faturamento - breakpointAtual.faturamento;
    if (faixaSize > 0) {
      const posicaoNaFaixa =
        faturamentoAnual - breakpointAtual.faturamento;
      const proporcao = posicaoNaFaixa / faixaSize;
      const reducaoIncremental =
        proximoBp.reducaoAcumulada - breakpointAtual.reducaoAcumulada;
      reducaoFinal += reducaoIncremental * proporcao;
    }
  }

  // O multiplicador nunca fica negativo
  const multiplicadorAjustado = Math.max(
    0.0001,
    multiplicadorBase - reducaoFinal,
  );

  let faixaLabel = 'Acima de R$ 57M';
  if (faturamentoAnual <= 29_000_000) {
    faixaLabel = `R$ 9M – R$ 29M (Fase 1)`;
  } else if (faturamentoAnual <= 57_000_000) {
    faixaLabel = `R$ 29M – R$ 57M (Fase 2)`;
  }

  return {
    multiplicadorAjustado,
    reducaoAplicada: reducaoFinal,
    faixaAtual: faixaLabel,
    cicloAtual: breakpointAtual.ciclo,
    faseReducao: breakpointAtual.fase,
  };
};

// ===================== REGRA DE OURO =====================
// O HRM NUNCA pode ser menor que o teto da faixa de faturamento anterior.
// Implementação: calcula HRM normalizado (sem coeficientes multiplicadores)
// em cada breakpoint até o faturamento do cliente; se o HRM natural
// for menor que o máximo anterior, usa o máximo.

const aplicarRegraDeOuro = (
  faturamentoAnual: number,
  multiplicadorBase: number,
): { multiplicadorCorrigido: number; regraAplicada: boolean } => {
  // Coleta todos os breakpoints até o faturamento do cliente
  const bpsRelevantes = BREAKPOINTS.filter(
    (bp) => bp.faturamento > 0 && bp.faturamento <= faturamentoAnual,
  );

  let maxHrm = 0;
  let regraFoiAplicada = false;

  for (const bp of bpsRelevantes) {
    const multAjustado = Math.max(0.0001, multiplicadorBase - bp.reducaoAcumulada);
    const hrmNoBp = (bp.faturamento / 12) * multAjustado;
    if (hrmNoBp > maxHrm) {
      maxHrm = hrmNoBp;
    }
  }

  // Calcula o HRM natural no faturamento solicitado
  const infoMult = calcularMultiplicadorAjustado(
    faturamentoAnual,
    multiplicadorBase,
  );
  const hrmNatural = (faturamentoAnual / 12) * infoMult.multiplicadorAjustado;

  if (hrmNatural < maxHrm && maxHrm > 0) {
    // Corrige o multiplicador para que o HRM seja pelo menos o maxHrm
    const multiplicadorCorrigido = (maxHrm * 12) / faturamentoAnual;
    regraFoiAplicada = true;
    return { multiplicadorCorrigido, regraAplicada: regraFoiAplicada };
  }

  return {
    multiplicadorCorrigido: infoMult.multiplicadorAjustado,
    regraAplicada: false,
  };
};

// ===================== FUNÇÃO PRINCIPAL =====================

export const calcularHonorarios = (input: CalculoInput): CalculoResult => {
  const { faturamentoAnual, regime, funcionarios, coeficientes, parametros } =
    input;

  const faturamentoMensal = faturamentoAnual / 12;
  const multiplicadorBase = parametros.regime_coeficientes[regime];
  const folhaPorFuncionario = parametros.folha_valores[regime];

  // 1. Calcula multiplicador ajustado pela faixa de faturamento
  const infoMult = calcularMultiplicadorAjustado(
    faturamentoAnual,
    multiplicadorBase,
  );

  // 2. Aplica Regra de Ouro (monotônica não decrescente)
  const { multiplicadorCorrigido, regraAplicada } = aplicarRegraDeOuro(
    faturamentoAnual,
    multiplicadorBase,
  );

  // 3. Resolve os coeficientes escolhidos
  const coefOperacoes =
    parametros.operacoes_coeficientes[coeficientes.operacoes] ?? 1.0;
  const coefFiliais =
    parametros.filiais_coeficientes[coeficientes.filiais] ?? 1.0;
  const coefAutomacao =
    parametros.automacao_coeficientes[coeficientes.automacao] ?? 1.0;
  const coefRisco =
    parametros.risco_fiscal_coeficientes[coeficientes.riscoFiscal] ?? 1.0;
  const coefPlano =
    parametros.plano_coeficientes[coeficientes.plano] ?? 1.0;

  // 4. Calcula HRM base (faturamento × multiplicador ajustado)
  const hrmBase = faturamentoMensal * multiplicadorCorrigido;

  // 5. HRM completo com todos os coeficientes
  const hrmComCoeficientes =
    hrmBase * coefOperacoes * coefFiliais * coefAutomacao * coefRisco * coefPlano;

  // 6. Honorário de folha de pagamento
  const honorarioFolha = funcionarios * folhaPorFuncionario;

  // 7. Honorário total
  const honorarioTotal = hrmComCoeficientes + honorarioFolha;

  return {
    hrmBase,
    hrmComCoeficientes,
    honorarioFolha,
    honorarioTotal,
    multiplicadorOriginal: multiplicadorBase,
    multiplicadorAjustado: multiplicadorCorrigido,
    faixaAtual: infoMult.faixaAtual,
    detalhesCalculo: {
      faturamentoMensal,
      regime,
      multiplicadorBase,
      reducaoAplicada: infoMult.reducaoAplicada,
      cicloAtual: infoMult.cicloAtual,
      faseReducao: infoMult.faseReducao,
      coeficientesAplicados: {
        operacoes: { label: coeficientes.operacoes, valor: coefOperacoes },
        filiais: { label: coeficientes.filiais, valor: coefFiliais },
        automacao: { label: coeficientes.automacao, valor: coefAutomacao },
        riscoFiscal: { label: coeficientes.riscoFiscal, valor: coefRisco },
        plano: { label: coeficientes.plano, valor: coefPlano },
      },
      folhaPorFuncionario,
      regraDeOuroAplicada: regraAplicada,
    },
  };
};

// ===================== HELPERS DE FORMATAÇÃO =====================

export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatarPercentual = (valor: number): string => {
  return (valor * 100).toFixed(4) + '%';
};
