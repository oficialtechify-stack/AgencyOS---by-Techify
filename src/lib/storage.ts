import { AppState, ViewType } from '../types';
import {
  initialKPIPeriods,
  initialCashTransactions,
  initialAdCampaigns,
  initialCRMLeads,
  initialKanbanTasks,
  initialStockItems,
  initialAgendaEvents,
  initialProspectionDemands,
  initialProspectionContracts,
} from '../data/mockInitialData';

const STORAGE_KEY = 'agencyos_full_app_state_v2';

export const initialSocialPosts = [
  {
    id: 'post-1',
    platform: 'Instagram' as const,
    client: 'Reteteu Comida Honesta',
    content: '🔥 Novo Prato do Dia: Carne do Sol com Queijo Coalho Assado na Brasa! Venha conferir.',
    scheduledDate: '2026-08-15',
    scheduledTime: '12:00',
    status: 'Agendado' as const,
  },
  {
    id: 'post-[#2]',
    platform: 'LinkedIn' as const,
    client: 'Techify Agency',
    content: '🚀 Como triplicamos a captação de leads B2B utilizando o Maps Scraper da AgencyOS.',
    scheduledDate: '2026-08-16',
    scheduledTime: '09:00',
    status: 'Rascunho' as const,
  },
];

export const getDefaultState = (): AppState => ({
  activeView: 'landing',
  organization: {
    agencyName: 'Sua Agência Scale',
    plan: 'Pro',
    trialDaysRemaining: 14,
    trialActive: true,
    licenseKey: 'AGENCYOS-PRO-TECHIFY-2026-889X',
  },
  kpiPeriods: initialKPIPeriods,
  transactions: initialCashTransactions,
  campaigns: initialAdCampaigns,
  leads: initialCRMLeads,
  tasks: initialKanbanTasks,
  stockItems: initialStockItems,
  events: initialAgendaEvents.map((e) => ({
    ...e,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
  })),
  socialPosts: initialSocialPosts,
  prospectionDemands: initialProspectionDemands,
  prospectionContracts: initialProspectionContracts,
});

export const loadState = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultState();
    const parsed = JSON.parse(data);
    return { ...getDefaultState(), ...parsed };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getDefaultState();
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

export const resetToDefaults = (): AppState => {
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
};

// Backward-compatible Storage helper
export const Storage = {
  getUserProfile: () => ({
    name: 'Marcos Henrique',
    email: 'rickmarketing81@gmail.com',
    plan: 'Agency',
    status: 'active',
    createdAt: '03/06/2026',
  }),
  getCRMLeads: () => loadState().leads,
  getKPIPeriods: () => loadState().kpiPeriods,
  getCashTransactions: () => loadState().transactions,
  getCampaigns: () => loadState().campaigns,
  getStockItems: () => loadState().stockItems,
  getKanbanTasks: () => loadState().tasks,
};
