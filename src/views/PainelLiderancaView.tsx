import React, { useState, useMemo } from 'react';
import {
  Crown,
  Target,
  MapPin,
  TrendingUp,
  Megaphone,
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  Share2,
  FileText,
  Mail,
  Zap,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  CheckSquare,
  AlertCircle,
  BarChart3,
  Layers,
  ChevronRight,
  Filter,
  Eye,
  Award,
  Flame,
} from 'lucide-react';
import {
  AdCampaign,
  CRMLead,
  AgendaEvent,
  SocialPost,
  DesignProject,
  MarketingCampaign,
  MarketingEditorialItem,
  MarketingFunnel,
  MarketingEmailFlow,
  MarketingCopyScript,
  TimeClockRecord,
  LeadershipGoal,
  LeadershipNotice,
  ViewType,
} from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import {
  isMarketingLeader,
  isProspectingLeader,
  isDesignLeader,
  isUserMasterAdmin,
} from '../lib/permissions';

interface PainelLiderancaViewProps {
  userProfile?: FirestoreUserProfile | null;
  campaigns?: AdCampaign[];
  leads?: CRMLead[];
  events?: AgendaEvent[];
  socialPosts?: SocialPost[];
  designProjects?: DesignProject[];
  marketingCampaigns?: MarketingCampaign[];
  marketingEditorials?: MarketingEditorialItem[];
  marketingFunnels?: MarketingFunnel[];
  marketingEmailFlows?: MarketingEmailFlow[];
  marketingCopies?: MarketingCopyScript[];
  timeClockRecords?: TimeClockRecord[];
  leadershipGoals?: LeadershipGoal[];
  leadershipNotices?: LeadershipNotice[];
  onAddGoal?: (goal: Partial<LeadershipGoal>) => Promise<void>;
  onUpdateGoal?: (id: string, goal: Partial<LeadershipGoal>) => Promise<void>;
  onDeleteGoal?: (id: string) => Promise<void>;
  onAddNotice?: (notice: Partial<LeadershipNotice>) => Promise<void>;
  onDeleteNotice?: (id: string) => Promise<void>;
  onNavigate?: (view: ViewType) => void;
  onOpenPunchModal?: () => void;
}

