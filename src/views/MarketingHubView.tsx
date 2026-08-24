import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Megaphone,
  Calendar,
  Layers,
  Mail,
  FileText,
  Plus,
  RotateCcw,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  BarChart3,
  Calculator,
  BookOpen,
  HelpCircle,
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
import { CampaignsTab } from '../components/marketing/CampaignsTab';
import { EditorialTab } from '../components/marketing/EditorialTab';
import { FunnelsTab } from '../components/marketing/FunnelsTab';
import { EmailsTab } from '../components/marketing/EmailsTab';
import { CopywritingTab } from '../components/marketing/CopywritingTab';
import { MarketingToolsTab } from '../components/marketing/MarketingToolsTab';
import { MarketingModals } from '../components/marketing/MarketingModals';
import { MarketingGuideModal } from '../components/marketing/MarketingGuideModal';

const GUIDE_STORAGE_KEY = 'agencyos_mkt_guide_seen_v1';

interface MarketingHubViewProps {
  userProfile?: FirestoreUserProfile | null;
  marketingCampaigns?: MarketingCampaign[];
  marketingEditorials?: MarketingEditorialItem[];
  marketingFunnels?: MarketingFunnel[];
  marketingEmailFlows?: MarketingEmailFlow[];
  marketingCopies?: MarketingCopyScript[];
  onAddCampaign?: (campaign: Omit<MarketingCampaign, 'id'>) => Promise<void>;
  onUpdateCampaign?: (id: string, campaign: Partial<MarketingCampaign>) => Promise<void>;
  onDeleteCampaign?: (id: string) => Promise<void>;
  onAddEditorial?: (item: Omit<MarketingEditorialItem, 'id'>) => Promise<void>;
  onUpdateEditorial?: (id: string, item: Partial<MarketingEditorialItem>) => Promise<void>;
  onDeleteEditorial?: (id: string) => Promise<void>;
  onAddFunnel?: (funnel: Omit<MarketingFunnel, 'id'>) => Promise<void>;
  onUpdateFunnel?: (id: string, funnel: Partial<MarketingFunnel>) => Promise<void>;
  onDeleteFunnel?: (id: string) => Promise<void>;
  onAddEmailFlow?: (flow: Omit<MarketingEmailFlow, 'id'>) => Promise<void>;
  onUpdateEmailFlow?: (id: string, flow: Partial<MarketingEmailFlow>) => Promise<void>;
  onDeleteEmailFlow?: (id: string) => Promise<void>;
  onAddCopyScript?: (copy: Omit<MarketingCopyScript, 'id'>) => Promise<void>;
  onUpdateCopyScript?: (id: string, copy: Partial<MarketingCopyScript>) => Promise<void>;
  onDeleteCopyScript?: (id: string) => Promise<void>;
  onClearAllMarketingData?: () => Promise<void>;
  onNavigate?: (view: ViewType) => void;
}

