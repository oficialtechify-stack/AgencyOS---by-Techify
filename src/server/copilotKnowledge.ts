// Fixed, non-sensitive AgencyOS domain guidance. All financial metrics MUST come
// from the authenticated tenant's Firestore, never from these examples.
export const OPERATIONS_GUIDE = Object.freeze({
  areas: [
    { id:'dashboard', name:'Visão geral', purpose:'panorama de indicadores reais e alertas' },
    { id:'prospection', name:'Clientes e vendas', purpose:'leads, qualificação, etapas, fechamentos e follow-up' },
    { id:'agenda', name:'Agenda', purpose:'compromissos e entregas' },
    { id:'kanban', name:'Projetos e tarefas', purpose:'prioridades, responsáveis e prazos' },
    { id:'lideranca', name:'Equipe e liderança', purpose:'capacidade e metas' },
    { id:'ponto', name:'Registro de ponto', purpose:'jornadas de trabalho e escalas' },
    { id:'campanhas', name:'Campanhas', purpose:'gastos, conversões e retorno declarado' },
    { id:'marketing', name:'Marketing e conteúdo', purpose:'estratégias, funis e campanhas editoriais' },
    { id:'social-hub', name:'Redes sociais', purpose:'conteúdo, agendamentos e conexões Meta oficiais' },
    { id:'designer', name:'Design e aprovações', purpose:'briefings, aprovações e entregas' },
    { id:'fluxo-caixa', name:'Fluxo de caixa', purpose:'entradas e saídas registradas' },
    { id:'kpis', name:'Indicadores', purpose:'MRR, CAC, LTV e churn quando informados pela empresa' },
    { id:'relatorios', name:'Relatórios', purpose:'análise consolidada e transparência das fontes' },
    { id:'estoque', name:'Estoque e recursos', purpose:'materiais, quantidades e alertas' },
  ],
  playbooks: [
    'Diagnóstico: separar dado observado, hipótese, risco e próximo teste.',
    'Crescimento: aquisição qualificada -> conversão -> retenção -> expansão; não escalar campanha com margem desconhecida.',
    'Vendas: ICP, segmentos, scripts consultivos, qualificação, proposta, follow-up, taxa de ganho.',
    'Marketing: hipótese criativa, orçamento, CAC, CPL, ROAS com atribuição explícita e experimentos incrementais.',
    'Financeiro: conferir períodos, competência versus caixa, margem, custos fixos, receita recorrente confirmada e inadimplência.',
    'Operações: identificar gargalos no Kanban, carga de trabalho, SLA, tarefas atrasadas, entregáveis e dependências.',
    'Relacionamento: onboarding, health score, satisfação, churn, upsell e plano de recuperação de clientes.',
    'Gestão de equipe: metas factíveis, prioridades, responsabilidade, qualidade e comunicação.',
    'Privacidade: nunca expor dados de outra empresa, credenciais, senhas, contatos em massa ou informações não autorizadas.',
  ],
});
export type CopilotArea = 'overview'|'sales'|'finance'|'operations'|'marketing'|'team';
export const AREA_COLLECTIONS: Record<CopilotArea, string[]> = {
 overview:['leads','tasks','transactions','campaigns','events','kpiPeriods'],
 sales:['leads','prospectionContracts','prospectionDemands'],
 finance:['transactions','kpiPeriods','prospectionContracts'],
 operations:['tasks','events','stockItems','designProjects','designBriefings'],
 marketing:['campaigns','marketingCampaigns','marketingEmailFlows','socialPosts','marketingEditorials'],
 team:['tasks','leadershipGoals','employeeWorkSchedules'],
};
export const COLLECTION_MODULE: Record<string, string> = {
 leads:'prospection',prospectionContracts:'prospection',prospectionDemands:'prospection',
 transactions:'fluxo-caixa', kpiPeriods:'kpis',
 tasks:'kanban', events:'agenda', stockItems:'estoque',
 designProjects:'designer',designBriefings:'designer',
 campaigns:'campanhas', marketingCampaigns:'marketing',marketingEmailFlows:'marketing',
 socialPosts:'social-hub', marketingEditorials:'marketing',
 leadershipGoals:'lideranca', employeeWorkSchedules:'lideranca',
};
const expose = [
 'id','name','title','client','clientName','category','status','priority','date',
 'scheduledDate','scheduledTime','monthYear','type','description','platform',
 'spend','revenue','amount','mrr','arr','ltv','cac','churnRate','activeClients',
 'clicks','conversions','roas','source','quantity','minQuantity','unitPrice',
 'progress','assignedLeader','triggerEvent','stepsCount','conversionRate',
 'dueDate','createdAt','deadline','budget','goal','value'
];
export function safeAgencyRow(row: Record<string, unknown>) {
 const clean: Record<string, string | number | boolean>={};
 for(const key of expose) {
  const val=row[key];
  if(typeof val==='number' && Number.isFinite(val)) clean[key]=val;
  else if(typeof val==='boolean') clean[key]=val;
  else if(typeof val==='string' && val.trim()) clean[key]=val.slice(0,key==='description'?220:100);
 }
 return clean;
}
export function chooseArea(text: string): CopilotArea {
 const t=text.toLowerCase();
 if(/(receita|mrr|lucro|finan|despes|caixa|custos|pagamento|faturam)/.test(t))return 'finance';
 if(/(cliente|lead|venda|prospec|contrato|funil|closer|sdr|churn)/.test(t))return 'sales';
 if(/(post|campanha|meta ads|anúncio|criativ|marketing|instagram|reels)/.test(t))return 'marketing';
 if(/(tarefa|projeto|agenda|entrega|design|estoque|prazo)/.test(t))return 'operations';
 if(/(equipe|funcionári|lideran|ponto|escala)/.test(t))return 'team';
 return 'overview';
}
