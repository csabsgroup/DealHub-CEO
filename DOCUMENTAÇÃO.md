DOCUMENTAÇÃO FUNCIONAL
CRM COMERCIAL MULTI-TENANT PARA CONTABILIDADE

Base conceitual para construção sobre o Twenty
Versão 1.0  |  Março de 2026
Objetivo do documento
Definir, com nível funcional e operacional, a visão do produto, a arquitetura multi-tenant, os módulos, as telas, as regras de negócio, as permissões, as automações e os critérios de aceite do CRM comercial especializado para escritórios de contabilidade.










Documento preparado para servir como base de IA, produto, UX, engenharia e operação comercial.
 
1. Sumário executivo
Este documento especifica uma plataforma SaaS multi-tenant de CRM comercial especializada para o mercado contábil, construída sobre o Twenty como base de dados, objetos, workflows, permissões e visão operacional. O produto deverá unir pipeline comercial, captação, atendimento, propostas, contratos, precificação de honorários, onboarding e acompanhamento de carteira em uma única plataforma.
A proposta não é reproduzir um CRM genérico. O sistema deve ser desenhado para a realidade de escritórios contábeis e consultorias correlatas, permitindo vender contabilidade, BPO financeiro, folha, fiscal, societário, legalização, consultoria tributária e demais serviços recorrentes e avulsos.
Decisão estrutural
O Twenty será tratado como núcleo transacional e de modelagem. Sobre ele serão construídas camadas de verticalização: inteligência comercial para contabilidade, motor de precificação, playbooks consultivos, proposta/contrato, integrações financeiras e visão de carteira.

2. Escopo do produto
• Plataforma web responsiva, orientada a operação B2B.
• Arquitetura multi-tenant com segregação forte de dados por workspace/tenant.
• Suporte a múltiplos perfis: administrador da organização, gestor comercial, vendedor/closer, SDR/BDR, pré-vendas, pós-vendas/onboarding, financeiro comercial, atendimento e liderança executiva.
• Operação com múltiplos pipelines e múltiplas unidades de negócio dentro do mesmo tenant.
• Fluxo ponta a ponta: lead -> qualificação -> diagnóstico -> proposta -> contrato -> ganho/perdido -> implantação -> renovação/upsell.
• Camada especializada para nicho contábil: CNPJ, CNAE, regime tributário, porte, segmento, folha, faturamento, dores contábeis, módulos contratados, cálculo de honorários e defasagem.
3. Princípios de produto
• Operacionalidade acima de complexidade: a interface deve ser rápida para o vendedor.
• Visão 360 do cliente em tela única, com indicadores, histórico, tarefas, documentos e contratos.
• Automação com segurança: toda automação crítica precisa ser auditável e reversível quando aplicável.
• Configuração sem depender de código para campos, pipelines, status, motivos, tags, templates e SLAs.
• Dados confiáveis: nenhuma etapa relevante deve avançar sem os campos mandatórios definidos nas regras.
• Escalabilidade multi-tenant: nenhuma regra, filtro, dashboard ou automação pode misturar dados entre tenants.
 
