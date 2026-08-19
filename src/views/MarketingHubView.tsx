import React, { useState, useMemo } from 'react';
import {
  Target,
  Megaphone,
  Calendar,
  Layers,
  Mail,
  FileText,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  MarketingCampaign,
  MarketingEditorialItem,
  MarketingFunnel,
  MarketingEmailFlow,
  MarketingCopyScript,
  ViewType,
} from '../types';
import { FirestoreUserProfile } from '../lib/firebase';

interface MarketingHubViewProps {
  userProfile?: FirestoreUserProfile | null;
  marketingCampaigns?: MarketingCampaign[];
  marketingEditorials?: MarketingEditorialItem[];
  marketingFunnels?: MarketingFunnel[];
  marketingEmailFlows?: MarketingEmailFlow[];
  marketingCopies?: MarketingCopyScript[];
  onAddCampaign?: (campaign: Omit<MarketingCampaign, 'id'>) => Promise<void>;
  onDeleteCampaign?: (id: string) => Promise<void>;
  onAddEditorial?: (item: Omit<MarketingEditorialItem, 'id'>) => Promise<void>;
  onDeleteEditorial?: (id: string) => Promise<void>;
  onAddFunnel?: (funnel: Omit<MarketingFunnel, 'id'>) => Promise<void>;
  onDeleteFunnel?: (id: string) => Promise<void>;
  onAddEmailFlow?: (flow: Omit<MarketingEmailFlow, 'id'>) => Promise<void>;
  onDeleteEmailFlow?: (id: string) => Promise<void>;
  onAddCopyScript?: (copy: Omit<MarketingCopyScript, 'id'>) => Promise<void>;
  onDeleteCopyScript?: (id: string) => Promise<void>;
  onClearAllMarketingData?: () => Promise<void>;
  onNavigate?: (view: ViewType) => void;
}

// Initial mock data if empty
const DEFAULT_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'mkt-c1',
    title: 'Lançamento Mentorias Q3 2026',
    clientName: 'Techify Agência',
    type: 'Lançamento',
    channel: 'Multi-Canal',
    budget: 15000,
    spent: 8400,
    revenue: 49800,
    leadsGoal: 1200,
    leadsGenerated: 940,
    status: 'Ativa',
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    responsible: 'Marcos Henrique',
    notes: 'Campanha focada em captação para webinar de fechamento high-ticket.',
  },
  {
    id: 'mkt-c2',
    title: 'Captação Inbound B2B Empresas',
    clientName: 'Techify Agência',
    type: 'Inbound',
    channel: 'Meta Ads',
    budget: 8000,
    spent: 3200,
    revenue: 18500,
    leadsGoal: 400,
    leadsGenerated: 315,
    status: 'Em Otimização',
    startDate: '2026-08-10',
    responsible: 'Lucas Tráfego',
    notes: 'Anúncios diretos no feed e carrossel de dores comuns de empresários.',
  },
];

const DEFAULT_EDITORIALS: MarketingEditorialItem[] = [
  {
    id: 'mkt-e1',
    title: 'Como Reduzir o CAC da sua Agência em 40% em 30 Dias',
    clientName: 'Techify Agência',
    channel: 'LinkedIn',
    contentType: 'Artigo Longo',
    persona: 'Donos de Agência e Gestores de Tráfego',
    funnelStage: 'Topo (Atração)',
    status: 'Agendado',
    publishDate: '2026-08-22',
    author: 'Marcos Henrique',
    copyOutline: 'Análise de métricas, erros na qualificação de leads e automações de CRM.',
  },
  {
    id: 'mkt-e2',
    title: 'Carrossel: Os 5 Erros que Quebram o ROAS no Meta Ads',
    clientName: 'Techify Agência',
    channel: 'Instagram',
    contentType: 'Carrossel',
    persona: 'Empreendedores Digitais',
    funnelStage: 'Meio (Nutrição)',
    status: 'Publicado',
    publishDate: '2026-08-18',
    author: 'Vitória Designer',
    copyOutline: 'Design minimalista corporativo com chamada final para auditoria gratuita.',
  },
];

const DEFAULT_FUNNELS: MarketingFunnel[] = [
  {
    id: 'mkt-f1',
    name: 'Funil Principal de Aquisição AgencyOS',
    clientName: 'Techify Agência',
    trafficSource: 'Meta Ads + Google Search',
    visitors: 12400,
    leads: 1860,
    mqls: 620,
    sqls: 180,
    sales: 42,
    averageTicket: 1997,
    status: 'Ativo',
    createdAt: '2026-08-01',
  },
];

const DEFAULT_EMAIL_FLOWS: MarketingEmailFlow[] = [
  {
    id: 'mkt-ef1',
    name: 'Sequência Boas-Vindas & Onboarding 14 Dias',
    clientName: 'Techify Agência',
    triggerEvent: 'Cadastro no Trial do AgencyOS',
    stepsCount: 7,
    subscribersCount: 1420,
    openRate: 48.6,
    clickRate: 18.2,
    conversionRate: 8.4,
    status: 'Ativo',
    createdAt: '2026-08-05',
  },
  {
    id: 'mkt-ef2',
    name: 'Nutrição para Leads Inbound Perdidos',
    clientName: 'Techify Agência',
    triggerEvent: 'Lead sem contato há mais de 15 dias',
    stepsCount: 4,
    subscribersCount: 680,
    openRate: 34.2,
    clickRate: 9.8,
    conversionRate: 4.1,
    status: 'Ativo',
    createdAt: '2026-08-12',
  },
];

