// Tipagens TypeScript para todas as tabelas do Supabase (Fase 2)
// Cada tipo reflete exatamente o schema SQL das migrations 00008-00021

// ===================== RBAC DINÂMICO (migration 00021) =====================

// Permissões granulares disponíveis no sistema RBAC
export type RbacPermissoes = {
  can_view_all_deals: boolean;
  can_delete_deals: boolean;
  can_access_settings: boolean;
  can_manage_financials: boolean;
  can_export_data: boolean;
};

export const DEFAULT_PERMISSOES: RbacPermissoes = {
  can_view_all_deals: false,
  can_delete_deals: false,
  can_access_settings: false,
  can_manage_financials: false,
  can_export_data: false,
};

// Rótulos legíveis para cada permissão (usados na UI)
export const PERMISSAO_LABELS: Record<keyof RbacPermissoes, { label: string; descricao: string }> = {
  can_view_all_deals:    { label: 'Ver todos os negócios',    descricao: 'Acessa negócios de toda a equipe, não apenas os próprios.' },
  can_delete_deals:      { label: 'Excluir negócios',         descricao: 'Pode remover negócios permanentemente do sistema.' },
  can_access_settings:   { label: 'Acessar configurações',    descricao: 'Acessa o painel de Configurações do workspace.' },
  can_manage_financials: { label: 'Gerenciar financeiro',     descricao: 'Visualiza e edita valores de propostas e precificação.' },
  can_export_data:       { label: 'Exportar dados',           descricao: 'Exporta listas de empresas, negócios e relatórios.' },
};

export type TenantRole = {
  id: string;
  tenant_id: string;
  nome: string;
  descricao: string | null;
  is_system_default: boolean;
  permissoes: RbacPermissoes;
  created_at: string;
  updated_at: string;
};

export type TenantRoleInsert = Omit<TenantRole, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type TenantRoleUpdate = Partial<Pick<TenantRole, 'nome' | 'descricao' | 'permissoes'>>;

// ===================== GESTÃO DE USUÁRIOS (migration 00020) =====================

// Mantido para compatibilidade com migration 00020 e RLS existente
export type PerfilCRM = 'admin' | 'vendedor' | 'sdr';

// Tipo unificado retornado pelo hook useUsuarios (join user_tenants + profiles + tenant_roles)
export type UsuarioCRM = {
  id: string;            // user_tenants.id
  user_id: string;       // profiles.id / auth.users.id
  tenant_role_id: string | null;
  is_active: boolean;
  created_at: string;
  email: string;
  full_name: string | null;
  role_nome: string | null;
  role_permissoes: RbacPermissoes | null;
};

