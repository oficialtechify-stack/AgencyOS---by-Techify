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
    id: 'profile',
    name: 'Meu Perfil & Crachá',
    category: 'Principal',
    description: 'Foto de perfil, dados profissionais, setor e crachá digital da agência',
    iconName: 'UserCheck',
  },
  {
    id: 'lideranca',
    name: 'Painel de Liderança',
    category: 'Principal',
    description: 'Comando executivo, metas de tráfego/vendas e visão estratégica por liderança',
    iconName: 'Crown',
  },
  {
    id: 'ponto',
    name: 'Ponto Eletrônico Seguro',
    category: 'Gestão & Projetos',
    description: 'Registro biométrico e geolocalizado de jornada, espelho de ponto e horas trabalhadas',
    iconName: 'Clock',
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
    id: 'prospection',
    name: 'Prospecção & Fechamentos',
    category: 'Tráfego & Vendas',
    description: 'Demandas comerciais, abordagem por Instagram, pacotes Techify e contratos fechados em tempo real',
    iconName: 'Target',
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
  {
    id: 'leadspay-master',
    name: 'LeadsPay — Dashboard & Métricas',
    category: 'Administração',
    description: 'Central de telemetria, faturamento global, webhooks e métricas unificadas',
    iconName: 'Zap',
  },
  {
    id: 'leadspay-companies',
    name: 'LeadsPay — Gerenciar Empresas',
    category: 'Administração',
    description: 'Gestão de empresas parceiras, assinaturas, planos e chaves de API LeadsPay',
    iconName: 'Building2',
  },
];

export const ALL_OPERATIONAL_MODULE_IDS: ViewType[] = ALL_SYSTEM_MODULES.filter(
  (m) => m.id !== 'admin'
).map((m) => m.id);

export const ALL_MODULE_IDS: ViewType[] = ALL_SYSTEM_MODULES.map((m) => m.id);

// Admin Master emails that always have full unrestricted access
export const MASTER_ADMIN_EMAILS = [
  'rickmarketing81@gmail.com',
  'rickmarketing81@gamail.com',
  'agencyosoficial@gmail.com',
  'oficialtechify@gmail.com',
];

/**
 * Check if the user is the global Master Admin (Super Admin of AgencyOS platform)
 */
export function isUserMasterAdmin(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  const email = (profile?.email || userEmail || '').toLowerCase().trim();
  const uid = (profile?.uid || '').toLowerCase().trim();

  // If email matches rickmarketing81 or any master admin email
  if (
    MASTER_ADMIN_EMAILS.includes(email) ||
    email.startsWith('rickmarketing81@') ||
    email.includes('rickmarketing81') ||
    email.includes('agencyosoficial') ||
    email.includes('oficialtechify')
  ) {
    return true;
  }

  // If UID corresponds to Marcos Henrique / Master Owner
  if (
    uid === 'user-rick-marcos' ||
    uid.includes('rick-marcos') ||
    uid === 'agency-master-owner'
  ) {
    return true;
  }

  return false;
}

/**
 * Check if the user is a Company Owner / CEO / Leader of their own company/workspace
 */
