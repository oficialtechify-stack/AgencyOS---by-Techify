import { ViewType, ViewMode } from '../types';
import { FirestoreUserProfile } from './firebase';

export interface SystemModuleInfo {
  id: ViewType;
  name: string;
  category: 'Principal' | 'Financeiro' | 'Tráfego & Vendas' | 'Gestão & Projetos' | 'Inteligência & IA' | 'Administração';
  description: string;
  iconName: string;
}

export const ALL_SYSTEM_MODULES: SystemModuleInfo[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Geral',
    category: 'Principal',
    description: 'Visão 360° com métricas consolidadas e atalhos rápidos',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'kpis',
    name: 'KPIs & Métricas',
    category: 'Financeiro',
    description: 'Acompanhamento de MRR, ARR, LTV, CAC e Churn Rate',
    iconName: 'DollarSign',
  },
  {
    id: 'fluxo-caixa',
    name: 'Fluxo de Caixa',
    category: 'Financeiro',
    description: 'Controle de entradas, saídas, despesas e saldo operacional',
    iconName: 'TrendingUp',
  },
  {
    id: 'campanhas',
    name: 'Campanhas de Tráfego',
    category: 'Tráfego & Vendas',
    description: 'Gestão de anúncios Meta Ads, Google Ads e TikTok Ads com ROAS',
    iconName: 'Megaphone',
  },
  {
    id: 'marketing',
    name: 'Marketing & Lançamentos',
    category: 'Tráfego & Vendas',
    description: 'Estratégia de marketing, calendário editorial, funis de aquisição, automações e copywriting',
    iconName: 'Target',
  },
  {
    id: 'agenda',
    name: 'Agenda & Reuniões',
    category: 'Gestão & Projetos',
    description: 'Agendamento de reuniões, alinhamentos e fechamentos com clientes',
    iconName: 'Calendar',
  },
  {
    id: 'maps-scraper',
    name: 'Maps Scraper & CRM',
    category: 'Tráfego & Vendas',
    description: 'Extração e prospecção de leads locais no Google Maps com qualificação',
    iconName: 'MapPin',
  },
  {
    id: 'designer',
    name: 'Área do Designer & Criação',
    category: 'Gestão & Projetos',
    description: 'Hub criativo, aprovações de artes, legendas, pastas de empresas e entrega de pacotes',
    iconName: 'Palette',
  },
  {
    id: 'social-hub',
    name: 'Social Media Hub',
    category: 'Inteligência & IA',
    description: 'Criação, agendamento de posts e automações com IA para redes',
    iconName: 'Share2',
  },
  {
    id: 'estoque',
    name: 'Gestão de Estoque',
    category: 'Gestão & Projetos',
    description: 'Controle de licenças, créditos de API e produtos digitais/físicos',
    iconName: 'Package',
  },
  {
    id: 'kanban',
    name: 'Kanban de Projetos',
    category: 'Gestão & Projetos',
    description: 'Quadro visual de demandas, sprints e entregas da equipe',
    iconName: 'Kanban',
  },
  {
    id: 'relatorios',
    name: 'Relatórios Executivos',
    category: 'Principal',
    description: 'Geração e exportação de relatórios gerenciais e para clientes',
    iconName: 'FileText',
  },
  {
    id: 'calculadora-roi',
    name: 'Calculadora de ROI',
    category: 'Financeiro',
    description: 'Simulador financeiro de retorno sobre investimento e conversões',
    iconName: 'Calculator',
  },
  {
    id: 'ia-consultora',
    name: 'IA Consultora',
    category: 'Inteligência & IA',
    description: 'Assistente inteligente para insights estratégicos e otimização',
    iconName: 'Bot',
  },
  {
    id: 'admin',
    name: 'Painel Administrativo',
    category: 'Administração',
    description: 'Gestão global de usuários, senhas, planos e permissões granulares',
    iconName: 'ShieldCheck',
  },
];

export const ALL_OPERATIONAL_MODULE_IDS: ViewType[] = ALL_SYSTEM_MODULES.filter(
  (m) => m.id !== 'admin'
).map((m) => m.id);

