import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  Bell,
  Sparkles,
  Plus,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  Folder,
  BarChart3,
  Calendar,
  Clock,
  UserPlus,
  RefreshCw,
  X,
  Play,
  Pause,
  Trash2,
  Bot,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  ViewMode,
  KPIPeriod,
  CashTransaction,
  AdCampaign,
  CRMLead,
  StockItem,
  KanbanTask,
  ProspectionClosedContract,
} from '../types';
import { FirestoreUserProfile, resolveUserAvatar } from '../lib/firebase';

interface DashboardGeralViewProps {
  onNavigate?: (view: ViewMode) => void;
  kpiPeriods?: KPIPeriod[];
  transactions?: CashTransaction[];
  campaigns?: AdCampaign[];
  leads?: CRMLead[];
  stockItems?: StockItem[];
  tasks?: KanbanTask[];
  prospectionContracts?: ProspectionClosedContract[];
  userProfile?: FirestoreUserProfile | null;
  onAddTask?: (task: Partial<KanbanTask>) => Promise<any> | void;
  onUpdateTaskStatus?: (taskId: string, status: KanbanTask['status']) => Promise<any> | void;
  onDeleteTask?: (taskId: string) => Promise<any> | void;
  onAddTransaction?: (transaction: Partial<CashTransaction>) => Promise<any> | void;
  onDeleteTransaction?: (id: string) => Promise<any> | void;
  onAddCampaign?: (campaign: Partial<AdCampaign>) => Promise<any> | void;
  onUpdateCampaign?: (id: string, updates: Partial<AdCampaign>) => Promise<any> | void;
  onDeleteCampaign?: (id: string) => Promise<any> | void;
  onAddLead?: (lead: Partial<CRMLead>) => Promise<any> | void;
}