// ===================== EMPRESAS =====================
export type Empresa = {
  id: string;
  tenant_id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  cnae_principal: string | null;
  porte: 'MEI' | 'ME' | 'EPP' | 'Médio' | 'Grande' | null;
  regime_tributario:
    | 'Simples Nacional'
    | 'Lucro Presumido'
    | 'Lucro Real'
    | 'Imune/Isento'
    | null;
  segmento: string | null;
  nicho: string | null;
  faturamento_estimado: number | null;
  colaboradores: number | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  site: string | null;
  email_principal: string | null;
  telefone: string | null;
  dono_conta_id: string | null;
  unidade_negocio: string | null;
  tags: string[];
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EmpresaInsert = Omit<
  Empresa,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type EmpresaUpdate = Partial<
  Omit<Empresa, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== CONTATOS =====================
export type Contato = {
  id: string;
  tenant_id: string;
  empresa_id: string | null;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  papel_decisao:
    | 'Decisor'
    | 'Influenciador'
    | 'Aprovador'
    | 'Usuario'
    | 'Comprador'
    | 'Gatekeeper'
    | null;
  canal_preferido:
    | 'Email'
    | 'Telefone'
    | 'WhatsApp'
    | 'Presencial'
    | 'Videoconferência'
    | null;
  is_principal: boolean;
  consentimento: boolean;
  consentimento_data: string | null;
  data_ultimo_contato: string | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContatoInsert = Omit<
  Contato,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type ContatoUpdate = Partial<
  Omit<Contato, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== ORIGENS LEAD =====================
export type OrigemLead = {
  id: string;
  tenant_id: string;
  nome: string;
  tipo:
    | 'Inbound'
    | 'Outbound'
    | 'Indicação'
    | 'Evento'
    | 'Parceria'
    | 'Mídia Paga'
    | 'Orgânico'
    | 'Outro'
    | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrigemLeadInsert = Omit<
  OrigemLead,
  'id' | 'tenant_id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type OrigemLeadUpdate = Partial<
  Omit<OrigemLead, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== LEADS =====================
export type LeadStatusTriagem =
  | 'Novo'
  | 'Contatado'
  | 'Qualificado'
  | 'Desqualificado'
  | 'Convertido';

export type LeadTemperatura = 'Frio' | 'Morno' | 'Quente';

export type Lead = {
  id: string;
  tenant_id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  cnpj: string | null;
  origem_id: string | null;
  origem_detalhe: string | null;
  canal: string | null;
  campanha: string | null;
  interesse_principal: string | null;
  descricao_dor: string | null;
  score: number;
  temperatura: LeadTemperatura | null;
  status_triagem: LeadStatusTriagem;
  responsavel_id: string | null;
  unidade_negocio: string | null;
  data_primeiro_contato: string | null;
  data_qualificacao: string | null;
  convertido_empresa_id: string | null;
  convertido_contato_id: string | null;
  data_conversao: string | null;
  observacoes: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LeadInsert = Omit<
  Lead,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type LeadUpdate = Partial<
  Omit<Lead, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PIPELINES =====================
export type Pipeline = {
  id: string;
  tenant_id: string;
  nome: string;
  descricao: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineInsert = Omit<
  Pipeline,
  'id' | 'tenant_id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type PipelineUpdate = Partial<
  Omit<Pipeline, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PIPELINE ETAPAS =====================
export type PipelineEtapaTipo = 'aberto' | 'ganho' | 'perdido';

export type PipelineEtapa = {
  id: string;
  tenant_id: string;
  pipeline_id: string;
  nome: string;
  posicao: number;
  cor: string;
  probabilidade: number;
  tipo: PipelineEtapaTipo;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineEtapaInsert = Omit<
  PipelineEtapa,
  'id' | 'tenant_id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type PipelineEtapaUpdate = Partial<
  Omit<PipelineEtapa, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== MOTIVOS PERDA =====================
export type MotivoPerda = {
  id: string;
  tenant_id: string;
  nome: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MotivoPerdaInsert = Omit<
  MotivoPerda,
  'id' | 'tenant_id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type MotivoPerdaUpdate = Partial<
  Omit<MotivoPerda, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== NEGOCIOS =====================
export type NegocioStatusFinal = 'Aberto' | 'Ganho' | 'Perdido';

export type Negocio = {
  id: string;
  tenant_id: string;
  titulo: string;
  empresa_id: string | null;
  contato_principal_id: string | null;
  lead_id: string | null;
  pipeline_id: string;
  etapa_id: string;
  responsavel_id: string | null;
  unidade_negocio: string | null;
  valor_estimado: number;
  valor_mensalidade: number | null;
  valor_setup: number | null;
  probabilidade: number;
  origem: string | null;
  servico: string | null;
  pacote: string | null;
  temperatura: LeadTemperatura | null;
  data_prevista_fechamento: string | null;
  data_fechamento: string | null;
  data_fechamento_real: string | null;
  status_final: NegocioStatusFinal | null;
  motivo_perda_id: string | null;
  motivo_perda_detalhe: string | null;
  proxima_atividade: string | null;
  proxima_atividade_data: string | null;
  observacoes: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type NegocioInsert = Omit<
  Negocio,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type NegocioUpdate = Partial<
  Omit<Negocio, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== ATIVIDADES =====================
export type AtividadeTipo =
  | 'Tarefa'
  | 'Reunião'
  | 'Chamada'
  | 'Email'
  | 'WhatsApp'
  | 'Nota'
  | 'Visita'
  | 'Outro';

export type AtividadeStatus =
  | 'Pendente'
  | 'Em andamento'
  | 'Concluída'
  | 'Cancelada';

export type AtividadePrioridade = 'Baixa' | 'Normal' | 'Alta' | 'Urgente';

export type AtividadeRecorrencia =
  | 'Nenhuma'
  | 'Diária'
  | 'Semanal'
  | 'Quinzenal'
  | 'Mensal';

export type Atividade = {
  id: string;
  tenant_id: string;
  tipo: AtividadeTipo;
  titulo: string;
  descricao: string | null;
  lead_id: string | null;
  empresa_id: string | null;
  contato_id: string | null;
  negocio_id: string | null;
  responsavel_id: string | null;
  criado_por_id: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  dia_inteiro: boolean;
  duracao_minutos: number | null;
  status: AtividadeStatus;
  prioridade: AtividadePrioridade;
  resultado: string | null;
  lembrete_minutos: number | null;
  recorrencia: AtividadeRecorrencia;
  observacoes: string | null;
  tags: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AtividadeInsert = Omit<
  Atividade,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type AtividadeUpdate = Partial<
  Omit<Atividade, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== SERVICOS =====================
export type ServicoCategoria =
  | 'Contabilidade'
  | 'Fiscal'
  | 'Folha de Pagamento'
  | 'Societário'
  | 'Consultoria'
  | 'Financeiro'
  | 'Legalização'
  | 'Auditoria'
  | 'Outro';

export type ServicoTipoCobranca = 'Recorrente' | 'Avulso';

export type Servico = {
  id: string;
  tenant_id: string;
  nome: string;
  categoria: ServicoCategoria | null;
  descricao_comercial: string | null;
  preco_minimo: number;
  preco_sugerido: number;
  tipo_cobranca: ServicoTipoCobranca;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ServicoInsert = Omit<
  Servico,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type ServicoUpdate = Partial<
  Omit<Servico, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PACOTES =====================
export type Pacote = {
  id: string;
  tenant_id: string;
  nome: string;
  descricao: string | null;
  preco_sugerido: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PacoteInsert = Omit<
  Pacote,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type PacoteUpdate = Partial<
  Omit<Pacote, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PACOTE_SERVICOS =====================
export type PacoteServico = {
  id: string;
  tenant_id: string;
  pacote_id: string;
  servico_id: string;
  quantidade: number;
  preco_unitario_override: number | null;
  created_at: string;
};

export type PacoteServicoInsert = Omit<
  PacoteServico,
  'id' | 'tenant_id' | 'created_at'
> & {
  id?: string;
};

// ===================== PROPOSTAS =====================
export type PropostaStatus = 'Rascunho' | 'Enviada' | 'Aceita' | 'Recusada';

export type Proposta = {
  id: string;
  tenant_id: string;
  negocio_id: string | null;
  numero: string;
  versao: number;
  valor_total: number;
  valor_setup: number;
  valor_mensalidade: number;
  validade_dias: number;
  data_validade: string | null;
  status: PropostaStatus;
  observacoes: string | null;
  criado_por_id: string | null;
  // Campos do Cálculo Inteligente (migration 00019)
  faturamento_anual: number | null;
  numero_funcionarios: number | null;
  regime_tributario: string | null;
  fator_operacoes: string | null;
  fator_filiais: string | null;
  fator_automacao: string | null;
  fator_risco: string | null;
  pacote_escolhido: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PropostaInsert = Omit<
  Proposta,
  | 'id'
  | 'tenant_id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'faturamento_anual'
  | 'numero_funcionarios'
  | 'regime_tributario'
  | 'fator_operacoes'
  | 'fator_filiais'
  | 'fator_automacao'
  | 'fator_risco'
  | 'pacote_escolhido'
> & {
  id?: string;
  deleted_at?: string | null;
  faturamento_anual?: number | null;
  numero_funcionarios?: number | null;
  regime_tributario?: string | null;
  fator_operacoes?: string | null;
  fator_filiais?: string | null;
  fator_automacao?: string | null;
  fator_risco?: string | null;
  pacote_escolhido?: string | null;
};

export type PropostaUpdate = Partial<
  Omit<Proposta, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PROPOSTA_ITENS =====================
export type PropostaItem = {
  id: string;
  tenant_id: string;
  proposta_id: string;
  servico_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  tipo_cobranca: ServicoTipoCobranca;
  posicao: number;
  created_at: string;
};

export type PropostaItemInsert = Omit<
  PropostaItem,
  'id' | 'tenant_id' | 'created_at'
> & {
  id?: string;
};

// ===================== CONTRATOS =====================
// Campos conforme PRD_V2.md Seção 9.12

export type ContratoStatus =
  | 'Rascunho'
  | 'enviado'
  | 'assinado parcial'
  | 'assinado'
  | 'recusado'
  | 'expirado'
  | 'cancelado';

export type IndiceReajuste = 'IPCA' | 'IGPM' | 'INPC' | 'Custom';

export type PeriodicidadeReajuste = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'Custom';

export type Contrato = {
  // Identidade
  id: string;
  tenant_id: string;
  // Relações (PRD_V2 §9.12)
  deal_id: string;
  proposal_id: string | null;
  template_id: string | null;
  // Status obrigatório
  status_contrato: ContratoStatus;
  // Vigência
  inicio_vigencia: string | null;
  fim_vigencia: string | null;
  // Reajuste
  indice_reajuste: IndiceReajuste | string | null;
  periodicidade_reajuste: PeriodicidadeReajuste | string | null;
  // Assinatura digital
  assinatura_provider: string | null;
  link_assinatura: string | null;
  enviado_em: string | null;
  assinado_em: string | null;
  arquivo_final: string | null;
  // Texto livre
  observacoes: string | null;
  // Colunas legadas mantidas para compatibilidade com migration 00015
  empresa_id: string | null;
  proposta_id: string | null;
  numero: string | null;
  valor_mensalidade: number | null;
  valor_setup: number | null;
  responsavel_id: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContratoInsert = {
  deal_id: string;
  status_contrato: ContratoStatus;
  proposal_id?: string | null;
  template_id?: string | null;
  inicio_vigencia?: string | null;
  fim_vigencia?: string | null;
  indice_reajuste?: string | null;
  periodicidade_reajuste?: string | null;
  assinatura_provider?: string | null;
  link_assinatura?: string | null;
  enviado_em?: string | null;
  assinado_em?: string | null;
  arquivo_final?: string | null;
  observacoes?: string | null;
  id?: string;
  deleted_at?: string | null;
};

export type ContratoUpdate = Partial<
  Omit<Contrato, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== IMPLANTAÇÕES =====================

export type ImplantacaoStatus =
  | 'Pendente'
  | 'Em Andamento'
  | 'Concluída'
  | 'Pausada';

export type ImplantacaoRisco = 'Baixo' | 'Médio' | 'Alto';

export type Implantacao = {
  id: string;
  tenant_id: string;
  empresa_id: string;
  contrato_id: string | null;
  nome: string;
  status: ImplantacaoStatus;
  risco: ImplantacaoRisco;
  data_kickoff: string | null;
  prazo_alvo: string | null;
  data_handoff: string | null;
  responsavel_id: string | null;
  checklist_concluido: boolean;
  checklist_json: Record<string, unknown> | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ImplantacaoInsert = Omit<
  Implantacao,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type ImplantacaoUpdate = Partial<
  Omit<Implantacao, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

// ===================== PRECIFICAÇÃO PARÂMETROS =====================

export type PrecificacaoParametros = {
  id: string;
  tenant_id: string;
  regime_coeficientes: Record<string, number>;
  folha_valores: Record<string, number>;
  operacoes_coeficientes: Record<string, number>;
  filiais_coeficientes: Record<string, number>;
  automacao_coeficientes: Record<string, number>;
  risco_fiscal_coeficientes: Record<string, number>;
  plano_coeficientes: Record<string, number>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PrecificacaoParametrosInsert = Omit<
  PrecificacaoParametros,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
  deleted_at?: string | null;
};

export type PrecificacaoParametrosUpdate = Partial<
  Omit<PrecificacaoParametros, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;
