// types/auth.ts

export type PlanType = 'starter' | 'professional' | 'enterprise';

export interface UserPermissions {
  dashboardGeral: boolean;
  pontoEletronico: boolean;
  kpisMetricas: boolean;
  fluxoCaixa: boolean;
  campanhasTrafego: boolean;
  marketingLancamentos: boolean;
  agendaReunioes: boolean;
  prospeccaoFechamento: boolean;
  mapsScraper: boolean;
  areaDesigner: boolean;
  socialMediaHub: boolean;
  gestaoEstoque: boolean;
  kanbanProjetos: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'owner' | 'employee' | 'master';
  organizationId: string; // ID da agência principal
  jobTitle?: string; // ex: Gestor de Tráfego, Líder de Design
  permissions?: UserPermissions;
  
  // Dados do Trial / Assinatura
  subscription: {
    plan: PlanType;
    status: 'trialing' | 'active' | 'canceled' | 'expired';
    trialEndsAt: string; // ISO String (Data em +14 dias para novos clientes)
    isMasterAccount?: boolean; // Para rickmarketing81@gmail.com
  };
}
