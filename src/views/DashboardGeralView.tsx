import React from 'react';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  MapPin,
  Share2,
  Package,
  Kanban,
  FileText,
  Target,
  Bot,
  Users,
  TrendingDown,
  ArrowRight,
  Lock,
  Palette,
} from 'lucide-react';
import { ViewMode, KPIPeriod, CashTransaction, AdCampaign, CRMLead, StockItem } from '../types';
import { hasModuleAccess } from '../lib/permissions';
import { FirestoreUserProfile } from '../lib/firebase';

interface DashboardGeralViewProps {
  onNavigate?: (view: ViewMode) => void;
  kpiPeriods?: KPIPeriod[];
  transactions?: CashTransaction[];
  campaigns?: AdCampaign[];
  leads?: CRMLead[];
  stockItems?: StockItem[];
  userProfile?: FirestoreUserProfile | null;
}

export const DashboardGeralView: React.FC<DashboardGeralViewProps> = ({
  onNavigate = (_view: ViewMode) => {},
  kpiPeriods = [],
  transactions = [],
  campaigns = [],
  leads = [],
  stockItems = [],
  userProfile,
}) => {
  const latestKPI = kpiPeriods.length > 0 ? kpiPeriods[kpiPeriods.length - 1] : null;
  const currentMRR = latestKPI && latestKPI.mrr > 0 ? `R$ ${latestKPI.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';
  const activeClients = latestKPI && latestKPI.activeClients > 0 ? latestKPI.activeClients.toString() : '—';
  const churnRate = latestKPI && latestKPI.churnRate > 0 ? `${latestKPI.churnRate.toFixed(1)}%` : '—';

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? `${(totalRevenue / totalSpend).toFixed(1)}x` : '—';

  const modules = [
    {
      id: 'kpis' as ViewMode,
      title: 'Financeiro',
      desc: 'KPIs, MRR, LTV',
      icon: DollarSign,
      iconBg: 'bg-[#101912]',
      iconBorder: 'border-[#1b2f1f]',
      iconColor: 'text-[#22c55e]',
      badge: latestKPI ? `MRR ativo` : 'Sem dados',
      badgeColor: 'text-[#22c55e]',
    },
    {
      id: 'campanhas' as ViewMode,
      title: 'Tráfego',
      desc: 'Facebook & Google Ads',
      icon: BarChart3,
      iconBg: 'bg-[#0f1728]',
      iconBorder: 'border-[#1b2b46]',
      iconColor: 'text-blue-400',
      badge: `${campaigns.length} campanhas`,
      badgeColor: 'text-blue-400',
    },
    {
      id: 'fluxo-caixa' as ViewMode,
      title: 'Fluxo de Caixa',
      desc: 'Entradas e saídas',
      icon: TrendingUp,
      iconBg: 'bg-[#1b1228]',
      iconBorder: 'border-[#311b46]',
      iconColor: 'text-purple-400',
      badge: 'Ver dados',
      badgeColor: 'text-purple-400',
    },
    {
      id: 'maps-scraper' as ViewMode,
      title: 'Maps Scraper',
      desc: 'Extração de leads',
      icon: MapPin,
      iconBg: 'bg-[#24170d]',
      iconBorder: 'border-[#3f2715]',
      iconColor: 'text-amber-500',
      badge: `${leads.length} leads`,
      badgeColor: 'text-amber-500',
    },
    {
      id: 'agenda' as ViewMode,
      title: 'Agenda',
      desc: 'Compromissos e tarefas',
      icon: Calendar,
      iconBg: 'bg-[#101912]',
      iconBorder: 'border-[#1b2f1f]',
      iconColor: 'text-[#22c55e]',
      badge: 'Ver agenda',
      badgeColor: 'text-[#22c55e]',
    },
    {
      id: 'calculadora-roi' as ViewMode,
      title: 'Calculadora ROI',
      desc: 'Previsão e rentabilidade',
      icon: Target,
      iconBg: 'bg-[#0f1728]',
      iconBorder: 'border-[#1b2b46]',
      iconColor: 'text-blue-400',
      badge: 'Calcular',
      badgeColor: 'text-blue-400',
    },
    {
      id: 'ia-consultora' as ViewMode,
      title: 'IA Consultora',
      desc: 'Análise inteligente',
      icon: Bot,
      iconBg: 'bg-[#1b1228]',
      iconBorder: 'border-[#311b46]',
      iconColor: 'text-purple-400',
      badge: 'Online',
      badgeColor: 'text-purple-400',
    },
    {
      id: 'social-hub' as ViewMode,
      title: 'Social Hub',
      desc: 'Instagram & WhatsApp com IA',
      icon: Share2,
      iconBg: 'bg-[#24170d]',
      iconBorder: 'border-[#3f2715]',
      iconColor: 'text-amber-500',
      badge: 'IA ativa',
      badgeColor: 'text-amber-500',
    },
    {
      id: 'estoque' as ViewMode,
      title: 'Estoque',
      desc: 'Produtos e alertas de estoque',
      icon: Package,
      iconBg: 'bg-[#0f1728]',
      iconBorder: 'border-[#1b2b46]',
      iconColor: 'text-blue-400',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'relatorios' as ViewMode,
      title: 'Relatórios',
      desc: 'Exportar relatório completo',
      icon: FileText,
      iconBg: 'bg-[#1b1228]',
      iconBorder: 'border-[#311b46]',
      iconColor: 'text-purple-400',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'designer' as ViewMode,
      title: 'Área do Designer',
      desc: 'Briefings, aprovação & entrega',
      icon: Palette,
      iconBg: 'bg-[#1b1228]',
      iconBorder: 'border-[#311b46]',
      iconColor: 'text-pink-400',
      badge: 'Hub Criativo',
      badgeColor: 'text-pink-400',
    },
    {
      id: 'kanban' as ViewMode,
      title: 'Kanban',
      desc: 'Projetos e tarefas da agência',
      icon: Kanban,
      iconBg: 'bg-[#101912]',
      iconBorder: 'border-[#1b2f1f]',
      iconColor: 'text-[#22c55e]',
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <div className="space-y-6 text-gray-200 font-sans max-w-7xl mx-auto pb-12">
      {/* Top Welcome / Header section */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22c55e] tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
          <span>AGENCYOS • AO VIVO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Bem-vindo ao AgencyOS
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Tudo que você precisa para gerir sua agência em um só lugar.
        </p>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="text-[#22c55e]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {currentMRR}
          </div>
          <div className="text-xs text-gray-400 font-normal">
            MRR
          </div>
        </div>

        {/* Clientes Ativos */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {activeClients}
          </div>
          <div className="text-xs text-gray-400 font-normal">
            Clientes Ativos
          </div>
        </div>

        {/* Churn Rate */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="text-purple-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {churnRate}
          </div>
          <div className="text-xs text-gray-400 font-normal">
            Churn Rate
          </div>
        </div>

        {/* ROAS Médio */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="text-amber-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {avgRoas}
          </div>
          <div className="text-xs text-gray-400 font-normal">
            ROAS Médio
          </div>
        </div>
      </div>

      {/* Middle Card: Receita vs Despesas */}
      <div className="p-6 rounded-2xl bg-[#0c0e16] border border-[#161a25] space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-white text-sm">Receita vs Despesas</h3>
          <p className="text-xs text-gray-500 font-normal">
            Sem dados — cadastre KPIs no módulo Financeiro
          </p>
        </div>

        {kpiPeriods.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-[#111420] flex items-center justify-center text-gray-600 mb-1">
              <DollarSign className="w-6 h-6 text-gray-500 stroke-[1.5]" />
            </div>
            <p className="text-xs text-gray-400 font-normal">
              Nenhum dado financeiro cadastrado.
            </p>
            <button
              onClick={() => onNavigate('kpis')}
              className="text-xs font-semibold text-[#22c55e] hover:underline cursor-pointer pt-0.5"
            >
              → Ir para o Módulo Financeiro
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {kpiPeriods.slice(-4).map((kp) => (
              <div key={kp.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium">{kp.monthYear}</span>
                  <span className="text-[#22c55e] font-bold">
                    MRR: R$ {kp.mrr.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#151926] overflow-hidden flex">
                  <div className="h-full bg-[#22c55e]" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Módulos do Sistema (11 ativos) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm sm:text-base">Módulos do Sistema</h3>
          <span className="text-xs text-gray-500 font-normal">11 ativos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            const isAllowed = hasModuleAccess(m.id, userProfile);
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl bg-[#0c0e16] border transition-all flex flex-col justify-between group min-h-[160px] ${
                  isAllowed
                    ? 'border-[#161a25] hover:border-[#22c55e]/40'
                    : 'border-[#1a1520] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${m.iconBg} border ${m.iconBorder} flex items-center justify-center ${m.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isAllowed ? (
                      m.badge && (
                        <span className={`text-xs font-semibold ${m.badgeColor}`}>
                          {m.badge}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-bold text-red-400 bg-red-950/50 border border-red-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Bloqueado
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                      <span>{m.title}</span>
                      {!isAllowed && <Lock className="w-3 h-3 text-red-400/80" />}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">{m.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(m.id)}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer mt-4 pt-1 ${
                    isAllowed
                      ? 'text-[#22c55e] hover:underline'
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  <span>{isAllowed ? 'Abrir módulo' : 'Acesso Restrito'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
