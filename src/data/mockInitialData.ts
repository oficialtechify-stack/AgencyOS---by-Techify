import type {
  CRMLead,
  KPIPeriod,
  CashTransaction,
  AdCampaign,
  AgendaEvent,
  StockItem,
  KanbanTask,
  SystemUpdate,
  SubscriptionPlan,
  AdminUserRecord,
  ProspectionDemand,
  ProspectionClosedContract,
} from '../types';

// All production workspaces start empty. Do not ship demo customers,
// financial records, contracts, staff accounts or nonfunctional payment links.
// Actual data must be created by authorized users and read from Firestore.
export const initialCRMLeads: CRMLead[] = [];
export const initialKPIPeriods: KPIPeriod[] = [];
export const initialCashTransactions: CashTransaction[] = [];
export const initialAdCampaigns: AdCampaign[] = [];
export const initialAgendaEvents: AgendaEvent[] = [];
export const initialStockItems: StockItem[] = [];
export const initialKanbanTasks: KanbanTask[] = [];
export const initialSystemUpdates: SystemUpdate[] = [];
export const initialSubscriptionPlans: SubscriptionPlan[] = [];
export const generateAdminUsers = (): AdminUserRecord[] => [];
export const initialProspectionDemands: ProspectionDemand[] = [];
export const initialProspectionContracts: ProspectionClosedContract[] = [];