4. Arquitetura do produto e premissas multi-tenant
4.1 Modelo de tenancy
Cada cliente da plataforma será um tenant isolado logicamente, representado por um workspace com seus próprios usuários, pipelines, campos customizados, integrações, templates, permissões, automações, dashboards e registros transacionais. Um usuário poderá pertencer a mais de um tenant, porém sempre operando em contexto explícito de workspace.
• Tenant = organização cliente da plataforma.
• Workspace = contexto operacional do tenant.
• Usuário multi-tenant deve alternar explicitamente de contexto.
• Não é permitido compartilhamento acidental de artefatos entre tenants.
4.2 Estratégia de segregação de dados
Todo registro de negócio deverá possuir tenant_id obrigatório e herdá-lo automaticamente do contexto logado. O backend deve bloquear qualquer consulta, escrita, exportação, automação, webhook, relatório ou integração que não respeite esse escopo. Logs técnicos e analíticos também devem carregar tenant_id para auditoria.
4.3 Entidades compartilhadas vs. entidades isoladas
Entidades de aplicação, como catálogo global de países, estados, moedas, idiomas, templates-base de sistema ou taxonomias padrão, podem ser compartilhadas. Já leads, empresas, contatos, negócios, atividades, contratos, propostas, mensagens, integrações credenciadas, arquivos, dashboards, usuários por tenant e configurações operacionais devem ser isolados por tenant.
4.4 Unidade de negócio dentro do tenant
Cada tenant poderá operar uma ou mais unidades de negócio, marcas ou carteiras internas. Isso permite, por exemplo, separar operação de contabilidade recorrente, BPO financeiro, consultoria tributária e legalização sem precisar criar outro tenant. As unidades de negócio servirão para filtros, permissões, metas, dashboards e roteamento.
4.5 Escalabilidade e performance
O sistema deve suportar crescimento horizontal de tenants e volume alto de registros, com paginação, índices por tenant, busca full-text contextualizada e filas para automações pesadas. Operações de lista, funil e timeline precisam responder com baixa latência mesmo em bases grandes.
4.6 White-label e personalização
Na fase inicial o produto poderá ter customização leve por tenant: logo, nome interno da plataforma, cor principal, idioma, moeda, domínios de e-mail, templates de proposta e contrato. White-label profundo poderá ser tratado como fase posterior.
5. Perfis de usuário e controle de acesso
5.1 Perfis macro
O sistema deverá operar com RBAC por tenant. Perfis-padrão: Owner do tenant, Admin, Gestor Comercial, SDR/BDR, Closer, Executivo de Contas, Onboarding/Implantação, Financeiro Comercial, Atendimento, Viewer Executivo e Perfil Customizado.
5.2 Regras gerais de permissão
As permissões devem ser configuráveis por módulo, ação e escopo. Exemplo: visualizar todos os negócios, visualizar apenas os negócios próprios, editar só negócios da própria equipe, excluir apenas rascunhos, exportar relatórios, aprovar propostas, publicar automações, gerenciar integrações, editar campos customizados e acessar dados financeiros.
Permissão	Descrição funcional	Escopo possível
Visualizar registros	Leitura de listas, fichas e dashboards	próprio / equipe / unidade / todos
Editar registros	Alterar campos e relacionamentos	próprio / equipe / todos
Excluir/arquivar	Exclusão lógica controlada	apenas perfis autorizados
Exportar	CSV/XLSX/PDF e integrações	por módulo e por perfil
Administrar configurações	Campos, funis, motivos, templates	admin / owner / customizado

5.3 Matriz de escopos
O escopo de acesso deve aceitar, no mínimo: próprio usuário, equipe direta, unidade de negócio, todos dentro do tenant e nenhum. Para objetos sensíveis, como contratos, comissões e valores de honorários, o sistema deve permitir restrições adicionais.
5.4 Auditoria
Toda ação sensível deve gerar log: criação, edição, exclusão lógica, alteração de etapa, alteração de valor, envio de proposta, assinatura, mudança de dono do lead, importação, exportação, acesso a dados financeiros e alteração de regras.
6. Modelo de dados funcional
6.1 Objetos principais
Os objetos centrais da plataforma serão: Lead, Empresa, Contato, Oportunidade/Negócio, Atividade, Tarefa, Reunião, Pipeline, Etapa, Proposta, Contrato, Serviço, Plano/Pacote, Diagnóstico, Cotação/Honorário, Documento, Mensagem, Ticket Comercial, Implantação, Renovação, Upsell, Motivo de Perda, Motivo de Churn, Meta, Comissão, Dashboard e Automação.
Objeto	Função principal	Exemplo de uso
Lead	Registro inicial de interesse	Lead de formulário ou WhatsApp
Empresa	Conta principal B2B	Escritório, clínica, e-commerce
Contato	Pessoa vinculada à conta	Sócio, financeiro, RH
Negócio	Oportunidade comercial	Proposta de contabilidade mensal
Diagnóstico	Mapeamento consultivo	Levantamento de dores e escopo
Proposta	Oferta comercial formal	Plano com preços e condições
Contrato	Formalização jurídica	Assinatura eletrônica
Implantação	Passagem para operação	Checklist pós-venda

