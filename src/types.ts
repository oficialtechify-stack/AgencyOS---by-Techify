export type ViewType =
  | 'landing'
  | 'trial-signup'
  | 'dashboard'
  | 'marketing'
  | 'designer'
  | 'studio-agency'
  | 'kpis'
  | 'fluxo-caixa'
  | 'campanhas'
  | 'agenda'
  | 'maps-scraper'
  | 'social-hub'
  | 'estoque'
  | 'kanban'
  | 'relatorios'
  | 'calculadora-roi'
  | 'ia-consultora'
  | 'admin'
  | 'technical-docs';

export type ViewMode = ViewType;

export interface UserProfile {
  name: string;
  email: string;
  agencyName?: string;
  role?: string;
  leadershipRole?: 'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro';
  userType?: 'employee' | 'client';
  agencyOwnerUid?: string;
  plan: 'Starter' | 'Pro' | 'Agency' | 'Trial Gratuito' | 'Gratuito / Equipe';
  status: 'active' | 'Trial Expirado' | 'cancelled' | 'blocked';
  createdAt: string;
  allowedModules?: ViewType[];
  tempPasswordHint?: string;
}

export interface OrganizationState {
  agencyName: string;
  plan: string;
  trialDaysRemaining: number;
  trialActive: boolean;
  licenseKey: string;
}

export interface KPIPeriod {
  id: string;
  monthYear: string; // e.g. "08/2026"
  mrr: number;
  arr: number;
  ltv: number;
  cac: number;
  churnRate: number;
  activeClients: number;
}

export interface CashTransaction {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'LinkedIn Ads' | 'Facebook Ads' | 'Outro';
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
  roas: number;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  client: string;
  type: 'Apresentação' | 'Alinhamento' | 'Fechamento' | 'Reunião' | 'Entrega' | 'Outro';
  meetUrl?: string;
  status?: string;
}

export type CalendarEvent = AgendaEvent;

export interface SocialPost {
  id: string;
  platform: 'Instagram' | 'LinkedIn' | 'Facebook' | 'TikTok';
  client: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Agendado' | 'Publicado' | 'Rascunho';
}

export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'fechado' | 'perdido';

export interface CRMLead {
  id: string;
  name: string;
  city: string;
  category: string;
  phone: string;
  email: string;
  website: string | null;
  hasWebsite?: boolean;
  instagram: string;
  instagramExists?: boolean;
  rating: number;
  reviewsCount?: number;
  verified?: boolean;
  qualification?: 'Alta Qualificação' | 'Média Qualificação' | 'Em Qualificação' | string;
  qualificationScore?: number;
  status: LeadStatus;
  source?: string;
  address?: string;
  assignedLeader?: string; // e.g. "Líder de Prospecção", "Líder Geral", "SDR"
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  status: 'Ativo' | 'Estoque Baixo' | 'Esgotado';
}

export interface KanbanTask {
  id: string;
  title: string;
  client: string;
  description: string;
  status: 'Backlog' | 'Em Andamento' | 'Revisão' | 'Concluído';
  priority: 'Baixa' | 'Média' | 'Alta';
  assignedLeader?: string; // e.g. "Líder Geral", "Líder de Marketing", "Líder de Prospecção", "Líder de Design"
}

export interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  type: 'Novidade' | 'Melhoria' | 'Correção';
  version: string;
  date: string;
  hidden?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: 'Starter' | 'Pro' | 'Agency';
  price: number;
  period: string;
  isPopular?: boolean;
  paymentLink?: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  plan: 'Trial Gratuito' | 'Starter' | 'Pro' | 'Agency';
  status: 'Ativo' | 'Trial Expirado' | 'Cancelado' | 'Bloqueado';
  trialExpiration: string;
  createdAt: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export type DesignStatus =
  | 'briefing'
  | 'producao'
  | 'revisao'
  | 'aprovado'
  | 'ajustes'
  | 'entregue';

export type DesignChannel =
  | 'Instagram Feed'
  | 'Instagram Stories'
  | 'Carrossel'
  | 'Meta Ads'
  | 'Google Display'
  | 'Banner Web'
  | 'Identidade Visual'
  | 'Impresso'
  | 'Outro';

export type DesignCategory =
  | 'Empresa / Cliente'
  | 'Instagram'
  | 'Anúncios / Tráfego'
  | 'Pessoal / Agência'
  | 'Branding'
  | 'Eventos'
  | 'Outros';