export const DashboardGeralView: React.FC<DashboardGeralViewProps> = ({
  onNavigate = (_view: ViewMode) => {},
  kpiPeriods = [],
  transactions = [],
  campaigns = [],
  leads = [],
  stockItems = [],
  tasks = [],
  prospectionContracts = [],
  userProfile,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onAddTransaction,
  onDeleteTransaction,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onAddLead,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'12meses' | '6meses' | '30dias'>('12meses');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Quick form states
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectProgress, setNewProjectProgress] = useState(0);

  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignPlatform, setNewCampaignPlatform] = useState('Meta Ads');
  const [newCampaignSpend, setNewCampaignSpend] = useState('');
  const [newCampaignRevenue, setNewCampaignRevenue] = useState('');

  const [newTransDesc, setNewTransDesc] = useState('');
  const [newTransAmount, setNewTransAmount] = useState('');
  const [newTransType, setNewTransType] = useState<'income' | 'expense'>('income');

  // AI Chat state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active 3-dots project action menu
  const [activeProjectMenuId, setActiveProjectMenuId] = useState<string | null>(null);

  // Notification backend is not implemented: never render invented notifications.
  const notifications: { id: string; title: string; text: string; time: string }[] = [];

  // Only real Firestore-backed tasks are displayed. No template projects.
  const displayProjects = useMemo(() => tasks
    .filter((task) => task && task.id && task.title)
    .slice(0, 5)
    .map((task, index) => {
      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-purple-500'];
      const progress =
        task.status === 'Concluído' ? 100 :
        task.status === 'Revisão' ? 85 :
        task.status === 'Em Andamento' ? 50 : 0;
      return {
        id: task.id, title: task.title,
        client: task.client || 'Sem cliente informado',
        progress, color: colors[index % colors.length],
        initials: task.title.substring(0, 2).toUpperCase(),
      };
    }), [tasks]);

  const displayCampaigns = useMemo(() => campaigns
    .filter((campaign) => campaign && campaign.id && campaign.name)
    .slice(0, 5)
    .map((campaign) => {
      const spend = Number(campaign.spend) || 0;
      const revenue = Number(campaign.revenue) || 0;
      const platform = campaign.platform || 'Outro';
      const iconColor = platform.includes('Google')
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      return {
        id: campaign.id, name: campaign.name, platform,
        spend, revenue, roas: spend > 0 ? +(revenue / spend).toFixed(2) : null,
        status: campaign.status, iconColor,
      };
    }), [campaigns]);

  const money = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Only persisted cash movements drive the finance dashboard.
  const validTransactions = useMemo(() => transactions
    .filter((transaction) =>
      transaction && (transaction.type === 'Entrada' || transaction.type === 'Saída') &&
      Number.isFinite(Number(transaction.amount)) && Number(transaction.amount) >= 0 &&
      transaction.date && !Number.isNaN(new Date(transaction.date).getTime())
    ), [transactions]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentMonthTransactions = validTransactions.filter((t) => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  const revenueCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'Entrada').reduce((sum, t) => sum + Number(t.amount), 0);
  const expensesCurrentMonth = currentMonthTransactions
    .filter((t) => t.type === 'Saída').reduce((sum, t) => sum + Number(t.amount), 0);
  const operatingProfit = revenueCurrentMonth - expensesCurrentMonth;

  const monthlyFinancialData = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, month - (11 - index), 1);
    const matching = validTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === date.getFullYear() &&
        transactionDate.getMonth() === date.getMonth();
    });
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receita: matching.filter((t) => t.type === 'Entrada').reduce((sum, t) => sum + Number(t.amount), 0),
      despesas: matching.filter((t) => t.type === 'Saída').reduce((sum, t) => sum + Number(t.amount), 0),
      count: matching.length,
    };
  }), [validTransactions, year, month]);

  const currentChartData = useMemo(() => {
    if (chartPeriod === '6meses') return monthlyFinancialData.slice(-6);
    if (chartPeriod === '30dias') {
      return Array.from({ length: 30 }, (_, index) => {
        const day = new Date(year, month, now.getDate() - (29 - index));
        const matching = validTransactions.filter((t) => {
          const date = new Date(t.date);
          return date.getFullYear() === day.getFullYear() &&
            date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
        });
        return {
          month: day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          receita: matching.filter((t) => t.type === 'Entrada').reduce((sum, t) => sum + Number(t.amount), 0),
          despesas: matching.filter((t) => t.type === 'Saída').reduce((sum, t) => sum + Number(t.amount), 0),
          count: matching.length,
        };
      });
    }
    return monthlyFinancialData;
  }, [chartPeriod, monthlyFinancialData, validTransactions, year, month]);

  // MRR, active clients and churn are not reliably derivable from the lead
  // pipeline. They must be recorded as actual KPI periods by the business.
  const latestKpi = useMemo(() => [...kpiPeriods]
    .filter((kpi) => kpi && /^\d{2}\/\d{4}$/.test(kpi.monthYear || ''))
    .sort((a, b) => {
      const [am, ay] = a.monthYear.split('/').map(Number);
      const [bm, by] = b.monthYear.split('/').map(Number);
      return (by * 12 + bm) - (ay * 12 + am);
    })[0], [kpiPeriods]);
  const currentMRR = latestKpi && Number.isFinite(Number(latestKpi.mrr))
    ? money(Number(latestKpi.mrr)) : '—';
  const activeClientsCount = latestKpi && Number.isFinite(Number(latestKpi.activeClients))
    ? String(latestKpi.activeClients) : '—';
  const churnRateStr = latestKpi && Number.isFinite(Number(latestKpi.churnRate))
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(latestKpi.churnRate) + '%'
    : '—';
  const avgRoasStr = useMemo(() => {
    const totalSpend = campaigns.reduce((sum, c) => sum + Math.max(0, Number(c.spend) || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + Math.max(0, Number(c.revenue) || 0), 0);
    return totalSpend > 0 ? (totalRevenue / totalSpend).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'x' : '—';
  }, [campaigns]);

  // Real activity comes from timestamped transactions. Do not fabricate events.
  const activities = useMemo(() => [...validTransactions]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.type === 'Entrada' ? 'Receita registrada' : 'Despesa registrada',
      desc: `${t.description || t.category || 'Movimentação'} — ${money(Number(t.amount))}`,
      time: new Date(t.date).toLocaleDateString('pt-BR'),
      icon: DollarSign,
      color: t.type === 'Entrada'
        ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
        : 'text-rose-400 bg-rose-500/20 border-rose-500/30',
    })), [validTransactions]);


  // SVG Chart Geometry
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const maxVal = Math.max(1, ...currentChartData.flatMap((d) => [d.receita, d.despesas]));

  const pointsRevenue = currentChartData.map((d, i) => {
    const x = paddingX + (i / Math.max(1, currentChartData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.receita / maxVal) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pointsExpense = currentChartData.map((d, i) => {
    const x = paddingX + (i / Math.max(1, currentChartData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.despesas / maxVal) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // Generate smooth SVG paths
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const revenueLinePath = createSmoothPath(pointsRevenue);
  const revenueAreaPath = `${revenueLinePath} L ${pointsRevenue[pointsRevenue.length - 1]?.x || 0},${
    svgHeight - paddingY
  } L ${pointsRevenue[0]?.x || 0},${svgHeight - paddingY} Z`;

  const expenseLinePath = createSmoothPath(pointsExpense);

  // Handlers for real Firestore creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle) return;

    if (onAddTask) {
      await onAddTask({
        title: newProjectTitle,
        description: `Cliente: ${newProjectClient || 'Geral'}`,
        status: newProjectProgress >= 100 ? 'Concluído' : 'Em Andamento',
        priority: 'Alta',
        client: newProjectClient || 'Geral',
      });
    }

    // The Firestore subscription updates the project list after persistence.

    setNewProjectTitle('');
    setNewProjectClient('');
    setIsNewProjectModalOpen(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;

    const spendNum = parseFloat(newCampaignSpend) || 0;
    const revNum = parseFloat(newCampaignRevenue) || 0;

    if (onAddCampaign) {
      await onAddCampaign({
        name: newCampaignName,
        platform: newCampaignPlatform,
        spend: spendNum,
        revenue: revNum,
        status: 'Ativa',
        clicks: 0, conversions: 0,
        roas: spendNum > 0 ? revNum / spendNum : 0,
      });
    }

    // The Firestore subscription updates the campaign list after persistence.

    setNewCampaignName('');
    setIsNewCampaignModalOpen(false);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransDesc) return;

    const amountNum = parseFloat(newTransAmount) || 0;
    if (onAddTransaction) {
      await onAddTransaction({
        description: newTransDesc,
        amount: amountNum,
        type: newTransType === 'income' ? 'Entrada' : 'Saída',
        date: new Date().toISOString(),
        category: newTransType === 'income' ? 'Venda / Contrato' : 'Operacional',
      });
    }

    // The transaction appears in recent activity after Firestore synchronization.

    setNewTransDesc('');
    setIsNewTransactionModalOpen(false);
  };

  // AI Strategic Consultant using Gemini 3.8 Flash
  const handleAskGemini = async (presetQuestion?: string) => {
    const question = presetQuestion || aiPrompt;
    if (!question) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const payload = {
        context: {
          agencyName: userProfile?.agencyName || 'Minha Agência',
          mrr: currentMRR,
          activeClients: activeClientsCount,
          churnRate: churnRateStr,
          avgRoas: avgRoasStr,
          revenueCurrentMonth: money(revenueCurrentMonth),
          expensesCurrentMonth: money(expensesCurrentMonth),
          operatingProfit: money(operatingProfit),
          campaigns: displayCampaigns.map((c) => ({ name: c.name, roas: `${c.roas}x`, spend: c.spend })),
          projects: displayProjects.map((p) => ({ name: p.title, client: p.client, progress: `${p.progress}%` })),
        },
        message: question,
      };

      const res = await fetch('/api/ai/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.reply) {
        setAiResponse(data.reply);
      } else if (data.analysis) {
        setAiResponse(data.analysis);
      } else {
        setAiResponse('A API não retornou uma análise. Tente novamente em instantes.');
      }
    } catch (err) {
      setAiResponse('Não foi possível consultar a IA. Verifique a integração e tente novamente.');


    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered lists for instant search
  const filteredProjects = displayProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCampaigns = displayCampaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#070D1F] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in select-none">
      {/* Top Header matching Screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#14234B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Bem-vindo ao AgencyOS</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Tudo que você precisa para gerir sua agência em um só lugar.
          </p>
        </div>

        {/* Right Header Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Real-time Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no AgencyOS..."
              className="w-full pl-9 pr-3 py-2 bg-[#0B152F] border border-[#182855] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action: New Project */}
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>

          {/* Quick Action: Gemini AI Copilot */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl border border-blue-400/30 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer shrink-0"
            title="Abrir Copilot IA Gemini"
          >
            <Bot className="w-3.5 h-3.5 text-blue-300" />
            <span>Copilot Gemini</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 bg-[#0B152F] border border-[#182855] hover:bg-[#122045] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer relative"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#070D1F]" />}
            </button>

            {/* Notification popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0B152F] border border-[#182855] rounded-2xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#182855] px-1">
                  <span className="text-xs font-bold text-white">Notificações</span>
                  <span className="text-[10px] text-slate-500">Atualização em tempo real</span>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 && <p className="text-xs text-slate-400 px-2 py-3">Nenhuma notificação disponível.</p>}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-xl bg-[#0F1D3F]/50 hover:bg-[#0F1D3F] border border-[#182855]/60 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-white leading-tight">{n.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{n.text}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Chip */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0B152F] border border-[#182855] rounded-xl hover:bg-[#122045] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden shadow-sm">
                {resolveUserAvatar(userProfile as any) ? (
                  <img
                    src={resolveUserAvatar(userProfile as any)}
                    alt={userProfile?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {userProfile?.name
                      ? userProfile.name
                          .trim()
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {userProfile?.name || userProfile?.agencyName || 'Usuário'}
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {userProfile?.role || 'Conta da agência'}
                </div>
              </div>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0B152F] border border-[#182855] rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#142552] rounded-xl transition-colors cursor-pointer"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#142552] rounded-xl transition-colors cursor-pointer"
                >
                  Configurações
                </button>
                <div className="border-t border-[#182855] my-1" />
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsAIModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:bg-[#142552] rounded-xl transition-colors cursor-pointer"
                >
                  Diagnóstico IA Gemini
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: MRR */}
        <div className="bg-[#0A132C] border border-[#152554] hover:border-blue-500/40 rounded-2xl p-5 shadow-lg shadow-blue-950/20 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0F2047] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
            {/* Sparkline curve matching screenshot */}
            <span className="text-[10px] text-slate-500">Registros reais</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-4">
            MRR
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {currentMRR}
          </div>
          <div className="text-xs text-slate-500 mt-2">{latestKpi ? 'Indicador registrado' : 'Aguardando KPIs'}</div>
        </div>

        {/* Card 2: Clientes Ativos */}
        <div className="bg-[#0A132C] border border-[#152554] hover:border-blue-500/40 rounded-2xl p-5 shadow-lg shadow-blue-950/20 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0F2047] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-500">Registros reais</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-4">
            Clientes Ativos
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {activeClientsCount}
          </div>
          <div className="text-xs text-slate-500 mt-2">{latestKpi ? 'Indicador registrado' : 'Aguardando KPIs'}</div>
        </div>

        {/* Card 3: Churn Rate */}
        <div className="bg-[#0A132C] border border-[#152554] hover:border-blue-500/40 rounded-2xl p-5 shadow-lg shadow-blue-950/20 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0F2047] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-500">Registros reais</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-4">
            Churn Rate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {churnRateStr}
          </div>
          <div className="text-xs text-slate-500 mt-2">{latestKpi ? 'Indicador registrado' : 'Aguardando KPIs'}</div>
        </div>

        {/* Card 4: ROAS Médio */}
        <div className="bg-[#0A132C] border border-[#152554] hover:border-blue-500/40 rounded-2xl p-5 shadow-lg shadow-blue-950/20 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0F2047] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-500">Registros reais</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-4">
            ROAS Médio
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {avgRoasStr}
          </div>
          <div className="text-xs text-slate-500 mt-2">{campaigns.length ? 'Calculado pelas campanhas' : 'Aguardando campanhas'}</div>
        </div>
      </div>

      {/* Middle Section: Receita vs Despesas (8 cols) + Resumo financeiro (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#0A132C] border border-[#152554] rounded-2xl p-5 sm:p-6 shadow-lg shadow-blue-950/20 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Receita vs Despesas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe a evolução financeira da sua agência.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Legend matching screenshot */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-300 font-medium">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-slate-300 font-medium">Despesas</span>
                </div>
              </div>

              {/* Filter dropdown */}
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value as any)}
                className="bg-[#0D1838] border border-[#182B61] text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="12meses">Últimos 12 meses</option>
                <option value="6meses">Últimos 6 meses</option>
                <option value="30dias">Últimos 30 dias</option>
              </select>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          {currentChartData.some((d) => d.count > 0) ? (
          <div className="w-full relative mt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-64 overflow-visible"
            >
              <defs>
                <linearGradient id="revenueFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines with exact currency labels */}
              {Array.from({ length: 5 }, (_, idx) => maxVal * (4 - idx) / 4).map((val, idx) => {
                const y = paddingY + (idx / 4) * (svgHeight - paddingY * 2);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#14244D"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      fill="#64748B"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {money(val)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill for Receita */}
              <path d={revenueAreaPath} fill="url(#revenueFillGrad)" />

              {/* Stroke line for Receita */}
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Stroke line for Despesas */}
              <path
                d={expenseLinePath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Interactive Data Points & Hover Tooltips */}
              {pointsRevenue.map((pt, i) => {
                const isSelected = selectedMonthIndex === i;
                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setSelectedMonthIndex(i)}
                    onMouseLeave={() => setSelectedMonthIndex(null)}
                  >
                    {/* Month Label on X Axis */}
                    <text
                      x={pt.x}
                      y={svgHeight - 6}
                      fill={isSelected ? '#FFFFFF' : '#64748B'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {pt.data.month}
                    </text>

                    {/* Revenue point dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5.5 : 3.5}
                      fill="#3B82F6"
                      stroke="#0A132C"
                      strokeWidth="2"
                    />

                    {/* Expense point dot */}
                    <circle
                      cx={pointsExpense[i]?.x || pt.x}
                      cy={pointsExpense[i]?.y || pt.y}
                      r={isSelected ? 4.5 : 2.5}
                      fill="#94A3B8"
                      stroke="#0A132C"
                      strokeWidth="2"
                    />

                    {/* Interactive Tooltip Card when hovering */}
                    {isSelected && (
                      <g>
                        <rect
                          x={Math.max(10, Math.min(pt.x - 70, svgWidth - 150))}
                          y={Math.max(5, pt.y - 58)}
                          width="140"
                          height="48"
                          rx="8"
                          fill="#0D1838"
                          stroke="#2563EB"
                          strokeWidth="1.5"
                          filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                        />
                        <text
                          x={Math.max(10, Math.min(pt.x - 70, svgWidth - 150)) + 10}
                          y={Math.max(5, pt.y - 58) + 16}
                          fill="#93C5FD"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {`${pt.data.month}: Receita R$ ${pt.data.receita.toLocaleString('pt-BR')}`}
                        </text>
                        <text
                          x={Math.max(10, Math.min(pt.x - 70, svgWidth - 150)) + 10}
                          y={Math.max(5, pt.y - 58) + 32}
                          fill="#CBD5E1"
                          fontSize="9.5"
                        >
                          {`Despesas: R$ ${pt.data.despesas.toLocaleString('pt-BR')} (Lucro: R$ ${(
                            pt.data.receita - pt.data.despesas
                          ).toLocaleString('pt-BR')})`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-slate-400 border border-dashed border-[#1A2E63] rounded-xl">
              Nenhuma movimentação financeira neste período.
            </div>
          )}
        </div>

        {/* Right Card: Resumo financeiro (4 cols matching screenshot) */}
        <div className="lg:col-span-4 bg-[#0A132C] border border-[#152554] rounded-2xl p-5 sm:p-6 shadow-lg shadow-blue-950/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14244D]">
            <h2 className="text-base font-bold text-white tracking-tight">
              Resumo financeiro
            </h2>
            <div className="px-2.5 py-1 bg-[#0F2047] text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20">
              Este mês
            </div>
          </div>

          <div className="space-y-3.5 flex-1">
            {/* Row 1: Receita total */}
            <div className="p-3.5 rounded-xl bg-[#0C1738] border border-[#182A5E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Receita total</div>
                  <div className="text-base font-bold text-white mt-0.5">{money(revenueCurrentMonth)}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Dados atuais
              </span>
            </div>

            {/* Row 2: Despesas totais */}
            <div className="p-3.5 rounded-xl bg-[#0C1738] border border-[#182A5E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Despesas totais</div>
                  <div className="text-base font-bold text-white mt-0.5">{money(expensesCurrentMonth)}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                Dados atuais
              </span>
            </div>

            {/* Row 3: Lucro operacional */}
            <div className="p-3.5 rounded-xl bg-[#0C1738] border border-[#182A5E] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Lucro operacional</div>
                  <div className="text-base font-bold text-white mt-0.5">{money(operatingProfit)}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Dados atuais
              </span>
            </div>
          </div>

          {/* Quick Transaction Action */}
          <button
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="w-full py-2.5 px-3 bg-[#11234F] hover:bg-[#162D63] border border-blue-500/30 rounded-xl text-xs font-semibold text-blue-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Transação no Fluxo de Caixa</span>
          </button>
        </div>
      </div>

      {/* Bottom Section (3 equal columns matching screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Projetos em andamento */}
        <div className="bg-[#0A132C] border border-[#152554] rounded-2xl p-5 shadow-lg shadow-blue-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14244D]">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Projetos em andamento</span>
              </h2>
              <button
                onClick={() => onNavigate('kanban')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#14244D] mt-1">
              {filteredProjects.length === 0 && <p className="py-6 text-xs text-slate-400">Nenhum projeto cadastrado.</p>}
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl ${proj.color} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {proj.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                        {proj.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{proj.client}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-16 sm:w-20">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progresso</span>
                        <span className="font-bold text-slate-200">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-[#14244D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveProjectMenuId(activeProjectMenuId === proj.id ? null : proj.id)
                        }
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#14244D] transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeProjectMenuId === proj.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-[#0E1A3D] border border-[#1D326C] rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                          <button
                            onClick={() => {
                              if (onUpdateTaskStatus) onUpdateTaskStatus(proj.id, 'Concluído');
                              setActiveProjectMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-emerald-400 hover:bg-[#15275B] rounded-lg transition-colors cursor-pointer"
                          >
                            Marcar Concluído
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteTask) onDeleteTask(proj.id);
                              setActiveProjectMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-rose-400 hover:bg-[#15275B] rounded-lg transition-colors cursor-pointer"
                          >
                            Excluir Projeto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="mt-3 w-full py-2 bg-[#0E1B3D] hover:bg-[#13244F] border border-[#1A2E63] rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Novo Projeto</span>
          </button>
        </div>

        {/* Column 2: Performance de campanhas */}
        <div className="bg-[#0A132C] border border-[#152554] rounded-2xl p-5 shadow-lg shadow-blue-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14244D]">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Performance de campanhas</span>
              </h2>
              <button
                onClick={() => onNavigate('campanhas')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 border-b border-[#14244D]">
              <div className="col-span-6">Campanha</div>
              <div className="col-span-3 text-right">Investimento</div>
              <div className="col-span-3 text-right">ROAS</div>
            </div>

            <div className="divide-y divide-[#14244D]">
              {filteredCampaigns.length === 0 && <p className="py-6 text-xs text-slate-400">Nenhuma campanha cadastrada.</p>}
              {filteredCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="grid grid-cols-12 items-center py-3 text-xs group cursor-pointer hover:bg-[#0D183B]/50 px-1 rounded-lg transition-colors"
                  onClick={() => onNavigate('campanhas')}
                >
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg ${camp.iconColor} border flex items-center justify-center text-[10px] font-bold shrink-0`}
                    >
                      {camp.platform.substring(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                        {camp.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{camp.platform}</div>
                    </div>
                  </div>

                  <div className="col-span-3 text-right text-slate-300 font-medium">
                    R$ {camp.spend.toLocaleString('pt-BR')}
                  </div>

                  <div className="col-span-3 text-right font-bold text-emerald-400">
                    {camp.roas === null ? '—' : `${camp.roas}x`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="mt-3 w-full py-2 bg-[#0E1B3D] hover:bg-[#13244F] border border-[#1A2E63] rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Campanha</span>
          </button>
        </div>

        {/* Column 3: Atividades recentes */}
        <div className="bg-[#0A132C] border border-[#152554] rounded-2xl p-5 shadow-lg shadow-blue-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#14244D]">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Atividades recentes</span>
              </h2>
              <span className="text-xs text-blue-400 font-semibold cursor-pointer">Ver todas →</span>
            </div>

            <div className="divide-y divide-[#14244D] mt-1">
              {activities.length === 0 && <p className="py-6 text-xs text-slate-400">Nenhuma atividade financeira registrada.</p>}
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-3 flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl ${act.color} border flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">{act.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {act.desc}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">{act.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('fluxo-caixa')}
            className="mt-3 w-full py-2 bg-[#0E1B3D] hover:bg-[#13244F] border border-[#1A2E63] rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ver movimentações financeiras</span>
          </button>
        </div>
      </div>

      {/* Modal 1: Novo Projeto */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B152F] border border-[#182855] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182855]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>Novo Projeto</span>
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Redesign Landing Page"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Clinica Vita"
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Progresso Inicial</span>
                  <span className="text-blue-400">{newProjectProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProjectProgress}
                  onChange={(e) => setNewProjectProgress(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-[#0E1B3D] hover:bg-[#142550] text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Nova Campanha */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B152F] border border-[#182855] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182855]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Nova Campanha de Tráfego</span>
              </h3>
              <button
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prospecção Black Friday"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plataforma</label>
                <select
                  value={newCampaignPlatform}
                  onChange={(e) => setNewCampaignPlatform(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Google Ads">Google Ads</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="YouTube Ads">YouTube Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Investimento (R$)</label>
                  <input
                    type="number"
                    value={newCampaignSpend}
                    onChange={(e) => setNewCampaignSpend(e.target.value)}
                    className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Retorno / Vendas (R$)</label>
                  <input
                    type="number"
                    value={newCampaignRevenue}
                    onChange={(e) => setNewCampaignRevenue(e.target.value)}
                    className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 bg-[#0E1B3D] hover:bg-[#142550] text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Nova Transação */}
      {isNewTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B152F] border border-[#182855] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182855]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Registrar Transação</span>
              </h3>
              <button
                onClick={() => setIsNewTransactionModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTransType('income')}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      newTransType === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-[#0E1B3D] text-slate-400 border-[#182855]'
                    }`}
                  >
                    Receita (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransType('expense')}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      newTransType === 'expense'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-[#0E1B3D] text-slate-400 border-[#182855]'
                    }`}
                  >
                    Despesa (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mensalidade TechFlow"
                  value={newTransDesc}
                  onChange={(e) => setNewTransDesc(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newTransAmount}
                  onChange={(e) => setNewTransAmount(e.target.value)}
                  className="w-full bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionModalOpen(false)}
                  className="px-4 py-2 bg-[#0E1B3D] hover:bg-[#142550] text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Salvar no Fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Copilot IA Gemini Strategic Assistant */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B152F] border border-[#1D3575] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182855]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400 text-blue-300 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Copilot Estratégico Gemini</h3>
                  <p className="text-[11px] text-slate-400">
                    Análise em tempo real das métricas da agência com Google Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleAskGemini('Analise meu MRR registrado e sugira ações realistas para melhorá-lo. Se não houver dados, informe isso.')}
                className="px-3 py-1.5 bg-[#0E1B3D] hover:bg-[#152B61] border border-[#182B61] rounded-xl text-blue-300 cursor-pointer transition-colors"
              >
                📈 Como escalar o MRR?
              </button>
              <button
                onClick={() =>
                  handleAskGemini('Analise o ROAS apenas das campanhas cadastradas. Se não houver campanhas, explique quais dados registrar.')
                }
                className="px-3 py-1.5 bg-[#0E1B3D] hover:bg-[#152B61] border border-[#182B61] rounded-xl text-blue-300 cursor-pointer transition-colors"
              >
                🎯 Otimizar orçamento de tráfego
              </button>
              <button
                onClick={() =>
                  handleAskGemini('Analise o churn registrado e sugira ações de retenção. Se não houver dados suficientes, explique o que falta.')
                }
                className="px-3 py-1.5 bg-[#0E1B3D] hover:bg-[#152B61] border border-[#182B61] rounded-xl text-blue-300 cursor-pointer transition-colors"
              >
                🛡️ Estratégia anti-churn
              </button>
            </div>

            {/* Input prompt */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                placeholder="Pergunte qualquer coisa sobre o crescimento da sua agência..."
                className="flex-1 bg-[#0E1B3D] border border-[#182855] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleAskGemini()}
                disabled={isAiLoading || !aiPrompt}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Analisar</span>
              </button>
            </div>

            {/* AI Response Output */}
            {isAiLoading && (
              <div className="p-6 rounded-2xl bg-[#091126] border border-[#152758] flex items-center justify-center gap-3 text-xs text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>O Gemini está analisando seus dados de MRR, ROAS e Projetos...</span>
              </div>
            )}

            {aiResponse && (
              <div className="p-4 rounded-2xl bg-[#091126] border border-[#152758] text-xs text-slate-200 leading-relaxed max-h-72 overflow-y-auto custom-scrollbar space-y-2 whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
