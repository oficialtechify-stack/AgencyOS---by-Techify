// lib/plans.ts
import { PlanType, UserPermissions } from '@/types/auth';

export const PLAN_MODULES: Record<PlanType, (keyof UserPermissions)[]> = {
  starter: [
    'dashboardGeral',
    'fluxoCaixa',
    'agendaReunioes',
    'kanbanProjetos',
  ],
  professional: [
    'dashboardGeral',
    'fluxoCaixa',
    'agendaReunioes',
    'kanbanProjetos',
    'campanhasTrafego',
    'marketingLancamentos',
    'areaDesigner',
    'mapsScraper',
    'prospeccaoFechamento',
    'kpisMetricas',
  ],
  enterprise: [
    'dashboardGeral',
    'pontoEletronico',
    'kpisMetricas',
    'fluxoCaixa',
    'campanhasTrafego',
    'marketingLancamentos',
    'agendaReunioes',
    'prospeccaoFechamento',
    'mapsScraper',
    'areaDesigner',
    'socialMediaHub',
    'gestaoEstoque',
    'kanbanProjetos',
  ],
};

export const ALL_PERMISSIONS_KEYS: (keyof UserPermissions)[] = [
  'dashboardGeral',
  'pontoEletronico',
  'kpisMetricas',
  'fluxoCaixa',
  'campanhasTrafego',
  'marketingLancamentos',
  'agendaReunioes',
  'prospeccaoFechamento',
  'mapsScraper',
  'areaDesigner',
  'socialMediaHub',
  'gestaoEstoque',
  'kanbanProjetos',
];

export function getDefaultPermissionsForPlan(plan: PlanType): UserPermissions {
  const allowed = new Set<keyof UserPermissions>(PLAN_MODULES[plan] || PLAN_MODULES.professional);
  const result = {} as UserPermissions;
  for (const key of ALL_PERMISSIONS_KEYS) {
    result[key] = allowed.has(key);
  }
  return result;
}

export function isModuleAllowedForUser(
  moduleKey: keyof UserPermissions,
  permissions?: UserPermissions,
  plan?: PlanType,
  isMaster?: boolean
): boolean {
  if (isMaster) return true;
  if (permissions && typeof permissions[moduleKey] === 'boolean') {
    return permissions[moduleKey];
  }
  if (plan && PLAN_MODULES[plan]) {
    return PLAN_MODULES[plan].includes(moduleKey);
  }
  return true;
}
