import {
  AdminUserRecord,
  AdCampaign,
  AgendaEvent,
  CRMLead,
  CashTransaction,
  KPIPeriod,
  KanbanTask,
  StockItem,
  SubscriptionPlan,
  SystemUpdate,
} from '../types';

export const initialCRMLeads: CRMLead[] = [
  {
    id: 'lead-1',
    name: 'Reteteu - Comida Honesta',
    city: 'Recife',
    category: 'Restaurante Brasileiro',
    phone: '(81) 98254-2560',
    email: 'falecom@reteteu.com.br',
    website: 'www.reteteu.com.br',
    instagram: '@reteteucomidahonesta',
    rating: 4.5,
    status: 'novo',
  },
  {
    id: 'lead-2',
    name: 'Ponte Nova',
    city: 'Recife',
    category: 'Restaurante Contemporâneo',
    phone: '(81) 99814-0313',
    email: 'reservas@pontenova.com.br',
    website: 'www.pontenova.com.br',
    instagram: '@pontenova',
    rating: 4.7,
    status: 'novo',
  },
  {
    id: 'lead-3',
    name: 'Câ-Já Restaurante',
    city: 'Recife',
    category: 'Restaurante Brasileiro',
    phone: '(81) 3126-0648',
    email: 'contato@cajarestaurante.com.br',
    website: 'www.cajarestaurante.com.br',
    instagram: '@cajarestaurante',
    rating: 4.6,
    status: 'novo',
  },
  {
    id: 'lead-4',
    name: 'Valent Barber',
    city: 'Jaboatão',
    category: 'Barbearia',
    phone: '(81) 96666-5555',
    email: 'contato@valentbarber.com.br',
    website: 'booksy.com/pt-br/valentbarber',
    instagram: '@valentbarber',
    rating: 5.0,
    status: 'contatado',
  },
  {
    id: 'lead-5',
    name: 'Studio Zé Barber',
    city: 'Jaboatão',
    category: 'Barbearia',
    phone: '(81) 98888-7777',
    email: 'contato@studiozebarber.com.br',
    website: 'booksy.com/pt-br/studioze',
    instagram: '@studiozebarber',
    rating: 5.0,
    status: 'contatado',
  },
  {
    id: 'lead-6',
    name: 'Boteco Barazzone',
    city: 'Jaboatão',
    category: 'Bar e Restaurante',
    phone: '(81) 3462-1088',
    email: 'contato@barazzone.com.br',
    website: null,
    instagram: '@botecobarazzone',
    rating: 4.3,
    status: 'novo',
  },
];

export const initialKPIPeriods: KPIPeriod[] = [];

export const initialCashTransactions: CashTransaction[] = [];

export const initialAdCampaigns: AdCampaign[] = [];

export const initialAgendaEvents: AgendaEvent[] = [
  {
    id: 'ev-1',
    title: 'Reunião de Onboarding - Cliente Alpha',
    date: '2026-08-15',
    time: '10:00',
    client: 'Alpha Ecommerce',
    type: 'Reunião',
  },
  {
    id: 'ev-2',
    title: 'Apresentação de Relatório Mensal',
    date: '2026-08-18',
    time: '14:30',
    client: 'Barbearia Valent',
    type: 'Alinhamento',
  },
];

export const initialStockItems: StockItem[] = [];

export const initialKanbanTasks: KanbanTask[] = [];

export const initialSystemUpdates: SystemUpdate[] = [
  {
    id: 'up-1',
    title: 'Dashboard individual por usuário',
    description: 'Cada usuário agora tem seu próprio dashboard isolado. Dados financeiros, campanhas e leads são separados por conta.',
    type: 'Novidade',
    version: 'v1.3.0',
    date: '04 de junho de 2026',
    hidden: true,
  },
  {
    id: 'up-2',
    title: 'Sino de notificações de atualizações',
    description: 'Um sino no topo do sistema agora avisa sobre novidades, correções e melhorias na plataforma em tempo real.',
    type: 'Novidade',
    version: 'v1.3.0',
    date: '04 de junho de 2026',
    hidden: true,
  },
  {
    id: 'up-3',
    title: 'Proteção contra cadastro duplicado',
    description: 'Corrigido bug que permitia criar múltiplas assinaturas com o mesmo email. Agora cada email só pode ter um cadastro.',
    type: 'Correção',
    version: 'v1.2.1',
    date: '04 de junho de 2026',
  },
  {
    id: 'up-4',
    title: 'Painel Admin expandido',
    description: 'O painel administrativo agora conta com 3 abas: Assinaturas, Atualizações do sistema e Estatísticas com MRR estimado.',
    type: 'Melhoria',
    version: 'v1.3.0',
    date: '04 de junho de 2026',
  },
];

export const initialSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    code: 'Starter',
    price: 49.99,
    period: '/mês',
    paymentLink: 'https://cacto.pay/starter',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    code: 'Pro',
    price: 249.99,
    period: '/mês',
    isPopular: true,
    paymentLink: 'https://cacto.pay/pro',
  },
  {
    id: 'plan-agency',
    name: 'Agency',
    code: 'Agency',
    price: 997.0,
    period: '/mês',
    paymentLink: 'https://cacto.pay/agency',
  },
];

// Generates 129 user records matching Admin panel in screenshot 12
export const generateAdminUsers = (): AdminUserRecord[] => {
  const list: AdminUserRecord[] = [
    {
      id: 'usr-001',
      email: 'aigerakabane81983521523@gmail.com',
      plan: 'Trial Gratuito',
      status: 'Trial Expirado',
      trialExpiration: '27/07/2026',
      createdAt: '13/07/2026',
      notes: '—',
    },
    {
      id: 'usr-002',
      email: 'aigerakabane81983521523@gmail.com',
      plan: 'Pro',
      status: 'Ativo',
      trialExpiration: '27/07/2026',
      createdAt: '13/07/2026',
      notes: '—',
    },
    {
      id: 'usr-003',
      email: 'aigerakabane81983521523@gmail.com',
      plan: 'Pro',
      status: 'Ativo',
      trialExpiration: '27/07/2026',
      createdAt: '13/07/2026',
      notes: '—',
    },
    {
      id: 'usr-004',
      email: 'oficialtechify@gmail.com',
      plan: 'Trial Gratuito',
      status: 'Trial Expirado',
      trialExpiration: '18/07/2026',
      createdAt: '04/07/2026',
      notes: '—',
    },
    {
      id: 'usr-005',
      email: 'rickmarketing81@gmail.com',
      plan: 'Agency',
      status: 'Ativo',
      trialExpiration: '17/06/2026',
      createdAt: '03/06/2026',
      notes: 'Administrador principal',
    },
    {
      id: 'usr-006',
      email: 'brendasvelyn2030@gmail.com',
      plan: 'Trial Gratuito',
      status: 'Trial Expirado',
      trialExpiration: '17/06/2026',
      createdAt: '03/06/2026',
      notes: '—',
    },
  ];

  // Fill remaining to reach 129 total entries
  for (let i = 7; i <= 129; i++) {
    list.push({
      id: `usr-${String(i).padStart(3, '0')}`,
      email: 'aigerakabane81983521523@gmail.com',
      plan: 'Trial Gratuito',
      status: 'Trial Expirado',
      trialExpiration: '18/06/2026',
      createdAt: '04/06/2026',
      notes: '—',
    });
  }

  return list;
};