export const ALL_MODULE_IDS: ViewType[] = ALL_SYSTEM_MODULES.map((m) => m.id);

// Admin Master emails that always have full unrestricted access
export const MASTER_ADMIN_EMAILS = [
  'rickmarketing81@gmail.com',
  'oficialtechify@gmail.com',
];

/**
 * Check if the user is a master admin
 */
export function isUserMasterAdmin(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  const email = (profile?.email || userEmail || '').toLowerCase().trim();
  if (MASTER_ADMIN_EMAILS.includes(email)) return true;
  if (profile?.role?.toLowerCase().includes('admin')) return true;
  return false;
}

/**
 * Check whether a specific module is allowed for a user profile
 */
export function hasModuleAccess(
  moduleId: ViewType,
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  // Master Admins always have access to everything
  if (isUserMasterAdmin(profile, userEmail)) {
    return true;
  }

  // Admin module is strictly for admins or profiles explicitly granted 'admin'
  if (moduleId === 'admin') {
    return profile?.allowedModules?.includes('admin') || false;
  }

  // If user has no specific allowedModules configured (e.g. legacy), default to open
  if (!profile?.allowedModules || profile.allowedModules.length === 0) {
    return true;
  }

  return profile.allowedModules.includes(moduleId);
}

/**
 * Get count of allowed modules for display badge
 */
export function getAllowedModulesCount(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): { allowed: number; total: number; isAll: boolean } {
  if (isUserMasterAdmin(profile, userEmail)) {
    return {
      allowed: ALL_SYSTEM_MODULES.length,
      total: ALL_SYSTEM_MODULES.length,
      isAll: true,
    };
  }

  const allowedList = profile?.allowedModules || ALL_OPERATIONAL_MODULE_IDS;
  return {
    allowed: allowedList.length,
    total: ALL_OPERATIONAL_MODULE_IDS.length,
    isAll: allowedList.length >= ALL_OPERATIONAL_MODULE_IDS.length,
  };
}

/**
 * Quick permission presets for the Admin view
 */
export const PERMISSION_PRESETS = [
  {
    name: 'Liberar Tudo (Acesso Total)',
    badge: 'Total',
    color: 'border-[#22c55e] text-[#22c55e] bg-[#142816]',
    modules: ALL_OPERATIONAL_MODULE_IDS,
  },
  {
    name: 'Design & Criação',
    badge: 'Design',
    color: 'border-pink-500/40 text-pink-400 bg-[#26101c]',
    modules: ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios'] as ViewType[],
  },
  {
    name: 'Gestor de Tráfego',
    badge: 'Tráfego',
    color: 'border-blue-500/40 text-blue-400 bg-[#0f1728]',
    modules: ['dashboard', 'campanhas', 'calculadora-roi', 'relatorios', 'ia-consultora'] as ViewType[],
  },
  {
    name: 'Comercial & Prospecção (CRM)',
    badge: 'CRM',
    color: 'border-amber-500/40 text-amber-400 bg-[#24170d]',
    modules: ['dashboard', 'maps-scraper', 'agenda', 'social-hub', 'relatorios'] as ViewType[],
  },
  {
    name: 'Financeiro & Contabilidade',
    badge: 'Financeiro',
    color: 'border-emerald-500/40 text-emerald-400 bg-[#101912]',
    modules: ['dashboard', 'kpis', 'fluxo-caixa', 'calculadora-roi', 'relatorios'] as ViewType[],
  },
  {
    name: 'Operação & Projetos',
    badge: 'Operação',
    color: 'border-purple-500/40 text-purple-400 bg-[#1b1228]',
    modules: ['dashboard', 'kanban', 'estoque', 'agenda', 'ia-consultora'] as ViewType[],
  },
  {
    name: 'Apenas Dashboard',
    badge: 'Básico',
    color: 'border-gray-500/40 text-gray-400 bg-[#12141e]',
    modules: ['dashboard'] as ViewType[],
  },
];