6.2 Relacionamentos
Uma Empresa poderá ter múltiplos Contatos, múltiplos Negócios, múltiplos Contratos e múltiplos Serviços contratados ao longo do tempo. Um Lead poderá existir antes de virar Empresa; ao converter, o sistema deverá preservar histórico e relacionar origem, canal e responsável. Um Negócio poderá gerar uma ou mais Propostas; uma proposta aprovada poderá gerar Contrato e Implantação.
6.3 Campos padrão x customizados
Todos os tenants terão um núcleo de campos padrão do produto. Além disso, cada tenant poderá criar campos customizados por objeto, com tipos como texto, número, moeda, data, data e hora, lista única, múltipla seleção, checkbox, usuário, fórmula, relacionamento, arquivo e URL.
6.4 Versionamento de metadados
Alterações em campos customizados, status, etapas, categorias e templates precisam ser versionadas. O objetivo é preservar histórico analítico e evitar que relatórios quebrem quando uma configuração mudar.
7. Módulo de configuração organizacional
7.1 Dados do tenant
Tela para nome da organização, CNPJ da organização cliente da plataforma, logo, domínio, moeda, fuso horário, idioma, cor principal, unidades de negócio, centros de resultado comerciais e preferências gerais.
7.2 Usuários e equipes
Tela para convidar usuários, inativar, redefinir perfil, alocar em equipes, definir gestor imediato, unidade de negócio, metas padrão e escopo de visualização.
7.3 Catálogos configuráveis
O tenant deverá conseguir cadastrar e manter: pipelines, etapas, tags, motivos de perda, motivos de churn, fontes de lead, origens detalhadas, segmentos, nichos, serviços, pacotes, tipos de contrato, templates de proposta, templates de e-mail, templates de WhatsApp, formulários e playbooks.
7.4 Campos customizados
Gestor ou admin com permissão poderá criar, editar, ordenar, agrupar, ativar e arquivar campos customizados. Cada campo terá regras de obrigatoriedade, visibilidade por etapa e dependência condicional.
8. Módulo de captação e entrada de leads
8.1 Objetivo
Centralizar toda entrada de leads do tenant, independentemente do canal de origem, para garantir rastreabilidade, deduplicação, roteamento e SLA de primeiro contato.
8.2 Canais previstos
Cadastro manual, importação de planilha, formulário web, landing pages, chatbot, WhatsApp, API pública, integrações com mídia/ads, e-mail parsing e webhooks.
8.3 Tela Caixa de Entrada de Leads
Deve apresentar lista unificada de novos leads, com filtros por origem, data, responsável, status, temperatura, SLA e duplicidade. A tela precisa permitir ação rápida: assumir lead, descartar, mesclar, converter em oportunidade ou enviar para qualificação.
8.4 Deduplicação
O sistema deve sugerir duplicidade por e-mail, telefone, CNPJ, razão social, domínio de e-mail e similaridade de nome. Regras de merge devem preservar histórico, proprietário original, origem primária e dados mais confiáveis.
8.5 Roteamento
O roteamento pode ser manual, round-robin, por equipe, por canal, por nicho, por estado/região, por porte, por serviço de interesse ou por regra personalizada.
9. Módulo de cadastro de empresas, contatos e enriquecimento
9.1 Empresa
A tela da empresa deve funcionar como ficha-mestre da conta. Campos padrão recomendados: razão social, nome fantasia, CNPJ, situação cadastral, CNAE principal, CNAEs secundários, regime tributário atual, porte, faixa de faturamento, quantidade de colaboradores, cidade, estado, país, site, Instagram, segmento, nicho, origem, dono da conta e unidade de negócio.
9.2 Contatos
Cada empresa poderá ter múltiplos contatos, com tipo de relação: sócio, financeiro, RH, fiscal, operacional, decisor, influenciador, usuário final e contador anterior. Deve haver marcação de contato principal, canal preferencial e permissões de comunicação.
9.3 Enriquecimento por CNPJ
Quando o usuário digitar CNPJ válido, a plataforma deverá buscar dados públicos e preencher automaticamente os campos possíveis. Esse enriquecimento pode ser síncrono ou assíncrono, mas o usuário deve ver o status da consulta e a origem dos dados.
9.4 Saúde cadastral
A plataforma deverá sinalizar campos ausentes, dados inconsistentes, CNPJ inválido, telefone incompleto, contato sem e-mail e empresa sem decisor identificado.
10. Módulo de pipeline e gestão de oportunidades
10.1 Conceito
O pipeline é o coração da operação comercial. O tenant poderá manter múltiplos pipelines, por exemplo: Novos Clientes, BPO Financeiro, Recuperação de Inativos, Renovação, Upsell, Legalização e Parcerias.
10.2 Estrutura de negócio
Cada oportunidade deve possuir no mínimo: título, empresa, contato principal, pipeline, etapa, responsável, valor estimado, data prevista de fechamento, origem, serviços de interesse, temperatura, probabilidade, status de ganho/perda/em andamento e próximos passos.
10.3 Visualizações
List view, kanban, calendário por próxima atividade, forecast view e quadro por responsável. Todas as views precisam aceitar filtros salvos, colunas configuráveis, agrupamentos e ordenações.
10.4 Regras de avanço de etapa
Cada etapa poderá exigir campos obrigatórios, checklist, playbook, documento anexado, proposta emitida, reunião concluída, diagnóstico preenchido ou aceite interno. O sistema não deve permitir avanço se as regras mandatórias não forem atendidas.
Regra obrigatória de UX
Ao tentar mover um negócio para etapa que exige condições não cumpridas, a interface deve explicar exatamente o que está faltando e permitir correção imediata. Nunca apenas bloquear sem contexto.

