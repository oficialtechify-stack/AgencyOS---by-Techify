export interface TechifyPackageOption {
  id: string;
  name: string;
  category: 'pacote' | 'servico';
  description: string;
  features: string[];
  suggestedPrice: number;
  priceType: 'Mensal Recorrente (MRR)' | 'Pontual / Projeto Único';
  badge: string;
  popular?: boolean;
}

export const TECHIFY_PACKAGES: TechifyPackageOption[] = [
  {
    id: 'pack-scale-360',
    name: 'Techify Scale 360 (Solução Completa)',
    category: 'pacote',
    description: 'A solução definitiva para empresas: Gestão de Tráfego Pago + 30 Criativos Mensais + Landing Page de Alta Conversão + CRM & Automação de WhatsApp.',
    features: [
      'Gestão Meta Ads & Google Ads com foco em ROAS',
      '30 Criativos Mensais (Design & Copywriting)',
      'Landing Page Profissional e Otimizada',
      'Automação de WhatsApp para Atendimento e Leads',
      'Relatórios Executivos Semanais & Reunião Mensal',
    ],
    suggestedPrice: 3500,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Mais Completo',
    popular: true,
  },
  {
    id: 'pack-trafego-performance',
    name: 'Techify Tráfego & Performance',
    category: 'pacote',
    description: 'Focado em geração contínua de clientes qualificados e conversões através de anúncios estratégicos no Meta Ads e Google Ads.',
    features: [
      'Gestão de Campanhas Meta Ads e Google Ads',
      'Configuração avançada de Pixel e Conversões CAPI',
      'Testes A/B de Criativos e Públicos',
      'Painel em Tempo Real de Métricas',
      'Otimização Diária de Orçamento e ROI',
    ],
    suggestedPrice: 2200,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Alta Performance',
    popular: true,
  },
  {
    id: 'pack-social-branding',
    name: 'Techify Social & Branding',
    category: 'pacote',
    description: 'Transforme o Instagram e redes sociais do cliente em uma vitrine magnética com artes profissionais e autoridade visual.',
    features: [
      '24 a 30 Artes/Carrosséis Profissionais por mês',
      'Copywriting Persuasivo com Ganchos de Engajamento',
      'Identidade Visual e Grid Harmônico',
      'Estratégia de Destaques e Bio Estratégica',
      'Entrega Organizada via Drive e Aprovação Rápida',
    ],
    suggestedPrice: 1800,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Design & Autoridade',
  },
  {
    id: 'pack-web-conversao',
    name: 'Techify Web & Conversão',
    category: 'pacote',
    description: 'Desenvolvimento de Landing Page de alta velocidade e conversão para produtos, serviços ou clínicas, com SEO e integração direta com WhatsApp.',
    features: [
      'Landing Page 100% Responsiva e Ultra Rápida',
      'Copywriting Especializado em Vendas',
      'Botões de Ação Direta para WhatsApp e Formulário',
      'Integração com Google Analytics e Tag Manager',
      'Hospedagem e Domínio Configurados',
    ],
    suggestedPrice: 2500,
    priceType: 'Pontual / Projeto Único',
    badge: 'Conversão Máxima',
  },
  {
    id: 'pack-ia-automacao',
    name: 'Techify IA & Automação',
    category: 'pacote',
    description: 'Robô Inteligente de Atendimento e Triagem no WhatsApp integrado com CRM para responder clientes 24h por dia e qualificar leads.',
    features: [
      'Agente SDR de IA no WhatsApp 24/7',
      'Triagem Automática e Agendamento de Reuniões',
      'Notificações Instantâneas para o Comercial',
      'Funil de Resgate de Clientes que não responderam',
      'Integração com Google Planilhas e CRM',
    ],
    suggestedPrice: 1500,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Inovação & IA',
  },
  {
    id: 'pack-growth-b2b',
    name: 'Techify Growth B2B Outbound',
    category: 'pacote',
    description: 'Prospecção ativa e agressiva para empresas que vendem para outras empresas, com campanhas frias, LinkedIn e agendamento de reuniões qualificadas.',
    features: [
      'Mapeamento de ICP e Lista de Decisores Qualificados',
      'Cadências de Abordagem Multicanal (WhatsApp/Email/LinkedIn)',
      'SDR Dedicado para Qualificação de Agendamentos',
      'Scripts de Abordagem Personalizados por Nicho',
      'Garantia de Reuniões Mensais Agendadas',
    ],
    suggestedPrice: 4000,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Exclusivo B2B',
  },
];

export const TECHIFY_INDIVIDUAL_SERVICES: TechifyPackageOption[] = [
  {
    id: 'serv-trafego-pago',
    name: 'Gestão de Tráfego Pago (Meta / Google)',
    category: 'servico',
    description: 'Criação, gestão e escala de campanhas de anúncios patrocinados.',
    features: ['Meta Ads', 'Google Ads', 'Otimização Contínua'],
    suggestedPrice: 1500,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Serviço Individual',
  },
  {
    id: 'serv-landing-page',
    name: 'Criação de Landing Page de Alta Conversão',
    category: 'servico',
    description: 'Página web profissional para captação de leads e vendas.',
    features: ['Design Moderno', 'Copywriting Incluso', 'Carregamento Rápido'],
    suggestedPrice: 1800,
    priceType: 'Pontual / Projeto Único',
    badge: 'Serviço Individual',
  },
  {
    id: 'serv-pacote-artes',
    name: 'Pacote Mensal de Criativos & Artes',
    category: 'servico',
    description: 'Design profissional para feed, carrosséis e stories.',
    features: ['15 a 30 Criativos', 'Arquivos Prontos para Anúncio ou Feed'],
    suggestedPrice: 1200,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Serviço Individual',
  },
  {
    id: 'serv-automacao-wpp',
    name: 'Automação de WhatsApp & CRM',
    category: 'servico',
    description: 'Configuração de fluxo automático de atendimento e mensagens.',
    features: ['Fluxo de Mensagens', 'Disparo de Boas-Vindas', 'Funil'],
    suggestedPrice: 990,
    priceType: 'Mensal Recorrente (MRR)',
    badge: 'Serviço Individual',
  },
  {
    id: 'serv-identidade-visual',
    name: 'Identidade Visual & Branding',
    category: 'servico',
    description: 'Criação de logotipo, paleta de cores, tipografia e manual de marca.',
    features: ['Logo Vetorial', 'Manual da Marca', 'Kit Redes Sociais'],
    suggestedPrice: 2000,
    priceType: 'Pontual / Projeto Único',
    badge: 'Serviço Individual',
  },
  {
    id: 'serv-consultoria-comercial',
    name: 'Consultoria & Diagnóstico Comercial',
    category: 'servico',
    description: 'Análise de funil, scripts de vendas e capacitação do time de atendimento.',
    features: ['Auditoria de Processos', 'Script de Vendas', 'Reuniões de Alinhamento'],
    suggestedPrice: 2500,
    priceType: 'Pontual / Projeto Único',
    badge: 'Serviço Individual',
  },
];

export const ALL_TECHIFY_OFFERS = [...TECHIFY_PACKAGES, ...TECHIFY_INDIVIDUAL_SERVICES];