export function isCompanyOwnerOrCEO(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (!profile && !userEmail) return false;

  // An employee assigned to another agency owner is not the company owner
  if (profile?.userType === 'employee' && profile.agencyOwnerUid && profile.agencyOwnerUid !== profile.uid) {
    return false;
  }

  const role = (profile?.role || '').toLowerCase();
  if (
    role.includes('ceo') ||
    role.includes('dono') ||
    role.includes('proprietário') ||
    role.includes('proprietaria') ||
    role.includes('fundador') ||
    role.includes('diretor executivo') ||
    role.includes('lider geral') ||
    role.includes('líder geral') ||
    profile?.leadershipRole === 'lider_geral'
  ) {
    return true;
  }

  // If user signed up as an independent client/company account
  if (profile?.userType === 'client' || (!profile?.agencyOwnerUid || profile?.agencyOwnerUid === profile?.uid)) {
    return true;
  }

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

  // Ponto eletrônico and Meu Perfil are accessible to all registered users
  if (moduleId === 'ponto' || moduleId === 'profile') {
    return true;
  }

  // Admin module: accessible to Master Admin, or Company CEO / Owner (to manage their team), or if explicitly granted
  if (moduleId === 'admin') {
    if (isCompanyOwnerOrCEO(profile, userEmail)) {
      return true;
    }
    return profile?.allowedModules?.includes('admin') || false;
  }

  // For employees: strictly check allowedModules configured by their CEO!
  if (profile?.userType === 'employee') {
    if (!profile.allowedModules || profile.allowedModules.length === 0) {
      // Default basic access if unconfigured
      return ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'ponto'].includes(moduleId);
    }
    return profile.allowedModules.includes(moduleId);
  }

  // For company owners / CEOs: full operational access to their company's modules unless restricted
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
    name: '👑 Líder Geral (Acesso Total / Gestão)',
    badge: 'Líder Geral',
    color: 'border-white text-white bg-neutral-900',
    modules: ALL_OPERATIONAL_MODULE_IDS,
  },
  {
    name: '🎯 Líder de Marketing (Estratégia & Lançamentos)',
    badge: 'Líder Marketing',
    color: 'border-neutral-700 text-white bg-neutral-900',
    modules: ['dashboard', 'marketing', 'campanhas', 'social-hub', 'calculadora-roi', 'relatorios', 'ia-consultora', 'designer'] as ViewType[],
  },
  {
    name: '📍 Líder de Prospecção (Comercial, SDR & CRM)',
    badge: 'Líder Prospecção',
    color: 'border-neutral-700 text-white bg-neutral-900',
    modules: ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'social-hub', 'ia-consultora', 'campanhas'] as ViewType[],
  },
  {
    name: '🎨 Líder de Design (Direção Criativa)',
    badge: 'Líder Design',
    color: 'border-neutral-700 text-white bg-neutral-900',
    modules: ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios'] as ViewType[],
  },
  {
    name: '🚀 Gestor de Tráfego',
    badge: 'Tráfego',
    color: 'border-neutral-700 text-neutral-300 bg-neutral-950',
    modules: ['dashboard', 'campanhas', 'calculadora-roi', 'relatorios', 'ia-consultora'] as ViewType[],
  },
  {
    name: '🎨 Designer Gráfico',
    badge: 'Designer',
    color: 'border-neutral-700 text-neutral-300 bg-neutral-950',
    modules: ['dashboard', 'designer', 'social-hub', 'kanban'] as ViewType[],
  },
  {
    name: '💼 Closer / SDR de Prospecção',
    badge: 'Prospecção',
    color: 'border-neutral-700 text-neutral-300 bg-neutral-950',
    modules: ['dashboard', 'maps-scraper', 'agenda', 'relatorios'] as ViewType[],
  },
  {
    name: '💰 Financeiro & Contabilidade',
    badge: 'Financeiro',
    color: 'border-neutral-700 text-neutral-300 bg-neutral-950',
    modules: ['dashboard', 'kpis', 'fluxo-caixa', 'calculadora-roi', 'relatorios'] as ViewType[],
  },
  {
    name: '⚡ Operação & Projetos',
    badge: 'Operação',
    color: 'border-neutral-700 text-neutral-300 bg-neutral-950',
    modules: ['dashboard', 'kanban', 'estoque', 'agenda', 'ia-consultora'] as ViewType[],
  },
  {
    name: '📊 Apenas Dashboard',
    badge: 'Básico',
    color: 'border-neutral-800 text-neutral-400 bg-neutral-950',
    modules: ['dashboard'] as ViewType[],
  },
];

/**
 * Checks if a user has any Leadership role
 */
export function isLeader(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.leadershipRole && profile.leadershipRole !== 'membro') return true;
  const role = (profile?.role || '').toLowerCase();
  return (
    role.includes('lider') ||
    role.includes('líder') ||
    role.includes('diretor') ||
    role.includes('gestor') ||
    role.includes('gerente') ||
    profile?.designRole === 'lider' ||
    profile?.designRole === 'admin'
  );
}

/**
 * Checks if a user is Marketing Leader or General Leader
 */
export function isMarketingLeader(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.leadershipRole === 'lider_marketing' || profile?.leadershipRole === 'lider_geral') return true;
  const role = (profile?.role || '').toLowerCase();
  return (
    (role.includes('lider') || role.includes('líder') || role.includes('gestor')) &&
    (role.includes('marketing') || role.includes('geral') || role.includes('estratégia'))
  );
}