export const MarketingHubView: React.FC<MarketingHubViewProps> = ({
  userProfile,
  marketingCampaigns = [],
  marketingEditorials = [],
  marketingFunnels = [],
  marketingEmailFlows = [],
  marketingCopies = [],
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onAddEditorial,
  onUpdateEditorial,
  onDeleteEditorial,
  onAddFunnel,
  onUpdateFunnel,
  onDeleteFunnel,
  onAddEmailFlow,
  onUpdateEmailFlow,
  onDeleteEmailFlow,
  onAddCopyScript,
  onUpdateCopyScript,
  onDeleteCopyScript,
  onClearAllMarketingData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'campanhas' | 'editorial' | 'funis' | 'emails' | 'copywriting' | 'ferramentas'
  >('campanhas');

  // Clean local state initialized strictly with empty arrays or props
  const [campaignsList, setCampaignsList] = useState<MarketingCampaign[]>(marketingCampaigns || []);
  const [editorialsList, setEditorialsList] = useState<MarketingEditorialItem[]>(marketingEditorials || []);
  const [funnelsList, setFunnelsList] = useState<MarketingFunnel[]>(marketingFunnels || []);
  const [emailFlowsList, setEmailFlowsList] = useState<MarketingEmailFlow[]>(marketingEmailFlows || []);
  const [copiesList, setCopiesList] = useState<MarketingCopyScript[]>(marketingCopies || []);

  // Sync with Firestore props
  useEffect(() => {
    setCampaignsList(marketingCampaigns || []);
  }, [marketingCampaigns]);

  useEffect(() => {
    setEditorialsList(marketingEditorials || []);
  }, [marketingEditorials]);

  useEffect(() => {
    setFunnelsList(marketingFunnels || []);
  }, [marketingFunnels]);

  useEffect(() => {
    setEmailFlowsList(marketingEmailFlows || []);
  }, [marketingEmailFlows]);

  useEffect(() => {
    setCopiesList(marketingCopies || []);
  }, [marketingCopies]);

  // Onboarding Guide State (Auto-opens once)
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
      if (!hasSeenGuide) {
        setIsGuideOpen(true);
        localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, []);

  const handleOpenGuide = () => {
    setIsGuideOpen(true);
  };

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
  };

  // Modal open states
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  const [isNewEditorialModalOpen, setIsNewEditorialModalOpen] = useState(false);
  const [editingEditorial, setEditingEditorial] = useState<MarketingEditorialItem | null>(null);

  const [isNewFunnelModalOpen, setIsNewFunnelModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<MarketingFunnel | null>(null);

  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
  const [editingEmailFlow, setEditingEmailFlow] = useState<MarketingEmailFlow | null>(null);

  const [isNewCopyModalOpen, setIsNewCopyModalOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<MarketingCopyScript | null>(null);

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<{
    type: 'campanha' | 'editorial' | 'funil' | 'email' | 'copy';
    id: string;
    title: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Form states for creation
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
    responsible: userProfile?.name || 'Gestor de Marketing',
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
    author: userProfile?.name || 'Equipe de Marketing',
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

  // KPI Calculations
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
      scheduledEditorials: editorialsList.filter(
        (e) => e.status === 'Agendado' || e.status === 'Em Redação'
      ).length,
    };
  }, [campaignsList, editorialsList]);

  // Handlers for Save (Create)
  const handleSaveNewCampaign = async (e: React.FormEvent) => {
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
        responsible: userProfile?.name || 'Gestor de Marketing',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar campanha.');
    }
  };

  const handleSaveEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      if (onUpdateCampaign) {
        await onUpdateCampaign(editingCampaign.id, editingCampaign);
      }
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === editingCampaign.id ? editingCampaign : c))
      );
      setEditingCampaign(null);
      showToast('Campanha de marketing atualizada e salva!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar campanha.');
    }
  };

  const handleQuickCampaignStatus = async (
    id: string,
    newStatus: MarketingCampaign['status']
  ) => {
    try {
      if (onUpdateCampaign) {
        await onUpdateCampaign(id, { status: newStatus });
      }
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      showToast(`Status da campanha alterado para ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNewEditorial = async (e: React.FormEvent) => {
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

  const handleSaveEditEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEditorial) return;
    try {
      if (onUpdateEditorial) {
        await onUpdateEditorial(editingEditorial.id, editingEditorial);
      }
      setEditorialsList((prev) =>
        prev.map((item) => (item.id === editingEditorial.id ? editingEditorial : item))
      );
      setEditingEditorial(null);
      showToast('Conteúdo editorial atualizado e salvo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar editorial.');
    }
  };

  const handleQuickEditorialStatus = async (
    id: string,
    newStatus: MarketingEditorialItem['status']
  ) => {
    try {
      if (onUpdateEditorial) {
        await onUpdateEditorial(id, { status: newStatus });
      }
      setEditorialsList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Status do conteúdo alterado para ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNewFunnel = async (e: React.FormEvent) => {
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

  const handleSaveEditFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFunnel) return;
    try {
      if (onUpdateFunnel) {
        await onUpdateFunnel(editingFunnel.id, editingFunnel);
      }
      setFunnelsList((prev) =>
        prev.map((f) => (f.id === editingFunnel.id ? editingFunnel : f))
      );
      setEditingFunnel(null);
      showToast('Funil de conversão atualizado e salvo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar funil.');
    }
  };

  const handleSaveNewEmailFlow = async (e: React.FormEvent) => {
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
      showToast('Erro ao salvar fluxo.');
    }
  };

  const handleSaveEditEmailFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmailFlow) return;
    try {
      if (onUpdateEmailFlow) {
        await onUpdateEmailFlow(editingEmailFlow.id, editingEmailFlow);
      }
      setEmailFlowsList((prev) =>
        prev.map((ef) => (ef.id === editingEmailFlow.id ? editingEmailFlow : ef))
      );
      setEditingEmailFlow(null);
      showToast('Fluxo de automação atualizado e salvo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar fluxo de e-mail.');
    }
  };

  const handleSaveNewCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCopy.title.trim() || !newCopy.hookText.trim()) return;
    try {
      if (onAddCopyScript) {
        await onAddCopyScript(newCopy);
      } else {
        setCopiesList((prev) => [{ ...newCopy, id: `mkt-cp-${Date.now()}` }, ...prev]);
      }
      setIsNewCopyModalOpen(false);
      showToast('Script adicionado ao acervo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar script.');
    }
  };

  const handleSaveEditCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCopy) return;
    try {
      if (onUpdateCopyScript) {
        await onUpdateCopyScript(editingCopy.id, editingCopy);
      }
      setCopiesList((prev) =>
        prev.map((cp) => (cp.id === editingCopy.id ? editingCopy : cp))
      );
      setEditingCopy(null);
      showToast('Script / Copywriting atualizado e salvo!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar script.');
    }
  };

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
      showToast(`"${itemToDelete.title}" excluído com sucesso.`);
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
      showToast('Erro ao limpar dados.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 font-sans text-neutral-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e0e] border border-neutral-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Corporate Header */}
      <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-neutral-300 border border-neutral-700">
                Marketing & Aquisição
              </span>
              <span className="text-xs text-neutral-500 font-mono">Hub Estratégico & Lançamentos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-white" />
              Gestão de Marketing & Lançamentos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Planejamento de campanhas, funis de conversão, calendário editorial, automações de e-mail e acervo de copywriting de alta conversão.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Guide Button */}
            <button
              onClick={handleOpenGuide}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Abrir Guia e Manual Completo de Uso"
            >
              <BookOpen className="w-4 h-4 text-neutral-300" />
              <span>Guia & Dicas</span>
            </button>

            {/* Clear Data Button */}
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              title="Zerar todos os dados do módulo"
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Painel</span>
            </button>

            {/* Create Button */}
            <button
              onClick={() => {
                if (activeTab === 'campanhas') setIsNewCampaignModalOpen(true);
                else if (activeTab === 'editorial') setIsNewEditorialModalOpen(true);
                else if (activeTab === 'funis') setIsNewFunnelModalOpen(true);
                else if (activeTab === 'emails') setIsNewEmailModalOpen(true);
                else if (activeTab === 'copywriting') setIsNewCopyModalOpen(true);
                else setActiveTab('campanhas');
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>
                {activeTab === 'campanhas' && 'Nova Campanha'}
                {activeTab === 'editorial' && 'Novo Conteúdo'}
                {activeTab === 'funis' && 'Novo Funil'}
                {activeTab === 'emails' && 'Nova Automação'}
                {activeTab === 'copywriting' && 'Novo Script'}
                {activeTab === 'ferramentas' && 'Nova Campanha'}
              </span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-neutral-800/80">
          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>Leads Totais</span>
              <Users className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {stats.totalLeads.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">Captação global</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>CPL Médio</span>
              <DollarSign className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              R$ {stats.averageCPL}
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">Custo por Lead</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>Investimento</span>
              <BarChart3 className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              R$ {stats.totalSpent.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">
              de R$ {stats.totalBudget.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>Receita</span>
              <TrendingUp className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              R$ {stats.totalRevenue.toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">Retorno atribuído</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>ROAS Geral</span>
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {stats.globalROAS}x
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">Retorno s/ Invest.</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-bold">
              <span>Campanhas</span>
              <Megaphone className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {stats.activeCampaigns} <span className="text-xs text-neutral-500 font-normal">ativas</span>
            </div>
            <div className="text-[10px] text-neutral-500 font-normal">
              {stats.scheduledEditorials} editoriais
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'campanhas'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Megaphone className="w-4 h-4 text-white" />
          <span>Campanhas & Lançamentos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            {campaignsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'editorial'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>Calendário Editorial</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            {editorialsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('funis')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'funis'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Layers className="w-4 h-4 text-white" />
          <span>Funis de Conversão</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            {funnelsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'emails'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Mail className="w-4 h-4 text-white" />
          <span>E-mails & Automações</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            {emailFlowsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copywriting')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'copywriting'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <FileText className="w-4 h-4 text-white" />
          <span>Copywriting & Scripts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
            {copiesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ferramentas')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'ferramentas'
              ? 'bg-[#0e0e0e] text-white border-b-2 border-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Calculator className="w-4 h-4 text-white" />
          <span>Simulador & IA Generator</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'campanhas' && (
        <CampaignsTab
          campaigns={campaignsList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenNewModal={() => setIsNewCampaignModalOpen(true)}
          onEditCampaign={(camp) => setEditingCampaign(camp)}
          onDeleteCampaign={(camp) =>
            setItemToDelete({ type: 'campanha', id: camp.id, title: camp.title })
          }
          onQuickStatusChange={handleQuickCampaignStatus}
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {activeTab === 'editorial' && (
        <EditorialTab
          editorials={editorialsList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenNewModal={() => setIsNewEditorialModalOpen(true)}
          onEditEditorial={(item) => setEditingEditorial(item)}
          onDeleteEditorial={(item) =>
            setItemToDelete({ type: 'editorial', id: item.id, title: item.title })
          }
          onQuickStatusChange={handleQuickEditorialStatus}
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {activeTab === 'funis' && (
        <FunnelsTab
          funnels={funnelsList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenNewModal={() => setIsNewFunnelModalOpen(true)}
          onEditFunnel={(funnel) => setEditingFunnel(funnel)}
          onDeleteFunnel={(funnel) =>
            setItemToDelete({ type: 'funil', id: funnel.id, title: funnel.name })
          }
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {activeTab === 'emails' && (
        <EmailsTab
          emailFlows={emailFlowsList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenNewModal={() => setIsNewEmailModalOpen(true)}
          onEditEmailFlow={(flow) => setEditingEmailFlow(flow)}
          onDeleteEmailFlow={(flow) =>
            setItemToDelete({ type: 'email', id: flow.id, title: flow.name })
          }
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {activeTab === 'copywriting' && (
        <CopywritingTab
          copies={copiesList}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenNewModal={() => setIsNewCopyModalOpen(true)}
          onEditCopy={(copy) => setEditingCopy(copy)}
          onDeleteCopy={(copy) =>
            setItemToDelete({ type: 'copy', id: copy.id, title: copy.title })
          }
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {activeTab === 'ferramentas' && (
        <MarketingToolsTab
          onAddCopyScript={onAddCopyScript}
          showToast={showToast}
          onOpenFullGuide={handleOpenGuide}
        />
      )}

      {/* Shared Modals */}
      <MarketingModals
        isNewCampaignModalOpen={isNewCampaignModalOpen}
        onCloseNewCampaignModal={() => setIsNewCampaignModalOpen(false)}
        newCampaign={newCampaign}
        onNewCampaignChange={setNewCampaign}
        onSaveNewCampaign={handleSaveNewCampaign}
        editingCampaign={editingCampaign}
        onCloseEditCampaignModal={() => setEditingCampaign(null)}
        onEditingCampaignChange={setEditingCampaign}
        onSaveEditCampaign={handleSaveEditCampaign}
        isNewEditorialModalOpen={isNewEditorialModalOpen}
        onCloseNewEditorialModal={() => setIsNewEditorialModalOpen(false)}
        newEditorial={newEditorial}
        onNewEditorialChange={setNewEditorial}
        onSaveNewEditorial={handleSaveNewEditorial}
        editingEditorial={editingEditorial}
        onCloseEditEditorialModal={() => setEditingEditorial(null)}
        onEditingEditorialChange={setEditingEditorial}
        onSaveEditEditorial={handleSaveEditEditorial}
        isNewFunnelModalOpen={isNewFunnelModalOpen}
        onCloseNewFunnelModal={() => setIsNewFunnelModalOpen(false)}
        newFunnel={newFunnel}
        onNewFunnelChange={setNewFunnel}
        onSaveNewFunnel={handleSaveNewFunnel}
        editingFunnel={editingFunnel}
        onCloseEditFunnelModal={() => setEditingFunnel(null)}
        onEditingFunnelChange={setEditingFunnel}
        onSaveEditFunnel={handleSaveEditFunnel}
        isNewEmailModalOpen={isNewEmailModalOpen}
        onCloseNewEmailModal={() => setIsNewEmailModalOpen(false)}
        newEmailFlow={newEmailFlow}
        onNewEmailFlowChange={setNewEmailFlow}
        onSaveNewEmailFlow={handleSaveNewEmailFlow}
        editingEmailFlow={editingEmailFlow}
        onCloseEditEmailModal={() => setEditingEmailFlow(null)}
        onEditingEmailFlowChange={setEditingEmailFlow}
        onSaveEditEmailFlow={handleSaveEditEmailFlow}
        isNewCopyModalOpen={isNewCopyModalOpen}
        onCloseNewCopyModal={() => setIsNewCopyModalOpen(false)}
        newCopy={newCopy}
        onNewCopyChange={setNewCopy}
        onSaveNewCopy={handleSaveNewCopy}
        editingCopy={editingCopy}
        onCloseEditCopyModal={() => setEditingCopy(null)}
        onEditingCopyChange={setEditingCopy}
        onSaveEditCopy={handleSaveEditCopy}
        itemToDelete={itemToDelete}
        onCloseDeleteModal={() => setItemToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isClearAllModalOpen={isClearAllModalOpen}
        onCloseClearAllModal={() => setIsClearAllModalOpen(false)}
        onConfirmClearAll={handleClearAll}
      />

      {/* Interactive Onboarding Guide Modal */}
      <MarketingGuideModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          handleCloseGuide();
        }}
      />
    </div>
  );
};
