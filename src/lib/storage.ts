import { AppState, ViewType } from '../types';
const STORAGE_KEY = 'agencyos_full_app_state_v2';

// New workspaces start empty; social posts are persisted in Firebase.
export const initialSocialPosts = [];

export const getDefaultState = (): AppState => ({
  activeView: 'landing',
  organization: {
    agencyName: 'Minha Agência',
    plan: '',
    trialDaysRemaining: 0,
    trialActive: false,
    licenseKey: '',
  },
  kpiPeriods: [],
  transactions: [],
  campaigns: [],
  leads: [],
  tasks: [],
  stockItems: [],
  events: [],
  socialPosts: [],
  prospectionDemands: [],
  prospectionContracts: [],
});

// Never cache business records or user profiles in global localStorage.
// Doing so leaks one company's records into another account on shared devices.
export const loadState = (): AppState => {
  const state = getDefaultState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only view preference is non-sensitive and safe to restore.
      if (typeof parsed?.activeView === 'string') {
        state.activeView = parsed.activeView as ViewType;
      }
    }
  } catch (err) {
    console.warn('Falha ao ler preferência de navegação:', err);
  }
  return state;
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeView: state.activeView }));
  } catch (err) {
    console.warn('Falha ao salvar preferência:', err);
  }
};

export const resetToDefaults = (): AppState => {
  const initialState = getDefaultState();
  saveState(initialState);
  return initialState;
};

// Backward-compatible Storage helper
export const Storage = {
  getUserProfile: () => null,
  getCRMLeads: () => loadState().leads,
  getKPIPeriods: () => loadState().kpiPeriods,
  getCashTransactions: () => loadState().transactions,
  getCampaigns: () => loadState().campaigns,
  getStockItems: () => loadState().stockItems,
  getKanbanTasks: () => loadState().tasks,
};