const DEFAULT_COPIES: MarketingCopyScript[] = [
  {
    id: 'mkt-cp1',
    title: 'Gancho Anti-Desperdício de Tráfego',
    clientName: 'Geral Agência',
    category: 'Gancho / Hook',
    targetAudience: 'Empresários investindo mais de R$ 5k/mês em anúncios',
    hookText: 'Se o seu gestor de tráfego ainda te entrega cliques em vez de reuniões qualificadas na agenda, você está queimando caixa.',
    bodyText: 'Apresente o contraste entre métricas de vaidade e faturamento real no caixa da empresa.',
    ctaText: 'Clique no link abaixo e solicite uma auditoria gratuita de funil.',
    rating: 5,
    createdAt: '2026-08-10',
  },
  {
    id: 'mkt-cp2',
    title: 'Headline de Alta Conversão B2B',
    clientName: 'Techify Agência',
    category: 'Headline Matadora',
    targetAudience: 'Diretores Comerciais e CEOs',
    hookText: 'A plataforma definitiva para gerir finanças, campanhas e equipe da sua agência sem planilhas confusas.',
    bodyText: 'Centralize contratos, fluxo de caixa, aprovação de criativos e metas em um único painel corporativo.',
    ctaText: 'Iniciar teste de 14 dias sem compromisso.',
    rating: 5,
    createdAt: '2026-08-14',
  },
];