10.5 Motivos de perda
Negócios perdidos devem exigir motivo de perda, categoria macro, descrição opcional e indicador se há possibilidade de retomada futura. Também deve permitir marcar concorrente, preço perdido, timing, não aderência, falta de fit, sem retorno e outros motivos configuráveis.
11. Módulo de atividades, agenda e produtividade
11.1 Tipos de atividade
Ligação, WhatsApp, e-mail, reunião, visita, tarefa interna, follow-up, lembrete, análise de proposta, coleta de documentos e atividade customizada.
11.2 Regras operacionais
Todo negócio ativo deve ter ao menos uma próxima atividade futura, exceto quando estiver em etapas explicitamente passivas. O sistema deve sinalizar negócios sem próxima atividade e permitir criação rápida direto do kanban ou da timeline.
11.3 Agenda
A agenda deve mostrar compromissos do usuário com filtros por equipe, tipo, negócio, empresa e situação. Deve suportar integração com calendário externo e bloqueio de horário.
11.4 SLA e produtividade
O sistema deve medir tempo até primeiro contato, taxa de atividades concluídas, negócios sem follow-up, aging por etapa, ciclos de venda e taxa de no-show em reuniões.
12. Módulo de diagnóstico consultivo para contabilidade
12.1 Objetivo
Estruturar a venda consultiva especializada, registrando dores, maturidade e necessidades do prospect antes da proposta.
12.2 Estrutura do diagnóstico
O diagnóstico deve conter blocos configuráveis: contexto da empresa, estrutura societária, regime tributário atual, faturamento, folha, operações interestaduais, dores fiscais, dores societárias, dores trabalhistas, nível de organização financeira, sistemas utilizados, urgência, risco percebido e objetivo estratégico do cliente.
12.3 Motor de score
Cada resposta pode impactar um score de aderência, complexidade, urgência e potencial de ticket. O score deve ser configurável por tenant.
12.4 Saídas do diagnóstico
O sistema poderá recomendar serviços, plano/pacote ideal, faixa de honorário, objeções prováveis e playbook sugerido para a próxima reunião.
13. Módulo de serviços, planos, pacotes e precificação
13.1 Catálogo de serviços
O tenant deverá cadastrar serviços avulsos e recorrentes, com categoria, descrição comercial, descrição operacional, periodicidade, entregáveis, SLA prometido, custo estimado, preço mínimo, preço-alvo, preço teto e regras tributárias internas.
13.2 Pacotes
Pacotes são agrupadores comerciais que combinam serviços e parâmetros de preço. Exemplo: Contabilidade Essencial, Contabilidade + Folha, BPO Financeiro Pro, Consultoria Tributária Premium.
13.3 Motor de precificação
O sistema deve permitir cálculo de honorário com base em variáveis como faturamento, quantidade de notas, número de funcionários, regime tributário, complexidade fiscal, número de sócios, filiais, volume financeiro, urgência, escopo extra e margem desejada.
• Suportar fórmulas por variável, peso, faixa e multiplicador.
• Separar preço sugerido, preço mínimo, preço aprovado e preço fechado.
• Guardar memória de cálculo para auditoria e aprendizado comercial.
• Permitir tabela-base por nicho, porte, região ou pacote.
13.4 Regras de aprovação
Descontos fora da política, preço abaixo do piso, prazo especial, carência, isenção de setup ou concessões comerciais devem disparar aprovação interna por alçada.
14. Módulo de propostas e contratos
14.1 Propostas
O usuário poderá gerar proposta a partir de um negócio, escolhendo template, itens, preços, observações, validade, condições de pagamento, escopo, exclusões, premissas e próximos passos.
14.2 Versionamento
Cada proposta deverá manter versões. Nova edição após envio deve gerar nova versão, mantendo histórico do que foi alterado, quem alterou e quando.
14.3 Envio e rastreio
A proposta poderá ser enviada por e-mail, link público autenticado, WhatsApp ou assinatura digital. O sistema deve registrar abertura, visualização, aceite, recusa e prazo expirado.
14.4 Contratos
Após aceite, o sistema poderá gerar contrato automaticamente a partir de template com merge de variáveis. Deve suportar assinatura eletrônica, múltiplos signatários, ordem de assinatura, anexos e status do fluxo.
15. Módulo de atendimento comercial e omnichannel
15.1 Canais
WhatsApp oficial, e-mail, formulário, chat e mensagens internas. A plataforma deve consolidar interações na timeline da empresa e do negócio.
15.2 Inbox compartilhada
Mensagens devem poder ser distribuídas entre atendentes, com etiquetas, prioridade, SLA e transferência.
15.3 Regras de governança
Cada canal precisa ter fila, responsáveis, mensagens automáticas, horário de atendimento e regras para reabertura de conversas.
16. Módulo de onboarding e implantação
16.1 Gatilho de criação
Quando um negócio for marcado como ganho e contrato estiver assinado, a plataforma deverá poder criar automaticamente uma Implantação vinculada à conta.
16.2 Estrutura da implantação
A implantação deve conter checklist, etapas, responsável principal, responsáveis secundários, prazo alvo, documentos pendentes, integrações necessárias, status de kickoff e data de handoff.
16.3 Handoff Comercial -> Operação
Deve existir um formulário estruturado de passagem de bastão contendo tudo o que o time operacional precisa receber: serviços vendidos, exceções comerciais, expectativas do cliente, riscos, prazos prometidos, responsáveis do lado do cliente e anexos relevantes.
17. Módulo de carteira, renovação, upsell e churn
17.1 Carteira
Após implantação, a conta deve transitar para visão de carteira. Nessa fase o sistema precisa manter dados de contrato vigente, ticket atual, serviços ativos, histórico de aditivos e marcos da jornada.
17.2 Renovação
Renovações devem possuir pipeline próprio ou status específico, com alertas de antecedência, reajuste sugerido, análise de defasagem e risco de churn.
17.3 Upsell e cross-sell
A plataforma deverá abrir oportunidades derivadas da mesma conta, sem perder a visão consolidada do cliente. Deve ser possível distinguir novo logo de expansão.
17.4 Churn
Quando uma conta ou serviço for cancelado, o sistema deve exigir data de churn, escopo cancelado, motivo macro, motivo detalhado, evitabilidade, concorrente substituto e impacto financeiro.
18. Módulo de relatórios e dashboards
18.1 Dashboards operacionais
Visões para vendedor, gestor e diretoria. Indicadores mínimos: leads por origem, taxa de conversão por etapa, tempo médio até primeiro contato, tempo por etapa, ciclo médio de venda, forecast, ganhos, perdas, ticket médio, motivo de perda, aging, produtividade por usuário e SLA.
Indicador	Definição mínima	Recorte recomendado
Leads recebidos	Novos leads no período	origem / responsável / unidade
Conversão por etapa	Taxa entre etapas do pipeline	pipeline / equipe
Tempo até 1º contato	Horas entre entrada e 1º touch	canal / usuário
Ciclo de venda	Dias entre criação e fechamento	serviço / nicho
Forecast	Receita prevista ponderada e commit	mês / trimestre
Motivos de perda	Distribuição de perdas	responsável / nicho / serviço