export interface DesignProject {
  id: string;
  title: string;
  clientName: string;
  folderId?: string;
  folderName?: string;
  category: DesignCategory;
  channel: DesignChannel;
  status: DesignStatus;
  assignedTo: string; // e.g. "Vitória", "Lucas", "Designer"
  assignedEmail?: string;
  createdBy: string; // e.g. "Executivo Marcos"
  createdEmail?: string;
  briefing: string;
  copyText: string; // Legenda / Texto / Copy
  hashtags?: string;
  imageUrl?: string;
  images?: string[]; // Array of images for multi-image / carousel posts
  version: number;
  deadline?: string;
  dimensions?: string; // e.g. "1080x1350 (4:5)"
  packageId?: string;
  packageName?: string;
  reviewFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approved: boolean;
  commentsCount?: number;
  postStatus?: 'nao_postado' | 'agendado' | 'postado';
  postedAt?: string;
  postedBy?: string;
  postPlatforms?: string[];
  scheduledPostDate?: string;
  scheduledPostTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DesignComment {
  id: string;
  projectId: string;
  authorName: string;
  authorEmail: string;
  authorRole: 'designer' | 'lider' | 'executivo' | 'admin';
  text: string;
  attachmentUrl?: string;
  timestamp: string;
}

export interface DesignFolder {
  id: string;
  name: string;
  clientName: string;
  category: DesignCategory;
  color: string;
  icon?: string;
  designsCount?: number;
  createdAt?: string;
}

export interface DesignBriefingDemand {
  id: string;
  title: string;
  clientName: string;
  executiveName: string;
  executiveEmail: string;
  assignedTo?: string; // Nome da pessoa responsável por pegar/executar a demanda
  assignedEmail?: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  channel: DesignChannel;
  description: string;
  referencesUrl?: string;
  referenceLinks?: string[]; // Links (Behance, Pinterest, Drive, Figma, Canva, Web)
  referenceImages?: string[]; // Exemplos de imagens anexadas (URLs ou Base64)
  instagramProfiles?: string[]; // Perfis do Instagram (ex: @empresa ou URL)
  instagramPosts?: string[]; // Links de posts específicos do Instagram para referência
  deadline: string;
  status: 'Pendente' | 'Assumido' | 'Concluído';
  claimedBy?: string;
  claimedAt?: string;
  createdAt: string;
}

export interface DesignPackage {
  id: string;
  packageName: string;
  clientName: string;
  itemsCount: number;
  deliveredCount: number;
  driveLink?: string;
  figmaLink?: string;
  zipLink?: string;
  status: 'Em Produção' | 'Pronto para Entrega' | 'Entregue' | 'Aprovado pelo Cliente';
  notes?: string;
  deliveryDate: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  clientName: string;
  type: 'Lançamento' | 'Inbound' | 'Outbound' | 'Branding' | 'Perpétuo' | 'Tráfego Direto';
  channel: 'Multi-Canal' | 'Meta Ads' | 'Google Ads' | 'Email + CRM' | 'Orgânico / SEO' | 'TikTok Ads';
  budget: number;
  spent: number;
  revenue: number;
  leadsGoal: number;
  leadsGenerated: number;
  status: 'Planejamento' | 'Ativa' | 'Em Otimização' | 'Pausada' | 'Concluída';
  startDate: string;
  endDate?: string;
  responsible: string;
  notes?: string;
}

export interface MarketingEditorialItem {
  id: string;
  title: string;
  clientName: string;
  channel: 'Instagram' | 'LinkedIn' | 'Blog / SEO' | 'YouTube' | 'TikTok' | 'Email Newsletter';
  contentType: 'Carrossel' | 'Reels / Shorts' | 'Artigo Longo' | 'Vídeo VSL' | 'Post Estático' | 'Infográfico';
  persona: string;
  funnelStage: 'Topo (Atração)' | 'Meio (Nutrição)' | 'Fundo (Conversão)';
  status: 'Ideia' | 'Em Redação' | 'Design / Revisão' | 'Agendado' | 'Publicado';
  publishDate: string;
  author: string;
  copyOutline?: string;
}

export interface MarketingFunnel {
  id: string;
  name: string;
  clientName: string;
  trafficSource: string;
  visitors: number;
  leads: number;
  mqls: number;
  sqls: number;
  sales: number;
  averageTicket: number;
  status: 'Ativo' | 'Testando' | 'Pausado';
  createdAt: string;
}

export interface MarketingEmailFlow {
  id: string;
  name: string;
  clientName: string;
  triggerEvent: string;
  stepsCount: number;
  subscribersCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  status: 'Ativo' | 'Rascunho' | 'Pausado';
  createdAt: string;
}

export interface MarketingCopyScript {
  id: string;
  title: string;
  clientName: string;
  category: 'Gancho / Hook' | 'Headline Matadora' | 'Script de VSL' | 'Email de Vendas' | 'Anúncio Meta' | 'Página de Captura';
  targetAudience: string;
  hookText: string;
  bodyText: string;
  ctaText: string;
  rating?: number;
  createdAt: string;
}

export interface AppState {
  activeView: ViewType;
  organization: OrganizationState;
  kpiPeriods: KPIPeriod[];
  transactions: CashTransaction[];
  campaigns: AdCampaign[];
  leads: CRMLead[];
  tasks: KanbanTask[];
  stockItems: StockItem[];
  events: AgendaEvent[];
  socialPosts: SocialPost[];
  designProjects?: DesignProject[];
  designFolders?: DesignFolder[];
  designBriefings?: DesignBriefingDemand[];
  designPackages?: DesignPackage[];
  designComments?: DesignComment[];
  marketingCampaigns?: MarketingCampaign[];
  marketingEditorials?: MarketingEditorialItem[];
  marketingFunnels?: MarketingFunnel[];
  marketingEmailFlows?: MarketingEmailFlow[];
  marketingCopies?: MarketingCopyScript[];
}