export const MarketingHubView: React.FC<MarketingHubViewProps> = ({
  marketingCampaigns,
  marketingEditorials,
  marketingFunnels,
  marketingEmailFlows,
  marketingCopies,
  onAddCampaign,
  onDeleteCampaign,
  onAddEditorial,
  onDeleteEditorial,
  onAddFunnel,
  onDeleteFunnel,
  onAddEmailFlow,
  onDeleteEmailFlow,
  onAddCopyScript,
  onDeleteCopyScript,
  onClearAllMarketingData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'campanhas' | 'editorial' | 'funis' | 'emails' | 'copywriting'
  >('campanhas');

  // Local state fallbacks if no backend handler or empty
  const [campaignsList, setCampaignsList] = useState<MarketingCampaign[]>(
    marketingCampaigns && marketingCampaigns.length > 0 ? marketingCampaigns : DEFAULT_CAMPAIGNS
  );
  const [editorialsList, setEditorialsList] = useState<MarketingEditorialItem[]>(
    marketingEditorials && marketingEditorials.length > 0 ? marketingEditorials : DEFAULT_EDITORIALS
  );
  const [funnelsList, setFunnelsList] = useState<MarketingFunnel[]>(
    marketingFunnels && marketingFunnels.length > 0 ? marketingFunnels : DEFAULT_FUNNELS
  );
  const [emailFlowsList, setEmailFlowsList] = useState<MarketingEmailFlow[]>(
    marketingEmailFlows && marketingEmailFlows.length > 0 ? marketingEmailFlows : DEFAULT_EMAIL_FLOWS
  );
  const [copiesList, setCopiesList] = useState<MarketingCopyScript[]>(
    marketingCopies && marketingCopies.length > 0 ? marketingCopies : DEFAULT_COPIES
  );

  // Synchronize when props update
  React.useEffect(() => {
    if (marketingCampaigns && marketingCampaigns.length > 0) setCampaignsList(marketingCampaigns);
  }, [marketingCampaigns]);

  React.useEffect(() => {
    if (marketingEditorials && marketingEditorials.length > 0) setEditorialsList(marketingEditorials);
  }, [marketingEditorials]);

  React.useEffect(() => {
    if (marketingFunnels && marketingFunnels.length > 0) setFunnelsList(marketingFunnels);
  }, [marketingFunnels]);

  React.useEffect(() => {
    if (marketingEmailFlows && marketingEmailFlows.length > 0) setEmailFlowsList(marketingEmailFlows);
  }, [marketingEmailFlows]);

  React.useEffect(() => {
    if (marketingCopies && marketingCopies.length > 0) setCopiesList(marketingCopies);
  }, [marketingCopies]);

  // Modals state
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isNewEditorialModalOpen, setIsNewEditorialModalOpen] = useState(false);
  const [isNewFunnelModalOpen, setIsNewFunnelModalOpen] = useState(false);
  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
  const [isNewCopyModalOpen, setIsNewCopyModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Generic item to delete modal
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'campanha' | 'editorial' | 'funil' | 'email' | 'copy';
    id: string;
    title: string;
  } | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Aggregated KPIs
  const stats = useMemo(() => {
    const totalBudget = campaignsList.reduce((acc, c) => acc + (c.budget || 0), 0);
    const totalSpent = campaignsList.reduce((acc, c) => acc + (c.spent || 0), 0);
    const totalRevenue = campaignsList.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const totalLeads = campaignsList.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
    const globalROAS = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : '0.00';
    const averageCPL = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : '0.00';

    return {
      totalBudget,
      totalSpent,
      totalRevenue,
      totalLeads,
      globalROAS,
      averageCPL,
      activeCampaigns: campaignsList.filter((c) => c.status === 'Ativa').length,
      scheduledEditorials: editorialsList.filter((e) => e.status === 'Agendado' || e.status === 'Em Redação').length,
    };
  }, [campaignsList, editorialsList]);

  // Form states for modals
  const [newCampaign, setNewCampaign] = useState<Omit<MarketingCampaign, 'id'>>({
    title: '',
    clientName: '',
    type: 'Inbound',
    channel: 'Meta Ads',
    budget: 5000,
    spent: 0,
    revenue: 0,
    leadsGoal: 200,
    leadsGenerated: 0,
    status: 'Planejamento',
    startDate: new Date().toISOString().split('T')[0],
    responsible: 'Gestor de Marketing',
    notes: '',
  });

  const [newEditorial, setNewEditorial] = useState<Omit<MarketingEditorialItem, 'id'>>({
    title: '',
    clientName: '',
    channel: 'Instagram',
    contentType: 'Carrossel',
    persona: 'Cliente Ideal',
    funnelStage: 'Topo (Atração)',
    status: 'Em Redação',
    publishDate: new Date().toISOString().split('T')[0],
    author: 'Equipe de Marketing',
    copyOutline: '',
  });

  const [newFunnel, setNewFunnel] = useState<Omit<MarketingFunnel, 'id'>>({
    name: '',
    clientName: '',
    trafficSource: 'Meta Ads',
    visitors: 5000,
    leads: 500,
    mqls: 150,
    sqls: 50,
    sales: 10,
    averageTicket: 1500,
    status: 'Ativo',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const [newEmailFlow, setNewEmailFlow] = useState<Omit<MarketingEmailFlow, 'id'>>({
    name: '',
    clientName: '',
    triggerEvent: 'Novo Lead Cadastrado',
    stepsCount: 5,
    subscribersCount: 0,
    openRate: 40,
    clickRate: 15,
    conversionRate: 5,
    status: 'Ativo',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const [newCopy, setNewCopy] = useState<Omit<MarketingCopyScript, 'id'>>({
    title: '',
    clientName: '',
    category: 'Gancho / Hook',
    targetAudience: 'Público Alvo',
    hookText: '',
    bodyText: '',
    ctaText: '',
    rating: 5,
    createdAt: new Date().toISOString().split('T')[0],
  });

  // Handlers for creating items
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title.trim()) return;
    try {
      if (onAddCampaign) {
        await onAddCampaign(newCampaign);
      } else {
        setCampaignsList((prev) => [{ ...newCampaign, id: `mkt-c-${Date.now()}` }, ...prev]);
      }
      setIsNewCampaignModalOpen(false);
      showToast('Campanha de marketing criada com sucesso!');
      setNewCampaign({
        title: '',
        clientName: '',
        type: 'Inbound',
        channel: 'Meta Ads',
        budget: 5000,
        spent: 0,
        revenue: 0,
        leadsGoal: 200,
        leadsGenerated: 0,
        status: 'Planejamento',
        startDate: new Date().toISOString().split('T')[0],
        responsible: 'Gestor de Marketing',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar campanha.');
    }
  };

  const handleSaveEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditorial.title.trim()) return;
    try {
      if (onAddEditorial) {
        await onAddEditorial(newEditorial);
      } else {
        setEditorialsList((prev) => [{ ...newEditorial, id: `mkt-e-${Date.now()}` }, ...prev]);
      }
      setIsNewEditorialModalOpen(false);
      showToast('Conteúdo editorial cadastrado!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar editorial.');
    }
  };

  const handleSaveFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunnel.name.trim()) return;
    try {
      if (onAddFunnel) {
        await onAddFunnel(newFunnel);
      } else {
        setFunnelsList((prev) => [{ ...newFunnel, id: `mkt-f-${Date.now()}` }, ...prev]);
      }
      setIsNewFunnelModalOpen(false);
      showToast('Funil de marketing estruturado!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar funil.');
    }
  };

  const handleSaveEmailFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailFlow.name.trim()) return;
    try {
      if (onAddEmailFlow) {
        await onAddEmailFlow(newEmailFlow);
      } else {
        setEmailFlowsList((prev) => [{ ...newEmailFlow, id: `mkt-ef-${Date.now()}` }, ...prev]);
      }
      setIsNewEmailModalOpen(false);
      showToast('Fluxo de automação salvo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar fluxo de e-mail.');
    }
  };

  const handleSaveCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCopy.title.trim() || !newCopy.hookText.trim()) return;
    try {
      if (onAddCopyScript) {
        await onAddCopyScript(newCopy);
      } else {
        setCopiesList((prev) => [{ ...newCopy, id: `mkt-cp-${Date.now()}` }, ...prev]);
      }
      setIsNewCopyModalOpen(false);
      showToast('Copy / Roteiro adicionado ao acervo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar copy.');
    }
  };

  // Execution of Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'campanha') {
        if (onDeleteCampaign) await onDeleteCampaign(itemToDelete.id);
        setCampaignsList((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'editorial') {
        if (onDeleteEditorial) await onDeleteEditorial(itemToDelete.id);
        setEditorialsList((prev) => prev.filter((e) => e.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'funil') {
        if (onDeleteFunnel) await onDeleteFunnel(itemToDelete.id);
        setFunnelsList((prev) => prev.filter((f) => f.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'email') {
        if (onDeleteEmailFlow) await onDeleteEmailFlow(itemToDelete.id);
        setEmailFlowsList((prev) => prev.filter((ef) => ef.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'copy') {
        if (onDeleteCopyScript) await onDeleteCopyScript(itemToDelete.id);
        setCopiesList((prev) => prev.filter((cp) => cp.id !== itemToDelete.id));
      }
      showToast(`Item "${itemToDelete.title}" excluído com sucesso.`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir item.');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleClearAll = async () => {
    try {
      if (onClearAllMarketingData) {
        await onClearAllMarketingData();
      }
      setCampaignsList([]);
      setEditorialsList([]);
      setFunnelsList([]);
      setEmailFlowsList([]);
      setCopiesList([]);
      setIsClearAllModalOpen(false);
      showToast('Todos os dados de marketing foram zerados com sucesso.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao limpar dados de marketing.');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 font-sans text-gray-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d1f14] border border-[#22c55e] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Corporate Header */}
      <div className="bg-[#0b0d14] border border-[#171b29] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#132219] text-[#22c55e] border border-[#22c55e]/30">
                Marketing & Aquisição
              </span>
              <span className="text-xs text-gray-500 font-mono">Hub Estratégico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-[#22c55e]" />
              Gestão de Marketing & Lançamentos
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Planejamento de campanhas, funis de conversão, calendário editorial, automações de e-mail e acervo de copywriting de alta conversão.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (activeTab === 'campanhas') setIsNewCampaignModalOpen(true);
                else if (activeTab === 'editorial') setIsNewEditorialModalOpen(true);
                else if (activeTab === 'funis') setIsNewFunnelModalOpen(true);
                else if (activeTab === 'emails') setIsNewEmailModalOpen(true);
                else if (activeTab === 'copywriting') setIsNewCopyModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-[#1eb054] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'campanhas' && 'Nova Campanha'}
                {activeTab === 'editorial' && 'Novo Conteúdo'}
                {activeTab === 'funis' && 'Novo Funil'}
                {activeTab === 'emails' && 'Nova Automação'}
                {activeTab === 'copywriting' && 'Novo Script / Copy'}
              </span>
            </button>

            <button
              onClick={() => setIsClearAllModalOpen(true)}
              title="Zerar dados de demonstração"
              className="px-3.5 py-2.5 rounded-xl bg-[#121520] hover:bg-[#1a1f30] border border-[#22283a] text-gray-400 hover:text-red-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Painel</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-[#171b29]">
          {/* Leads Gerados */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Leads Totais</span>
              <Users className="w-3.5 h-3.5 text-[#22c55e]" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {stats.totalLeads.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Captação global</div>
          </div>

          {/* CPL Médio */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>CPL Médio</span>
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              R$ {stats.averageCPL}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Custo por Lead</div>
          </div>

          {/* Orçamento Alocado */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Investimento</span>
              <BarChart3 className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              R$ {stats.totalSpent.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">de R$ {stats.totalBudget.toLocaleString('pt-BR')}</div>
          </div>

          {/* Faturamento Gerado */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Receita</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#22c55e]" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-[#22c55e] font-mono">
              R$ {stats.totalRevenue.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Retorno atribuído</div>
          </div>

          {/* ROAS Global */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>ROAS Geral</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
              {stats.globalROAS}x
            </div>
            <div className="text-[10px] text-gray-500 font-medium">Retorno s/ Invest.</div>
          </div>

          {/* Campanhas Ativas */}
          <div className="p-3.5 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Campanhas</span>
              <Megaphone className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {stats.activeCampaigns} <span className="text-xs text-gray-500 font-normal">ativas</span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium">{stats.scheduledEditorials} editoriais</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-[#171b29]">
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'campanhas'
              ? 'bg-[#121520] text-white border-b-2 border-[#22c55e]'
              : 'text-gray-400 hover:text-white hover:bg-[#0c0e14]'
          }`}
        >
          <Megaphone className="w-4 h-4 text-[#22c55e]" />
          <span>Campanhas & Lançamentos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1a2030] text-gray-300 font-mono">
            {campaignsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'editorial'
              ? 'bg-[#121520] text-white border-b-2 border-[#22c55e]'
              : 'text-gray-400 hover:text-white hover:bg-[#0c0e14]'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Calendário Editorial</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1a2030] text-gray-300 font-mono">
            {editorialsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('funis')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'funis'
              ? 'bg-[#121520] text-white border-b-2 border-[#22c55e]'
              : 'text-gray-400 hover:text-white hover:bg-[#0c0e14]'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Funis de Conversão</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1a2030] text-gray-300 font-mono">
            {funnelsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'emails'
              ? 'bg-[#121520] text-white border-b-2 border-[#22c55e]'
              : 'text-gray-400 hover:text-white hover:bg-[#0c0e14]'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-400" />
          <span>E-mails & Automações</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1a2030] text-gray-300 font-mono">
            {emailFlowsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copywriting')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'copywriting'
              ? 'bg-[#121520] text-white border-b-2 border-[#22c55e]'
              : 'text-gray-400 hover:text-white hover:bg-[#0c0e14]'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Copywriting & Scripts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1a2030] text-gray-300 font-mono">
            {copiesList.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Campanhas & Lançamentos */}
      {activeTab === 'campanhas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar campanha por nome ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0f17] border border-[#1c2233] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
              />
            </div>
            <button
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="px-4 py-2 bg-[#121724] hover:bg-[#1a2033] border border-[#22283a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#22c55e]" />
              <span>Adicionar Campanha</span>
            </button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignsList
              .filter(
                (c) =>
                  c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((camp) => {
                const leadProgress = camp.leadsGoal > 0 ? Math.min(100, Math.round((camp.leadsGenerated / camp.leadsGoal) * 100)) : 0;
                const spendProgress = camp.budget > 0 ? Math.min(100, Math.round((camp.spent / camp.budget) * 100)) : 0;
                const roas = camp.spent > 0 ? (camp.revenue / camp.spent).toFixed(2) : '0.00';

                return (
                  <div
                    key={camp.id}
                    className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] hover:border-[#262e42] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#131926] text-gray-300 border border-[#202738]">
                              {camp.type}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 font-mono">
                              {camp.channel}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                            {camp.title}
                          </h3>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Cliente: <span className="text-gray-200 font-semibold">{camp.clientName || 'Interno'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              camp.status === 'Ativa'
                                ? 'bg-[#122818] text-[#22c55e] border border-[#22c55e]/30'
                                : camp.status === 'Em Otimização'
                                ? 'bg-[#292212] text-amber-400 border border-amber-500/30'
                                : 'bg-[#151822] text-gray-400 border border-[#22283a]'
                            }`}
                          >
                            {camp.status}
                          </span>
                          <button
                            onClick={() =>
                              setItemToDelete({
                                type: 'campanha',
                                id: camp.id,
                                title: camp.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Apagar Campanha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {camp.notes && (
                        <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed bg-[#10131d] p-2.5 rounded-xl border border-[#1a1f2e]">
                          {camp.notes}
                        </p>
                      )}
                    </div>

                    {/* Progress Bars and Metrics */}
                    <div className="space-y-3 pt-3 border-t border-[#161a25]">
                      {/* Leads Goal Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Meta de Leads</span>
                          <span className="font-bold text-white font-mono">
                            {camp.leadsGenerated} / {camp.leadsGoal} ({leadProgress}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#141824] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#22c55e] rounded-full transition-all"
                            style={{ width: `${leadProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial Footprint */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133]">
                          <div className="text-[10px] text-gray-500">Investido</div>
                          <div className="text-xs font-bold text-gray-200 font-mono">
                            R$ {camp.spent.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133]">
                          <div className="text-[10px] text-gray-500">Receita</div>
                          <div className="text-xs font-bold text-[#22c55e] font-mono">
                            R$ {camp.revenue.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133]">
                          <div className="text-[10px] text-gray-500">ROAS</div>
                          <div className="text-xs font-bold text-amber-400 font-mono">
                            {roas}x
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {campaignsList.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-3">
                <Megaphone className="w-10 h-10 text-gray-600 mx-auto" />
                <div className="text-sm font-bold text-gray-300">Nenhuma campanha cadastrada</div>
                <p className="text-xs text-gray-500">Clique em "+ Nova Campanha" para começar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Calendário Editorial */}
      {activeTab === 'editorial' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Planejamento editorial de conteúdos por canais, personas e etapas do funil.
            </div>
            <button
              onClick={() => setIsNewEditorialModalOpen(true)}
              className="px-4 py-2 bg-[#121724] hover:bg-[#1a2033] border border-[#22283a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#22c55e]" />
              <span>Novo Conteúdo</span>
            </button>
          </div>

          {/* Editorial Table */}
          <div className="rounded-2xl bg-[#0c0e16] border border-[#161a25] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#161a25] bg-[#0f121d] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Título / Conteúdo</th>
                    <th className="p-4">Canal & Formato</th>
                    <th className="p-4">Etapa do Funil</th>
                    <th className="p-4">Persona</th>
                    <th className="p-4">Data Publicação</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161a25]">
                  {editorialsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#11141f] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{item.title}</div>
                        <div className="text-[10px] text-gray-400">
                          {item.clientName || 'Techify Agência'} • Resp: {item.author}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-200">{item.channel}</span>
                        <div className="text-[10px] text-gray-500">{item.contentType}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.funnelStage.includes('Topo')
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-800/40'
                              : item.funnelStage.includes('Meio')
                              ? 'bg-purple-950/50 text-purple-400 border border-purple-800/40'
                              : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {item.funnelStage}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-xs">{item.persona}</td>
                      <td className="p-4 font-mono text-gray-300">{item.publishDate}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Publicado'
                              ? 'bg-[#122818] text-[#22c55e]'
                              : item.status === 'Agendado'
                              ? 'bg-[#1b233a] text-blue-400'
                              : 'bg-[#292212] text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: 'editorial',
                              id: item.id,
                              title: item.title,
                            })
                          }
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Apagar Conteúdo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {editorialsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Nenhum item editorial planejado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Funis de Conversão */}
      {activeTab === 'funis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Mapeamento de conversão em cada etapa (Visitantes → Leads → MQLs → SQLs → Vendas).
            </div>
            <button
              onClick={() => setIsNewFunnelModalOpen(true)}
              className="px-4 py-2 bg-[#121724] hover:bg-[#1a2033] border border-[#22283a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#22c55e]" />
              <span>Novo Funil</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {funnelsList.map((funnel) => {
              const leadRate = funnel.visitors > 0 ? ((funnel.leads / funnel.visitors) * 100).toFixed(1) : '0';
              const mqlRate = funnel.leads > 0 ? ((funnel.mqls / funnel.leads) * 100).toFixed(1) : '0';
              const sqlRate = funnel.mqls > 0 ? ((funnel.sqls / funnel.mqls) * 100).toFixed(1) : '0';
              const salesRate = funnel.sqls > 0 ? ((funnel.sales / funnel.sqls) * 100).toFixed(1) : '0';
              const totalEstRevenue = funnel.sales * funnel.averageTicket;

              return (
                <div
                  key={funnel.id}
                  className="p-6 rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#132219] text-[#22c55e] border border-[#22c55e]/30">
                          {funnel.status}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{funnel.trafficSource}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{funnel.name}</h3>
                      <div className="text-xs text-gray-400">Cliente: {funnel.clientName || 'Techify Agência'}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-medium">Receita Estimada</div>
                        <div className="text-base font-extrabold text-[#22c55e] font-mono">
                          R$ {totalEstRevenue.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: 'funil',
                            id: funnel.id,
                            title: funnel.name,
                          })
                        }
                        className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Apagar Funil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Funnel Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                    {/* Step 1: Visitantes */}
                    <div className="p-4 rounded-xl bg-[#0f121d] border border-[#1c2234] text-center space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">1. Visitantes</div>
                      <div className="text-lg font-extrabold text-white font-mono">{funnel.visitors.toLocaleString('pt-BR')}</div>
                      <div className="text-[10px] text-gray-500">100% Tráfego</div>
                    </div>

                    {/* Step 2: Leads */}
                    <div className="p-4 rounded-xl bg-[#0f121d] border border-[#1c2234] text-center space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2. Leads (Topo)</div>
                      <div className="text-lg font-extrabold text-white font-mono">{funnel.leads.toLocaleString('pt-BR')}</div>
                      <div className="text-[10px] text-[#22c55e] font-bold">{leadRate}% conv.</div>
                    </div>

                    {/* Step 3: MQLs */}
                    <div className="p-4 rounded-xl bg-[#0f121d] border border-[#1c2234] text-center space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">3. MQLs (Meio)</div>
                      <div className="text-lg font-extrabold text-white font-mono">{funnel.mqls.toLocaleString('pt-BR')}</div>
                      <div className="text-[10px] text-blue-400 font-bold">{mqlRate}% conv.</div>
                    </div>

                    {/* Step 4: SQLs */}
                    <div className="p-4 rounded-xl bg-[#0f121d] border border-[#1c2234] text-center space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">4. SQLs (Fundo)</div>
                      <div className="text-lg font-extrabold text-white font-mono">{funnel.sqls.toLocaleString('pt-BR')}</div>
                      <div className="text-[10px] text-purple-400 font-bold">{sqlRate}% conv.</div>
                    </div>

                    {/* Step 5: Vendas */}
                    <div className="p-4 rounded-xl bg-[#122818] border border-[#22c55e]/40 text-center space-y-1">
                      <div className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">5. Vendas</div>
                      <div className="text-lg font-extrabold text-[#22c55e] font-mono">{funnel.sales.toLocaleString('pt-BR')}</div>
                      <div className="text-[10px] text-white font-bold">{salesRate}% fechamento</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {funnelsList.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-3">
                <Layers className="w-10 h-10 text-gray-600 mx-auto" />
                <div className="text-sm font-bold text-gray-300">Nenhum funil de marketing ativo</div>
                <p className="text-xs text-gray-500">Clique em "+ Novo Funil" para projetar sua esteira de conversão.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: E-mails & Automações */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Fluxos de nutrição, disparos automáticos e métricas de engajamento de e-mail marketing.
            </div>
            <button
              onClick={() => setIsNewEmailModalOpen(true)}
              className="px-4 py-2 bg-[#121724] hover:bg-[#1a2033] border border-[#22283a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#22c55e]" />
              <span>Nova Automação</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailFlowsList.map((flow) => (
              <div
                key={flow.id}
                className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] hover:border-[#262e42] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#131926] text-gray-300 border border-[#202738]">
                        {flow.status}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                        {flow.name}
                      </h3>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Gatilho: <span className="text-gray-300 font-medium">{flow.triggerEvent}</span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'email',
                          id: flow.id,
                          title: flow.name,
                        })
                      }
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Apagar Automação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#161a25]">
                  <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133] text-center">
                    <div className="text-[9px] text-gray-500">Etapas</div>
                    <div className="text-xs font-bold text-white font-mono">{flow.stepsCount} e-mails</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133] text-center">
                    <div className="text-[9px] text-gray-500">Abertura</div>
                    <div className="text-xs font-bold text-[#22c55e] font-mono">{flow.openRate}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133] text-center">
                    <div className="text-[9px] text-gray-500">Cliques</div>
                    <div className="text-xs font-bold text-blue-400 font-mono">{flow.clickRate}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0f121d] border border-[#1b2133] text-center">
                    <div className="text-[9px] text-gray-500">Conversão</div>
                    <div className="text-xs font-bold text-amber-400 font-mono">{flow.conversionRate}%</div>
                  </div>
                </div>
              </div>
            ))}

            {emailFlowsList.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-3">
                <Mail className="w-10 h-10 text-gray-600 mx-auto" />
                <div className="text-sm font-bold text-gray-300">Nenhum fluxo de e-mail cadastrado</div>
                <p className="text-xs text-gray-500">Clique em "+ Nova Automação" para começar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Copywriting & Scripts */}
      {activeTab === 'copywriting' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Acervo de copies de alta conversão, ganchos de retenção, roteiros de VSL e headlines.
            </div>
            <button
              onClick={() => setIsNewCopyModalOpen(true)}
              className="px-4 py-2 bg-[#22c55e] text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-[#1eb054] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Script / Copy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {copiesList.map((cp) => (
              <div
                key={cp.id}
                className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] hover:border-[#262e42] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#132219] text-[#22c55e] border border-[#22c55e]/30">
                        {cp.category}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                        {cp.title}
                      </h3>
                      <div className="text-[11px] text-gray-400">
                        Público: <span className="text-gray-300 font-medium">{cp.targetAudience}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyText(cp.id, `${cp.hookText}\n\n${cp.bodyText}\n\n${cp.ctaText}`)}
                        className="p-2 rounded-xl bg-[#121724] hover:bg-[#1a2033] border border-[#22283a] text-gray-300 hover:text-white transition-colors cursor-pointer"
                        title="Copiar texto completo"
                      >
                        {copiedId === cp.id ? (
                          <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: 'copy',
                            id: cp.id,
                            title: cp.title,
                          })
                        }
                        className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Apagar Script"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hook Quote Box */}
                  <div className="mt-3 p-3 rounded-xl bg-[#101420] border border-[#1b2336] space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                      Gancho / Hook:
                    </div>
                    <p className="text-xs text-gray-200 font-medium italic leading-relaxed">
                      "{cp.hookText}"
                    </p>
                  </div>

                  {cp.bodyText && (
                    <div className="mt-2.5 text-xs text-gray-400 leading-relaxed">
                      <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">Corpo do Script:</span>
                      {cp.bodyText}
                    </div>
                  )}
                </div>

                {cp.ctaText && (
                  <div className="pt-3 border-t border-[#161a25] flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">CTA Principal:</span>
                    <span className="text-[#22c55e] font-bold text-right">{cp.ctaText}</span>
                  </div>
                )}
              </div>
            ))}

            {copiesList.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-3">
                <FileText className="w-10 h-10 text-gray-600 mx-auto" />
                <div className="text-sm font-bold text-gray-300">Nenhum script ou copy no acervo</div>
                <p className="text-xs text-gray-500">Clique em "+ Novo Script / Copy" para cadastrar ganchos de alta conversão.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Nova Campanha */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#22c55e]" />
                Nova Campanha de Marketing
              </h3>
              <button
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título da Campanha *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Captação Lançamento Black Friday 2026"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Cliente / Conta</label>
                  <input
                    type="text"
                    placeholder="Ex: Techify Agência"
                    value={newCampaign.clientName}
                    onChange={(e) => setNewCampaign({ ...newCampaign, clientName: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Tipo de Estratégia</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Inbound">Inbound Marketing</option>
                    <option value="Lançamento">Lançamento / Evento</option>
                    <option value="Perpétuo">Perpétuo / Funil Automático</option>
                    <option value="Outbound">Outbound / Prospecção</option>
                    <option value="Branding">Branding & Autoridade</option>
                    <option value="Tráfego Direto">Tráfego Direto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Canal Principal</label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Multi-Canal">Multi-Canal</option>
                    <option value="Meta Ads">Meta Ads (Instagram/FB)</option>
                    <option value="Google Ads">Google Ads (Search/YouTube)</option>
                    <option value="Email + CRM">Email + CRM</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Orgânico / SEO">Orgânico / SEO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Orçamento Total (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Meta de Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaign.leadsGoal}
                    onChange={(e) => setNewCampaign({ ...newCampaign, leadsGoal: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Responsável</label>
                  <input
                    type="text"
                    value={newCampaign.responsible}
                    onChange={(e) => setNewCampaign({ ...newCampaign, responsible: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Notas Estratégicas</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos principais, oferta, público alvo e detalhes de entrega..."
                  value={newCampaign.notes}
                  onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo Conteúdo Editorial */}
      {isNewEditorialModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Novo Item Editorial
              </h3>
              <button
                onClick={() => setIsNewEditorialModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditorial} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título do Conteúdo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5 Passos para Estruturar um Funil de Vendas de Alta Conversão"
                  value={newEditorial.title}
                  onChange={(e) => setNewEditorial({ ...newEditorial, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Canal de Publicação</label>
                  <select
                    value={newEditorial.channel}
                    onChange={(e) => setNewEditorial({ ...newEditorial, channel: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Blog / SEO">Blog / SEO</option>
                    <option value="Email Newsletter">Email Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Formato</label>
                  <select
                    value={newEditorial.contentType}
                    onChange={(e) => setNewEditorial({ ...newEditorial, contentType: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels / Shorts">Reels / Shorts</option>
                    <option value="Artigo Longo">Artigo Longo</option>
                    <option value="Vídeo VSL">Vídeo VSL</option>
                    <option value="Post Estático">Post Estático</option>
                    <option value="Infográfico">Infográfico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Etapa do Funil</label>
                  <select
                    value={newEditorial.funnelStage}
                    onChange={(e) => setNewEditorial({ ...newEditorial, funnelStage: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Topo (Atração)">Topo (Atração)</option>
                    <option value="Meio (Nutrição)">Meio (Nutrição)</option>
                    <option value="Fundo (Conversão)">Fundo (Conversão)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={newEditorial.publishDate}
                    onChange={(e) => setNewEditorial({ ...newEditorial, publishDate: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Persona Alvo</label>
                <input
                  type="text"
                  placeholder="Ex: Donos de Agência, Médicos, Advogados..."
                  value={newEditorial.persona}
                  onChange={(e) => setNewEditorial({ ...newEditorial, persona: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={() => setIsNewEditorialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Conteúdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo Funil */}
      {isNewFunnelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Estruturar Funil de Marketing
              </h3>
              <button
                onClick={() => setIsNewFunnelModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFunnel} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Funil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Funil High Ticket Consultoria Empresarial"
                  value={newFunnel.name}
                  onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Fonte de Tráfego</label>
                  <input
                    type="text"
                    placeholder="Ex: Meta Ads + Google Ads"
                    value={newFunnel.trafficSource}
                    onChange={(e) => setNewFunnel({ ...newFunnel, trafficSource: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Ticket Médio (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.averageTicket}
                    onChange={(e) => setNewFunnel({ ...newFunnel, averageTicket: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.visitors}
                    onChange={(e) => setNewFunnel({ ...newFunnel, visitors: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Leads (Topo)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.leads}
                    onChange={(e) => setNewFunnel({ ...newFunnel, leads: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">MQLs (Meio)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.mqls}
                    onChange={(e) => setNewFunnel({ ...newFunnel, mqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">SQLs / Oportunidades</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.sqls}
                    onChange={(e) => setNewFunnel({ ...newFunnel, sqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Vendas Concluídas</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.sales}
                    onChange={(e) => setNewFunnel({ ...newFunnel, sales: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={() => setIsNewFunnelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nova Automação de E-mail */}
      {isNewEmailModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Nova Automação de E-mail
              </h3>
              <button
                onClick={() => setIsNewEmailModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmailFlow} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Fluxo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sequência de Reengajamento para Leads Frios"
                  value={newEmailFlow.name}
                  onChange={(e) => setNewEmailFlow({ ...newEmailFlow, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Gatilho de Disparo</label>
                <input
                  type="text"
                  placeholder="Ex: Lead baixou E-book ou Solicitou Orçamento"
                  value={newEmailFlow.triggerEvent}
                  onChange={(e) => setNewEmailFlow({ ...newEmailFlow, triggerEvent: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Qtd. de E-mails / Passos</label>
                  <input
                    type="number"
                    min="1"
                    value={newEmailFlow.stepsCount}
                    onChange={(e) => setNewEmailFlow({ ...newEmailFlow, stepsCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Status</label>
                  <select
                    value={newEmailFlow.status}
                    onChange={(e) => setNewEmailFlow({ ...newEmailFlow, status: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={() => setIsNewEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo Script / Copy */}
      {isNewCopyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Cadastrar Novo Script / Copywriting
              </h3>
              <button
                onClick={() => setIsNewCopyModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCopy} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título do Script *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gancho de Quebra de Padrão para Clínicas"
                  value={newCopy.title}
                  onChange={(e) => setNewCopy({ ...newCopy, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Categoria de Copy</label>
                  <select
                    value={newCopy.category}
                    onChange={(e) => setNewCopy({ ...newCopy, category: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Gancho / Hook">Gancho / Hook</option>
                    <option value="Headline Matadora">Headline Matadora</option>
                    <option value="Script de VSL">Script de VSL</option>
                    <option value="Email de Vendas">Email de Vendas</option>
                    <option value="Anúncio Meta">Anúncio Meta</option>
                    <option value="Página de Captura">Página de Captura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Público / Nicho Alvo</label>
                  <input
                    type="text"
                    placeholder="Ex: E-commerce, B2B, Infoproduto"
                    value={newCopy.targetAudience}
                    onChange={(e) => setNewCopy({ ...newCopy, targetAudience: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Gancho Inicial (Hook) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="A frase ou primeiros 3 segundos que capturam 100% da atenção..."
                  value={newCopy.hookText}
                  onChange={(e) => setNewCopy({ ...newCopy, hookText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Desenvolvimento / Argumentação</label>
                <textarea
                  rows={3}
                  placeholder="Problema, agitação, mecanismo único e quebra de objeções..."
                  value={newCopy.bodyText}
                  onChange={(e) => setNewCopy({ ...newCopy, bodyText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  placeholder="Ex: Clique no botão abaixo e fale com nosso consultor no WhatsApp."
                  value={newCopy.ctaText}
                  onChange={(e) => setNewCopy({ ...newCopy, ctaText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={() => setIsNewCopyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Excluir Item */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-red-900/40 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Confirmar Exclusão</h3>
              <p className="text-xs text-gray-400 mt-1">
                Deseja realmente apagar o item <span className="text-white font-bold">"{itemToDelete.title}"</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1c2233] text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Apagar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Limpar Todos os Dados de Marketing */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-red-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Limpar Todo o Painel de Marketing</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Esta ação apagará todas as campanhas, itens editoriais, funis, fluxos de e-mail e copies de marketing da sua base, deixando a esteira 100% zerada e limpa.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1c2233] text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