18.2 Dashboards de contabilidade
Indicadores especializados: ticket por tipo de serviço, mix de serviços vendidos, honorário médio por porte, defasagem média identificada, conversão por nicho, fechamentos por regime tributário, churn por serviço, upsell por carteira e renovação por faixa de honorário.
18.3 Builder analítico
Na fase mais avançada, o tenant deve poder montar dashboards com widgets, filtros, métricas derivadas e compartilhamento por perfil.
19. Módulo de automações e workflows
19.1 Conceito
O sistema deverá permitir automações do tipo trigger -> condição -> ação.
19.2 Triggers mínimos
Registro criado, registro atualizado, campo alterado, etapa alterada, proposta aprovada, contrato assinado, atividade vencida, ausência de atividade, lead recebido, score calculado, data agendada atingida e webhook recebido.
19.3 Ações mínimas
Criar tarefa, atribuir responsável, atualizar campo, enviar e-mail, enviar mensagem, criar proposta, criar implantação, mover etapa, notificar Slack/Teams/webhook, aplicar tag, bloquear avanço, solicitar aprovação, criar renovação, abrir oportunidade de upsell.
19.4 Governança
Automações devem ter ambiente de rascunho, publicação, versionamento, log de execução, tratamento de erro e limites para evitar loops.
20. Módulo de integrações e APIs
20.1 Integrações prioritárias
WhatsApp oficial, e-mail (SMTP/Google/Microsoft), Google Calendar, Nibo, Omie, Conta Azul, formulários, assinatura eletrônica, gateways de pagamento, ERPs e ferramentas de automação como n8n.
20.2 API e webhooks
A plataforma deve oferecer API autenticada e webhooks por tenant. Toda credencial precisa pertencer ao tenant e respeitar escopo granular.
20.3 Sincronização
Quando houver integração bidirecional, o sistema deve registrar origem da alteração, timestamp, usuário/integrador responsável e estratégia de resolução de conflito.
21. Busca global e produtividade transversal
21.1 Busca global
Busca por empresa, CNPJ, contato, e-mail, telefone, número de proposta, contrato, negócio, tag e conteúdo relevante.
21.2 Comandos rápidos
Ações rápidas para criar lead, criar tarefa, registrar ligação, abrir proposta, mudar etapa e buscar conta sem navegar por vários menus.
22. Segurança, compliance e LGPD
22.1 Princípios
Proteção de dados por tenant, criptografia em trânsito, controle de acesso, logs de auditoria, política de retenção, consentimento e base legal para comunicações.
22.2 Requisitos
Registro de consentimento de comunicação, anonimização ou exclusão mediante fluxo aprovado, trilha de auditoria, gestão de sessão e notificações de acessos críticos.
23. Requisitos não funcionais
23.1 Performance
Telas principais devem carregar rapidamente, com paginação, lazy loading e consultas otimizadas.
23.2 Disponibilidade
O produto deverá ter monitoramento, logs, alertas e política de backup/restauração.
23.3 Observabilidade
Eventos críticos de negócio e técnicos devem ser observáveis para suporte e evolução do produto.
24. Regras de negócio transversais
24.1 Mandatoriedade contextual
Um campo pode ser opcional na criação, mas obrigatório para avançar etapa, emitir proposta, aprovar desconto ou gerar contrato.
24.2 Propriedade do registro
Todo lead e negócio deve ter um owner. Transferências precisam manter histórico.
24.3 Soft delete
Exclusões de registros estratégicos devem ser lógicas, nunca físicas, salvo processos administrativos controlados.
24.4 Integridade temporal
Datas como criação, primeira resposta, envio de proposta, aceite, assinatura, ganho e churn devem ser imutáveis ou altamente auditadas.
25. Descrição detalhada das telas
25.1 Login e seleção de workspace
Login com e-mail/senha ou SSO. Quando o usuário pertencer a mais de um tenant, deverá ver seletor de workspace após autenticação. A tela deve mostrar ambiente atual e impedir confusão entre tenants.
25.2 Dashboard inicial
Visão resumida com metas, atividades do dia, alertas de SLA, funil resumido, negócios críticos, tarefas vencidas e atalhos rápidos.
25.3 Caixa de entrada de leads
Tabela com cards ou linhas, ações em lote, filtros salvos, status de triagem, sinais de duplicidade e preview lateral.
25.4 Tela de empresa
Layout em visão 360, com cabeçalho de dados principais, abas ou painéis para resumo, contatos, negócios, contratos, documentos, mensagens, atividades, carteira, indicadores e timeline consolidada.
• Cabeçalho fixo com nome da conta, CNPJ, owner, status, ticket atual e tags.
• Bloco de KPIs rápidos: oportunidades abertas, propostas ativas, contrato vigente, risco e próxima ação.
• Timeline unificada com filtros por tipo de interação.
• Painel lateral com contatos principais, documentos recentes e automações pendentes.
25.5 Tela de negócio
Cabeçalho com etapa, valor, responsável, probabilidade e próxima atividade. Corpo com resumo, diagnóstico, proposta, checklist, timeline, arquivos, aprovadores e dados financeiros.
25.6 Tela de proposta
Editor orientado por blocos: capa, itens, escopo, entregáveis, preço, condições, observações, assinatura e histórico de versões.
25.7 Tela de contrato
Pré-visualização, status das assinaturas, signatários, trilha temporal e anexos.
25.8 Tela de implantação
Checklist, responsáveis, documentos pendentes, marcos, risco e observações de handoff.
25.9 Configurações
Submódulos laterais para usuários, equipes, campos, pipelines, automações, integrações, templates, serviços, pacotes, dashboards e segurança.
26. Critérios de aceite por módulo
26.1 Leads
O módulo será aceito quando permitir entrada por múltiplos canais, deduplicação, roteamento, SLA e conversão preservando histórico.
26.2 Pipeline
O módulo será aceito quando suportar múltiplos funis, regras de etapa, filtros salvos, ações rápidas e indicadores básicos.
26.3 Propostas e contratos
O módulo será aceito quando gerar versão rastreável, envio controlado e integração com assinatura.
26.4 Multi-tenant
O produto só será aceito quando todas as consultas, relatórios, integrações e logs estiverem isolados por tenant.
27. Roadmap sugerido
27.1 MVP
Autenticação, multi-tenant, usuários/equipes, empresas, contatos, leads, pipeline, atividades, dashboards operacionais, campos customizados básicos e importação.
27.2 V1
Diagnóstico consultivo, catálogo de serviços, precificação, propostas, contratos, onboarding, motivos de perda, automações, relatórios gerenciais e integrações prioritárias.
27.3 V2
WhatsApp oficial robusto, builder analítico avançado, score inteligente, renovação/churn, comissões, aprovações por alçada e módulos profundos de CS/carteira.
28. Considerações finais para implementação sobre o Twenty
28.1 O que usar do Twenty como fundação
Objetos, relações, filtros, views, permissões, workflows, APIs e base operacional do CRM.
28.2 O que construir por cima
Camadas verticais de contabilidade, precificação, propostas, contratos, handoff, renovação, analytics do nicho e integrações brasileiras.
28.3 Recomendação estratégica
Manter o core simples e extremamente utilizável, deixando a sofisticação na camada de regras, automações, catálogos e inteligência do nicho.
29. Anexo A - Campos padrão recomendados por objeto
Lead
nome, empresa, e-mail, telefone, CNPJ, origem, origem detalhada, campanha, canal, interesse principal, descrição da dor, responsável, status de triagem, score, data do primeiro contato, data da qualificação, observações
Empresa
razão social, nome fantasia, CNPJ, CNAE principal, porte, regime tributário, faturamento estimado, colaboradores, cidade, UF, segmento, nicho, site, dono da conta, unidade de negócio, tags
Contato
nome, cargo, e-mail, telefone, WhatsApp, papel na decisão, canal preferido, principal, consentimento, data do último contato
Negócio
título, empresa, contato principal, pipeline, etapa, responsável, valor estimado, probabilidade, origem, serviço, pacote, temperatura, próxima atividade, data prevista de fechamento, status final
Proposta
número, versão, valor total, setup, mensalidade, validade, condição de pagamento, descontos, aprovador, status de envio, status de aceite
Contrato
tipo, início, fim, renovação automática, índice de reajuste, multa, serviços contratados, signatários, status de assinatura
Implantação
responsável, kickoff, prazo alvo, checklist concluído, risco, documentos pendentes, data de handoff, status
30. Anexo B - Fluxos principais da plataforma
Fluxo 1 - Novo lead inbound
1. Lead entra por formulário, WhatsApp, importação ou API.
2. Sistema aplica deduplicação e roteamento.
3. Responsável recebe tarefa de primeiro contato conforme SLA.
4. Lead é qualificado e convertido em empresa, contato e oportunidade.
5. Negócio entra no pipeline correto com etapa inicial.
Fluxo 2 - Venda consultiva com proposta
1. Executivo agenda reunião de diagnóstico.
2. Diagnóstico é preenchido e motor sugere pacote e honorário.
3. Proposta é gerada, revisada e enviada.
4. Caso haja desconto fora da política, segue para aprovação.
5. Cliente aceita proposta e contrato é disparado.
Fluxo 3 - Handoff para implantação
1. Negócio marcado como ganho.
2. Contrato assinado e dados financeiros confirmados.
3. Sistema cria implantação e checklist.
4. Comercial preenche passagem de bastão.
5. Operação assume conta com todo histórico.
Fluxo 4 - Renovação e churn
1. Sistema identifica contratos próximos do vencimento.
2. Abre oportunidade de renovação com análise de reajuste.
3. Caso haja risco, cria plano de retenção.
4. Se cancelar, exige registro estruturado de churn.
31. Anexo C - Itens críticos para IA e development handoff
• Separar claramente regras de domínio, regras de interface e regras de automação.
• Modelar multi-tenancy desde o início, e não como adaptação posterior.
• Garantir que cada objeto tenha campos padrão, campos customizados, auditoria e ownership.
• Desenhar a visão 360 da conta e do negócio como telas prioritárias, não como detalhe tardio.
• Manter pipelines e etapas configuráveis, porém com governança para preservar analytics.
• Criar serviços, pacotes, diagnóstico e honorários como first-class citizens do produto.
• Tratar integração com WhatsApp, assinatura e ERP como camadas desacopladas.
• Preparar eventos de domínio para alimentar automações, dashboards e integrações.
 
32. Encerramento
Este documento foi escrito para servir como base robusta de descoberta, especificação, design de produto e implementação técnica. Ele descreve o comportamento esperado da plataforma em profundidade suficiente para orientar IA, produto, UX/UI, backend, frontend, dados, QA e operação.
Na próxima etapa, recomenda-se transformar este material em quatro derivados complementares: backlog épico por módulo, mapa de entidades e relacionamentos, fluxos de navegação por tela e plano de releases MVP/V1/V2 com critérios de aceite detalhados por história.
Uso recomendado
Utilize este documento como insumo mestre para gerar backlog no Lovable/Copilot/Claude/GPT, orientar wireframes e arquitetura, definir o modelo de dados sobre o Twenty e alinhar comercial, CS, produto e engenharia.