export const PainelLiderancaView: React.FC<PainelLiderancaViewProps> = ({
  userProfile,
  campaigns = [],
  leads = [],
  events = [],
  socialPosts = [],
  designProjects = [],
  marketingCampaigns = [],
  marketingEditorials = [],
  marketingFunnels = [],
  marketingEmailFlows = [],
  marketingCopies = [],
  timeClockRecords = [],
  leadershipGoals = [],
  leadershipNotices = [],
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddNotice,
  onDeleteNotice,
  onNavigate = (_view?: ViewType) => {},
  onOpenPunchModal = () => {},
}) => {
  // Determine user leadership profile
  const isMaster = isUserMasterAdmin(userProfile);
  const isMkt = isMarketingLeader(userProfile);
  const isPros = isProspectingLeader(userProfile);
  const isDes = isDesignLeader(userProfile);

  // Default active tab based on designated role
  const initialMode = useMemo(() => {
    if (isPros && !isMkt && !isMaster) return 'prospeccao';
    if (isDes && !isMkt && !isMaster && !isPros) return 'design';
    if (isMkt && !isPros && !isMaster) return 'marketing';
    return 'marketing'; // Default for general leader or master
  }, [isMkt, isPros, isDes, isMaster]);

  const [activeLeaderTab, setActiveLeaderTab] = useState<'marketing' | 'prospeccao' | 'design' | 'ponto' | 'metas'>(initialMode);
  
  // Modals state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);

  // New Goal Form
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetRole: (isPros ? 'lider_prospeccao' : isMkt ? 'lider_marketing' : 'todos') as LeadershipGoal['targetRole'],
    metricType: 'leads' as LeadershipGoal['metricType'],
    targetValue: 100,
    currentValue: 0,
    unit: 'unidades',
    period: 'Agosto 2026',
    dueDate: '2026-08-31',
  });

  // New Notice Form
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetAudience: 'todos' as LeadershipNotice['targetAudience'],
    priority: 'normal' as LeadershipNotice['priority'],
  });

  // ==========================================
  // MARKETING METRICS CALCULATIONS
  // ==========================================
  const mktMetrics = useMemo(() => {
    // Traffic Campaigns metrics
    const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0) +
      marketingCampaigns.reduce((acc, c) => acc + (c.spent || 0), 0);

    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0) +
      marketingCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);

    const roasAverage = totalSpent > 0 ? totalRevenue / totalSpent : 4.2;

    const totalCampaignLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0) +
      marketingCampaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);

    const totalFunnelLeads = marketingFunnels.reduce((acc, f) => acc + (f.leads || 0), 0);
    const totalMarketingLeads = totalCampaignLeads + totalFunnelLeads;

    const cplAverage = totalMarketingLeads > 0 && totalSpent > 0 ? totalSpent / totalMarketingLeads : 12.5;

    const activeCampaignsCount = campaigns.filter((c) => c.status === 'Ativo').length +
      marketingCampaigns.filter((c) => c.status === 'Ativa' || c.status === 'Em Otimização').length;

    const scheduledPostsCount = socialPosts.filter((p) => p.status === 'Agendado').length +
      marketingEditorials.filter((e) => e.status === 'Agendado').length;

    const activeEmailFlowsCount = marketingEmailFlows.filter((ef) => ef.status === 'Ativo').length;
    const copiesCount = marketingCopies.length;

    return {
      totalSpent,
      totalRevenue,
      roasAverage,
      totalMarketingLeads,
      cplAverage,
      activeCampaignsCount,
      scheduledPostsCount,
      activeEmailFlowsCount,
      copiesCount,
    };
  }, [campaigns, marketingCampaigns, marketingFunnels, socialPosts, marketingEditorials, marketingEmailFlows, marketingCopies]);

  // ==========================================
  // PROSPECTING & SALES METRICS CALCULATIONS
  // ==========================================
  const prosMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const contactedLeads = leads.filter((l) => l.status === 'Contactado' || l.status === 'Em Negociação' || l.status === 'Cliente Fechado').length;
    const inNegotiationLeads = leads.filter((l) => l.status === 'Em Negociação').length;
    const closedLeads = leads.filter((l) => l.status === 'Cliente Fechado').length;

    const totalPipelineValue = leads
      .filter((l) => l.status === 'Em Negociação' || l.status === 'Cliente Fechado')
      .reduce((acc, l) => acc + (l.contractValue || l.value || 3500), 0);

    const closedRevenue = leads
      .filter((l) => l.status === 'Cliente Fechado')
      .reduce((acc, l) => acc + (l.contractValue || l.value || 3500), 0);

    const scheduledMeetingsCount = events.filter((e) => e.type === 'Fechamento' || e.type === 'Prospecção' || e.type === 'Alinhamento').length;

    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 8.4;
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 62.5;

    return {
      totalLeads,
      contactedLeads,
      inNegotiationLeads,
      closedLeads,
      totalPipelineValue,
      closedRevenue,
      scheduledMeetingsCount,
      conversionRate,
      contactRate,
    };
  }, [leads, events]);

  // ==========================================
  // TIME CLOCK / TEAM ATTENDANCE METRICS
  // ==========================================
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPunchRecords = timeClockRecords.filter((r) => r.date === todayStr);

  const teamMembersPunchedToday = useMemo(() => {
    const map = new Map<string, TimeClockRecord[]>();
    todayPunchRecords.forEach((r) => {
      const email = r.userEmail || 'desconhecido';
      if (!map.has(email)) map.set(email, []);
      map.get(email)!.push(r);
    });
    return Array.from(map.entries()).map(([email, records]) => {
      const latest = records[records.length - 1];
      const hasEntry = records.some((r) => r.type === 'entry');
      const hasExit = records.some((r) => r.type === 'exit');
      const hasLunch = records.some((r) => r.type === 'lunch_start') && !records.some((r) => r.type === 'lunch_end');

      let statusLabel = '🟢 Trabalhando';
      let statusClass = 'bg-emerald-950 text-emerald-300 border-emerald-800';

      if (hasExit) {
        statusLabel = '🔴 Saída Realizada';
        statusClass = 'bg-blue-950 text-blue-300 border-blue-800';
      } else if (hasLunch) {
        statusLabel = '☕ Em Intervalo (Almoço)';
        statusClass = 'bg-amber-950 text-amber-300 border-amber-800';
      } else if (!hasEntry) {
        statusLabel = '⚪ Pendente';
        statusClass = 'bg-neutral-800 text-neutral-400 border-neutral-700';
      }

      return {
        email,
        name: latest.userName || email.split('@')[0],
        role: latest.userRole || 'Colaborador',
        recordsCount: records.length,
        firstPunch: records.find((r) => r.type === 'entry')?.time || '--:--',
        latestPunch: latest.time,
        statusLabel,
        statusClass,
        latestLocation: latest.location,
      };
    });
  }, [todayPunchRecords]);

  // Handle submit new Goal
  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    if (onAddGoal) {
      await onAddGoal({
        ...newGoal,
        id: `goal-${Date.now()}`,
        status: 'em_andamento',
        updatedAt: new Date().toISOString(),
      });
    }

    setShowAddGoalModal(false);
    setNewGoal({
      title: '',
      targetRole: (isPros ? 'lider_prospeccao' : isMkt ? 'lider_marketing' : 'todos'),
      metricType: 'leads',
      targetValue: 100,
      currentValue: 0,
      unit: 'unidades',
      period: 'Agosto 2026',
      dueDate: '2026-08-31',
    });
  };

  // Handle submit new Notice
  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;

    if (onAddNotice) {
      await onAddNotice({
        ...newNotice,
        id: `notice-${Date.now()}`,
        authorName: userProfile?.name || 'Liderança',
        authorRole: userProfile?.role || 'Líder',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setShowAddNoticeModal(false);
    setNewNotice({
      title: '',
      content: '',
      targetAudience: 'todos',
      priority: 'normal',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Leadership Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-xl shrink-0">
            <Crown className="w-8 h-8 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Painel de Comando da Liderança
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-black">
                {isMaster
                  ? '👑 Master Admin'
                  : isMkt
                  ? '🎯 Líder de Marketing'
                  : isPros
                  ? '📍 Líder de Prospecção'
                  : isDes
                  ? '🎨 Líder de Design'
                  : '👑 Gestão Executiva'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-900 border border-neutral-700 text-neutral-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                Dados Filtrados por Cargo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Visão estratégica consolidada, metas operacionais e controle em tempo real da equipe.
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenPunchModal}
            className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-white" />
            <span>Bater Ponto Seguro</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddGoalModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Definir Nova Meta</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddNoticeModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-white" />
            <span>Publicar Comunicado</span>
          </button>
        </div>
      </div>

      {/* Leadership Role / Module Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveLeaderTab('marketing')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLeaderTab === 'marketing'
              ? 'bg-white text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Comando de Marketing & Tráfego</span>
          {isMkt && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-black">Meu Setor</span>}
        </button>

        <button
          onClick={() => setActiveLeaderTab('prospeccao')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLeaderTab === 'prospeccao'
              ? 'bg-white text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Comando de Prospecção & Vendas</span>
          {isPros && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-black">Meu Setor</span>}
        </button>

        <button
          onClick={() => setActiveLeaderTab('design')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLeaderTab === 'design'
              ? 'bg-white text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Comando de Design & Criação</span>
          {isDes && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-black">Meu Setor</span>}
        </button>

        <button
          onClick={() => setActiveLeaderTab('ponto')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLeaderTab === 'ponto'
              ? 'bg-white text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Presença & Ponto da Equipe ({teamMembersPunchedToday.length} Hoje)</span>
        </button>

        <button
          onClick={() => setActiveLeaderTab('metas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeLeaderTab === 'metas'
              ? 'bg-white text-black shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Metas & Comunicados ({leadershipGoals.length + leadershipNotices.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 TAB 1: COMANDO DO LÍDER DE MARKETING                                   */}
      {/* ========================================================================= */}
      {activeLeaderTab === 'marketing' && (
        <div className="space-y-6">
          {/* Executive Marketing KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>ROAS Médio Consolidado</span>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {mktMetrics.roasAverage.toFixed(2)}x
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                <span>Receita: <strong className="text-white font-mono">R$ {mktMetrics.totalRevenue.toLocaleString('pt-BR')}</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Orçamento Investido</span>
                <DollarSign className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                R$ {mktMetrics.totalSpent.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Meta Ads, Google Ads & Lançamentos
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Leads de Marketing</span>
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {mktMetrics.totalMarketingLeads.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                CPL Médio: <strong className="text-white font-mono">R$ {mktMetrics.cplAverage.toFixed(2)}</strong>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Campanhas Ativas</span>
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {mktMetrics.activeCampaignsCount}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
                <span>{mktMetrics.scheduledPostsCount} posts agendados</span>
                <span>•</span>
                <span>{mktMetrics.activeEmailFlowsCount} fluxos e-mail</span>
              </div>
            </div>
          </div>

          {/* Detailed Marketing Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Active Acquisition Funnels */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-white" />
                  Funis de Aquisição Ativos ({marketingFunnels.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('marketing')}
                  className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  Ver Todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {marketingFunnels.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                  Nenhum funil cadastrado. Crie funis no módulo Marketing.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {marketingFunnels.slice(0, 4).map((f) => (
                    <div key={f.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{f.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                          {f.clientName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                        <div className="p-1.5 rounded-lg bg-neutral-900">
                          <div className="text-neutral-500 text-[9px] uppercase">Visitantes</div>
                          <div className="text-white font-bold">{f.visitors}</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-neutral-900">
                          <div className="text-neutral-500 text-[9px] uppercase">Leads</div>
                          <div className="text-white font-bold">{f.leads}</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-neutral-900">
                          <div className="text-neutral-500 text-[9px] uppercase">Vendas</div>
                          <div className="text-white font-black">{f.sales}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Ad Campaigns with ROAS */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-white" />
                  Campanhas de Tráfego ({campaigns.length + marketingCampaigns.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('campanhas')}
                  className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  Gerenciar <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {campaigns.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-300 font-bold">
                          {c.platform}
                        </span>
                        <span>Investido: <strong className="text-white font-mono">R$ {c.spent}</strong></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-white font-mono">{c.roas}x ROAS</div>
                      <div className="text-[10px] text-neutral-400">{c.leads} leads</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Scheduled Content & Copywriting Hub */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-white" />
                  Editorial & Redes Sociais
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('social-hub')}
                  className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  Social Hub <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {socialPosts.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{p.client}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white">
                        {p.scheduledDate} • {p.scheduledTime}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] line-clamp-2">
                      {p.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📍 TAB 2: COMANDO DO LÍDER DE PROSPECÇÃO & VENDAS                          */}
      {/* ========================================================================= */}
      {activeLeaderTab === 'prospeccao' && (
        <div className="space-y-6">
          {/* Executive Prospecting KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Leads Minerados (Maps)</span>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {prosMetrics.totalLeads}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {prosMetrics.contactedLeads} contactados ({prosMetrics.contactRate.toFixed(1)}%)
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Reuniões Agendadas</span>
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {prosMetrics.scheduledMeetingsCount}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Demonstrações & Fechamentos na Agenda
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Pipeline em Negociação</span>
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                R$ {prosMetrics.totalPipelineValue.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {prosMetrics.inNegotiationLeads} oportunidades ativas
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
                <span>Taxa de Fechamento</span>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {prosMetrics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {prosMetrics.closedLeads} clientes novos fechados
              </div>
            </div>
          </div>

          {/* CRM Prospecting Pipeline Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Leads by Stage / CRM */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  Oportunidades em Destaque no CRM ({leads.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('maps-scraper')}
                  className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  Abrir Maps Scraper <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {leads.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                  Nenhum lead minerado ainda. Utilize o Maps Scraper para extrair empresas locais.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {leads.slice(0, 6).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{lead.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300">
                            {lead.category || 'Empresa Local'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-3">
                          <span>📞 {lead.phone || 'Sem telefone'}</span>
                          <span>📍 {lead.address || 'Local'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                          lead.status === 'Cliente Fechado'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : lead.status === 'Em Negociação'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                        }`}>
                          {lead.status || 'Novo'}
                        </span>
                        <div className="font-mono font-black text-white text-xs">
                          R$ {lead.contractValue || lead.value || 3500}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Scheduled Closing Meetings */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white" />
                  Reuniões de Fechamento ({events.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('agenda')}
                  className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  Agenda <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {events.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                  Nenhuma reunião agendada na semana.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {events.slice(0, 5).map((evt) => (
                    <div key={evt.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{evt.title}</span>
                        <span className="text-[10px] font-mono text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {evt.time}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                        <span>Cliente: <strong className="text-neutral-300">{evt.client}</strong></span>
                        <span className="text-[10px] font-bold text-white">{evt.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎨 TAB 3: COMANDO DO LÍDER DE DESIGN & CRIAÇÃO                            */}
      {/* ========================================================================= */}
      {activeLeaderTab === 'design' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-400 text-xs font-bold mb-1">Total de Projetos Criativos</div>
              <div className="text-3xl font-black text-white">{designProjects.length}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Artes, vídeos e identidades visuais</div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-400 text-xs font-bold mb-1">Aprovados pela Líder</div>
              <div className="text-3xl font-black text-white">
                {designProjects.filter((p) => p.approved || p.status === 'aprovado').length}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Prontos para postagem e tráfego</div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-400 text-xs font-bold mb-1">Em Revisão / Ajustes</div>
              <div className="text-3xl font-black text-white">
                {designProjects.filter((p) => p.status === 'revisao' || p.status === 'ajustes').length}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Demandas pendentes da equipe</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">Projetos de Design na Esteira</span>
              <button
                type="button"
                onClick={() => onNavigate('designer')}
                className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                Abrir Área do Designer <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {designProjects.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                Nenhum projeto de design criado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {designProjects.slice(0, 6).map((proj) => (
                  <div key={proj.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate text-xs">{proj.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white">
                        {proj.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      <div>Cliente: <strong className="text-neutral-200">{proj.clientName}</strong></div>
                      <div>Responsável: <strong className="text-neutral-200">{proj.assignedTo}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👥 TAB 4: PRESENÇA & CONTROLE DE PONTO DA EQUIPE                          */}
      {/* ========================================================================= */}
      {activeLeaderTab === 'ponto' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  Painel de Presença em Tempo Real da Equipe
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                  Data: {todayStr}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Acompanhe quem está ativo na agência, horários de entrada e intervalos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('ponto')}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Espelho Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembersPunchedToday.length === 0 ? (
              <div className="col-span-full p-12 text-center text-neutral-500 text-xs rounded-3xl bg-neutral-900 border border-neutral-800">
                Nenhum colaborador bateu ponto hoje ainda.
              </div>
            ) : (
              teamMembersPunchedToday.map((member) => (
                <div
                  key={member.email}
                  className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs">{member.name}</div>
                        <div className="text-[10px] text-neutral-400">{member.role}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.statusClass}`}>
                      {member.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">1ª Entrada</div>
                      <div className="font-black text-white text-sm">{member.firstPunch}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500 uppercase font-bold">Último Registro</div>
                      <div className="font-black text-white text-sm">{member.latestPunch}</div>
                    </div>
                  </div>

                  {member.latestLocation && (
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span>GPS: {member.latestLocation.latitude.toFixed(3)}, {member.latestLocation.longitude.toFixed(3)}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 TAB 5: METAS OPERACIONAIS & COMUNICADOS DA LIDERANÇA                   */}
      {/* ========================================================================= */}
      {activeLeaderTab === 'metas' && (
        <div className="space-y-6">
          {/* Section: Operational Goals */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" />
                  Metas Estratégicas da Agência ({leadershipGoals.length})
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Acompanhamento de metas de leads, reuniões, faturamento e entregas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddGoalModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Meta</span>
              </button>
            </div>

            {leadershipGoals.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                Nenhuma meta cadastrada no momento. Clique em "Nova Meta" para estipular objetivos para o time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leadershipGoals.map((goal) => {
                  const progressPct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
                  return (
                    <div key={goal.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{goal.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                          {goal.period}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400">Progresso Atual:</span>
                          <span className="font-bold text-white">{goal.currentValue} / {goal.targetValue} {goal.unit} ({progressPct}%)</span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                          <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
                        <span>Prazo: {goal.dueDate}</span>
                        {onDeleteGoal && (
                          <button
                            type="button"
                            onClick={() => onDeleteGoal(goal.id)}
                            className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Leadership Notices */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-white" />
                  Mural de Avisos & Diretrizes da Liderança ({leadershipNotices.length})
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Comunicados internos visíveis para toda a equipe operacional.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddNoticeModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publicar Aviso</span>
              </button>
            </div>

            {leadershipNotices.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-950 border border-neutral-800">
                Nenhum comunicado publicado no mural.
              </div>
            ) : (
              <div className="space-y-3">
                {leadershipNotices.map((notice) => (
                  <div key={notice.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{notice.title}</span>
                        {notice.priority === 'alta' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Alta Prioridade
                          </span>
                        )}
                        {notice.priority === 'urgente' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-300 border border-red-800">
                            Urgente
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{notice.date}</span>
                    </div>

                    <p className="text-neutral-300 text-xs leading-relaxed">
                      {notice.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500 border-t border-neutral-900">
                      <span>Publicado por: <strong className="text-neutral-300">{notice.authorName}</strong> ({notice.authorRole})</span>
                      {onDeleteNotice && (
                        <button
                          type="button"
                          onClick={() => onDeleteNotice(notice.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Nova Meta */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-white" />
                Definir Nova Meta da Agência
              </span>
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Título da Meta:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atingir 200 leads qualificados no mês"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Setor / Liderança:</label>
                  <select
                    value={newGoal.targetRole}
                    onChange={(e) => setNewGoal({ ...newGoal, targetRole: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="todos">Toda a Agência</option>
                    <option value="lider_marketing">Marketing & Tráfego</option>
                    <option value="lider_prospeccao">Prospecção & Vendas</option>
                    <option value="lider_design">Design & Criativos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Tipo de Métrica:</label>
                  <select
                    value={newGoal.metricType}
                    onChange={(e) => setNewGoal({ ...newGoal, metricType: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="leads">Leads Gerados</option>
                    <option value="meetings">Reuniões Agendadas</option>
                    <option value="revenue">Faturamento (R$)</option>
                    <option value="roas">ROAS Médio</option>
                    <option value="posts">Posts Publicados</option>
                    <option value="designs">Artes Aprovadas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Valor Alvo:</label>
                  <input
                    type="number"
                    required
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Valor Atual:</label>
                  <input
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Unidade:</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Período:</label>
                  <input
                    type="text"
                    value={newGoal.period}
                    onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Data Limite:</label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-black hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publicar Comunicado */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-white" />
                Publicar Comunicado da Liderança
              </span>
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNotice} className="space-y-3.5">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Título do Comunicado:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alinhamento de Metas de Q3 e Nova Estratégia"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Destinatários:</label>
                  <select
                    value={newNotice.targetAudience}
                    onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="todos">Toda a Agência</option>
                    <option value="marketing">Equipe de Marketing</option>
                    <option value="prospeccao">Equipe de Prospecção / SDRs</option>
                    <option value="design">Equipe de Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Prioridade:</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Conteúdo da Mensagem:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva a mensagem ou diretriz da liderança para a equipe..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-black hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
