/**
 * Server/client shared catalogue. Do not import browser-side firebase modules
 * here: this file is imported by Vercel Node.js API routes as well as React.
 *
 * 'admin', 'leadspay-master' and 'leadspay-companies' are NOT grantable
 * employee modules. Their presence in a legacy profile must never escalate
 * server permissions.
 */
export const EMPLOYEE_MODULE_IDS = [
  'dashboard',
  'profile',
  'lideranca',
  'ponto',
  'kpis',
  'fluxo-caixa',
  'campanhas',
  'marketing',
  'agenda',
  'prospection',
  'maps-scraper',
  'designer',
  'social-hub',
  'estoque',
  'kanban',
  'relatorios',
  'calculadora-roi',
  'ia-consultora',
] as const;
export const DEFAULT_EMPLOYEE_MODULES: string[] = ['dashboard', 'kanban', 'agenda', 'ponto'];
export const EMPLOYEE_MODULE_SET: ReadonlySet<string> = new Set(EMPLOYEE_MODULE_IDS);
export function splitEmployeeModules(value: unknown) {
  const valid: string[] = [], ignored: string[] = [], seen = new Set<string>();
  if (!Array.isArray(value)) return { valid, ignored };
  for (const id of value) {
    if (typeof id !== 'string' || seen.has(id)) continue;
    seen.add(id);
    (EMPLOYEE_MODULE_SET.has(id) ? valid : ignored).push(id);
  }
  return { valid, ignored };
}