/**
 * Checks if a user is Prospecting Leader or General Leader
 */
export function isProspectingLeader(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.leadershipRole === 'lider_prospeccao' || profile?.leadershipRole === 'lider_geral') return true;
  const role = (profile?.role || '').toLowerCase();
  return (
    (role.includes('lider') || role.includes('líder') || role.includes('gestor')) &&
    (role.includes('prospec') || role.includes('comercial') || role.includes('vendas') || role.includes('sdr') || role.includes('geral'))
  );
}

/**
 * Checks if a user is Design Leader or General Leader
 */
export function isDesignLeader(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.leadershipRole === 'lider_design' || profile?.leadershipRole === 'lider_geral') return true;
  const role = (profile?.role || '').toLowerCase();
  return (
    ((role.includes('lider') || role.includes('líder') || role.includes('diretor')) &&
    (role.includes('design') || role.includes('arte') || role.includes('geral'))) ||
    profile?.designRole === 'lider'
  );
}

/**
 * Check if the user can create designs or briefings
 */
export function canUserCreateDesigns(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.canCreateDesigns !== undefined) return profile.canCreateDesigns;
  // By default, leaders and employees/designers can create
  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;
  if (dRole === 'cliente') return false;
  if (role.includes('cliente') || role.includes('convidado')) return false;
  return true;
}

/**
 * Check if the user has permission to edit designs
 */
export function canUserEditDesigns(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null,
  assignedEmail?: string,
  createdEmail?: string
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  
  const email = (profile?.email || userEmail || '').toLowerCase().trim();
  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;

  // Leaders / Admins can always edit any design
  if (dRole === 'lider' || dRole === 'admin') return true;
  if (role.includes('lider') || role.includes('líder') || role.includes('diretor') || role.includes('gerente') || role.includes('admin')) return true;

  // If explicitly granted permission
  if (profile?.canEditDesigns === true) return true;
  if (profile?.canEditDesigns === false) return false;

  // If user is the assigned designer or creator
  if (assignedEmail && email && assignedEmail.toLowerCase() === email) return true;
  if (createdEmail && email && createdEmail.toLowerCase() === email) return true;

  // Employees/Designers can edit by default
  if (dRole === 'designer' || dRole === 'funcionario') return true;
  if (role.includes('designer') || role.includes('funcionario') || role.includes('funcionário') || role.includes('gestor')) return true;

  // Clients / Guests cannot edit by default
  if (dRole === 'cliente') return false;
  if (role.includes('cliente') || role.includes('convidado')) return false;

  return true;
}

/**
 * Check if user can approve/reject designs (Leader / Manager / Admin)
 */
export function canUserApproveDesigns(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.canApproveDesigns !== undefined) return profile.canApproveDesigns;

  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;

  if (dRole === 'lider' || dRole === 'admin') return true;
  if (role.includes('lider') || role.includes('líder') || role.includes('diretor') || role.includes('gerente') || role.includes('admin') || role.includes('executiv')) return true;

  return false;
}

/**
 * Check if user can publish / post to social media
 */
export function canUserPublishPosts(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.canPublishPosts !== undefined) return profile.canPublishPosts;

  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;

  if (dRole === 'lider' || dRole === 'admin' || dRole === 'designer' || dRole === 'funcionario') return true;
  if (role.includes('lider') || role.includes('líder') || role.includes('designer') || role.includes('social') || role.includes('gestor') || role.includes('admin')) return true;

  return true;
}

/**
 * Check if user can edit marketing campaigns, funnels, editorials, copy
 */
export function canUserEditMarketing(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;
  if (dRole === 'cliente') return false;
  if (role.includes('cliente') || role.includes('convidado')) return false;
  return true;
}

export function canUserDeleteDesigns(
  profile?: FirestoreUserProfile | null,
  userEmail?: string | null
): boolean {
  if (isUserMasterAdmin(profile, userEmail)) return true;
  if (profile?.canDeleteDesigns !== undefined) return profile.canDeleteDesigns;

  const role = (profile?.role || '').toLowerCase();
  const dRole = profile?.designRole;

  if (dRole === 'lider' || dRole === 'admin') return true;
  if (role.includes('lider') || role.includes('líder') || role.includes('admin') || role.includes('diretor') || role.includes('gerente')) return true;

  return true;
}
